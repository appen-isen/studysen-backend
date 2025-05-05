import { AuthenticatedClubRequest, verifyClubAuth } from "@/middlewares/auth";
import express from "express";
import { createPost } from "./createPost";
import { body, param } from "express-validator";
import Validate from "@/middlewares/validate";
import { getAllPosts, getLastPost } from "./getPost";

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

// Route pour récupérer tous les posts
router.get("/all", getAllPosts);

// Route pour récupérer le dernier post
router.get("/last", getLastPost);

export default router;
