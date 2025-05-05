import { connectToPool } from "@/utils/database";
import { Request, Response } from "express";

// Fonction pour récupérer tous les posts
export async function getAllPosts(req: Request, res: Response) {
	try {
		// On récupère les posts et le club associé à chaque post
		const client = await connectToPool();
		const query = `
			SELECT 
				posts.*, 
				clubs.name AS club_name, 
				clubs.image_url AS club_image_url
			FROM posts JOIN clubs ON posts.club_id = clubs.club_id WHERE clubs.enabled = TRUE ;
            `;
		const result = await client.query(query);
		client.release();
		const posts = result.rows.map((post) => {
			return {
				id: post.post_id,
				type: post.is_event ? "event" : "post",
				date: new Date(post.date).toLocaleDateString("fr-FR", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
				}),
				title: post.title,
				club: {
					name: post.club_name,
					image: post.club_image_url,
				},
				description: post.description,
				link: post.link,
				address: post.location,
				info: {
					startTime: post.start_time,
					price: post.price,
					ageLimit: post.age_limit,
				},
				imageUri: post.image_url,
			};
		});

		res.status(200).json(posts);
	} catch (error) {
		res.status(500).json({ message: "Internal server error " + error });
	}
}

//Fonction pour récupérer le dernier post avec un offset
// en se basant sur les derniers posts ajoutés avec l'ID le plus grand
export async function getLastPost(req: Request, res: Response) {
	try {
		const { offset } = req.query;
		const client = await connectToPool();
		let query = ``;
		let result = null;
		if (!offset || isNaN(Number(offset))) {
			// Si aucun offset n'est fourni, on récupère le dernier post
			query = `
                SELECT 
                    posts.*, 
                    clubs.name AS club_name, 
                    clubs.image_url AS club_image_url
                FROM posts JOIN clubs ON posts.club_id = clubs.club_id WHERE clubs.enabled = TRUE
                ORDER BY posts.post_id DESC LIMIT 1;
            `;
			result = await client.query(query);
		} else {
			// Sinon, on récupère le dernier post avec l'offset fourni
			query = `
                SELECT 
                    posts.*, 
                    clubs.name AS club_name, 
                    clubs.image_url AS club_image_url
                FROM posts JOIN clubs ON posts.club_id = clubs.club_id WHERE clubs.enabled = TRUE
                ORDER BY posts.post_id DESC OFFSET $1 LIMIT 1;
            `;
			result = await client.query(query, [offset]);
		}
		client.release();
		if (result.rows.length === 0) {
			res.status(404).json({ message: "Aucun post trouvé" });
			return;
		}
		// On retourne le post trouvé
		const post = result.rows.map((post) => {
			return {
				id: post.post_id,
				type: post.is_event ? "event" : "post",
				date: new Date(post.date).toLocaleDateString("fr-FR", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
				}),
				title: post.title,
				club: {
					name: post.club_name,
					image: post.club_image_url,
				},
				description: post.description,
				link: post.link,
				address: post.location,
				info: {
					startTime: post.start_time,
					price: post.price,
					ageLimit: post.age_limit,
				},
				imageUri: post.image_url,
			};
		});

		res.status(200).json(post[0]);
	} catch (error) {
		res.status(500).json({ message: "Internal server error " + error });
	}
}
