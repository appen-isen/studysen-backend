import { AuthenticatedClubRequest, verifyClubAuth } from "@/middlewares/auth";
import express from "express";
import { createPost } from "./createPost";
import { body } from "express-validator";
import Validate from "@/middlewares/validate";

const router = express.Router();

// Route pour créer un post
router.post(
	"/create",
	verifyClubAuth,
	body("type")
		.exists()
		.isString()
		.isIn(["event", "post"])
		.withMessage("Veuillez entrer un type valide !"),
	body("title")
		.isString()
		.notEmpty()
		.withMessage("Veuillez entrer un titre valide !"),
	body("date")
		.exists()
		.isDate()
		.withMessage("Veuillez entrer une date valide !"),
	Validate,
	(req, res) => createPost(req as AuthenticatedClubRequest, res)
);

export default router;
