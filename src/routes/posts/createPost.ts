import { AuthenticatedClubRequest } from '@/middlewares/auth';
import { uploadImageToCDN } from '@/utils/cdn';
import { query } from '@/utils/database';
import { Response } from 'express';
import { sendNotificationToDevices } from '../notifications/clubNotifications';
import Logger from '@/utils/logger';
import { sql } from 'drizzle-orm';

const logger = new Logger('Posts');

// Fonction pour créer un post
export async function createPost(req: AuthenticatedClubRequest, res: Response) {
  try {
    const clubId = (req as AuthenticatedClubRequest).clubId;
    const { type, date, title, description, link, location, imageUrl, info, sendNotification } = req.body;

    const rows = await query(sql`
            INSERT INTO posts ( title, is_event, date, club_id, description, location, image_url, link, start_time, price, age_limit )
            VALUES (
              ${title},
              ${type === 'event'},
              ${date},
              ${clubId},
              ${description ?? null},
              ${location ?? null},
              ${imageUrl ?? null},
              ${link ?? null},
              ${info?.startTime === '' ? null : (info?.startTime ?? null)},
              ${info?.price === '' ? null : (info?.price ?? null)},
              ${info?.ageLimit === '' ? null : (info?.ageLimit ?? null)}
            )
            RETURNING post_id;
        `);
    // Récupérer le campus_id du club
    const campusRows = await query(sql`SELECT campus_id FROM clubs WHERE club_id = ${clubId}`);
    if (campusRows.length === 0) {
      res.status(404).json({ message: 'Club non trouvé' });
      return;
    }
    // Envoi de la notification aux appareils du campus
    const campusId = (campusRows as any)[0].campus_id;
    if (sendNotification) {
      sendNotificationToDevices(campusId, 'Nouveau post', title);
    }
    logger.info(`Post créé avec succès pour le club ${clubId} (ID: ${(rows as any)[0].post_id})`);
    res.status(201).json({
      message: 'Post créé avec succès',
      postId: (rows as any)[0].post_id
    });
  } catch (error) {
    logger.error('Erreur lors de la création du post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function editPost(req: AuthenticatedClubRequest, res: Response) {
  try {
    const clubId = (req as AuthenticatedClubRequest).clubId;
    const { postId, type, title, date, description, link, location, info } = req.body;

    const result = await query(sql`
      UPDATE posts
      SET title = ${title}, is_event = ${type === 'event'}, date = ${date}, description = ${description ?? null}, location = ${location ?? null}, link = ${link ?? null},
        start_time = ${info?.startTime === '' ? null : (info?.startTime ?? null)}, price = ${info?.price === '' ? null : (info?.price ?? null)}, age_limit = ${info?.ageLimit === '' ? null : (info?.ageLimit ?? null)}
      WHERE post_id = ${postId} AND club_id = ${clubId}
      RETURNING post_id;
    `);

    if ((result as any).length === 0) {
      res.status(404).json({ message: "Post non trouvé ou n'appartient pas au club" });
      return;
    }
    logger.info(`Post modifié avec succès pour le club ${clubId} (ID: ${postId})`);
    res.status(200).json({ message: 'Post modifié avec succès' });
  } catch (error) {
    logger.error('Erreur lors de la modification du post:', error);
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
    const result = await query(sql`
    UPDATE posts SET image_url = ${imageUrl} WHERE post_id = ${postId} AND club_id = ${clubId} RETURNING post_id;
  `);

    // Vérifier si le post existe et appartient au club
    if ((result as any).length === 0) {
      res.status(404).json({ message: 'Post non trouvé' });
      return;
    }

    res.status(200).json({
      message: 'Image ajoutée avec succès',
      url: imageUrl
    });
  } catch (error) {
    logger.error("Erreur lors de l'ajout de l'image au post:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
