import express from 'express';
import Validate from '@/middlewares/validate';
import { body, param } from 'express-validator';
import { activateClub, createClub, loginClub } from './clubAuth';
import { AuthenticatedClubRequest, verifyAdminAuth, verifyClubAuth } from '@/middlewares/auth';
import multer from 'multer';
import { addImageToClub, getClubImage } from './clubImage';
import { getClubsByCampus, getCurrentClub } from './getClubs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Route pour récupérer tous les clubs
router.get(
  '/:campusId',
  param('campusId').isInt().withMessage('Veuillez entrer un campusId valide'),
  Validate,
  getClubsByCampus
);

// Route pour créer un club
router.post(
  '/create',
  // Vérification combinée du mot de passe avec une seule regex
  body('name').isLength({ min: 2 }).withMessage('Veuillez entrer un nom valide !'),
  body('password')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .withMessage(
      'Le mot de passe doit avoir au minimum 8 caractères, une minuscule, une majuscule et un chiffre !'
    ),
  body('campusId').isInt().withMessage('Veuillez entrer un campusId valide'),
  Validate,
  createClub
);

// Route pour se connecter à un club
router.post(
  '/login',
  body('clubId').isInt().withMessage('Veuillez entrer un identifiant valide !'),
  body('password')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .withMessage(
      'Le mot de passe doit avoir au minimum 8 caractères, une minuscule, une majuscule et un chiffre !'
    ),
  Validate,
  loginClub
);

// Route pour se déconnecter d'un club
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true
  });
  res.sendStatus(200);
});

// Route récupérer les informations du club actuellement connecté
router.get('/me', verifyClubAuth, (req, res) => getCurrentClub(req as AuthenticatedClubRequest, res));

// Route pour activer un club
router.post(
  '/activate',
  verifyAdminAuth,
  body('clubId').isInt().withMessage('Veuillez entrer un clubId valide'),
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
