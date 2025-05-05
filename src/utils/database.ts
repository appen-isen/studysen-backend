import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

let pools: pg.Pool[] = [];
export async function connectToPool() {
	// Parcourir les pools pour trouver un pool disponible
	for (const pool of pools) {
		if (pool.totalCount < pool.getMaxListeners() - 1) {
			// Si le pool est disponible, le selectionner
			return await pool.connect();
		} else {
			// Si aucune pool n'est disponible, en créer une nouvelle
			const newPool = new pg.Pool({
				host: process.env.DB_HOST,
				user: process.env.DB_USER,
				password: process.env.DB_PASSWORD,
				database: process.env.DB_NAME,
				port: parseInt(process.env.DB_PORT as string),
			});
			pools.push(newPool);
			return await newPool.connect();
		}
	}
	// Si aucune pool n'est disponible, en créer une nouvelle
	const newPool = new pg.Pool({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		port: parseInt(process.env.DB_PORT as string),
	});
	pools.push(newPool);
	return await newPool.connect();
}
