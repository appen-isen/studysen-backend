import {connectToPool} from "../../utils/database";

export async function putParticipantsEmail(event_id: number, email: string) {
    const client = await connectToPool();
    const query = 'UPDATE event_participants SET event_id = $1 WHERE email = $2 RETURNING *';
    const result = await client.query(query, [event_id, email]);
    client.release();
    return result.rows[0];
}

export async function putParticipantsEventId(event_id: number, email: string) {
    const client = await connectToPool();
    const query = 'UPDATE event_participants SET email = $1 WHERE event_id = $2 RETURNING *';
    const result = await client.query(query, [email, event_id]);
    client.release();
    return result.rows[0];
}