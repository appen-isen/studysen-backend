import {connectToPool} from "../../utils/database";

export async function getAllOrganizations() {
    const client = await connectToPool();
    const query = 'SELECT * FROM organizations';
    const result = await client.query(query);
    client.release();
    return result.rows;
}

export async function getOrganizationById(id: number) {
    const client = await connectToPool();
    const query = 'SELECT * FROM organizations WHERE organization_id = $1';
    const result = await client.query(query, [id]);
    client.release();
    return result.rows[0];
}

export async function getOrganizationByName(name: string) {
    const client = await connectToPool();
    const query = 'SELECT * FROM organizations WHERE name = $1';
    const result = await client.query(query, [name]);
    client.release();
    return result.rows[0];
}