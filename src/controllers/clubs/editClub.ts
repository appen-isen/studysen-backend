import bcrypt from 'bcrypt';
import { sql } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { query } from '@/utils/database';
import Logger from '@/utils/logger';

const logger = new Logger('Clubs');

export async function editClub(req: Request, res: Response) {
  const { clubId, name, password, campusId, contactEmail } = req.body;

  try {
    let _updateQuery: string;
    let _queryParams: any[];

    if (password && password.trim() !== '') {
      // On met à jour le mot de passe seulement si un mot de passe est fourni
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      await query(sql`
    UPDATE clubs
    SET name = ${name}, password = ${hash}, campus_id = ${campusId}, contact_email = ${contactEmail}
    WHERE club_id = ${clubId};`);
    } else {
      // On met à jour le nom et le campus
      await query(sql`
    UPDATE clubs
    SET name = ${name}, campus_id = ${campusId}, contact_email = ${contactEmail}
    WHERE club_id = ${clubId};`);
    }

    logger.info(`Club mis à jour: ${name} (ID: ${clubId})`);
    res.status(200).json({
      message: 'Club mis à jour avec succès'
    });
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour du club (ID: ${clubId}):`, error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du club' });
  }
}
