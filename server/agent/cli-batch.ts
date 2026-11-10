import path from 'path';
import { fileURLToPath } from 'url';
import { enqueueResearchBatchJob } from './job-queue.js';
import { pool } from '../db/pool.js';

const __filename = fileURLToPath(import.meta.url);

async function runCliBatch() {
  const domain = process.argv[2] || 'Science, Nature & Everyday Sinhala';
  const batchSize = Number(process.argv[3]) || 4;
  console.log(`[AGENT CLI] Launching autonomous vocabulary discovery batch for domain: "${domain}" (size: ${batchSize})...`);
  const result = await enqueueResearchBatchJob({
    targetDomain: domain,
    batchSize,
    runImmediately: true,
  });
  console.log(`[AGENT CLI] Batch job #${result.jobId} finished with status: ${result.status}`);
  await pool.end();
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  runCliBatch().catch((err) => {
    console.error('[AGENT CLI] Error:', err);
    process.exit(1);
  });
}
