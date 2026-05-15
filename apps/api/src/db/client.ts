import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://loreweaver:loreweaver@postgres:5432/loreweaver';

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error', err);
});

export const db = drizzle(pool, { schema });
export { pool };
