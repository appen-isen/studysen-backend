import { Request, Response } from 'express';
import { connectToPool } from '@/utils/database';
import bcrypt from 'bcrypt';
import Logger from '@/utils/logger';

const logger = new Logger('Clubs');

export async function editClub(req: Request, res: Response) {
  const { clubId, name, password, campusId, contactEmail } = req.body;

  try {
    const client = await connectToPool();

    let updateQuery: string;
    let queryParams: any[];

    if (password && password.trim() !== '') {
      // On met à jour le mot de passe seulement si un mot de passe est fourni
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      updateQuery = `
            UPDATE clubs
            SET name = $1, password = $2, campus_id = $3, contact_email = $4
            WHERE club_id = $5;`;
      queryParams = [name, hash, campusId, contactEmail, clubId];
    } else {
      // On met à jour le nom et le campus
      updateQuery = `
            UPDATE clubs
            SET name = $1, campus_id = $2, contact_email = $3
            WHERE club_id = $4;`;
      queryParams = [name, campusId, contactEmail, clubId];
    }

    await client.query(updateQuery, queryParams);
    client.release();
    logger.info(`Club mis à jour: ${name} (ID: ${clubId})`);
    res.status(200).json({
      message: 'Club mis à jour avec succès'
    });
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour du club (ID: ${clubId}):`, error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du club' });
  }
}
