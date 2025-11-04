import express from 'express';
import Validate from '@/middlewares/validate';
import { body } from 'express-validator';
import { verifyAdminAuth } from '@/middlewares/auth';
import { getTelemetry, submitTelemetry, deleteTelemetry } from '@/controllers/telemetry';

const router = express.Router();

// Route pour récupérer les données de télémétrie
router.get('/', verifyAdminAuth, getTelemetry);

// Route pour soumettre des données de télémétrie
router.post(
  '/submit',
  body('type').isString().withMessage('Type requis'),
  body('data')
    .isArray()
    .withMessage('Données requises sous forme de tableau')
    .custom((arr) => arr.every((item: unknown) => typeof item === 'string'))
    .withMessage('Chaque élément du tableau doit être une chaîne de caractères'),
  Validate,
  submitTelemetry
);

// Route pour supprimer des données de télémétrie
router.delete(
  '/',
  body('ids').isArray().withMessage("Un tableau d'ID est requis"),
  body('ids.*').isInt().withMessage('Chaque ID doit être un entier'),
  verifyAdminAuth,
  Validate,
  deleteTelemetry
);

export default router;
