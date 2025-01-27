import {connectToPool} from "../../utils/database";

export async function deleteParticipants(event_id: number, email: string) {
    const client = await connectToPool();
    const query = 'DELETE FROM event_participants WHERE event_id = $1 AND email = $2 RETURNING *';
    const result = await client.query(query, [event_id, email]);
    client.release();
    return result.rows[0];
}