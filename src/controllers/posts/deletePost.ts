import { Response } from 'express';
import { AuthenticatedClubRequest } from '@/middlewares/auth';
import { query } from '@/utils/database';
import { deleteImageFromCDN } from '@/utils/cdn';
import Logger from '@/utils/logger';
import { sql } from 'drizzle-orm';

const logger = new Logger('Posts');

export async function deletePost(req: AuthenticatedClubRequest, res: Response) {
  try {
    const { postId } = req.body;
    // On supprime le post de la base de données en récupérant l'url de l'image pour la supprimer du CDN
    const rows = await query(sql`
            DELETE FROM posts
            WHERE post_id = ${postId} AND club_id = ${req.clubId}
            RETURNING image_url;
        `);

    // Vérifier si le post existe et appartient au club
    if (rows.length === 0) {
      res.status(404).json({ message: 'Post non trouvé' });
      return;
    }

    // Si le post a été supprimé, on supprime l'image du CDN
    const imageUrl = (rows as any)[0].image_url;
    if (imageUrl) {
      await deleteImageFromCDN(imageUrl);
    }
    logger.info(`Post supprimé avec succès pour le club ${req.clubId} (ID: ${postId})`);
    res.status(200).json({ message: 'Post supprimé avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la suppression du post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
