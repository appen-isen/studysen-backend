import { AuthenticatedClubRequest } from '@/middlewares/auth';
import { uploadImageToCDN } from '@/utils/cdn';
import { connectToPool } from '@/utils/database';
import { Response } from 'express';
import { sendNotificationToDevices } from '../notifications/clubNotifications';
import Logger from '@/utils/logger';

const logger = new Logger('Posts');

// Fonction pour créer un post
export async function createPost(req: AuthenticatedClubRequest, res: Response) {
  try {
    const clubId = (req as AuthenticatedClubRequest).clubId;
    const { type, date, title, description, link, location, imageUrl, info, sendNotification } = req.body;

    const client = await connectToPool();
    const query = `
            INSERT INTO posts ( title, is_event, date, club_id, description, location, image_url, link, start_time, price, age_limit )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 )
            RETURNING post_id;
        `;
    // Ajout des valeurs dans le tableau values
    const values = [
      title,
      type === 'event',
      date,
      clubId,
      description ?? null,
      location ?? null,
      imageUrl ?? null,
      link ?? null,
      info?.startTime === '' ? null : (info?.startTime ?? null),
      info?.price === '' ? null : (info?.price ?? null),
      info?.ageLimit === '' ? null : (info?.ageLimit ?? null)
    ];

    const result = await client.query(query, values);
    // Récupérer le campus_id du club
    const campusQuery = `SELECT campus_id FROM clubs WHERE club_id = $1`;
    const campusResult = await client.query(campusQuery, [clubId]);
    client.release();
    if (campusResult.rowCount === 0) {
      res.status(404).json({ message: 'Club non trouvé' });
      return;
    }
    // Envoi de la notification aux appareils du campus
    const campusId = campusResult.rows[0].campus_id;
    if (sendNotification) {
      sendNotificationToDevices(campusId, 'Nouveau post', title);
    }
    logger.info(`Post créé avec succès pour le club ${clubId} (ID: ${result.rows[0].post_id})`);
    res.status(201).json({
      message: 'Post créé avec succès',
      postId: result.rows[0].post_id
    });
  } catch (error) {
    logger.error('Erreur lors de la création du post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function editPost(req: AuthenticatedClubRequest, res: Response) {
  try {
    const clubId = (req as AuthenticatedClubRequest).clubId;
    const { postId, type, title, date, description, link, location, info } = req.body;

    const client = await connectToPool();
    const query = `
            UPDATE posts
            SET title = $1, is_event = $2, date = $3, description = $4, location = $5, link = $6,
                start_time = $7, price = $8, age_limit = $9
            WHERE post_id = $10 AND club_id = $11;
        `;
    const values = [
      title,
      type === 'event',
      date,
      description ?? null,
      location ?? null,
      link ?? null,
      info?.startTime === '' ? null : (info?.startTime ?? null),
      info?.price === '' ? null : (info?.price ?? null),
      info?.ageLimit === '' ? null : (info?.ageLimit ?? null),
      postId,
      clubId
    ];

    const result = await client.query(query, values);
    client.release();

    if (result.rowCount === 0) {
      res.status(404).json({ message: "Post non trouvé ou n'appartient pas au club" });
      return;
    }
    logger.info(`Post modifié avec succès pour le club ${clubId} (ID: ${postId})`);
    res.status(200).json({ message: 'Post modifié avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la modification du post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Fonction pour ajouter une image à un post
export async function addImageToPost(req: AuthenticatedClubRequest, res: Response) {
  try {
    const clubId = (req as AuthenticatedClubRequest).clubId;
    const postId = req.body.postId;

    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'Veuillez fournir une image' });
      return;
    }

    // On télécharge l'image sur le CDN et on récupère l'URL
    const imageUrl = await uploadImageToCDN(file);

    // Enregistrer l'URL de l'image dans la base de données
    const client = await connectToPool();
    const query = `
				UPDATE posts
				SET image_url = $1
				WHERE post_id = $2 AND club_id = $3;
			`;
    const result = await client.query(query, [imageUrl, postId, clubId]);
    client.release();

    // Vérifier si le post existe et appartient au club
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Post non trouvé' });
      return;
    }

    res.status(200).json({
      message: 'Image ajoutée avec succès',
      url: imageUrl
    });
  } catch (error) {
    logger.error("Erreur lors de l'ajout de l'image au post:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
