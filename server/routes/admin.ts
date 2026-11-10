import { Router, Request, Response } from 'express';
import { pool } from '../db/pool.js';
import { enqueueResearchBatchJob, getQueueStatus } from '../agent/job-queue.js';
import { getLLMProviderStatus } from '../agent/llm-provider.js';
import { insertVocabularyEntryComplete } from '../db/entry-repository.js';

export const adminRouter = Router();

/**
 * GET /api/admin/dashboard
 * Returns comprehensive Admin Dashboard metrics:
 * - Total, Verified, Source-Supported, AI Suggestion, Unverified, and Regional counts
 * - Words by category & grammatical type & source
 * - AI research jobs & 10-stage pipeline logs
 * - Duplicate detection report
 * - Human review queue
 * - User contribution moderation queue
 * - Audit log trail
 */
adminRouter.get('/admin/dashboard', async (_req: Request, res: Response) => {
  try {
    const [
      summaryRes,
      posBreakdownRes,
      categoryBreakdownRes,
      sourceBreakdownRes,
      jobsRes,
      recentLogsRes,
      reviewQueueRes,
      contributionsRes,
      duplicatesRes,
      auditLogsRes,
    ] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int AS total_vocabulary,
          COUNT(*) FILTER (WHERE verification_status = 'VERIFIED')::int AS verified_count,
          COUNT(*) FILTER (WHERE verification_status = 'SOURCE_SUPPORTED')::int AS source_supported_count,
          COUNT(*) FILTER (WHERE verification_status = 'AI_SUGGESTION')::int AS ai_suggestion_count,
          COUNT(*) FILTER (WHERE verification_status = 'UNVERIFIED')::int AS unverified_count,
          COUNT(*) FILTER (WHERE verification_status = 'DISPUTED_OR_REGIONAL')::int AS regional_count,
          ROUND(AVG(confidence_score)::numeric, 3)::float AS avg_confidence_score,
          (SELECT COUNT(*)::int FROM review_queue WHERE status = 'PENDING') AS pending_review_count,
          (SELECT COUNT(*)::int FROM user_contributions WHERE status = 'PENDING') AS pending_contributions_count,
          (SELECT COUNT(*)::int FROM research_jobs WHERE status = 'FAILED') AS failed_jobs_count
        FROM vocabulary_entries
      `),
      pool.query(`
        SELECT part_of_speech, COUNT(*)::int AS count
        FROM vocabulary_entries
        GROUP BY part_of_speech
        ORDER BY count DESC
      `),
      pool.query(`
        SELECT
          c.dimension_code,
          c.dimension_name,
          c.name_en,
          c.name_si,
          c.slug,
          COUNT(wcr.entry_id)::int AS word_count
        FROM categories c
        LEFT JOIN word_category_relations wcr ON wcr.category_id = c.id
        GROUP BY c.id
        ORDER BY word_count DESC, c.dimension_code ASC
        LIMIT 25
      `),
      pool.query(`
        SELECT
          vs.source_code,
          vs.title,
          vs.author_or_institution,
          vs.license_status,
          vs.reliability_weight,
          COUNT(es.entry_id)::int AS word_count
        FROM vocabulary_sources vs
        LEFT JOIN entry_sources es ON es.source_id = vs.id
        GROUP BY vs.id
        ORDER BY word_count DESC
      `),
      pool.query(`
        SELECT * FROM research_jobs ORDER BY created_at DESC, id DESC LIMIT 15
      `),
      pool.query(`
        SELECT al.*, rj.job_name
        FROM agent_logs al
        LEFT JOIN research_jobs rj ON rj.id = al.job_id
        ORDER BY al.created_at DESC, al.id DESC
        LIMIT 40
      `),
      pool.query(`
        SELECT * FROM review_queue ORDER BY status = 'PENDING' DESC, created_at DESC LIMIT 30
      `),
      pool.query(`
        SELECT * FROM user_contributions ORDER BY status = 'PENDING' DESC, created_at DESC LIMIT 30
      `),
      pool.query(`
        SELECT
          a.id AS entry_a_id,
          a.sinhala_word AS word_a,
          a.romanized_pronunciation AS roman_a,
          b.id AS entry_b_id,
          b.sinhala_word AS word_b,
          b.romanized_pronunciation AS roman_b,
          ROUND(similarity(a.sinhala_word, b.sinhala_word)::numeric, 3)::float AS similarity_score
        FROM vocabulary_entries a
        JOIN vocabulary_entries b ON a.id < b.id
        WHERE similarity(a.sinhala_word, b.sinhala_word) > 0.45
        ORDER BY similarity_score DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT * FROM audit_logs ORDER BY created_at DESC, id DESC LIMIT 25
      `),
    ]);

    res.json({
      summary: summaryRes.rows[0],
      byGrammaticalType: posBreakdownRes.rows,
      byCategory: categoryBreakdownRes.rows,
      bySource: sourceBreakdownRes.rows,
      researchJobs: jobsRes.rows,
      agentLogs: recentLogsRes.rows,
      reviewQueue: reviewQueueRes.rows,
      userContributions: contributionsRes.rows,
      duplicateReport: duplicatesRes.rows,
      auditLogs: auditLogsRes.rows,
      llmStatus: getLLMProviderStatus(),
      queueStatus: getQueueStatus(),
    });
  } catch (err) {
    console.error('[API /admin/dashboard] Error:', err);
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

/**
 * POST /api/admin/research-jobs
 * Launches a new Autonomous AI Vocabulary Research & Verification Batch Job.
 */
adminRouter.post('/admin/research-jobs', async (req: Request, res: Response) => {
  try {
    const {
      jobName,
      targetDomain = 'Science, Medicine, Heritage & Everyday Sinhala',
      targetCategorySlug = 'all-dimensions',
      batchSize = 5,
    } = req.body || {};

    const result = await enqueueResearchBatchJob({
      jobName,
      targetDomain,
      targetCategorySlug,
      batchSize: Number(batchSize) || 5,
      runImmediately: true,
    });

    const jobRes = await pool.query(`SELECT * FROM research_jobs WHERE id = $1`, [result.jobId]);
    const logsRes = await pool.query(
      `SELECT * FROM agent_logs WHERE job_id = $1 ORDER BY stage_number ASC, id ASC`,
      [result.jobId]
    );

    res.status(201).json({
      job: jobRes.rows[0],
      logs: logsRes.rows,
    });
  } catch (err: any) {
    console.error('[API POST /admin/research-jobs] Error:', err);
    res.status(500).json({ error: err?.message || 'Failed to launch research batch job' });
  }
});

/**
 * GET /api/admin/research-jobs/:id/logs
 * Retrieves the 10-stage verification logs for a specific research job.
 */
adminRouter.get('/admin/research-jobs/:id/logs', async (req: Request, res: Response) => {
  try {
    const jobId = Number(req.params.id);
    const logsRes = await pool.query(
      `SELECT * FROM agent_logs WHERE job_id = $1 ORDER BY stage_number ASC, id ASC`,
      [jobId]
    );
    res.json({ logs: logsRes.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load job logs' });
  }
});

/**
 * POST /api/admin/review-queue/:id/decision
 * Approves or rejects an uncertain entry in the Human Review Queue.
 */
adminRouter.post('/admin/review-queue/:id/decision', async (req: Request, res: Response) => {
  try {
    const reviewId = Number(req.params.id);
    const { decision, reviewerName = 'Chief Linguist Reviewer', reviewerNotes = '' } = req.body || {};

    const rqRes = await pool.query(`SELECT * FROM review_queue WHERE id = $1`, [reviewId]);
    if (rqRes.rows.length === 0) {
      res.status(404).json({ error: 'Review queue item not found' });
      return;
    }

    const item = rqRes.rows[0];

    if (decision === 'APPROVE') {
      const payload = item.candidate_payload || {};
      const entryData = {
        sinhalaWord: payload.sinhalaWord || item.candidate_sinhala,
        romanizedPronunciation: payload.romanizedPronunciation || item.candidate_romanized,
        ipaTranscription: payload.ipaTranscription || `/${item.candidate_romanized}/`,
        tamilPronunciationGuide: payload.tamilPronunciationGuide || item.candidate_tamil,
        syllableBreakdown: payload.syllableBreakdown || item.candidate_sinhala,
        primaryTamilTranslation: payload.primaryTamilTranslation || item.candidate_tamil,
        primaryEnglishTranslation: payload.primaryEnglishTranslation || item.candidate_english,
        partOfSpeech: payload.partOfSpeech || item.part_of_speech || 'Noun',
        grammaticalClassification: payload.grammaticalClassification || 'Verified Lexical Entry',
        difficultyLevel: payload.difficultyLevel || 'Intermediate',
        usageContext: payload.usageContext || 'Reviewed and verified by human linguist.',
        register: payload.register || ('Both' as const),
        spokenVsLiterary: payload.spokenVsLiterary || 'Spoken & Literary',
        regionalVariations: payload.regionalVariations || '',
        etymologyNotes: payload.etymologyNotes || 'Verified during human linguist review.',
        verificationStatus: 'VERIFIED' as const,
        confidenceScore: 0.96,
        isDemoDataset: false,
        senses: payload.senses || [
          {
            senseNumber: 1,
            sinhalaDefinition: payload.usageContext || item.candidate_sinhala,
            tamilMeaning: item.candidate_tamil,
            englishMeaning: item.candidate_english,
            contextualUsage: payload.usageContext || 'Standard usage',
          },
        ],
        examples: payload.examples || [
          {
            sinhalaSentence: `${item.candidate_sinhala} පිළිබඳ නිවැරදි අර්ථය මෙහි දැක්වේ.`,
            sinhalaRomanized: `${item.candidate_romanized} piḷibaṉda niværadi arthaya mehi dækvē.`,
            tamilTranslation: `${item.candidate_tamil} என்பதன் சரியான பொருள் இங்கே காட்டப்பட்டுள்ளது.`,
            englishTranslation: `The accurate meaning of ${item.candidate_english} is shown here.`,
            usageRegister: 'Neutral' as const,
            contextNote: 'Verified example',
          },
        ],
        synonyms: payload.synonyms || [],
        antonyms: payload.antonyms || [],
        relatedWords: payload.relatedWords || [],
        wordForms: payload.wordForms || [
          {
            formType: 'Base Form',
            sinhalaForm: item.candidate_sinhala,
            romanizedForm: item.candidate_romanized,
            tamilEquivalent: item.candidate_tamil,
            englishGloss: item.candidate_english,
            grammaticalNote: 'Verified headword',
          },
        ],
        linguisticRoot: payload.linguisticRoot || {
          originLanguage: 'Sinhala Lexicon',
          rootWord: item.candidate_sinhala,
          derivationType: 'Verified Lexical Stem',
          historicalEvolution: payload.etymologyNotes || 'Human-reviewed lexical attestation',
          cognates: '',
          etymologyReference: 'Human Linguist Review Board',
        },
        categorySlugs: payload.categorySlugs || ['a-nouns', 'g-intermediate'],
        sourceCodes: payload.sourceCodes || ['CARTER_1924'],
      };

      const saved = await insertVocabularyEntryComplete(entryData, reviewerName);

      await pool.query(
        `UPDATE review_queue
         SET status = 'APPROVED', entry_id = $2, reviewer_name = $3, reviewer_notes = $4, reviewed_at = NOW()
         WHERE id = $1`,
        [reviewId, saved.entryId, reviewerName, reviewerNotes]
      );

      res.json({ status: 'APPROVED', entryId: saved.entryId });
      return;
    } else {
      await pool.query(
        `UPDATE review_queue
         SET status = 'REJECTED', reviewer_name = $2, reviewer_notes = $3, reviewed_at = NOW()
         WHERE id = $1`,
        [reviewId, reviewerName, reviewerNotes]
      );

      await pool.query(
        `INSERT INTO audit_logs (entity_type, entity_id, action, actor, summary)
         VALUES ('review_queue', $1, 'REJECT_REVIEW_ITEM', $2, $3)`,
        [reviewId, reviewerName, `Rejected candidate '${item.candidate_sinhala}': ${reviewerNotes}`]
      );

      res.json({ status: 'REJECTED' });
    }
  } catch (err) {
    console.error('[API POST /admin/review-queue/:id/decision] Error:', err);
    res.status(500).json({ error: 'Failed to process review decision' });
  }
});

/**
 * POST /api/admin/contributions/:id/moderate
 * Moderates (APPROVE / REJECT) a user contribution and merges approved entries into vocabulary_entries.
 */
adminRouter.post('/admin/contributions/:id/moderate', async (req: Request, res: Response) => {
  try {
    const contribId = Number(req.params.id);
    const { decision, moderatorNotes = 'Verified and approved by moderation team' } = req.body || {};

    const cRes = await pool.query(`SELECT * FROM user_contributions WHERE id = $1`, [contribId]);
    if (cRes.rows.length === 0) {
      res.status(404).json({ error: 'Contribution not found' });
      return;
    }

    const contrib = cRes.rows[0];

    if (decision === 'APPROVE') {
      const saved = await insertVocabularyEntryComplete(
        {
          sinhalaWord: contrib.sinhala_word,
          romanizedPronunciation: contrib.romanized_pronunciation || contrib.sinhala_word,
          ipaTranscription: `/${contrib.romanized_pronunciation || contrib.sinhala_word}/`,
          tamilPronunciationGuide: contrib.proposed_tamil || '',
          syllableBreakdown: contrib.sinhala_word,
          primaryTamilTranslation: contrib.proposed_tamil || 'தமிழ் மொழிபெயர்ப்பு',
          primaryEnglishTranslation: contrib.proposed_english || 'Verified community contribution',
          partOfSpeech: contrib.part_of_speech || 'Noun',
          grammaticalClassification: `Community Contributed ${contrib.part_of_speech || 'Noun'}`,
          difficultyLevel: 'Intermediate',
          usageContext: contrib.notes || 'Approved community contribution.',
          register: 'Both',
          spokenVsLiterary: 'Spoken & Literary',
          regionalVariations: contrib.regional_dialect_note || undefined,
          etymologyNotes: contrib.source_reference || 'Verified contributor reference.',
          verificationStatus: 'VERIFIED',
          confidenceScore: 0.95,
          isDemoDataset: false,
          senses: [
            {
              senseNumber: 1,
              sinhalaDefinition: contrib.notes || contrib.sinhala_word,
              tamilMeaning: contrib.proposed_tamil || '',
              englishMeaning: contrib.proposed_english || '',
              contextualUsage: contrib.regional_dialect_note || 'Standard usage',
            },
          ],
          examples: contrib.example_sinhala
            ? [
                {
                  sinhalaSentence: contrib.example_sinhala,
                  sinhalaRomanized: '',
                  tamilTranslation: contrib.example_tamil || '',
                  englishTranslation: contrib.example_english || '',
                  usageRegister: 'Neutral',
                  contextNote: `Contributed by ${contrib.contributor_name}`,
                },
              ]
            : [],
          synonyms: [],
          antonyms: [],
          relatedWords: [],
          wordForms: [
            {
              formType: 'Base Form',
              sinhalaForm: contrib.sinhala_word,
              romanizedForm: contrib.romanized_pronunciation || '',
              tamilEquivalent: contrib.proposed_tamil || '',
              englishGloss: contrib.proposed_english || '',
              grammaticalNote: 'Approved contribution',
            },
          ],
          linguisticRoot: {
            originLanguage: 'Sinhala Lexicon (Community Verified)',
            rootWord: contrib.sinhala_word,
            derivationType: 'Attested Lexeme',
            historicalEvolution: contrib.source_reference || 'Community linguist submission',
            cognates: '',
            etymologyReference: contrib.source_reference || `Contributed by ${contrib.contributor_name}`,
          },
          categorySlugs: ['a-nouns', 'g-intermediate', 'i-traditional-sinhala-words'],
          sourceCodes: ['DOL_TRILINGUAL'],
        },
        `MODERATOR (${contrib.contributor_name})`
      );

      await pool.query(
        `UPDATE user_contributions
         SET status = 'APPROVED', target_entry_id = $2, moderator_notes = $3, moderated_at = NOW()
         WHERE id = $1`,
        [contribId, saved.entryId, moderatorNotes]
      );

      res.json({ status: 'APPROVED', entryId: saved.entryId });
      return;
    } else {
      await pool.query(
        `UPDATE user_contributions
         SET status = 'REJECTED', moderator_notes = $2, moderated_at = NOW()
         WHERE id = $1`,
        [contribId, moderatorNotes]
      );
      res.json({ status: 'REJECTED' });
    }
  } catch (err) {
    console.error('[API POST /admin/contributions/:id/moderate] Error:', err);
    res.status(500).json({ error: 'Failed to moderate contribution' });
  }
});
