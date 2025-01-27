import {connectToPool} from "../../utils/database";

export async function putEvent(id: number, title?: string, description?: string, date?: string, location?: string, organizer?: string) {
    const client = await connectToPool();
    const query = 'UPDATE Events SET title = $1, description = $2, date = $3, location = $4, organizer = $5 WHERE event_id = $6 RETURNING *';
    const result = await client.query(query, [title, description, date, location, organizer, id]);
    client.release();
    return result.rows[0];
}