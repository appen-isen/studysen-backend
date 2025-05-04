import { AuthenticatedClubRequest } from "@/middlewares/auth";
import { connectToPool } from "@/utils/database";
import { Response } from "express";

// Fonction pour créer un post
export async function createPost(req: AuthenticatedClubRequest, res: Response) {
	try {
		const clubId = (req as AuthenticatedClubRequest).clubId;
		const {
			type,
			date,
			title,
			description,
			link,
			location,
			imageUrl,
			info,
		} = req.body;

		const client = await connectToPool();
		const query = `
            INSERT INTO posts ( title, is_event, date, club_id, description, location, image_url, link, start_time, price, age_limit )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 )
            RETURNING post_id;
        `;
		// Ajout des valeurs dans le tableau values
		const values = [
			title,
			type === "event",
			new Date(date),
			clubId,
			description ?? null,
			location ?? null,
			imageUrl ?? null,
			link ?? null,
		];
		// On ajoute les informations supplémentaires si elles existent
		if (info) {
			values.push(
				info.startTime ?? null,
				info.price ?? null,
				info.ageLimit ?? null
			);
		}

		const result = await client.query(query, values);
		client.release();

		res.status(201).json({
			message: "Post créé avec succès",
			postId: result.rows[0].post_id,
		});
	} catch (error) {
		res.status(500).json({ message: "Internal server error " + error });
	}
}
