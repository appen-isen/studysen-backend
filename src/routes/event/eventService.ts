import { connectToPool } from "../../utils/database";

export async function updateEventImageUrl(event_id: number, imageUrl: string) {
  const client = await connectToPool();
  const query = "UPDATE events SET image_url = $1 WHERE event_id = $2";
  await client.query(query, [imageUrl, event_id]);
  client.release();
}
