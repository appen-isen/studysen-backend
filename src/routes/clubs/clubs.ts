import express from 'express';
import Validate from '@/middlewares/validate';
import { body, param } from 'express-validator';
import { activateClub, createClub, loginClub } from './clubAuth';
import { AuthenticatedClubRequest, verifyAdminAuth, verifyClubAuth } from '@/middlewares/auth';
import multer from 'multer';
import { addImageToClub, getClubImage } from './clubImage';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Route pour créer un club
router.post(
  '/create',
  // Les verifications de données
  body('name').isLength({ min: 2 }).withMessage('Veuillez entrer un nom valide !'),
  body('password')
    .isLength({ min: 8 })
    .matches(/[a-z]/)
    .matches(/[A-Z]/)
    .matches(/\d/)
    .withMessage(
      'Le mot de passe doit avoir au minimum 8 caractères, une minuscule, une majuscule et un chiffre !'
    ),
  body('campusNum').notEmpty().isInt(),
  Validate,
  createClub
);

// Route pour se connecter à un club
router.post(
  '/login',
  body('clubId').notEmpty().isInt().withMessage('Veuillez entrer un identifiant valide !'),
  body('password')
    .isLength({ min: 8 })
    .matches(/[a-z]/)
    .matches(/[A-Z]/)
    .matches(/\d/)
    .withMessage(
      'Le mot de passe doit avoir au minimum 8 caractères, une minuscule, une majuscule et un chiffre !'
    ),
  Validate,
  loginClub
);

// Route pour activer un club
router.post(
  '/activate',
  verifyAdminAuth,
  body('clubId').exists().isInt().withMessage('Veuillez entrer un clubId valide'),
  Validate,
  activateClub
);

// Route pour ajouter une image à un club
router.put('/image', verifyClubAuth, upload.single('image'), (req, res) =>
  addImageToClub(req as AuthenticatedClubRequest, res)
);

// Route pour récupérer l'image d'un club
router.get(
  '/image/:id',
  param('id').isInt().withMessage('Identifiant de club invalide !'),
  Validate,
  getClubImage
);

export default router;
