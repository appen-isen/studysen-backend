import { Response, Request } from 'express';
import { connectToPool } from '@/utils/database';
import { deleteImageFromCDN } from '@/utils/cdn';
import Logger from '@/utils/logger';
const logger = new Logger('Clubs');

export async function deleteClub(req: Request, res: Response) {
  const { clubId } = req.body;
  try {
    const client = await connectToPool();
    // Supprimer d'abord les posts liés à ce club
    await client.query('DELETE FROM posts WHERE club_id = $1', [clubId]);

    // On supprime le club de la base de données en récupérant l'url de l'image pour la supprimer du CDN
    const query = `
              DELETE FROM clubs
              WHERE club_id = $1
              RETURNING image_url;
          `;
    const result = await client.query(query, [clubId]);
    client.release();

    // Vérifier si le club existe
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Club non trouvé' });
      return;
    }

    // Si le club a été supprimé, on supprime l'image du CDN
    const imageUrl = result.rows[0].image_url;
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
