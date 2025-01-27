import { connectToPool } from "../../utils/database";

export async function getAllUsers() {
    const client = await connectToPool();
    const query = 'SELECT * FROM users';
    const result = await client.query(query);
    client.release();
    return result.rows;
}