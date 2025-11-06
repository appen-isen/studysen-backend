import express from 'express';
import Validate from '@/middlewares/validate';
import { body, param } from 'express-validator';
import { activateClub, adminLoginClub, createClub, loginClub } from '../controllers/clubs/clubAuth';
import { AuthenticatedClubRequest, verifyAdminAuth, verifyClubAuth } from '@/middlewares/auth';
import multer from 'multer';
import { addImageToClub, getClubImage } from '../controllers/clubs/clubImage';
import { getAllClubs, getClubsByCampus, getCurrentClub } from '../controllers/clubs/getClubs';
import { deleteClub } from '../controllers/clubs/deleteClub';
import { editClub } from '../controllers/clubs/editClub';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 50, // each IP can make up to 50 requests per `windowsMs` (5 minutes)
  standardHeaders: true, // add the `RateLimit-*` headers to the response
  legacyHeaders: false, // remove the `X-RateLimit-*` headers from the response
  validate: { trustProxy: false }
});

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Route récupérer les informations du club actuellement connecté
router.get('/me', verifyClubAuth, (req, res) => getCurrentClub(req as AuthenticatedClubRequest, res));

// Route pour récupérer tous les clubs
router.get('/all', verifyAdminAuth, (req, res) => {
  getAllClubs(req, res);
});

// Route pour récupérer les clubs par campus
router.get(
  '/:campusId',
  param('campusId').isInt().withMessage('Veuillez entrer un campusId valide'),
  Validate,
  getClubsByCampus
);

// Route pour supprimer un club (administrateur uniquement)
router.delete(
  '/',
  verifyAdminAuth,
  body('clubId').isInt().withMessage('Veuillez entrer un clubId valide'),
  Validate,
  deleteClub
);

// Route pour créer un club
router.post(
  '/create',
  authLimiter,
  // Vérification combinée du mot de passe avec une seule regex
  body('name').isLength({ min: 2 }).withMessage('Veuillez entrer un nom valide !'),
  body('password')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .withMessage(
      'Le mot de passe doit avoir au minimum 8 caractères, une minuscule, une majuscule et un chiffre !'
    ),
  body('campusId').isInt().withMessage('Veuillez entrer un campusId valide'),
  body('contactEmail').isEmail().withMessage('Veuillez entrer une adresse email valide !'),
  Validate,
  createClub
);

// Route pour se connecter à un club
router.post(
  '/login',
  authLimiter,
  body('clubId').isInt().withMessage('Veuillez entrer un identifiant valide !'),
  body('password')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .withMessage(
      'Le mot de passe doit avoir au minimum 8 caractères, une minuscule, une majuscule et un chiffre !'
    ),
  Validate,
  loginClub
);

// Route pour se connecter à un club via le mode administrateur
router.post(
  '/admin-login',
  verifyAdminAuth,
  body('clubId').isInt().withMessage('Veuillez entrer un identifiant valide !'),
  Validate,
  adminLoginClub
);

// Route pour se déconnecter d'un club
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true
  });
  res.sendStatus(200);
});

// Route pour activer un club
router.post(
  '/activate',
  verifyAdminAuth,
  body('clubId').isInt().withMessage('Veuillez entrer un clubId valide'),
  Validate,
  activateClub
);

//Route pour modifier les informations d'un club
router.put(
  '/edit',
  verifyAdminAuth,
  body('clubId').isInt().withMessage('Veuillez entrer un clubId valide'),
  body('name').isLength({ min: 2 }).withMessage('Veuillez entrer un nom valide !'),
  body('campusId').isInt().withMessage('Veuillez entrer un campusId valide'),
  body('contactEmail').isEmail().withMessage('Veuillez entrer une adresse email valide !'),
  Validate,
  editClub
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
