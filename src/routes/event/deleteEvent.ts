import { connectToPool } from "../../utils/database";

export async function deleteEvent(id: number) {
  const client = await connectToPool();
  const query = "DELETE FROM events WHERE event_id = $1 RETURNING *";
  const result = await client.query(query, [id]);
  client.release();
  return result.rows[0];
}
