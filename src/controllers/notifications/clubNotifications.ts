import { sql } from 'drizzle-orm';
import { Expo } from 'expo-server-sdk';
import { query } from '@/utils/database';
import Logger from '@/utils/logger';

const logger = new Logger('Notifications');

const expo = new Expo();

export async function sendNotificationToDevices(campus_id: number, title: string, message: string) {
  try {
    // Récupérer tous les devices pour le campus spécifié
    const rows = await query(sql`SELECT device_id FROM devices WHERE campus_id = ${campus_id}`);
    if (rows.length === 0) {
      logger.info(`Aucun device trouvé pour le campus ${campus_id}`);
      return;
    }
    const devices = (rows as any).map((row: any) => row.device_id);

    // On créé la notification pour chaque device
    const messages = [];
    for (const pushToken of devices) {
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
  } catch (error) {
    logger.error("Erreur lors de l'envoi des notifications:", error);
  }
}
