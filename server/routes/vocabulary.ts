import { Router, Request, Response } from 'express';
import { pool } from '../db/pool.js';
import { SINHALA_ALPHABET } from '../utils/sinhala-linguistics.js';

export const vocabularyRouter = Router();

/**
 * GET /api/stats
 * Returns homepage & global encyclopedia statistics, daily word, recent words, popular words, and dimension summary.
 */
vocabularyRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [
      countsRes,
      posRes,
      dimRes,
      sourceRes,
      recentRes,
      popularRes,
      dailyRes,
    ] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int AS total_entries,
          COUNT(*) FILTER (WHERE verification_status = 'VERIFIED')::int AS verified_count,
          COUNT(*) FILTER (WHERE verification_status = 'SOURCE_SUPPORTED')::int AS source_supported_count,
          COUNT(*) FILTER (WHERE verification_status = 'AI_SUGGESTION')::int AS ai_suggestion_count,
          COUNT(*) FILTER (WHERE verification_status = 'UNVERIFIED')::int AS unverified_count,
          COUNT(*) FILTER (WHERE verification_status = 'DISPUTED_OR_REGIONAL')::int AS regional_count,
          (SELECT COUNT(*)::int FROM categories) AS total_categories,
          (SELECT COUNT(*)::int FROM example_sentences) AS total_examples,
          (SELECT COUNT(*)::int FROM word_forms) AS total_word_forms,
          (SELECT COUNT(*)::int FROM vocabulary_sources) AS total_sources
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
          COUNT(DISTINCT c.id)::int AS category_count,
          COUNT(DISTINCT wcr.entry_id)::int AS word_count
        FROM categories c
        LEFT JOIN word_category_relations wcr ON wcr.category_id = c.id
        GROUP BY c.dimension_code, c.dimension_name
        ORDER BY c.dimension_code ASC
      `),
      pool.query(`
        SELECT
          vs.source_code,
          vs.title,
          vs.source_type,
          vs.license_status,
          COUNT(es.entry_id)::int AS word_count
        FROM vocabulary_sources vs
        LEFT JOIN entry_sources es ON es.source_id = vs.id
        GROUP BY vs.id
        ORDER BY word_count DESC
      `),
      pool.query(`
        SELECT
          id, sinhala_word, romanized_pronunciation, tamil_pronunciation_guide,
          primary_tamil_translation, primary_english_translation, part_of_speech,
          difficulty_level, verification_status, confidence_score, created_at
        FROM vocabulary_entries
        ORDER BY created_at DESC, id DESC
        LIMIT 8
      `),
      pool.query(`
        SELECT
          id, sinhala_word, romanized_pronunciation, tamil_pronunciation_guide,
          primary_tamil_translation, primary_english_translation, part_of_speech,
          difficulty_level, verification_status, view_count
        FROM vocabulary_entries
        ORDER BY view_count DESC, confidence_score DESC, sinhala_sort_key ASC
        LIMIT 8
      `),
      pool.query(`
        SELECT
          ve.*,
          lr.origin_language,
          lr.root_word,
          lr.historical_evolution,
          (
            SELECT json_agg(es_ex)
            FROM (
              SELECT sinhala_sentence, sinhala_romanized, tamil_translation, english_translation, usage_register
              FROM example_sentences
              WHERE entry_id = ve.id
              LIMIT 2
            ) es_ex
          ) AS examples
        FROM vocabulary_entries ve
        LEFT JOIN linguistic_roots lr ON lr.entry_id = ve.id
        ORDER BY ve.is_daily_featured DESC, ve.id ASC
        LIMIT 1
      `),
    ]);

    res.json({
      counts: countsRes.rows[0],
      byPartOfSpeech: posRes.rows,
      byDimension: dimRes.rows,
      bySource: sourceRes.rows,
      recentWords: recentRes.rows,
      popularWords: popularRes.rows,
      dailyWord: dailyRes.rows[0] || null,
    });
  } catch (err: any) {
    console.error('[API /stats] Error:', err);
    res.status(500).json({ error: 'Failed to load encyclopedia statistics' });
  }
});

/**
 * GET /api/vocabulary/autocomplete
 * Fast trilingual autocomplete + fuzzy trigram spelling suggestions
 */
vocabularyRouter.get('/vocabulary/autocomplete', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      res.json({ suggestions: [], spellingSuggestions: [] });
      return;
    }

    const pattern = `%${q}%`;
    const prefix = `${q}%`;

    const directRes = await pool.query(
      `SELECT
        id,
        sinhala_word,
        romanized_pronunciation,
        tamil_pronunciation_guide,
        primary_tamil_translation,
        primary_english_translation,
        part_of_speech,
        difficulty_level,
        verification_status
      FROM vocabulary_entries
      WHERE
        sinhala_word ILIKE $1
        OR romanized_pronunciation ILIKE $1
        OR primary_tamil_translation ILIKE $1
        OR primary_english_translation ILIKE $1
      ORDER BY
        CASE
          WHEN sinhala_word ILIKE $2 OR romanized_pronunciation ILIKE $2 THEN 0
          ELSE 1
        END,
        sinhala_sort_key ASC
      LIMIT 8`,
      [pattern, prefix]
    );

    // If few direct matches, provide pg_trgm fuzzy spelling suggestions
    let spellingSuggestions: any[] = [];
    if (directRes.rows.length < 3) {
      const fuzzyRes = await pool.query(
        `SELECT
          id,
          sinhala_word,
          romanized_pronunciation,
          primary_tamil_translation,
          primary_english_translation,
          part_of_speech,
          GREATEST(
            similarity(sinhala_word, $1),
            similarity(romanized_pronunciation, $1),
            similarity(primary_english_translation, $1),
            similarity(primary_tamil_translation, $1)
          ) AS sim_score
        FROM vocabulary_entries
        WHERE
          similarity(sinhala_word, $1) > 0.15
          OR similarity(romanized_pronunciation, $1) > 0.2
          OR similarity(primary_english_translation, $1) > 0.2
          OR similarity(primary_tamil_translation, $1) > 0.15
        ORDER BY sim_score DESC
        LIMIT 5`,
        [q]
      );
      spellingSuggestions = fuzzyRes.rows;
    }

    res.json({
      suggestions: directRes.rows,
      spellingSuggestions,
    });
  } catch (err) {
    console.error('[API /vocabulary/autocomplete] Error:', err);
    res.status(500).json({ error: 'Autocomplete query failed' });
  }
});

/**
 * GET /api/vocabulary/alphabet
 * Returns Sinhala alphabetical letter distribution in authentic Sinhala orthographic order (Swara -> Vyanjana)
 * plus Romanized A-Z distribution.
 */
vocabularyRouter.get('/vocabulary/alphabet', async (_req: Request, res: Response) => {
  try {
    const [siRes, romanRes] = await Promise.all([
      pool.query<{ letter: string; count: number }>(`
        SELECT sinhala_initial_letter AS letter, COUNT(*)::int AS count
        FROM vocabulary_entries
        GROUP BY sinhala_initial_letter
      `),
      pool.query<{ letter: string; count: number }>(`
        SELECT UPPER(SUBSTRING( REGEXP_REPLACE(
          TRANSLATE(LOWER(romanized_pronunciation), 'āæǣīūṛēōśṣṇḍṭḷṉṁṅñ', 'aaaiureossndtlmnnn'),
          '[^a-z]', '', 'g'
        ) FROM 1 FOR 1)) AS letter,
        COUNT(*)::int AS count
        FROM vocabulary_entries
        GROUP BY 1
        ORDER BY 1 ASC
      `),
    ]);

    const siCountMap = new Map(siRes.rows.map((r) => [r.letter, r.count]));
    const sinhalaAlphabet = SINHALA_ALPHABET.map((item) => ({
      ...item,
      count: siCountMap.get(item.letter) || 0,
    }));

    const romanCountMap = new Map(romanRes.rows.map((r) => [r.letter, r.count]));
    const romanAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => ({
      letter,
      count: romanCountMap.get(letter) || 0,
    }));

    res.json({
      sinhalaAlphabet,
      romanAlphabet,
    });
  } catch (err) {
    console.error('[API /vocabulary/alphabet] Error:', err);
    res.status(500).json({ error: 'Failed to load alphabet explorer data' });
  }
});

/**
 * GET /api/vocabulary
 * Advanced Trilingual Search & Multi-Faceted Vocabulary Explorer
 */
vocabularyRouter.get('/vocabulary', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    const lang = String(req.query.lang || 'all'); // all | si | ta | en | roman
    const pos = String(req.query.pos || '').trim();
    const category = String(req.query.category || '').trim();
    const dimension = String(req.query.dimension || '').trim();
    const difficulty = String(req.query.difficulty || '').trim();
    const status = String(req.query.status || '').trim();
    const register = String(req.query.register || '').trim();
    const letterSi = String(req.query.letterSi || '').trim();
    const letterRoman = String(req.query.letterRoman || '').trim();
    const sort = String(req.query.sort || 'sinhala_asc'); // sinhala_asc | newest | popular | confidence
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 24));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];

    if (q) {
      params.push(`%${q}%`);
      const pIdx = params.length;

      if (lang === 'si') {
        conditions.push(`(ve.sinhala_word ILIKE $${pIdx} OR ve.normalized_sinhala ILIKE $${pIdx})`);
      } else if (lang === 'ta') {
        conditions.push(`(ve.primary_tamil_translation ILIKE $${pIdx} OR ve.tamil_pronunciation_guide ILIKE $${pIdx} OR EXISTS (SELECT 1 FROM vocabulary_senses vs WHERE vs.entry_id = ve.id AND vs.tamil_meaning ILIKE $${pIdx}))`);
      } else if (lang === 'en') {
        conditions.push(`(ve.primary_english_translation ILIKE $${pIdx} OR ve.usage_context ILIKE $${pIdx} OR EXISTS (SELECT 1 FROM vocabulary_senses vs WHERE vs.entry_id = ve.id AND vs.english_meaning ILIKE $${pIdx}))`);
      } else if (lang === 'roman') {
        conditions.push(`(ve.romanized_pronunciation ILIKE $${pIdx})`);
      } else {
        conditions.push(`(
          ve.sinhala_word ILIKE $${pIdx}
          OR ve.romanized_pronunciation ILIKE $${pIdx}
          OR ve.primary_tamil_translation ILIKE $${pIdx}
          OR ve.primary_english_translation ILIKE $${pIdx}
          OR ve.usage_context ILIKE $${pIdx}
          OR EXISTS (
            SELECT 1 FROM vocabulary_senses vs
            WHERE vs.entry_id = ve.id
              AND (vs.tamil_meaning ILIKE $${pIdx} OR vs.english_meaning ILIKE $${pIdx} OR vs.sinhala_definition ILIKE $${pIdx})
          )
          OR EXISTS (
            SELECT 1 FROM synonyms syn
            WHERE syn.entry_id = ve.id AND (syn.synonym_sinhala ILIKE $${pIdx} OR syn.english_meaning ILIKE $${pIdx} OR syn.tamil_meaning ILIKE $${pIdx})
          )
        )`);
      }
    }

    if (pos) {
      params.push(pos);
      conditions.push(`LOWER(ve.part_of_speech) = LOWER($${params.length})`);
    }

    if (difficulty) {
      params.push(difficulty);
      conditions.push(`LOWER(ve.difficulty_level) = LOWER($${params.length})`);
    }

    if (status) {
      params.push(status);
      conditions.push(`ve.verification_status = $${params.length}`);
    }

    if (register) {
      params.push(register);
      conditions.push(`LOWER(ve.register) = LOWER($${params.length})`);
    }

    if (letterSi) {
      params.push(letterSi);
      conditions.push(`ve.sinhala_initial_letter = $${params.length}`);
    }

    if (letterRoman) {
      params.push(letterRoman.toUpperCase());
      conditions.push(`
        UPPER(SUBSTRING( REGEXP_REPLACE(
          TRANSLATE(LOWER(ve.romanized_pronunciation), 'āæǣīūṛēōśṣṇḍṭḷṉṁṅñ', 'aaaiureossndtlmnnn'),
          '[^a-z]', '', 'g'
        ) FROM 1 FOR 1)) = $${params.length}
      `);
    }

    if (category) {
      params.push(category);
      conditions.push(`EXISTS (
        SELECT 1 FROM word_category_relations wcr
        JOIN categories c ON c.id = wcr.category_id
        WHERE wcr.entry_id = ve.id AND c.slug = $${params.length}
      )`);
    }

    if (dimension) {
      params.push(dimension.toUpperCase());
      conditions.push(`EXISTS (
        SELECT 1 FROM word_category_relations wcr
        JOIN categories c ON c.id = wcr.category_id
        WHERE wcr.entry_id = ve.id AND c.dimension_code = $${params.length}
      )`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderByClause = 'ORDER BY ve.sinhala_sort_key ASC';
    if (sort === 'newest') orderByClause = 'ORDER BY ve.created_at DESC, ve.id DESC';
    else if (sort === 'popular') orderByClause = 'ORDER BY ve.view_count DESC, ve.sinhala_sort_key ASC';
    else if (sort === 'confidence') orderByClause = 'ORDER BY ve.confidence_score DESC, ve.sinhala_sort_key ASC';
    else if (sort === 'roman_asc') orderByClause = 'ORDER BY LOWER(ve.romanized_pronunciation) ASC';

    const countRes = await pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM vocabulary_entries ve ${whereClause}`,
      params
    );
    const total = countRes.rows[0]?.total || 0;

    const listParams = [...params, limit, offset];
    const entriesRes = await pool.query(
      `SELECT
        ve.id,
        ve.sinhala_word,
        ve.normalized_sinhala,
        ve.sinhala_initial_letter,
        ve.romanized_pronunciation,
        ve.tamil_pronunciation_guide,
        ve.primary_tamil_translation,
        ve.primary_english_translation,
        ve.part_of_speech,
        ve.grammatical_classification,
        ve.difficulty_level,
        ve.usage_context,
        ve.register,
        ve.spoken_vs_literary,
        ve.regional_variations,
        ve.verification_status,
        ve.confidence_score,
        ve.is_demo_dataset,
        ve.view_count,
        lr.origin_language,
        lr.root_word,
        COALESCE(
          (
            SELECT json_agg(json_build_object(
              'slug', c.slug,
              'dimension_code', c.dimension_code,
              'name_si', c.name_si,
              'name_ta', c.name_ta,
              'name_en', c.name_en
            ))
            FROM word_category_relations wcr
            JOIN categories c ON c.id = wcr.category_id
            WHERE wcr.entry_id = ve.id
          ),
          '[]'::json
        ) AS categories
      FROM vocabulary_entries ve
      LEFT JOIN linguistic_roots lr ON lr.entry_id = ve.id
      ${whereClause}
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      listParams
    );

    // If total === 0 and q is provided, compute fuzzy spelling suggestions using pg_trgm
    let fuzzySuggestions: any[] = [];
    if (total === 0 && q.length >= 2) {
      const fuzzyRes = await pool.query(
        `SELECT
          id, sinhala_word, romanized_pronunciation,
          primary_tamil_translation, primary_english_translation, part_of_speech,
          GREATEST(
            similarity(sinhala_word, $1),
            similarity(romanized_pronunciation, $1),
            similarity(primary_english_translation, $1),
            similarity(primary_tamil_translation, $1)
          ) AS similarity_score
        FROM vocabulary_entries
        ORDER BY similarity_score DESC
        LIMIT 6`,
        [q]
      );
      fuzzySuggestions = fuzzyRes.rows.filter((r) => Number(r.similarity_score) > 0.1);
    }

    res.json({
      entries: entriesRes.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      fuzzySuggestions,
    });
  } catch (err) {
    console.error('[API /vocabulary] Error:', err);
    res.status(500).json({ error: 'Failed to search vocabulary' });
  }
});

/**
 * GET /api/vocabulary/:idOrWord
 * Full dedicated Word Encyclopedia Page Dossier
 */
vocabularyRouter.get('/vocabulary/:idOrWord', async (req: Request, res: Response) => {
  try {
    const rawParam = String(req.params.idOrWord || '').trim();
    const isNumericId = /^\d+$/.test(rawParam);

    const entryRes = await pool.query(
      isNumericId
        ? `SELECT * FROM vocabulary_entries WHERE id = $1`
        : `SELECT * FROM vocabulary_entries WHERE sinhala_word = $1 OR normalized_sinhala = $1 OR LOWER(romanized_pronunciation) = LOWER($1) LIMIT 1`,
      [isNumericId ? Number(rawParam) : rawParam]
    );

    if (entryRes.rows.length === 0) {
      res.status(404).json({ error: 'Vocabulary entry not found' });
      return;
    }

    const entry = entryRes.rows[0];
    const entryId = entry.id;

    // Increment view_count asynchronously
    pool.query(`UPDATE vocabulary_entries SET view_count = view_count + 1 WHERE id = $1`, [entryId]).catch(() => {});

    const [
      pronRes,
      sensesRes,
      transRes,
      examplesRes,
      synonymsRes,
      antonymsRes,
      relatedRes,
      formsRes,
      rootRes,
      catsRes,
      sourcesRes,
      auditRes,
    ] = await Promise.all([
      pool.query(`SELECT * FROM pronunciation WHERE entry_id = $1`, [entryId]),
      pool.query(`SELECT * FROM vocabulary_senses WHERE entry_id = $1 ORDER BY sense_number ASC`, [entryId]),
      pool.query(`SELECT * FROM translations WHERE entry_id = $1 ORDER BY is_primary DESC, id ASC`, [entryId]),
      pool.query(`SELECT * FROM example_sentences WHERE entry_id = $1 ORDER BY id ASC`, [entryId]),
      pool.query(`SELECT * FROM synonyms WHERE entry_id = $1 ORDER BY id ASC`, [entryId]),
      pool.query(`SELECT * FROM antonyms WHERE entry_id = $1 ORDER BY id ASC`, [entryId]),
      pool.query(`SELECT * FROM related_words WHERE entry_id = $1 ORDER BY id ASC`, [entryId]),
      pool.query(`SELECT * FROM word_forms WHERE entry_id = $1 ORDER BY id ASC`, [entryId]),
      pool.query(`SELECT * FROM linguistic_roots WHERE entry_id = $1`, [entryId]),
      pool.query(
        `SELECT c.*, wcr.is_primary
         FROM word_category_relations wcr
         JOIN categories c ON c.id = wcr.category_id
         WHERE wcr.entry_id = $1
         ORDER BY c.dimension_code ASC, c.sort_order ASC`,
        [entryId]
      ),
      pool.query(
        `SELECT vs.*, es.citation_locator, es.verification_note, es.verified_at
         FROM entry_sources es
         JOIN vocabulary_sources vs ON vs.id = es.source_id
         WHERE es.entry_id = $1
         ORDER BY vs.reliability_weight DESC`,
        [entryId]
      ),
      pool.query(
        `SELECT id, action, actor, summary, created_at
         FROM audit_logs
         WHERE entity_type = 'vocabulary_entry' AND entity_id = $1
         ORDER BY created_at DESC LIMIT 10`,
        [entryId]
      ),
    ]);

    res.json({
      entry,
      pronunciation: pronRes.rows[0] || null,
      senses: sensesRes.rows,
      translations: transRes.rows,
      examples: examplesRes.rows,
      synonyms: synonymsRes.rows,
      antonyms: antonymsRes.rows,
      relatedWords: relatedRes.rows,
      wordForms: formsRes.rows,
      linguisticRoot: rootRes.rows[0] || null,
      categories: catsRes.rows,
      sources: sourcesRes.rows,
      auditHistory: auditRes.rows,
    });
  } catch (err) {
    console.error('[API /vocabulary/:idOrWord] Error:', err);
    res.status(500).json({ error: 'Failed to load vocabulary entry details' });
  }
});
