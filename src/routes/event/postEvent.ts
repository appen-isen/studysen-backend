import { connectToPool } from "@/utils/database";

export async function postEvent(
  title: string,
  description: string,
  date: string,
  location: string,
  organizer: number,
  imageUrl: string | null,
) {
  const client = await connectToPool();
  const query =
    "INSERT INTO events (title, description, date, location, organizer_id, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
  const result = await client.query(query, [
    title,
    description,
    date,
    location,
    organizer,
    imageUrl,
  ]);
  client.release();
  return result.rows[0];
}
