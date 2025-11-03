import { verifyAdminAuth } from '@/middlewares/auth';
import express from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 10, // each IP can make up to 10 requests per `windowsMs` (5 minutes)
  standardHeaders: true, // add the `RateLimit-*` headers to the response
  legacyHeaders: false // remove the `X-RateLimit-*` headers from the response
});

// Route pour vérifier si l'utilisateur est un administrateur
router.get('/verify', verifyAdminAuth, (req, res) => {
  res.sendStatus(200);
});

router.post('/login', adminLimiter, (req, res) => {
  const { key } = req.body;

  if (key !== process.env.ADMIN_KEY) {
    res.status(401).json({ message: 'Clé admin invalide !' });
    return;
  }
  //Génération du token admin
  const token = jwt.sign(
    {
      admin: true
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  // Envoi du token dans le cookie
  res.cookie('adminToken', token, {
    maxAge: 7 * 24 * 3600 * 1000,
    sameSite: 'lax',
    httpOnly: true
  });
  res.sendStatus(200);
});

export default router;
