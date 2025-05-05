import { connectToPool } from '../../utils/database';

export async function getAllParticipants() {
  const client = await connectToPool();
  const query = 'SELECT * FROM event_participants';
  const result = await client.query(query);
  client.release();
  return result.rows;
}

export async function getParticipantsByEventId(event_id: number) {
  const client = await connectToPool();
  const query = 'SELECT * FROM event_participants WHERE event_id = $1';
  const result = await client.query(query, [event_id]);
  client.release();
  return result.rows;
}

export async function getParticipantsByEmail(email: string) {
  const client = await connectToPool();
  const query = 'SELECT * FROM event_participants WHERE email = $1';
  const result = await client.query(query, [email]);
  client.release();
  return result.rows;
}

export async function getParticipantsByEventIdAndEmail(event_id: number, email: string) {
  const client = await connectToPool();
  const query = 'SELECT * FROM event_participants WHERE event_id = $1 AND email = $2';
  const result = await client.query(query, [event_id, email]);
  client.release();
  return result.rows[0];
}
