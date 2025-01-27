import {connectToPool} from "../../utils/database";

export async function postParticipants(event_id: number, email: string) {
    const client = await connectToPool();
    const query = 'INSERT INTO event_participants (event_id, email) VALUES ($1, $2) RETURNING *';
    const result = await client.query(query, [event_id, email]);
    client.release();
    return result.rows[0];
}