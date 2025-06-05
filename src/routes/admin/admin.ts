import express from 'express';
import jwt from 'jsonwebtoken';
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/login', (req, res) => {
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
