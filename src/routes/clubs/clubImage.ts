import { Request, Response } from 'express';
import { AuthenticatedClubRequest } from '@/middlewares/auth';
import { uploadImageToCDN } from '@/utils/cdn';
import { connectToPool } from '@/utils/database';

/// Fonction pour ajouter une image à un club
export async function addImageToClub(req: AuthenticatedClubRequest, res: Response) {
  try {
    const clubId = (req as AuthenticatedClubRequest).clubId;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'Veuillez fournir une image' });
      return;
    }

    const imageUrl = await uploadImageToCDN(file);

    // Enregistrer l'URL de l'image dans la base de données
    const client = await connectToPool();
    const query = `
            UPDATE clubs
            SET image_url = $1
            WHERE club_id = $2;
        `;
    await client.query(query, [imageUrl, clubId]);
    client.release();

    res.status(200).json({
      message: 'Image ajoutée avec succès',
      url: imageUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error ' + error });
  }
}

/// Fonction pour récupérer l'image d'un club
export async function getClubImage(req: Request, res: Response) {
  try {
    // Vérifier si l'identifiant du club est valide
    const clubId = parseInt(req.params.id, 10);

    const client = await connectToPool();
    const query = `
            SELECT image_url
            FROM clubs
            WHERE club_id = $1;
        `;
    const result = await client.query(query, [clubId]);
    client.release();

    if (result.rows.length === 0) {
      res.status(404).json({
        message: 'Aucun club trouvé avec cet identifiant'
      });
      return;
    }

    const imageUrl = result.rows[0].image_url;

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
    res.status(500).json({ message: 'Internal server error ' + error });
  }
}
