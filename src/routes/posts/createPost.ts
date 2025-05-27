import { AuthenticatedClubRequest } from '@/middlewares/auth';
import { uploadImageToCDN } from '@/utils/cdn';
import { connectToPool } from '@/utils/database';
import e, { Response } from 'express';

// Fonction pour créer un post
export async function createPost(req: AuthenticatedClubRequest, res: Response) {
  try {
    const clubId = (req as AuthenticatedClubRequest).clubId;
    const { type, date, title, description, link, location, imageUrl, info } = req.body;

    const client = await connectToPool();
    const query = `
            INSERT INTO posts ( title, is_event, date, club_id, description, location, image_url, link, start_time, price, age_limit )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 )
            RETURNING post_id;
        `;
    // Ajout des valeurs dans le tableau values
    const values = [
      title,
      type === 'event',
      date,
      clubId,
      description ?? null,
      location ?? null,
      imageUrl ?? null,
      link ?? null,
      info?.startTime ?? null,
      info?.price ?? null,
      info?.ageLimit ?? null
    ];

    const result = await client.query(query, values);
    client.release();

    res.status(201).json({
      message: 'Post créé avec succès',
      postId: result.rows[0].post_id
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Fonction pour ajouter une image à un post
export async function addImageToPost(req: AuthenticatedClubRequest, res: Response) {
  try {
    const clubId = (req as AuthenticatedClubRequest).clubId;
    const postId = req.body.postId;

    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'Veuillez fournir une image' });
      return;
    }

    // On télécharge l'image sur le CDN et on récupère l'URL
    const imageUrl = await uploadImageToCDN(file);

    // Enregistrer l'URL de l'image dans la base de données
    const client = await connectToPool();
    const query = `
				UPDATE posts
				SET image_url = $1
				WHERE post_id = $2 AND club_id = $3;
			`;
    const result = await client.query(query, [imageUrl, postId, clubId]);
    client.release();

    // Vérifier si le post existe et appartient au club
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Post non trouvé' });
      return;
    }

    res.status(200).json({
      message: 'Image ajoutée avec succès',
      url: imageUrl
    });
  } catch (error) {
    console.error('Error adding image to post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
