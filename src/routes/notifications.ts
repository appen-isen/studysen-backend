import express from 'express';
import { query } from '@/utils/database';
import { sendNotification } from '@/controllers/notifications/sendNotifications';
import Validate from '@/middlewares/validate';
import { body, param } from 'express-validator';
import Logger from '@/utils/logger';
import { sql } from 'drizzle-orm';

const router = express.Router();

const logger = new Logger('Notifications');

// On enregistre un nouveau périphérique pour les notifications
router.post(
  '/add-device',
  body('device_id').notEmpty(),
  body('campus_id').isInt(),
  Validate,
  async (req, res) => {
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
);

// On supprime un périphérique
router.delete('/delete-device/:device_id', param('device_id').notEmpty(), Validate, async (req, res) => {
  try {
    const { device_id } = req.params;
    await query(sql`DELETE FROM devices WHERE device_id = ${device_id}`);
    res.sendStatus(200);
  } catch (error) {
    logger.error('Erreur lors de la suppression du périphérique:', error);
    res.status(500).json({ message: 'Internal server error: ' + error });
  }
});

router.post('/add-notifications', async (req, res) => {
  try {
    // On ajoute une notification à la base de données
    const { device_id, title, message, date } = req.body;
    const rows = await query(sql`
      INSERT INTO notifications (device_id, title, message, date)
      VALUES (${device_id}, ${title}, ${message}, ${date}) RETURNING *
    `);
    res.status(201).json((rows as any)[0]);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error: ' + error });
  }
});

router.post('/send-notifications', async (req, res) => {
  try {
    // On envoie une notification
    const { device_id, title, message, date } = req.body;
    await sendNotification(device_id, title, message, date);
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error: ' + error });
  }
});

router.delete('/delete-notifications/:device_id', async (req, res) => {
  try {
    // On supprime toutes les notifications pour un device_id
    const { device_id } = req.params;
    await query(sql`DELETE FROM notifications WHERE device_id = ${device_id}`);
    res.status(200).json({
      message: 'All notifications deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error: ' + error });
  }
});

router.get('/:device_id', async (req, res) => {
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
});

export default router;
