import { connectToPool } from "@/utils/database";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Route pour créer un club
export async function createClub(req: Request, res: Response) {
	try {
		const { name, password, campusNum } = req.body;
		const client = await connectToPool();

		// Vérifier si le nom du club existe déjà
		const checkQuery = `SELECT club_id FROM clubs WHERE name = $1;`;
		const checkResult = await client.query(checkQuery, [name]);
		if (checkResult.rows.length > 0) {
			client.release();
			res.status(409).json({
				message: "Ce nom de club est déjà utilisé.",
			});
			return;
		}

		const query = `
	  INSERT INTO clubs (name, password, campus_num, enabled)
	  VALUES ($1, $2, $3, FALSE) 
	  RETURNING club_id, name, campus_num;
	`;
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);

		const result = await client.query(query, [name, hash, campusNum]);
		client.release();

		const club = result.rows[0];
		res.status(201).json({
			club: {
				clubId: club.club_id,
				name: club.name,
			},
			message:
				"Le club a été créé avec succès, veuillez attendre son activation pour l'utiliser !",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Internal server error: " + error,
		});
	}
}

// Authentification d'un club
export async function loginClub(req: Request, res: Response) {
	try {
		const { clubId, password } = req.body;
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
				message: "Mot de passe invalide !",
			});
			return;
		}

		if (!club.enabled) {
			res.status(403).json({
				message:
					"Le club n'est pas encore activé, veuillez contacter un administrateur pour faire la demande.",
			});
			return;
		}

		//Génération du token
		const token = jwt.sign(
			{
				clubId: club.club_id,
			},
			JWT_SECRET,
			{ expiresIn: "24h" }
		);
		// Envoi du token dans le cookie
		res.cookie("token", token, {
			maxAge: 24 * 3600 * 1000,
			sameSite: "lax",
			httpOnly: true,
		});
		res.sendStatus(200);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Internal server error: " + error,
		});
	}
}

// Activation d'un club
export async function activateClub(req: Request, res: Response) {
	try {
		const { clubId } = req.body;
		const client = await connectToPool();
		const query = `
	  UPDATE clubs
	  SET enabled = TRUE
	  WHERE club_id = $1;
	`;

		await client.query(query, [clubId]);
		client.release();

		res.status(200).json({
			message: "Le club a été activé avec succès !",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Internal server error: " + error,
		});
	}
}
