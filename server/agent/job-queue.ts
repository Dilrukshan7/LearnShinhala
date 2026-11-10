import { Queue, Worker } from 'bullmq';
import { pool } from '../db/pool.js';
import { executeResearchBatchJob } from './verification-pipeline.js';
import { getLLMProviderStatus } from './llm-provider.js';

let bullQueue: Queue | null = null;
let bullWorker: Worker | null = null;
let queueMode: 'bullmq-redis' | 'postgres-durable' = 'postgres-durable';

export function getQueueStatus() {
  return {
    mode: queueMode,
    redisConfigured: Boolean(process.env.REDIS_URL),
    autoScheduleMinutes: Number(process.env.AGENT_AUTO_SCHEDULE_MINUTES) || 60,
  };
}

export async function initResearchJobQueue(): Promise<void> {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl && redisUrl.trim().length > 0) {
    try {
      const url = new URL(redisUrl);
      const connection = {
        host: url.hostname,
        port: Number(url.port) || 6379,
        password: url.password || undefined,
        maxRetriesPerRequest: null as null,
      };
      bullQueue = new Queue('sinhala-vocabulary-research', { connection });
      bullWorker = new Worker(
        'sinhala-vocabulary-research',
        async (job) => {
          await executeResearchBatchJob(job.data.jobId);
        },
        {
          connection,
          concurrency: 1,
        }
      );
      queueMode = 'bullmq-redis';
      console.log('[QUEUE] Initialized BullMQ + Redis distributed research worker.');
      return;
    } catch (err) {
      console.warn('[QUEUE] Redis unavailable, falling back to PostgreSQL durable job queue:', err);
    }
  }

  queueMode = 'postgres-durable';
  console.log('[QUEUE] Initialized PostgreSQL durable background research queue.');
}

export async function enqueueResearchBatchJob(params: {
  jobName?: string;
  targetDomain: string;
  targetCategorySlug?: string;
  batchSize?: number;
  runImmediately?: boolean;
}): Promise<{ jobId: number; status: string }> {
  const llmStatus = getLLMProviderStatus();
  const batchSize = Math.max(1, Math.min(20, params.batchSize || Number(process.env.AGENT_BATCH_SIZE) || 5));
  const jobName =
    params.jobName ||
    `Autonomous Discovery Batch — ${params.targetDomain || 'General Trilingual Lexicon'}`;

  const res = await pool.query<{ id: number }>(
    `INSERT INTO research_jobs (
      job_name, job_type, target_domain, target_category_slug, source_corpus,
      status, batch_size, llm_provider
    ) VALUES ($1, 'AUTONOMOUS_BATCH', $2, $3, 'CARTER_1924 + DOL_TRILINGUAL + EPD_TECHNICAL', 'QUEUED', $4, $5)
    RETURNING id`,
    [
      jobName,
      params.targetDomain || 'General Sinhala Lexicon',
      params.targetCategorySlug || 'all-dimensions',
      batchSize,
      llmStatus.activeProvider,
    ]
  );

  const jobId = res.rows[0].id;

  if (queueMode === 'bullmq-redis' && bullQueue) {
    await bullQueue.add(
      'research-batch',
      { jobId },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
    );
    return { jobId, status: 'QUEUED' };
  }

  if (params.runImmediately !== false) {
    await executeResearchBatchJob(jobId);
    return { jobId, status: 'COMPLETED' };
  } else {
    setImmediate(() => {
      executeResearchBatchJob(jobId).catch((err) =>
        console.error(`[QUEUE] Background job #${jobId} failed:`, err)
      );
    });
    return { jobId, status: 'QUEUED' };
  }
}
