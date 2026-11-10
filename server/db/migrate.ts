import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(sql);
  console.log('[DB] PostgreSQL relational schema migrations applied successfully.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  runMigrations()
    .then(() => pool.end())
    .catch((err) => {
      console.error('[DB] Migration error:', err);
      process.exit(1);
    });
}
