import { connectToPool } from "../../utils/database";

export async function putUsers(userId: number, email: string) {
  const client = await connectToPool();
  const query = "UPDATE users SET email = $1 WHERE user_id = $2";
  await client.query(query, [email, userId]);
  client.release();
}
