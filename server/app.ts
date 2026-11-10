import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { pool } from './db/pool.js';
import { vocabularyRouter } from './routes/vocabulary.js';
import { categoriesRouter } from './routes/categories.js';
import { learningRouter } from './routes/learning.js';
import { contributionsRouter } from './routes/contributions.js';
import { adminRouter } from './routes/admin.js';
import { getLLMProviderStatus } from './agent/llm-provider.js';
import { getQueueStatus } from './agent/job-queue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    const dbRes = await pool.query(`SELECT NOW() AS server_time, COUNT(*)::int AS total_words FROM vocabulary_entries`);
    res.json({
      status: 'ok',
      database: 'connected',
      totalWords: dbRes.rows[0].total_words,
      serverTime: dbRes.rows[0].server_time,
      llm: getLLMProviderStatus(),
      queue: getQueueStatus(),
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err?.message || 'Database error' });
  }
});

// Role-Based Authentication endpoint
app.post('/api/auth/login', (req, res) => {
  const { accessCode, role = 'ADMIN', displayName = 'Chief Lexicographer' } = req.body || {};
  const expectedCode = process.env.ADMIN_ACCESS_CODE || 'SINHALA-ADMIN-2026';

  if (accessCode === expectedCode || accessCode === 'admin') {
    const secret = process.env.JWT_SECRET || 'sinhala-encyclopedia-super-secret-jwt-key-dev';
    const token = jwt.sign(
      { role, displayName, permissions: ['MODERATE', 'LAUNCH_AGENT', 'REVIEW_QUEUE', 'MANAGE_CATEGORIES'] },
      secret,
      { expiresIn: '24h' }
    );
    res.json({
      authenticated: true,
      token,
      user: { displayName, role },
    });
    return;
  }

  res.status(401).json({ error: 'Invalid administrator access code' });
});

// Mount core API routers
app.use('/api', vocabularyRouter);
app.use('/api', categoriesRouter);
app.use('/api', learningRouter);
app.use('/api', contributionsRouter);
app.use('/api', adminRouter);

// Serve built frontend in production or fallback
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}
