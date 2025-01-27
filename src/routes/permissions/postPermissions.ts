import { connectToPool } from "../../utils/database";
import fs from "fs";
import path from "path";

export async function postPermissions(permissionName: string) {
    const client = await connectToPool();
    const query = 'INSERT INTO permissions (permission_name) VALUES ($1) RETURNING *';
    const result = await client.query(query, [permissionName]);
    client.release();

    // Lis la liste des permissions depuis le fichier permissions.json
    const permissionsFilePath = path.join(__dirname, '../../data/permissions.json');
    const permissionsData = JSON.parse(fs.readFileSync(permissionsFilePath, 'utf-8'));

    // Ajoute la nouvelle permission à la liste
    permissionsData.permissions.push(permissionName);

    // Écrit la liste des permissions dans le fichier permissions.json
    fs.writeFileSync(permissionsFilePath, JSON.stringify(permissionsData, null, 2));

    return result.rows[0];
}