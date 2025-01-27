import { connectToPool } from "../../utils/database";

export async function deleteUsers(userId: number) {
    const client = await connectToPool();
    const query = 'DELETE FROM users WHERE user_id = $1 RETURNING *';
    const result = await client.query(query, [userId]);
    client.release();
    return result.rows[0];
}