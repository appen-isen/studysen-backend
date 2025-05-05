import { connectToPool } from '../../utils/database';

export async function getAllUsers() {
  const client = await connectToPool();
  const query = 'SELECT * FROM users';
  const result = await client.query(query);
  client.release();
  return result.rows;
}

export async function getUserByEmail(email: string) {
  const client = await connectToPool();
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await client.query(query, [email]);
  client.release();
  return result.rows[0];
}
