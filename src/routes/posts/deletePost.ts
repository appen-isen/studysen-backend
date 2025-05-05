import { Response } from "express";
import { AuthenticatedClubRequest } from "@/middlewares/auth";
import { connectToPool } from "@/utils/database";
import { deleteImageFromCDN } from "@/utils/cdn";

export async function deletePost(req: AuthenticatedClubRequest, res: Response) {
	try {
		const { postId } = req.body;
		const client = await connectToPool();
		// On supprime le post de la base de données en récupérant l'url de l'image pour la supprimer du CDN
		const query = `
            DELETE FROM posts
            WHERE post_id = $1 AND club_id = $2
            RETURNING image_url;
        `;
		const result = await client.query(query, [postId, req.clubId]);
		client.release();

		// Vérifier si le post existe et appartient au club
		if (result.rowCount === 0) {
			res.status(404).json({ message: "Post non trouvé" });
			return;
		}

		// Si le post a été supprimé, on supprime l'image du CDN
		const imageUrl = result.rows[0].image_url;
		if (imageUrl) {
			await deleteImageFromCDN(imageUrl);
		}

		res.status(200).json({ message: "Post supprimé avec succès" });
	} catch (error) {
		res.status(500).json({ message: "Internal server error", error });
	}
}
