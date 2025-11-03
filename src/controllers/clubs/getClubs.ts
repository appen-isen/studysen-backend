import { Request, Response } from 'express';
import { query } from '@/utils/database';
import { AuthenticatedClubRequest } from '@/middlewares/auth';
import Logger from '@/utils/logger';
import { sql } from 'drizzle-orm';

const logger = new Logger('Clubs');

export async function getClubsByCampus(req: Request, res: Response) {
  try {
    // On récupère tous les clubs actifs pour le campus donné
    const rows = await query(sql`
      SELECT club_id, name, campus_id, image_url FROM clubs WHERE enabled = TRUE AND campus_id = ${Number(
        req.params.campusId
      )}
    `);
    const clubs = rows.map((row: any) => ({
      clubId: row.club_id,
      name: row.name,
      campusId: row.campus_id,
      imageUrl: row.image_url
    }));
    res.status(200).json(clubs);
    return;
  } catch (error) {
    logger.error('Erreur lors de la récupération des clubs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des clubs' });
    return;
  }
}

export async function getAllClubs(req: Request, res: Response) {
  try {
    // On récupère tous les clubs actifs
    const rows = await query(sql`SELECT * FROM clubs`);
    const clubs = rows.map((row: any) => ({
      clubId: row.club_id,
      name: row.name,
      campusId: row.campus_id,
      imageUrl: row.image_url,
      contactEmail: row.contact_email,
      enabled: row.enabled
    }));
    res.status(200).json(clubs);
  } catch (error) {
    logger.error('Erreur lors de la récupération des clubs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des clubs' });
  }
}

export async function getCurrentClub(req: AuthenticatedClubRequest, res: Response) {
  const clubId = req.clubId;
  try {
    // On récupère le club actuellement connecté
    const rows = await query(sql`
      SELECT club_id, name, campus_id, image_url FROM clubs WHERE enabled = TRUE AND club_id = ${clubId}
    `);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Aucun club trouvé' });
      return;
    }
    const row = (rows as any)[0];
    const club = {
      clubId: row.club_id,
      name: row.name,
      campusId: row.campus_id,
      imageUrl: row.image_url
    };
    res.status(200).json(club);
  } catch (error) {
    logger.error(`Erreur lors de la récupération du club (ID: ${clubId}):`, error);
    res.status(500).json({ message: 'Erreur lors de la récupération du club' });
  }
}
