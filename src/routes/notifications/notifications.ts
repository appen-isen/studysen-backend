import express from "express";
import dotenv from "dotenv";
import { connectToPool } from "@/utils/database";
import { sendNotification } from "@/routes/notifications/sendNotifications";

const router = express.Router();

dotenv.config();

router.post("/add-notifications", async (req, res) => {
    try {
        const { user_id, device_id, title, message, date } = req.body;
        const client = await connectToPool();
        const query = `
            INSERT INTO notifications (user_id, device_id, title, message, date)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;
        const result = await client.query(query, [user_id, device_id, title, message, date]);
        client.release();
        res.status(201).json(result.rows[0]);
    } catch (error) {
        // @ts-ignore
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
});

router.post("/send-notifications", async (req, res) => {
    try {
        const { user_id, device_id, title, message, date } = req.body;
        await sendNotification(user_id, device_id, title, message, date);
        res.status(200).json({ message: 'Notification sent successfully' });
    } catch (error) {
        // @ts-ignore
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
});

router.delete("/delete-notifications/:user_id", async (req, res) => {
    try {
        const { user_id } = req.params;
        const client = await connectToPool();
        const query = `
            DELETE FROM notifications
            WHERE user_id = $1
        `;
        await client.query(query, [user_id]);
        client.release();
        res.status(200).json({ message: 'All notifications deleted successfully' });
    } catch (error) {
        // @ts-ignore
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
});

export default router;