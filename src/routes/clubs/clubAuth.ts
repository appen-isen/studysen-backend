import { connectToPool } from '@/utils/database';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Logger from '@/utils/logger';
import { sendEmail } from '@/utils/email';
import { getCampusName } from '@/utils/campus';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const logger = new Logger('Clubs');

// Route pour créer un club
export async function createClub(req: Request, res: Response) {
  try {
    const { name, password, campusId, contactEmail } = req.body;
    const client = await connectToPool();

    // Vérifier si le nom du club existe déjà
    const checkQuery = `SELECT club_id FROM clubs WHERE name = $1;`;
    const checkResult = await client.query(checkQuery, [name]);
    if (checkResult.rows.length > 0) {
      client.release();
      res.status(409).json({
        message: 'Ce nom de club est déjà utilisé.'
      });
      return;
    }

    const query = `
	  INSERT INTO clubs (name, password, campus_id, enabled, contact_email)
	  VALUES ($1, $2, $3, FALSE, $4) 
	  RETURNING club_id, name, campus_id;
	`;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const result = await client.query(query, [name, hash, campusId, contactEmail]);
    client.release();

    const club = result.rows[0];

    //Génération du token
    const token = jwt.sign(
      {
        clubId: club.club_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`Club créé: ${club.name} (ID: ${club.club_id})`);
    // Envoi de l'email de création de club
    sendEmail(contactEmail, 'Club créé - Studysen', 'new-club', {
      supportEmail: process.env.FROM_MAIL,
      clubName: name,
      campusName: getCampusName(campusId)
    });
    // Envoi de l'email de vérification aux administrateurs
    if (process.env.FROM_MAIL) {
      sendEmail(process.env.FROM_MAIL, 'Vérification de club - Studysen', 'club-verification', {
        ownerEmail: contactEmail,
        clubName: name,
        campusName: getCampusName(campusId)
      });
    } else {
      logger.error(
        "L'email de vérification n'a pas pu être envoyé car la variable d'environnement FROM_MAIL n'est pas définie."
      );
    }

    // Envoi du token dans le cookie
    res.cookie('token', token, {
      maxAge: 24 * 3600 * 1000,
      sameSite: 'lax',
      httpOnly: true
    });
    res.status(201).json({
      club: {
        clubId: club.club_id,
        campusId: club.campus_id,
        name: club.name
      },
      message: "Le club a été créé avec succès, veuillez attendre son activation pour l'utiliser !"
    });
  } catch (error) {
    logger.error('Erreur lors de la création du club', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
}

// Authentification d'un club
export async function loginClub(req: Request, res: Response) {
  const { clubId, password } = req.body;
  try {
    const client = await connectToPool();
    const query = `
      SELECT club_id, password, enabled
      FROM clubs
      WHERE club_id = $1;
    `;

    const result = await client.query(query, [clubId]);
    client.release();

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Le club n'existe pas !" });
      return;
    }
    const club = result.rows[0];
    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, club.password);

    if (!isPasswordValid) {
      res.status(401).json({
        message: 'Mot de passe invalide !'
      });
      return;
    }

    if (!club.enabled) {
      res.status(403).json({
        message:
          "Le club n'est pas encore activé, veuillez contacter un administrateur pour faire la demande."
      });
      return;
    }

    //Génération du token
    const token = jwt.sign(
      {
        clubId: club.club_id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Envoi du token dans le cookie
    res.cookie('token', token, {
      maxAge: 7 * 24 * 3600 * 1000,
      sameSite: 'lax',
      httpOnly: true
    });
    res.sendStatus(200);
  } catch (error) {
    logger.error(`Erreur lors de la connexion au club (ID: ${clubId})`, error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
}

// Authentification d'un club via le mode administrateur
export async function adminLoginClub(req: Request, res: Response) {
  const { clubId } = req.body;
  try {
    //Génération du token directement avec l'id du club (mode administrateur)
    const token = jwt.sign(
      {
        clubId: clubId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Envoi du token dans le cookie
    res.cookie('token', token, {
      maxAge: 7 * 24 * 3600 * 1000,
      sameSite: 'lax',
      httpOnly: true
    });
    res.sendStatus(200);
  } catch (error) {
    logger.error(`Erreur lors de la connexion au club en tant qu'administrateur (ID: ${clubId})`, error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
}

// Activation d'un club
export async function activateClub(req: Request, res: Response) {
  const { clubId } = req.body;
  try {
    const client = await connectToPool();
    const query = `
	  UPDATE clubs
	  SET enabled = TRUE
	  WHERE club_id = $1 RETURNING name, contact_email, campus_id;
	`;

    const result = await client.query(query, [clubId]);
    client.release();
    logger.info(`Club activé: ${clubId}`);
    // Envoi de l'email d'activation du club
    sendEmail(result.rows[0].contact_email, 'Club activé - Studysen', 'club-enabled', {
      supportEmail: process.env.FROM_MAIL,
      clubName: result.rows[0].name,
      campusName: getCampusName(result.rows[0].campus_id)
    });
    res.status(200).json({
      message: 'Le club a été activé avec succès !'
    });
  } catch (error) {
    logger.error(`Erreur lors de l'activation du club (ID: ${clubId})`, error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
}
