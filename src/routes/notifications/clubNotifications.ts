import { Expo } from 'expo-server-sdk';
import { connectToPool } from '@/utils/database';

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
      console.log(`Aucun device trouvé pour le campus ${campus_id}`);
      return;
    }
    const devices = result.rows.map((row) => row.device_id);

    // On créé la notification pour chaque device
    let messages = [];
    for (let pushToken of devices) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
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
        console.error(error);
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi des notifications:", error);
  } finally {
    await client.release();
  }
}
