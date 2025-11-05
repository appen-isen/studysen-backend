import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, query } from 'express-validator';
import multer from 'multer';
import { addImageToPost, createPost, editPost } from '@/controllers/posts/createPost';
import { deletePost } from '@/controllers/posts/deletePost';
import { getAllPosts, getClubPosts, getLastPost, getLastPostId } from '@/controllers/posts/getPost';
import { type AuthenticatedClubRequest, verifyClubAuth } from '@/middlewares/auth';
import Validate from '@/middlewares/validate';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const _postsLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 10, // each IP can make up to 10 requests per `windowsMs` (10 minutes)
  standardHeaders: true, // add the `RateLimit-*` headers to the response
  legacyHeaders: false // remove the `X-RateLimit-*` headers from the response
});

// Route pour créer un post
router.post(
  '/',
  // postsLimiter,
  verifyClubAuth,
  body('type').isString().isIn(['event', 'post']).withMessage('Veuillez entrer un type valide !'),
  body('title').isString().notEmpty().withMessage('Veuillez entrer un titre valide !'),
  body('date').isDate().withMessage('Veuillez entrer une date valide !'),
  body('sendNotification').isBoolean().withMessage('Veuillez entrer une valeur pour sendNotification !'),
  Validate,
  (req, res) => createPost(req as AuthenticatedClubRequest, res)
);

//Route pour modifier un post
router.put(
  '/',
  verifyClubAuth,
  body('postId').isInt().withMessage('Veuillez entrer un postId valide !'),
  body('type').isString().isIn(['event', 'post']).withMessage('Veuillez entrer un type valide !'),
  body('title').isString().notEmpty().withMessage('Veuillez entrer un titre valide !'),
  body('date').isDate().withMessage('Veuillez entrer une date valide !'),
  Validate,
  (req, res) => editPost(req as AuthenticatedClubRequest, res)
);

// Route pour ajouter une image à un post
router.put(
  '/add-image',
  verifyClubAuth,
  upload.single('image'),
  body('postId').isInt().withMessage('Veuillez entrer un postId valide !'),
  Validate,
  (req, res) => addImageToPost(req as AuthenticatedClubRequest, res)
);

// Route pour supprimer un post
router.delete(
  '/',
  verifyClubAuth,
  body('postId').isInt().withMessage('Veuillez entrer un postId valide !'),
  Validate,
  (req, res) => deletePost(req as AuthenticatedClubRequest, res)
);

// Route pour récupérer tous les posts
router.get(
  '/',
  query('campus').isInt().withMessage('Veuillez entrer un numéro de campus !'),
  Validate,
  getAllPosts
);

// Route pour récupérer le dernier post
router.get(
  '/last',
  query('campus').isInt().withMessage('Veuillez entrer un numéro de campus !'),
  Validate,
  getLastPost
);

// Route pour récupérer uniquement l'ID du dernier post
router.get(
  '/last/id',
  query('campus').isInt().withMessage('Veuillez entrer un numéro de campus !'),
  Validate,
  getLastPostId
);

// Route pour récupérer les posts d'un club spécifique
router.get(
  '/club/:clubId',
  param('clubId').isInt().withMessage('Veuillez entrer un clubId valide'),
  Validate,
  getClubPosts
);

export default router;
