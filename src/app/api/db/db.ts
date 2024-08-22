import { logger } from './logger.js';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
	logger.error('No connection string');
	process.exit(1)
}

const sslConfig = {
	rejectUnauthorized: false,
};

export const pool = new pg.Pool({
	connectionString,
	ssl: process.env.NODE_ENV === 'production' ? true : sslConfig,
});

pool.on('error', (err: Error) => {
	console.error('Unexpected error on idle client', err);
	process.exit(-1);
});

export async function query(q: string, values: Array<number | string | boolean | Date | null> = []) {
	let client;
	try {
		client = await pool.connect();
	} catch (e) {
		console.error('unable to get client from pool', e);
		return null;
	}

	try {
		const result = values?.length === 0 ? await client.query(q) : await client.query(q, values);
		return result;
	} catch (e) {
		console.error('unable to query', e);
		console.info(q, values);
		return null;
	} finally {
		client.release();
	}
}

export async function insertPattern(pattern_matrix: Array<string>, vel_id: number, username: string) {
	const q = `
	INSERT INTO Pattern(pattern_matrix, vel_id, username, status) VALUES ($1, $2, $3, $4) RETURNING id;
	`
	const result = await query(q, [`{${pattern_matrix}`, vel_id, username]);
	return result && result.rows[0] || null;
}