import { connectToPool } from '../../utils/database';

export async function updateOrganizations(id: number, name: string, description: string, image_url: string) {
  const client = await connectToPool();
  const query =
    'UPDATE organizations SET name = $1, description = $2, image_url = $3 WHERE organization_id = $4';
  await client.query(query, [name, description, image_url, id]);
  client.release();
}
