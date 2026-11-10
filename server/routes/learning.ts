import { Router, Request, Response } from 'express';
import { pool } from '../db/pool.js';

export const learningRouter = Router();

/**
 * GET /api/learning/exercises
 * Generates interactive learning decks:
 * - Flashcards (Sinhala <-> Tamil <-> English)
 * - Sinhala-to-Tamil & Sinhala-to-English multiple-choice quizzes
 * - Fill-in-the-blank contextual sentence exercises
 * - Listening & Pronunciation syllable/phonetic drills
 * - Daily curated learning collections
 */
learningRouter.get('/learning/exercises', async (req: Request, res: Response) => {
  try {
    const difficulty = String(req.query.difficulty || '').trim();
    const categorySlug = String(req.query.category || '').trim();
    const learnerKey = String(req.query.learnerKey || 'default_learner').trim();

    const params: any[] = [];
    const conditions: string[] = [];

    if (difficulty) {
      params.push(difficulty);
      conditions.push(`LOWER(ve.difficulty_level) = LOWER($${params.length})`);
    }
    if (categorySlug) {
      params.push(categorySlug);
      conditions.push(`EXISTS (
        SELECT 1 FROM word_category_relations wcr
        JOIN categories c ON c.id = wcr.category_id
        WHERE wcr.entry_id = ve.id AND c.slug = $${params.length}
      )`);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const entriesRes = await pool.query(
      `SELECT
        ve.id,
        ve.sinhala_word,
        ve.romanized_pronunciation,
        ve.tamil_pronunciation_guide,
        ve.primary_tamil_translation,
        ve.primary_english_translation,
        ve.part_of_speech,
        ve.difficulty_level,
        ve.usage_context,
        p.ipa_transcription,
        p.syllable_breakdown,
        (
          SELECT json_agg(es)
          FROM (
            SELECT sinhala_sentence, sinhala_romanized, tamil_translation, english_translation
            FROM example_sentences
            WHERE entry_id = ve.id
            LIMIT 1
          ) es
        ) AS sample_sentences
      FROM vocabulary_entries ve
      LEFT JOIN pronunciation p ON p.entry_id = ve.id
      ${whereSql}
      ORDER BY ve.sinhala_sort_key ASC
      LIMIT 30`,
      params
    );

    const words = entriesRes.rows;

    // Build fill-in-the-blank items from example sentences
    const fillInTheBlanks = words
      .filter((w) => Array.isArray(w.sample_sentences) && w.sample_sentences.length > 0)
      .map((w) => {
        const sent = w.sample_sentences[0];
        const baseStem = w.sinhala_word.slice(0, Math.max(2, w.sinhala_word.length - 1));
        const blankedSentence = sent.sinhala_sentence.includes(w.sinhala_word)
          ? sent.sinhala_sentence.replace(w.sinhala_word, '________')
          : sent.sinhala_sentence.replace(new RegExp(baseStem, 'g'), '________');

        return {
          entryId: w.id,
          answerSinhala: w.sinhala_word,
          answerRomanized: w.romanized_pronunciation,
          blankedSentence:
            blankedSentence === sent.sinhala_sentence
              ? `${sent.sinhala_sentence} [ ____ = ${w.primary_english_translation} ]`
              : blankedSentence,
          fullSinhalaSentence: sent.sinhala_sentence,
          tamilHint: sent.tamil_translation,
          englishHint: sent.english_translation,
          wordTamilMeaning: w.primary_tamil_translation,
          wordEnglishMeaning: w.primary_english_translation,
        };
      });

    // Fetch personal vocabulary list & progress for learnerKey
    const progressRes = await pool.query(
      `SELECT
        ulp.*,
        ve.sinhala_word,
        ve.romanized_pronunciation,
        ve.primary_tamil_translation,
        ve.primary_english_translation,
        ve.part_of_speech,
        ve.difficulty_level
      FROM user_learning_progress ulp
      JOIN vocabulary_entries ve ON ve.id = ulp.entry_id
      WHERE ulp.learner_key = $1
      ORDER BY ulp.last_practiced_at DESC`,
      [learnerKey]
    );

    res.json({
      flashcards: words,
      fillInTheBlanks,
      personalProgress: progressRes.rows,
      collections: [
        {
          id: 'daily-essentials',
          titleSi: 'එදිනෙදා අත්‍යවශ්‍ය සිංහල වදන්',
          titleTa: 'அன்றாட அத்தியாவசிய சிங்களச் சொற்கள்',
          titleEn: 'Daily Essential Conversational Sinhala',
          difficulty: 'Beginner',
          filterDifficulty: 'Beginner',
        },
        {
          id: 'academic-stem',
          titleSi: 'විද්‍යා, තාක්ෂණ හා ශාස්ත්‍රීය ශබ්දමාලාව',
          titleTa: 'அறிவியல் மற்றும் கல்விசார் கலைச்சொற்கள்',
          titleEn: 'Academic, STEM & University Terminology',
          difficulty: 'Intermediate',
          filterDifficulty: 'Intermediate',
        },
        {
          id: 'heritage-nature',
          titleSi: 'හෙළ උරුමය, කෘෂිකර්මය සහ සොබාදහම',
          titleTa: 'மரபுரிமை, விவசாயம் மற்றும் இயற்கை',
          titleEn: 'Classical Heritage, Agriculture & Flora/Fauna',
          difficulty: 'Elementary',
          filterDifficulty: 'Elementary',
        },
      ],
    });
  } catch (err) {
    console.error('[API /learning/exercises] Error:', err);
    res.status(500).json({ error: 'Failed to load learning exercises' });
  }
});

/**
 * POST /api/learning/progress
 * Updates flashcard mastery, quiz score, or personal vocabulary list bookmark.
 */
learningRouter.post('/learning/progress', async (req: Request, res: Response) => {
  try {
    const {
      learnerKey = 'default_learner',
      entryId,
      inPersonalList,
      isCorrect,
    } = req.body || {};

    if (!entryId) {
      res.status(400).json({ error: 'entryId is required' });
      return;
    }

    const deltaScore = isCorrect === true ? 20 : isCorrect === false ? -10 : 0;
    const practicedInc = isCorrect !== undefined ? 1 : 0;
    const correctInc = isCorrect === true ? 1 : 0;

    const upsertRes = await pool.query(
      `INSERT INTO user_learning_progress (
        learner_key, entry_id, in_personal_list, mastery_score, times_practiced, correct_answers, last_practiced_at
      ) VALUES ($1, $2, COALESCE($3, true), GREATEST(0, LEAST(100, $4)), $5, $6, NOW())
      ON CONFLICT (learner_key, entry_id) DO UPDATE SET
        in_personal_list = COALESCE($3, user_learning_progress.in_personal_list),
        mastery_score = GREATEST(0, LEAST(100, user_learning_progress.mastery_score + $4)),
        times_practiced = user_learning_progress.times_practiced + $5,
        correct_answers = user_learning_progress.correct_answers + $6,
        last_practiced_at = NOW()
      RETURNING *`,
      [
        learnerKey,
        Number(entryId),
        inPersonalList !== undefined ? Boolean(inPersonalList) : null,
        deltaScore > 0 ? deltaScore : 0,
        practicedInc,
        correctInc,
      ]
    );

    res.json({ progress: upsertRes.rows[0] });
  } catch (err) {
    console.error('[API POST /learning/progress] Error:', err);
    res.status(500).json({ error: 'Failed to update learning progress' });
  }
});
