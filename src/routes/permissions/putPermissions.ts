import { connectToPool } from "../../utils/database";

export async function putPermissions(
  permissionId: number,
  permissionName: string,
) {
  const client = await connectToPool();
  const query =
    "UPDATE permissions SET permission_name = $1 WHERE permission_id = $2";
  await client.query(query, [permissionName, permissionId]);
  client.release();
}
