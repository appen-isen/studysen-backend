import { connectToPool } from "../../utils/database";

export async function deletePermissions(permissionId: number) {
    const client = await connectToPool();
    const query = 'DELETE FROM permissions WHERE permission_id = $1 RETURNING *';
    const result = await client.query(query, [permissionId]);
    client.release();
    return result.rows[0];
}