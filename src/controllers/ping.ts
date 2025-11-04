import { Request, Response } from 'express';

// Route de test simple
export async function ping(req: Request, res: Response) {
  try {
    res.status(200).json({ ping: 'pong' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error ' + error });
  }
}
