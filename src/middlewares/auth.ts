import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export interface AuthenticatedClubRequest extends Request {
  clubId: number;
}

// Middleware pour vérifier l'authentification d'un club
export function verifyClubAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies['token'];

  if (!token) {
    res.status(401).json({ message: 'Token invalide !' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // @ts-ignore
    req.clubId = decoded.clubId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalide !' });
    return;
  }
}
// Middleware pour vérifier l'authentification d'un administrateur
export function verifyAdminAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies['adminToken'];

  if (!token) {
    res.status(401).json({ message: 'Token admin invalide !' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // @ts-ignore
    if (decoded.admin !== true) {
      res.status(403).json({ message: 'Accès interdit !' });
      return;
    }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token admin invalide !' });
    return;
  }
}
