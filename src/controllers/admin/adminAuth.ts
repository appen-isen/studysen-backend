import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Route pour vérifier si l'utilisateur est un administrateur
export async function verifyAdmin(req: Request, res: Response) {
  res.sendStatus(200);
}

// Route pour se connecter en tant qu'administrateur
export async function loginAdmin(req: Request, res: Response) {
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
}
