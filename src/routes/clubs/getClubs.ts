import { Request, Response } from 'express';
import { connectToPool } from '@/utils/database';
import { AuthenticatedClubRequest } from '@/middlewares/auth';

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

export async function getAllClubs(req: Request, res: Response) {
  try {
    const client = await connectToPool();
    // On récupère tous les clubs actifs
    const result = await client.query('SELECT * FROM clubs');
    client.release();
    const clubs = result.rows.map((row) => ({
      clubId: row.club_id,
      name: row.name,
      campusId: row.campus_id,
      imageUrl: row.image_url,
      enabled: row.enabled
    }));
    res.status(200).json(clubs);
  } catch (error) {
    console.error('Erreur lors de la récupération des clubs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des clubs' });
  }
}

export async function getCurrentClub(req: AuthenticatedClubRequest, res: Response) {
  try {
    const client = await connectToPool();
    const clubId = req.clubId;
    // On récupère le club actuellement connecté
    const result = await client.query(
      'SELECT club_id, name, campus_id, image_url FROM clubs WHERE enabled = TRUE AND club_id = $1',
      [clubId]
    );
    client.release();
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Aucun club trouvé' });
      return;
    }
    const row = result.rows[0];
    const club = {
      clubId: row.club_id,
      name: row.name,
      campusId: row.campus_id,
      imageUrl: row.image_url
    };
    res.status(200).json(club);
  } catch (error) {
    console.error('Erreur lors de la récupération du club:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du club' });
  }
}
