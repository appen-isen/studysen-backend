import { sql } from 'drizzle-orm';
import { Expo } from 'expo-server-sdk';
import { query } from '@/utils/database';
import Logger from '@/utils/logger';

const expo = new Expo();
const logger = new Logger('Notifications');

export async function sendNotification(device_id: string, title: string, message: string, date: string) {
  // Create the message
  const messages = [];
  if (!Expo.isExpoPushToken(device_id)) {
    logger.error(`Le token ${device_id} n'est pas un token Expo valide`);
    return;
  }
  logger.info(`Envoi de la notification à ${device_id} avec le titre: ${title}`);

  messages.push({
    to: device_id,
    sound: 'default',
    title: title,
    body: message,
    data: { device_id, title, message, date }
  });

  // Send the notification
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      logger.error("Erreur lors de l'envoi des notifications:", error);
    }
  }
}

async function checkAndSendNotifications() {
  try {
    // Définition de la fenêtre de temps pour les notifications
    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + 60000);
    // Requête principale simplifiée
    const rows = await query(sql`
            SELECT * FROM notifications 
            WHERE date >= ${currentDate.toISOString()}::timestamp
            AND date <= ${futureDate.toISOString()}::timestamp
            ORDER BY date ASC
        `);

    // Traitement des notifications trouvées
    for (const notification of rows as any) {
      try {
        // Envoi de la notification
        await sendNotification(
          notification.device_id,
          notification.title,
          notification.message,
          notification.date
        );
        // Suppression après envoi réussi
        await query(sql`DELETE FROM notifications WHERE notification_id = ${notification.notification_id}`);
      } catch (notifError) {
        logger.error(
          `Erreur lors du traitement de la notification ${notification.notification_id}:`,
          notifError
        );
      }
    }
  } catch (error) {
    logger.error('Erreur lors de la vérification des notifications:', error);
  }
}

setInterval(checkAndSendNotifications, 60000);
