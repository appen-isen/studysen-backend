import { sql } from 'drizzle-orm';
import type { Request, Response } from 'express';
import type { AuthenticatedClubRequest } from '@/middlewares/auth';
import { uploadImageToCDN } from '@/utils/cdn';
import { query } from '@/utils/database';
import Logger from '@/utils/logger';

const logger = new Logger('Clubs');

/// Fonction pour ajouter une image à un club
export async function addImageToClub(req: AuthenticatedClubRequest, res: Response) {
  const clubId = (req as AuthenticatedClubRequest).clubId;
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'Veuillez fournir une image' });
      return;
    }

    const imageUrl = await uploadImageToCDN(file);

    // Enregistrer l'URL de l'image dans la base de données
    await query(sql`UPDATE clubs SET image_url = ${imageUrl} WHERE club_id = ${clubId}`);

    res.status(200).json({
      message: 'Image ajoutée avec succès',
      url: imageUrl
    });
  } catch (error) {
    logger.error(`Erreur lors de l'ajout de l'image au club (ID: ${clubId}):`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/// Fonction pour récupérer l'image d'un club
export async function getClubImage(req: Request, res: Response) {
  try {
    // Vérifier si l'identifiant du club est valide
    const clubId = parseInt(req.params.id, 10);

    const rows = await query(sql`
            SELECT image_url FROM clubs WHERE club_id = ${clubId}
        `);

    if (rows.length === 0) {
      res.status(404).json({
        message: 'Aucun club trouvé avec cet identifiant'
      });
      return;
    }

    const imageUrl = (rows as any)[0].image_url;

    // Vérifier s'il y a une image associée au club'
    if (!imageUrl) {
      res.status(404).json({
        message: 'Aucune image trouvée pour ce club'
      });
      return;
    }
    res.status(200).json({
      imageUrl: imageUrl
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération de l'image du club:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
