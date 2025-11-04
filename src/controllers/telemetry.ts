import { query } from '@/utils/database';
import Logger from '@/utils/logger';
import { Request, Response } from 'express';
import { sql } from 'drizzle-orm';

const logger = new Logger('Telemetry');

// Récupérer les données de télémétrie
export async function getTelemetry(req: Request, res: Response) {
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
}

// Soumettre des données de télémétrie
export async function submitTelemetry(req: Request, res: Response) {
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

// Supprimer des données de télémétrie
export async function deleteTelemetry(req: Request, res: Response) {
  try {
    const ids: number[] = req.body.ids;
    if (!ids || ids.length === 0) {
      res.status(400).json({ message: "Le tableau d'IDs est vide" });
      return;
    }

    // On supprime les données de télémétrie correspondant au tableau d'IDs
    const placeholders = ids.map((id) => sql`${id}`);
    await query(sql` DELETE FROM telemetry WHERE telemetry_id IN (${sql.join(placeholders, sql.raw(','))})`);
    res.status(200).json({ message: 'Télémétrie supprimée avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la suppression de la télémétrie', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}
