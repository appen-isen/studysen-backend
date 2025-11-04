import { query } from '@/utils/database';
import Logger from '@/utils/logger';
import { Request, Response } from 'express';
import { sql } from 'drizzle-orm';

const logger = new Logger('Notifications');

// Ajouter un nouveau périphérique pour les notifications
export async function addDevice(req: Request, res: Response) {
  try {
    const { device_id, campus_id } = req.body;

    // On vérifie si le périphérique existe déjà
    const checkRows = await query(sql`SELECT 1 FROM devices WHERE device_id = ${device_id} LIMIT 1`);
    if (checkRows.length > 0) {
      res.sendStatus(200);
      return;
    }

    const rows = await query(sql`
      INSERT INTO devices (device_id, campus_id) VALUES (${device_id}, ${campus_id}) RETURNING *
    `);
    res.status(201).json((rows as any)[0]);
  } catch (error) {
    logger.error("Erreur lors de l'ajout du périphérique:", error);
    res.status(500).json({ message: 'Internal server error: ' + error });
  }
}

// Supprimer un périphérique
export async function deleteDevice(req: Request, res: Response) {
  try {
    const { device_id } = req.params;
    await query(sql`DELETE FROM devices WHERE device_id = ${device_id}`);
    res.sendStatus(200);
  } catch (error) {
    logger.error('Erreur lors de la suppression du périphérique:', error);
    res.status(500).json({ message: 'Internal server error: ' + error });
  }
}
