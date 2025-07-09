import { Expo } from 'expo-server-sdk';
import { connectToPool } from '@/utils/database';
import Logger from '@/utils/logger';

let expo = new Expo();
const logger = new Logger('Notifications');

export async function sendNotification(device_id: string, title: string, message: string, date: string) {
  // Create the message
  let messages = [];
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
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      logger.error("Erreur lors de l'envoi des notifications:", error);
    }
  }
}

async function checkAndSendNotifications() {
  const client = await connectToPool();

  try {
    // Définition de la fenêtre de temps pour les notifications
    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + 60000);
    // Requête principale simplifiée
    const query = `
            SELECT * FROM notifications 
            WHERE date >= $1::timestamp
            AND date <= $2::timestamp
            ORDER BY date ASC;
        `;

    // Exécution de la requête principale
    const result = await client.query(query, [currentDate.toISOString(), futureDate.toISOString()]);

    // Traitement des notifications trouvées
    for (const notification of result.rows) {
      try {
        // Envoi de la notification
        await sendNotification(
          notification.device_id,
          notification.title,
          notification.message,
          notification.date
        );
        // Suppression après envoi réussi
        const deleteQuery = `
                    DELETE FROM notifications
                    WHERE notification_id = $1
                `;
        await client.query(deleteQuery, [notification.notification_id]);
      } catch (notifError) {
        logger.error(
          `Erreur lors du traitement de la notification ${notification.notification_id}:`,
          notifError
        );
      }
    }
  } catch (error) {
    logger.error('Erreur lors de la vérification des notifications:', error);
  } finally {
    await client.release();
  }
}

checkAndSendNotifications();

setInterval(checkAndSendNotifications, 60000);
