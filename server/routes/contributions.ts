import { Router, Request, Response } from 'express';
import { pool } from '../db/pool.js';
import { verifySinhalaUnicode } from '../utils/sinhala-linguistics.js';

export const contributionsRouter = Router();

/**
 * GET /api/contributions
 * Lists community & expert contributions (filterable by status).
 */
contributionsRouter.get('/contributions', async (req: Request, res: Response) => {
  try {
    const status = String(req.query.status || '').trim();
    const params: any[] = [];
    const whereClause = status ? (params.push(status), `WHERE status = $1`) : '';

    const result = await pool.query(
      `SELECT * FROM user_contributions ${whereClause} ORDER BY created_at DESC LIMIT 50`,
      params
    );

    res.json({ contributions: result.rows });
  } catch (err) {
    console.error('[API GET /contributions] Error:', err);
    res.status(500).json({ error: 'Failed to load contributions' });
  }
});

/**
 * POST /api/contributions
 * Allows users and linguistic experts to:
 * - Suggest new words (NEW_WORD)
 * - Correct translations (TRANSLATION_CORRECTION)
 * - Submit regional vocabulary (REGIONAL_VOCABULARY)
 * - Suggest example sentences (EXAMPLE_SENTENCE)
 * - Report incorrect definitions (INCORRECT_DEFINITION_REPORT)
 * - Submit references (SOURCE_REFERENCE)
 * All contributions enter PENDING review status before becoming verified vocabulary.
 */
contributionsRouter.post('/contributions', async (req: Request, res: Response) => {
  try {
    const {
      contributionType = 'NEW_WORD',
      targetEntryId,
      sinhalaWord,
      romanizedPronunciation,
      proposedTamil,
      proposedEnglish,
      partOfSpeech = 'Noun',
      exampleSinhala,
      exampleTamil,
      exampleEnglish,
      regionalDialectNote,
      sourceReference,
      contributorName,
      contributorRole = 'Community Contributor',
      notes,
    } = req.body || {};

    if (!sinhalaWord || !contributorName) {
      res.status(400).json({ error: 'Sinhala word and contributor name are required.' });
      return;
    }

    const unicodeCheck = verifySinhalaUnicode(String(sinhalaWord));

    const insertRes = await pool.query(
      `INSERT INTO user_contributions (
        contribution_type,
        target_entry_id,
        sinhala_word,
        romanized_pronunciation,
        proposed_tamil,
        proposed_english,
        part_of_speech,
        example_sinhala,
        example_tamil,
        example_english,
        regional_dialect_note,
        source_reference,
        contributor_name,
        contributor_role,
        notes,
        status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'PENDING')
      RETURNING *`,
      [
        contributionType,
        targetEntryId ? Number(targetEntryId) : null,
        unicodeCheck.normalized || sinhalaWord.trim(),
        romanizedPronunciation || '',
        proposedTamil || '',
        proposedEnglish || '',
        partOfSpeech,
        exampleSinhala || null,
        exampleTamil || null,
        exampleEnglish || null,
        regionalDialectNote || null,
        sourceReference || null,
        contributorName.trim(),
        contributorRole,
        notes || null,
      ]
    );

    await pool.query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, actor, summary)
       VALUES ('user_contribution', $1, 'SUBMIT_CONTRIBUTION', $2, $3)`,
      [
        insertRes.rows[0].id,
        contributorName.trim(),
        `Submitted ${contributionType} for '${sinhalaWord}' awaiting linguist moderation`,
      ]
    );

    res.status(201).json({
      contribution: insertRes.rows[0],
      unicodeCheck,
    });
  } catch (err) {
    console.error('[API POST /contributions] Error:', err);
    res.status(500).json({ error: 'Failed to submit contribution' });
  }
});
