import express from 'express';
import Validate from '@/middlewares/validate';
import { body, param } from 'express-validator';
import { addDevice, deleteDevice } from '@/controllers/notifications/deviceManagement';
import {
  addNotification,
  sendNotificationHandler,
  deleteNotifications,
  getNotifications
} from '@/controllers/notifications/notificationManagement';

const router = express.Router();

// Enregistrer un nouveau périphérique pour les notifications
router.post('/add-device', body('device_id').notEmpty(), body('campus_id').isInt(), Validate, addDevice);

// Supprimer un périphérique
router.delete('/delete-device/:device_id', param('device_id').notEmpty(), Validate, deleteDevice);

// Ajouter une notification à la base de données
router.post('/add-notifications', addNotification);

// Envoyer une notification
router.post('/send-notifications', sendNotificationHandler);

// Supprimer toutes les notifications pour un device_id
router.delete('/delete-notifications/:device_id', deleteNotifications);

// Récupérer toutes les notifications pour un device_id
router.get('/:device_id', getNotifications);

export default router;
