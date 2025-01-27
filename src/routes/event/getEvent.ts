import {connectToPool} from "../../utils/database";

export async function getAllEvents() {
    const client = await connectToPool();
    const query = 'SELECT * FROM events';
    const result = await client.query(query);
    client.release();
    return result.rows;
}

export async function getEventById(id: number) {
    const client = await connectToPool();
    const query = 'SELECT * FROM events WHERE id = $1';
    const result = await client.query(query, [id]);
    client.release();
    return result.rows[0];
}

export async function getEventByTitle(title: string) {
    const client = await connectToPool();
    const query = 'SELECT * FROM events WHERE title = $1';
    const result = await client.query(query, [title]);
    client.release();
    return result.rows[0];
}

export async function getEventByDate(date: string) {
    const client = await connectToPool();
    const query = 'SELECT * FROM events WHERE date = $1';
    const result = await client.query(query, [date]);
    client.release();
    return result.rows;
}

export async function getEventByLocation(location: string) {
    const client = await connectToPool();
    const query = 'SELECT * FROM events WHERE location = $1';
    const result = await client.query(query, [location]);
    client.release();
    return result.rows;
}

export async function getEventByOrganizer(organizer: string) {
    const client = await connectToPool();
    const query = 'SELECT * FROM events WHERE organizer = $1';
    const result = await client.query(query, [organizer]);
    client.release();
    return result.rows;
}