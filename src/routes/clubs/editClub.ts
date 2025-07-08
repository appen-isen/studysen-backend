import { Request, Response } from 'express';
import { connectToPool } from '@/utils/database';
import bcrypt from 'bcrypt';

export async function editClub(req: Request, res: Response) {
  try {
    const { clubId, name, password, campusId } = req.body;
    const client = await connectToPool();

    let updateQuery: string;
    let queryParams: any[];

    if (password && password.trim() !== '') {
      // On met à jour le mot de passe seulement si un mot de passe est fourni
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      updateQuery = `
            UPDATE clubs
            SET name = $1, password = $2, campus_id = $3
            WHERE club_id = $4;`;
      queryParams = [name, hash, campusId, clubId];
    } else {
      // On met à jour le nom et le campus
      updateQuery = `
            UPDATE clubs
            SET name = $1, campus_id = $2
            WHERE club_id = $3;`;
      queryParams = [name, campusId, clubId];
    }

    const result = await client.query(updateQuery, queryParams);
    client.release();

    res.status(200).json({
      message: 'Club mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du club:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du club' });
  }
}
