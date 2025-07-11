import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

let pools: pg.Pool[] = [];

export async function initializeDatabase() {
  try {
    // Créer un pool de connexion pour l'initialisation
    const initPool = new pg.Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT as string)
    });

    // Lire le fichier database.sql
    const sqlFilePath = path.join(__dirname, '..', '..', 'db', 'database.sql');
    const sqlSchema = await fs.readFile(sqlFilePath, 'utf8');
    // Exécuter le schéma SQL
    const client = await initPool.connect();
    try {
      await client.query(sqlSchema);
    } finally {
      client.release();
    }
    await initPool.end();
  } catch (error) {
    throw error;
  }
}

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
        port: parseInt(process.env.DB_PORT as string)
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
    port: parseInt(process.env.DB_PORT as string)
  });
  pools.push(newPool);
  return await newPool.connect();
}
