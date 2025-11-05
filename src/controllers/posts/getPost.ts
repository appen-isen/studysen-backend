import { sql } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { query } from '@/utils/database';
import Logger from '@/utils/logger';

const logger = new Logger('Posts');

// Fonction pour récupérer tous les posts
export async function getAllPosts(req: Request, res: Response) {
  try {
    const { campus } = req.query;
    const campusId = Number(campus);
    // On récupère les posts et le club associé à chaque post
    const rows = await query(
      sql`SELECT 
            posts.*, 
            clubs.name AS club_name, 
            clubs.image_url AS club_image_url
          FROM posts 
          JOIN clubs ON posts.club_id = clubs.club_id 
          WHERE clubs.enabled = TRUE AND clubs.campus_id = ${campusId}`
    );
    const posts = rows.map((post: any) => {
      return {
        id: post.post_id,
        type: post.is_event ? 'event' : 'post',
        date: new Date(post.date).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        title: post.title,
        club: {
          name: post.club_name,
          image: post.club_image_url
        },
        description: post.description,
        link: post.link,
        address: post.location,
        info: {
          startTime: post.start_time,
          price: post.price,
          ageLimit: post.age_limit
        },
        imageUri: post.image_url
      };
    });

    res.status(200).json(posts);
  } catch (error) {
    logger.error('Erreur lors de la récupération des posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

//Fonction pour récupérer le dernier post avec un offset
// en se basant sur les derniers posts ajoutés avec l'ID le plus grand
export async function getLastPost(req: Request, res: Response) {
  try {
    const { offset, campus } = req.query;
    const campusId = Number(campus);
    const off = Number(offset);
    const base = sql`SELECT 
                      posts.*, 
                      clubs.name AS club_name, 
                      clubs.image_url AS club_image_url
                    FROM posts 
                    JOIN clubs ON posts.club_id = clubs.club_id 
                    WHERE clubs.enabled = TRUE AND clubs.campus_id = ${campusId}
                    ORDER BY posts.post_id DESC`;
    const rows =
      !offset || Number.isNaN(off)
        ? await query(sql`${base} LIMIT 1`)
        : await query(sql`${base} OFFSET ${off} LIMIT 1`);

    if (rows.length === 0) {
      res.status(404).json({ message: 'Aucun post trouvé' });
      return;
    }
    // On retourne le post trouvé
    const post = rows.map((post: any) => {
      return {
        id: post.post_id,
        type: post.is_event ? 'event' : 'post',
        date: new Date(post.date).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        title: post.title,
        club: {
          name: post.club_name,
          image: post.club_image_url
        },
        description: post.description,
        link: post.link,
        address: post.location,
        info: {
          startTime: post.start_time,
          price: post.price,
          ageLimit: post.age_limit
        },
        imageUri: post.image_url
      };
    });

    res.status(200).json(post[0]);
  } catch (error) {
    logger.error('Erreur lors de la récupération du dernier post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

//Fonction pour récupérer les posts d'un club spécifique
export async function getClubPosts(req: Request, res: Response) {
  const { clubId } = req.params;
  try {
    const rows = await query(sql`
      SELECT 
        posts.*, 
        clubs.name AS club_name, 
        clubs.image_url AS club_image_url
      FROM posts 
      JOIN clubs ON posts.club_id = clubs.club_id 
      WHERE clubs.enabled = TRUE AND clubs.club_id = ${Number(clubId)};
    `);

    if (rows.length === 0) {
      res.status(404).json({ message: 'Aucun post trouvé pour ce club' });
      return;
    }

    const posts = rows.map((post: any) => {
      return {
        id: post.post_id,
        type: post.is_event ? 'event' : 'post',
        date: new Date(post.date).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        title: post.title,
        club: {
          name: post.club_name,
          image: post.club_image_url
        },
        description: post.description,
        link: post.link,
        address: post.location,
        info: {
          startTime: post.start_time,
          price: post.price,
          ageLimit: post.age_limit
        },
        imageUri: post.image_url
      };
    });

    res.status(200).json(posts);
  } catch (error) {
    logger.error(`Erreur lors de la récupération des posts du club (${clubId}):`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Fonction pour récupérer uniquement l'ID du dernier post
export async function getLastPostId(req: Request, res: Response) {
  try {
    const { campus } = req.query;
    const campusId = Number(campus);
    const rows = await query<{ post_id: number }>(
      sql`SELECT posts.post_id
          FROM posts
          JOIN clubs ON posts.club_id = clubs.club_id
          WHERE clubs.enabled = TRUE AND clubs.campus_id = ${campusId}
          ORDER BY posts.post_id DESC
          LIMIT 1`
    );
    if (rows.length === 0) {
      res.status(404).json({ message: 'Aucun post trouvé' });
      return;
    }
    res.status(200).json({ id: rows[0].post_id });
  } catch (error) {
    logger.error("Erreur lors de la récupération de l'ID du dernier post:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
