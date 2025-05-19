import { Request, Response } from 'express';
import { connectToPool } from '@/utils/database';

export async function getClubsByCampus(req: Request, res: Response) {
  try {
    const client = await connectToPool();
    // On récupère tous les clubs actifs pour le campus donné
    const result = await client.query(
      'SELECT club_id, name, campus_id, image_url FROM clubs WHERE enabled = TRUE AND campus_id = $1',
      [req.params.campusId]
    );
    client.release();
    const clubs = result.rows.map((row) => ({
      clubId: row.club_id,
      name: row.name,
      campusId: row.campus_id,
      imageUrl: row.image_url
    }));
    res.status(200).json(clubs);
    return;
  } catch (error) {
    console.error('Erreur lors de la récupération des clubs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des clubs' });
    return;
  }
}
