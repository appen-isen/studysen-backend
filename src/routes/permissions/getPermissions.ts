import { connectToPool } from "../../utils/database";

export async function getAllPermissions() {
    // Lis les permissions depuis le fichier permissions.json
    const permissions = require('../../data/permissions.json');

    // Regarde dans la base de données si les permissions sont déjà enregistrées
    const client = await connectToPool();
    const query = 'SELECT * FROM permissions';
    const result = await client.query(query);
    if (result.rows.length === 0) {
        for (const permission of permissions.permissions) {
            const query = 'INSERT INTO permissions (permission_name) VALUES ($1) RETURNING *';
            const result = await client.query(query, [permission]);
        }
        client.release();
        return result.rows[0];
    }
    // Regarde si les permissions sont les mêmes
    else if (result.rows && result.rows.length === permissions.permissions.length) {
        client.release();
        return result.rows;
    }
    // Si les permissions sont différentes, les met à jour
    else {
        for (const permission of permissions.permissions) {
            const query = 'INSERT INTO permissions (permission_name) VALUES ($1) RETURNING *';
            const result = await client.query(query, [permission]);
        }
        client.release();
        return result.rows[0];
    }
}

export async function getPermissionById(id: number) {
    const client = await connectToPool();
    const query = 'SELECT * FROM permissions WHERE permission_id = $1';
    const result = await client.query(query, [id]);
    client.release();
    return result.rows[0];
}

export async function getPermissionForUser(email: string) {
    const client = await connectToPool();
    const query = `
        SELECT p.permission_name
        FROM user_permissions up
        JOIN users u ON up.user_id = u.user_id
        JOIN permissions p ON up.permission_id = p.permission_id
        WHERE u.email = $1
    `;
    const result = await client.query(query, [email]);
    client.release();
    return result.rows.map(row => row.permission_name);
}

export async function getUsersForPermission(permission: string) {
    const client = await connectToPool();
    const query = `
        SELECT u.email
        FROM user_permissions up
        JOIN users u ON up.user_id = u.user_id
        JOIN permissions p ON up.permission_id = p.permission_id
        WHERE p.permission_name = $1
    `;
    const result = await client.query(query, [permission]);
    client.release();
    return result.rows.map(row => row.email);
}