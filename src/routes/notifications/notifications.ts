import express from 'express';
import { connectToPool } from '@/utils/database';
import { sendNotification } from '@/routes/notifications/sendNotifications';
import Validate from '@/middlewares/validate';
import { body, param } from 'express-validator';
import Logger from '@/utils/logger';

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
      const client = await connectToPool();

      // On vérifie si le périphérique existe déjà
      const checkQuery = `SELECT * FROM devices WHERE device_id = $1`;
      const checkResult = await client.query(checkQuery, [device_id]);
      if (checkResult.rowCount && checkResult.rowCount > 0) {
        client.release();
        res.sendStatus(200);
        return;
      }

      const query = `
      INSERT INTO devices (device_id, campus_id)
      VALUES ($1, $2) RETURNING *;
    `;
      const result = await client.query(query, [device_id, campus_id]);
      client.release();
      res.status(201).json(result.rows[0]);
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
    const client = await connectToPool();
    const query = `
      DELETE FROM devices
      WHERE device_id = $1
    `;
    await client.query(query, [device_id]);
    client.release();
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
    const client = await connectToPool();
    const query = `
      INSERT INTO notifications (device_id, title, message, date)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const result = await client.query(query, [device_id, title, message, date]);
    client.release();
    res.status(201).json(result.rows[0]);
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
    const client = await connectToPool();
    const query = `
      DELETE FROM notifications
      WHERE device_id = $1
    `;
    await client.query(query, [device_id]);
    client.release();
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
    const client = await connectToPool();
    const query = `
      SELECT * FROM notifications WHERE device_id = $1;
    `;
    const response = await client.query(query, [device_id]);
    client.release();
    if (response.rowCount === 0) {
      res.status(204).json({ message: 'Empty' });
      return;
    }
    res.status(200).json({ message: response.rows });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error: ' + error });
  }
});

export default router;
