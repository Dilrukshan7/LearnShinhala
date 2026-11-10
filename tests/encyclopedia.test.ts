import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/app.js';
import {
  verifySinhalaUnicode,
  computeSinhalaSortKey,
  getSinhalaInitialLetter,
} from '../server/utils/sinhala-linguistics.js';

describe('Complete Sinhala Vocabulary Encyclopedia — Linguistic & API Suite', () => {
  it('validates authentic Sinhala Unicode and rejects detached dependent vowel signs', () => {
    const valid = verifySinhalaUnicode('විශ්වවිද්‍යාලය');
    expect(valid.isValid).toBe(true);
    expect(valid.score).toBe(1.0);

    const invalid = verifySinhalaUnicode('ාකුරු'); // starts with detached pillam
    expect(invalid.isValid).toBe(false);
    expect(invalid.issues.length).toBeGreaterThan(0);
  });

  it('orders Sinhala words according to authentic Sinhala Hodiya (Swara -> Vyanjana)', () => {
    const keyA = computeSinhalaSortKey('අම්මා');
    const keyAa = computeSinhalaSortKey('ආයුබෝවන්');
    const keyKa = computeSinhalaSortKey('කුරුල්ලා');
    const keyLa = computeSinhalaSortKey('ළමයා');

    expect(keyA < keyAa).toBe(true);
    expect(keyAa < keyKa).toBe(true);
    expect(keyKa < keyLa).toBe(true);
    expect(getSinhalaInitialLetter('ආයුබෝවන්')).toBe('ආ');
    expect(getSinhalaInitialLetter('ළමයා')).toBe('ළ');
  });

  it('GET /api/health returns connected PostgreSQL status and word count', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.totalWords).toBeGreaterThanOrEqual(20);
  });

  it('GET /api/stats returns trilingual encyclopedia statistics and daily word', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body.counts.total_entries).toBeGreaterThanOrEqual(20);
    expect(res.body.counts.total_categories).toBeGreaterThanOrEqual(150);
    expect(res.body.dailyWord).toBeTruthy();
    expect(res.body.dailyWord.sinhala_word).toBeTruthy();
  });

  it('GET /api/vocabulary supports searching by Sinhala, Tamil, English, and Romanized pronunciation', async () => {
    // Search by Sinhala
    const siRes = await request(app).get('/api/vocabulary?q=' + encodeURIComponent('ආයුබෝවන්'));
    expect(siRes.status).toBe(200);
    expect(siRes.body.entries.length).toBeGreaterThanOrEqual(1);
    expect(siRes.body.entries[0].sinhala_word).toBe('ආයුබෝවන්');

    // Search by Tamil
    const taRes = await request(app).get('/api/vocabulary?q=' + encodeURIComponent('பல்கலைக்கழகம்'));
    expect(taRes.status).toBe(200);
    expect(taRes.body.entries.some((e: any) => e.sinhala_word === 'විශ්වවිද්‍යාලය')).toBe(true);

    // Search by Romanized
    const romRes = await request(app).get('/api/vocabulary?q=vatura');
    expect(romRes.status).toBe(200);
    expect(romRes.body.entries.some((e: any) => e.sinhala_word === 'වතුර')).toBe(true);
  });

  it('GET /api/vocabulary/:idOrWord returns full word encyclopedia dossier with senses, examples, forms, and roots', async () => {
    const res = await request(app).get('/api/vocabulary/' + encodeURIComponent('ආයුබෝවන්'));
    expect(res.status).toBe(200);
    expect(res.body.entry.sinhala_word).toBe('ආයුබෝවන්');
    expect(res.body.senses.length).toBeGreaterThanOrEqual(1);
    expect(res.body.examples.length).toBeGreaterThanOrEqual(1);
    expect(res.body.wordForms.length).toBeGreaterThanOrEqual(1);
    expect(res.body.linguisticRoot).toBeTruthy();
    expect(res.body.sources.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/categories returns all 9 hierarchical dimensions (A through I)', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.dimensions.length).toBe(9);
    expect(res.body.allCategories.length).toBeGreaterThanOrEqual(150);
  });

  it('POST /api/admin/research-jobs executes the 10-stage autonomous discovery & verification pipeline', async () => {
    const res = await request(app)
      .post('/api/admin/research-jobs')
      .send({
        targetDomain: 'Science, Physics, Chemistry & Classical Sinhala',
        batchSize: 4,
      });
    expect(res.status).toBe(201);
    expect(res.body.job.status).toBe('COMPLETED');
    expect(res.body.logs.length).toBeGreaterThan(0);
  });
});
