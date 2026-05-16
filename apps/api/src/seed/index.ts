import { db, pool } from '../db/client.js';
import { seedData } from './seedData.js';

async function seed() {
  await seedData();
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
