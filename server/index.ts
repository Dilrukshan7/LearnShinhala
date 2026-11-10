import dotenv from 'dotenv';
import { app } from './app.js';
import { runMigrations } from './db/migrate.js';
import { runSeed } from './db/seed.js';
import { initResearchJobQueue } from './agent/job-queue.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;

async function startServer() {
  await runMigrations();
  await runSeed();
  await initResearchJobQueue();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Complete Sinhala Vocabulary Encyclopedia API listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SERVER] Failed to start:', err);
  process.exit(1);
});
