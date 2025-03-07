import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { connectToPool } from "@/utils/database";

const router = express.Router();
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register route
router.post("/register", async (req, res) => {
  try {
    const { email, password, username, promo, isenId, campus } = req.body;
    const client = await connectToPool();
    const query = `
      INSERT INTO users (email, password, username, promo, isenId, campus)
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING user_id, email, username, promo, isenId, campus;
    `;
    const result = await client.query(query, [email, password, username, promo, isenId, campus]);
    client.release();

        const user = result.rows[0];
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                username: user.username,
                promo: user.promo,
                isenId: user.isenid,
                campus: user.campus,
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            user: {
                user_id: user.user_id,
                email: user.email,
                username: user.username,
                promo: user.promo,
                isenId: user.isenid,
                campus: user.campus,
            },
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error: " + error });
    }
});

// Login route
// @ts-ignore
router.post("/login", async (req, res) => {
    try {
        if (req.body.token && !req.body.email && !req.body.password) {
            try {
                const decoded = jwt.verify(req.body.token, JWT_SECRET) as jwt.JwtPayload;
                const newToken = jwt.sign(
                    {
                        user_id: decoded.user_id,
                        email: decoded.email,
                        username: decoded.username,
                        promo: decoded.promo,
                        isenId: decoded.isenId,
                        campus: decoded.campus
                    },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                return res.status(200).json({
                    user: {
                        user_id: decoded.user_id,
                        email: decoded.email,
                        username: decoded.username,
                        promo: decoded.promo,
                        isenId: decoded.isenId,
                        campus: decoded.campus
                    },
                    token: newToken
                });
            } catch (error) {
                console.error(error);
                return res.status(401).json({ message: "Invalid or expired token" });
            }
        }

        const { email, password } = req.body;
        const client = await connectToPool();
        const query = `
            SELECT * FROM users
            WHERE email = $1 AND password = $2
        `;
        const result = await client.query(query, [email, password]);
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = result.rows[0];
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                username: user.username,
                promo: user.promo,
                isenId: user.isenid,
                campus: user.campus,
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            user: {
                user_id: user.user_id,
                email: user.email,
                username: user.username,
                promo: user.promo,
                isenId: user.isenid,
                campus: user.campus,
            },
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error: " + error });
    }
});

export default router;