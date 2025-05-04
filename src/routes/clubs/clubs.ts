import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { connectToPool } from "@/utils/database";
import Validate from "@/middlewares/validate";
import { body } from "express-validator";
import bcrypt from "bcrypt";

const router = express.Router();
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Route pour créer un club
router.post(
	"/create",
	// Les verifications de données
	body("name")
		.isLength({ min: 2 })
		.withMessage("Veuillez entrer un nom valide !"),
	body("password")
		.isLength({ min: 8 })
		.matches(/[a-z]/)
		.matches(/[A-Z]/)
		.matches(/\d/)
		.withMessage(
			"Le mot de passe doit avoir au minimum 8 caractères, une minuscule, une majuscule et un chiffre !"
		),
	body("campusNum").notEmpty().isInt(),
	Validate,
	async (req, res) => {
		try {
			const { name, password, campusNum } = req.body;
			const client = await connectToPool();
			const query = `
          INSERT INTO clubs (name, password, campus_num)
          VALUES ($1, $2, $3) 
          RETURNING club_id, name, campus_num;
        `;
			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(password, salt);

			const result = await client.query(query, [name, hash, campusNum]);
			client.release();

			const club = result.rows[0];
			const token = jwt.sign(
				{
					club_id: club.club_id,
				},
				JWT_SECRET,
				{ expiresIn: "24h" }
			);

			res.status(201).json({
				club: {
					club_id: club.club_id,
					name: club.name,
				},
				token,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({
				message: "Internal server error: " + error,
			});
		}
	}
);

// Route pour se connecter à un club
router.post(
	"/login",
	body("clubId")
		.notEmpty()
		.isInt()
		.withMessage("Veuillez entrer un identifiant valide !"),
	body("password")
		.isLength({ min: 8 })
		.matches(/[a-z]/)
		.matches(/[A-Z]/)
		.matches(/\d/)
		.withMessage(
			"Le mot de passe doit avoir au minimum 8 caractères, une minuscule, une majuscule et un chiffre !"
		),
	Validate,
	async (req, res) => {
		try {
			const { clubId, password } = req.body;
			const client = await connectToPool();
			const query = `
          SELECT club_id, password
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
			const isPasswordValid = await bcrypt.compare(
				password,
				club.password
			);

			if (!isPasswordValid) {
				res.status(401).json({
					message: "Mot de passe invalide !",
				});
				return;
			}

			//Génération du token
			const token = jwt.sign(
				{
					club_id: club.club_id,
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
);

export default router;
