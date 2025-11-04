import { query } from '@/utils/database';
import { Request, Response } from 'express';
import { sendNotification } from './sendNotifications';
import { sql } from 'drizzle-orm';

// Ajouter une notification à la base de données
export async function addNotification(req: Request, res: Response) {
  try {
    const { device_id, title, message, date } = req.body;
    const rows = await query(sql`
      INSERT INTO notifications (device_id, title, message, date)
      VALUES (${device_id}, ${title}, ${message}, ${date}) RETURNING *
    `);
    res.status(201).json((rows as any)[0]);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error: ' + error });
  }
}

// Envoyer une notification
export async function sendNotificationHandler(req: Request, res: Response) {
  try {
    const { device_id, title, message, date } = req.body;
    await sendNotification(device_id, title, message, date);
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error: ' + error });
  }
}

// Supprimer toutes les notifications pour un device_id
export async function deleteNotifications(req: Request, res: Response) {
  try {
    const { device_id } = req.params;
    await query(sql`DELETE FROM notifications WHERE device_id = ${device_id}`);
    res.status(200).json({
      message: 'All notifications deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error: ' + error });
  }
}

// Récupérer toutes les notifications pour un device_id
export async function getNotifications(req: Request, res: Response) {
  try {
    const { device_id } = req.params;
    const rows = await query(sql`SELECT * FROM notifications WHERE device_id = ${device_id}`);
    if (rows.length === 0) {
      res.status(204).json({ message: 'Empty' });
      return;
    }
    res.status(200).json({ message: rows });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error: ' + error });
  }
}
