import { connectToPool } from '../../utils/database';

export async function addOrganizations(name: string, description: string, campus: string, imageUrl: string) {
  const client = await connectToPool();
  const query =
    'INSERT INTO organizations (name, description, campus, image_url) VALUES ($1, $2, $3, $4) RETURNING *';
  const result = await client.query(query, [name, description, campus, imageUrl]);
  client.release();
  return result.rows[0];
}

export async function addUsersToOrganization(userId: number, organizationId: number) {
  const client = await connectToPool();
  const query = 'INSERT INTO user_organizations (user_id, organization_id) VALUES ($1, $2) RETURNING *';
  const result = await client.query(query, [userId, organizationId]);
  client.release();
  return result.rows[0];
}
