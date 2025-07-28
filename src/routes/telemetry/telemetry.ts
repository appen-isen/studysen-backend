import express from 'express';
import Validate from '@/middlewares/validate';
import { body } from 'express-validator';
import { connectToPool } from '@/utils/database';
import Logger from '@/utils/logger';
import { verifyAdminAuth } from '@/middlewares/auth';

const router = express.Router();

const logger = new Logger('Telemetry');

// Route pour récupérer les données
router.get('/', verifyAdminAuth, async (req, res) => {
  try {
    const { type } = req.body;
    const client = await connectToPool();
    // On récupère les données de télémétrie, filtrées par type si spécifié
    let query = 'SELECT *, telemetry_id AS id FROM telemetry';
    let params: any[] = [];
    if (type) {
      query += ' WHERE type = $1';
      params = [type];
    }
    const result = await client.query(query, params);
    res.status(200).json(result.rows);
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
      const client = await connectToPool();
      const { type, data } = req.body;
      const dataArray: string[] = data;

      // On ajoute chaque valeur de données à la table de télémétrie si elle n'existe pas déjà
      for (const value of dataArray) {
        const existsQuery = 'SELECT * FROM telemetry WHERE type = $1 AND data = $2';
        const existsResult = await client.query(existsQuery, [type, value]);
        if (existsResult.rows.length === 0) {
          // Si la valeur n'existe pas, on l'insère
          const insertQuery = 'INSERT INTO telemetry (type, data) VALUES ($1, $2)';
          await client.query(insertQuery, [type, value]);
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
  verifyAdminAuth,
  async (req, res) => {
    try {
      const { ids } = req.body;
      const client = await connectToPool();

      // On supprime les données de télémétrie correspondant au tableau d'IDs
      const deleteQuery = 'DELETE FROM telemetry WHERE telemetry_id = ANY($1)';
      await client.query(deleteQuery, [ids]);
      res.status(200).json({ message: 'Télémétrie supprimée avec succès' });
    } catch (error) {
      logger.error('Erreur lors de la suppression de la télémétrie', error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }
);

export default router;
