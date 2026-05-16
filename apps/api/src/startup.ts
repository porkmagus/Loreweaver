import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, pool } from './db/client.js';
import { users } from './db/schema.js';
import { sql } from 'drizzle-orm';
import { seedData } from './seed/seedData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Run raw SQL migration files from apps/api/drizzle/.
 * Simple migration tracking via drizzle meta/journal.
 */
async function runMigrations() {
  const drizzleDir = path.resolve(__dirname, '../drizzle');
  const metaDir = path.join(drizzleDir, 'meta');

  // Check if journal exists
  const journalPath = path.join(metaDir, '_journal.json');
  if (!fs.existsSync(journalPath)) {
    console.warn('No drizzle journal found. Skipping migrations.');
    return;
  }

  const journal = JSON.parse(fs.readFileSync(journalPath, 'utf-8'));

  // Check applied migrations by querying drizzle migrations table
  const applied = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'drizzle_migrations'
    )
  `);
  const trackingTableExists = (applied.rows[0] as { exists: boolean }).exists;

  let appliedTags = new Set<string>();
  if (trackingTableExists) {
    const rows = await db.execute(sql`SELECT tag FROM "drizzle_migrations"`);
    for (const row of rows.rows) {
      appliedTags.add((row as { tag: string }).tag);
    }
  } else {
    // The tracking table is missing. Determine whether the database
    // already contains schema objects by checking for the first
    // migration's primary table.
    const firstMigration = journal.entries[0];
    const firstTable = firstMigration?.tag.includes('users') ? 'users' : 'worlds';
    const schemaCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = ${firstTable}
      )
    `);
    const schemaAlreadyExists = (schemaCheck.rows[0] as { exists: boolean }).exists;

    if (schemaAlreadyExists) {
      // Tables exist but tracking table does not; mark all existing
      // migrations as applied without re-running them.
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "drizzle_migrations" (
          tag text PRIMARY KEY,
          applied_at timestamp with time zone DEFAULT now() NOT NULL
        )
      `);
      for (const entry of journal.entries) {
        await db.execute(sql`INSERT INTO "drizzle_migrations" (tag) VALUES (${entry.tag})`);
        appliedTags.add(entry.tag);
      }
      console.log('Created drizzle_migrations tracking table and marked existing migrations as applied.');
    }
    // else: fresh database; migrations will be applied below and
    // recorded afterward.
  }

  // Apply each unapplied migration
  for (const entry of journal.entries) {
    if (appliedTags.has(entry.tag)) continue;

    const sqlPath = path.join(drizzleDir, entry.tag + '.sql');
    if (!fs.existsSync(sqlPath)) {
      console.warn(`Migration file missing: ${sqlPath}`);
      continue;
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    // Split by statement-breakpoint comments and execute each statement
    const statements = sqlContent
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`Applying migration: ${entry.tag}`);
    for (const statement of statements) {
      await db.execute(sql.raw(statement));
    }

    appliedTags.add(entry.tag);
  }

  // Ensure tracking table exists and record any newly applied migrations
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "drizzle_migrations" (
      tag text PRIMARY KEY,
      applied_at timestamp with time zone DEFAULT now() NOT NULL
    )
  `);
  for (const entry of journal.entries) {
    if (appliedTags.has(entry.tag)) {
      // Upsert in case it was already recorded in a previous run
      await db.execute(sql`
        INSERT INTO "drizzle_migrations" (tag)
        VALUES (${entry.tag})
        ON CONFLICT (tag) DO NOTHING
      `);
    }
  }

  console.log('Migrations applied.');
}

/**
 * Check if database has any data. Returns true if empty.
 */
async function isDatabaseEmpty(): Promise<boolean> {
  try {
    const result = await db.select().from(users).limit(1);
    return result.length === 0;
  } catch {
    // Table might not exist yet
    return true;
  }
}

/**
 * Startup sequence: migrations → seed if empty.
 */
export async function startup() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  Loreweaver v0.1.0 — Starting up                     ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // 1. Run migrations
  await runMigrations();

  // 2. Seed if database is empty and SEED_ON_STARTUP is explicitly enabled
  const empty = await isDatabaseEmpty();
  const shouldSeed = process.env.SEED_ON_STARTUP === 'true';
  if (empty && shouldSeed) {
    console.log('Database is empty. Running initial seed...');
    await seedData();
    console.log('✅ Demo data seeded. Open http://localhost:5173 to explore.\n');
  } else {
    if (empty) {
      console.log('Database is empty. Onboarding flow will create the first world.\n');
    } else {
      console.log('✅ Database has existing data. Skipping seed.\n');
    }
  }
}
