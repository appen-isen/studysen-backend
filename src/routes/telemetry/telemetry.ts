import express from 'express';
import Validate from '@/middlewares/validate';
import { body } from 'express-validator';
import Logger from '@/utils/logger';
import { verifyAdminAuth } from '@/middlewares/auth';
import { query } from '@/utils/database';
import { sql } from 'drizzle-orm';

const router = express.Router();

const logger = new Logger('Telemetry');

// Route pour récupérer les données
router.get('/', verifyAdminAuth, async (req, res) => {
  try {
    const { type } = req.body;
    // On récupère les données de télémétrie, filtrées par type si spécifié
    const where = type ? sql` WHERE type = ${type}` : sql``;
    const rows = await query(sql`SELECT *, telemetry_id AS id FROM telemetry${where}`);
    res.status(200).json(rows);
  } catch (error) {
    logger.error('Erreur lors de la récupération des données de télémétrie', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Route pour soumettre des données
router.post(
  '/submit',
  body('type').isString().withMessage('Type requis'),
  body('data')
    .isArray()
    .withMessage('Données requises sous forme de tableau')
    .custom((arr) => arr.every((item: unknown) => typeof item === 'string'))
    .withMessage('Chaque élément du tableau doit être une chaîne de caractères'),
  Validate,
  async (req, res) => {
    try {
      const { type, data } = req.body;
      const dataArray: string[] = data;

      // On ajoute chaque valeur de données à la table de télémétrie si elle n'existe pas déjà
      for (const value of dataArray) {
        const exists = await query(
          sql`SELECT 1 FROM telemetry WHERE type = ${type} AND data = ${value} LIMIT 1`
        );
        if (exists.length === 0) {
          // Si la valeur n'existe pas, on l'insère
          await query(sql`INSERT INTO telemetry (type, data) VALUES (${type}, ${value})`);
        }
      }

      res.status(200).json({ message: 'Télémétrie soumise avec succès' });
    } catch (error) {
      logger.error('Erreur lors de la soumission de la télémétrie', error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
      return;
    }
  }
);

// Route pour supprimer des données
router.delete(
  '/',
  body('ids').isArray().withMessage("Un tableau d'ID est requis"),
  body('ids.*').isInt().withMessage('Chaque ID doit être un entier'),
  verifyAdminAuth,
  Validate,
  async (req, res) => {
    try {
      const ids: number[] = req.body.ids;
      if (!ids || ids.length === 0) {
        res.status(400).json({ message: "Le tableau d'IDs est vide" });
        return;
      }

      // On supprime les données de télémétrie correspondant au tableau d'IDs
      const placeholders = ids.map((id) => sql`${id}`);
      await query(
        sql` DELETE FROM telemetry WHERE telemetry_id IN (${sql.join(placeholders, sql.raw(','))})`
      );
      res.status(200).json({ message: 'Télémétrie supprimée avec succès' });
    } catch (error) {
      logger.error('Erreur lors de la suppression de la télémétrie', error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }
);

export default router;
