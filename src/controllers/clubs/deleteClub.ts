import { sql } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { deleteImageFromCDN } from '@/utils/cdn';
import { query } from '@/utils/database';
import Logger from '@/utils/logger';

const logger = new Logger('Clubs');

export async function deleteClub(req: Request, res: Response) {
  const { clubId } = req.body;
  try {
    // Supprimer d'abord les posts liés à ce club
    await query(sql`DELETE FROM posts WHERE club_id = ${clubId}`);

    // On supprime le club de la base de données en récupérant l'url de l'image pour la supprimer du CDN
    const rows = await query(sql`
              DELETE FROM clubs
              WHERE club_id = ${clubId}
              RETURNING image_url;
          `);

    // Vérifier si le club existe
    if (rows.length === 0) {
      res.status(404).json({ message: 'Club non trouvé' });
      return;
    }

    // Si le club a été supprimé, on supprime l'image du CDN
    const imageUrl = (rows as any)[0].image_url;
    if (imageUrl) {
      await deleteImageFromCDN(imageUrl);
    }
    logger.info(`Club supprimé avec succès (ID: ${clubId})`);
    res.status(200).json({ message: 'Club supprimé avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la suppression du club:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
