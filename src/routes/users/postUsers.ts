import { connectToPool } from "../../utils/database";

export async function postUsers(email: string) {
  const client = await connectToPool();
  const query = "INSERT INTO users (email) VALUES ($1) RETURNING *";
  const result = await client.query(query, [email]);
  client.release();
  return result.rows[0];
}
