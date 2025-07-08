import { Expo } from 'expo-server-sdk';
import { connectToPool } from '@/utils/database';

let expo = new Expo();

export async function sendNotification(device_id: string, title: string, message: string, date: string) {
  // Create the message
  let messages = [];
  if (!Expo.isExpoPushToken(device_id)) {
    console.error(`Push token ${device_id} is not a valid Expo push token`);
    return;
  }
  console.log(
    '[' + Date.now().toLocaleString() + '] Sending notification to',
    device_id,
    'with title:',
    title
  );

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
      console.error(error);
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

        // Log de la notification envoyée avec la date d'envoi et le titre
        console.log(
          `Notification envoyée à ${notification.device_id} le ${notification.date.toLocaleString()} avec le titre "${notification.title}"`
        );

        // Suppression après envoi réussi
        const deleteQuery = `
                    DELETE FROM notifications
                    WHERE notification_id = $1
                `;
        await client.query(deleteQuery, [notification.notification_id]);
      } catch (notifError) {
        console.error(
          `Erreur lors du traitement de la notification ${notification.notification_id}:`,
          notifError
        );
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des notifications:', error);
  } finally {
    await client.release();
  }
}

checkAndSendNotifications();

setInterval(checkAndSendNotifications, 60000);
