import { AuthenticatedClubRequest, verifyClubAuth } from "@/middlewares/auth";
import express from "express";
import { addImageToPost, createPost } from "./createPost";
import { body } from "express-validator";
import Validate from "@/middlewares/validate";
import { getAllPosts, getLastPost } from "./getPost";
import multer from "multer";
import { deletePost } from "./deletePost";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Route pour créer un post
router.post(
	"/",
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

// Route pour ajouter une image à un post
router.put(
	"/add-image",
	verifyClubAuth,
	upload.single("image"),
	body("postId")
		.exists()
		.isInt()
		.withMessage("Veuillez entrer un postId valide !"),
	Validate,
	(req, res) => addImageToPost(req as AuthenticatedClubRequest, res)
);

// Route pour supprimer un post
router.delete(
	"/",
	verifyClubAuth,
	body("postId")
		.exists()
		.isInt()
		.withMessage("Veuillez entrer un postId valide !"),
	Validate,
	(req, res) => deletePost(req as AuthenticatedClubRequest, res)
);

// Route pour récupérer tous les posts
router.get("/", getAllPosts);

// Route pour récupérer le dernier post
router.get("/last", getLastPost);

export default router;
