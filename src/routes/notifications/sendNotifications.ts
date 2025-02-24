import { Expo } from 'expo-server-sdk';
import { connectToPool } from "@/utils/database";

let expo = new Expo();

export async function sendNotification(user_id: string, device_id: string, title: string, message: string, date: string) {
    const currentDate = new Date();
    const notificationDate = new Date(date);

    // Check if the notification date is older than the current date
    if (notificationDate < currentDate) {
        // Create the message
        let messages = [];
        if (!Expo.isExpoPushToken(device_id)) {
            console.error(`Push token ${device_id} is not a valid Expo push token`);
            return;
        }

        messages.push({
            to: device_id,
            sound: 'default',
            title: title,
            body: message,
            data: { user_id, device_id, title, message, date },
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
}

async function checkAndSendNotifications() {
    const client = await connectToPool();
    const currentDate = new Date();
    

    try {
        // Query for notifications that need to be sent
        const query = `
            SELECT * FROM notifications
            WHERE date < $1
        `;
        const result = await client.query(query, [currentDate]);

        // Send and delete each notification
        for (const notification of result.rows) {
            await sendNotification(
                notification.user_id,
                notification.device_id,
                notification.title,
                notification.message,
                notification.date
            );

            // Delete the notification from the database
            const deleteQuery = `
                DELETE FROM notifications
                WHERE notification_id = $1
            `;
            await client.query(deleteQuery, [notification.notification_id]);
        }
    } catch (error) {
        console.error('Error checking and sending notifications:', error);
    } finally {
        client.release();
    }
}

setInterval(checkAndSendNotifications, 60000);