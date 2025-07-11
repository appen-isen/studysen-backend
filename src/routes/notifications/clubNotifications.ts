import { Expo } from 'expo-server-sdk';
import { connectToPool } from '@/utils/database';
import Logger from '@/utils/logger';

const logger = new Logger('Notifications');

let expo = new Expo();

export async function sendNotificationToDevices(campus_id: number, title: string, message: string) {
  const client = await connectToPool();
  try {
    // Récupérer tous les devices pour le campus spécifié
    const query = `
      SELECT device_id FROM devices WHERE campus_id = $1;
    `;
    const result = await client.query(query, [campus_id]);
    if (result.rowCount === 0) {
      logger.info(`Aucun device trouvé pour le campus ${campus_id}`);
      return;
    }
    const devices = result.rows.map((row) => row.device_id);

    // On créé la notification pour chaque device
    let messages = [];
    for (let pushToken of devices) {
      if (!Expo.isExpoPushToken(pushToken)) {
        logger.error(`Le token ${pushToken} n'est pas un token Expo valide`);
        continue;
      }
      messages.push({
        to: pushToken,
        sound: 'default',
        title: title,
        body: message,
        data: { device_id: pushToken }
      });
    }

    // Envoi des notifications
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
  } catch (error) {
    logger.error("Erreur lors de l'envoi des notifications:", error);
  } finally {
    await client.release();
  }
}
