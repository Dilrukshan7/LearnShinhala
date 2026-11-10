import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';
import { ALL_CATEGORY_SEEDS } from './categories-data.js';
import { VOCABULARY_SOURCES_SEED, INITIAL_SEED_VOCABULARY } from './vocabulary-seed-data.js';
import { EXTENDED_SEED_VOCABULARY } from './vocabulary-seed-extended.js';
import { PERMITTED_CORPUS_BANK } from '../agent/corpus-bank.js';
import { insertVocabularyEntryComplete } from './entry-repository.js';

const __filename = fileURLToPath(import.meta.url);

export async function runSeed(): Promise<void> {
  console.log('[SEED] Starting database seeding for Complete Sinhala Vocabulary Encyclopedia...');

  // 1. Seed Categories (All 9 Dimensions A-I)
  for (let i = 0; i < ALL_CATEGORY_SEEDS.length; i++) {
    const cat = ALL_CATEGORY_SEEDS[i];
    await pool.query(
      `INSERT INTO categories (slug, dimension_code, dimension_name, name_si, name_ta, name_en, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (slug) DO UPDATE SET
         name_si = EXCLUDED.name_si,
         name_ta = EXCLUDED.name_ta,
         name_en = EXCLUDED.name_en,
         dimension_name = EXCLUDED.dimension_name`,
      [cat.slug, cat.dimensionCode, cat.dimensionName, cat.nameSi, cat.nameTa, cat.nameEn, i + 1]
    );
  }
  console.log(`[SEED] Seeded ${ALL_CATEGORY_SEEDS.length} hierarchical categories across Dimensions A–I.`);

  // 2. Seed Permitted Linguistic Sources
  for (const src of VOCABULARY_SOURCES_SEED) {
    await pool.query(
      `INSERT INTO vocabulary_sources (
        source_code, title, author_or_institution, publication_year, source_type, license_status, reference_url, reliability_weight, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (source_code) DO UPDATE SET
        title = EXCLUDED.title,
        reliability_weight = EXCLUDED.reliability_weight`,
      [
        src.sourceCode,
        src.title,
        src.authorOrInstitution,
        src.publicationYear,
        src.sourceType,
        src.licenseStatus,
        src.referenceUrl,
        src.reliabilityWeight,
        src.notes,
      ]
    );
  }
  console.log(`[SEED] Seeded ${VOCABULARY_SOURCES_SEED.length} permitted linguistic & dictionary sources.`);

  // 3. Seed Initial Demonstration & Foundation Lexicon
  const initialEntries = [
    ...INITIAL_SEED_VOCABULARY,
    ...EXTENDED_SEED_VOCABULARY,
    ...PERMITTED_CORPUS_BANK.slice(0, 6),
  ];

  let insertedCount = 0;
  for (const entry of initialEntries) {
    const res = await insertVocabularyEntryComplete(entry, 'INITIAL_LEXICON_SEED');
    if (res.inserted) insertedCount++;
  }
  console.log(`[SEED] Inserted ${insertedCount} richly annotated trilingual vocabulary entries (total initial pool: ${initialEntries.length}).`);

  // 4. Seed Initial Review Queue items (Uncertain / Regional / AI-suggested entries requiring Human Linguist Review)
  const existingReviewCount = await pool.query(`SELECT COUNT(*)::int AS cnt FROM review_queue`);
  if (existingReviewCount.rows[0].cnt === 0) {
    const reviewCandidates = [
      {
        sinhala: 'හේන',
        romanized: 'hēna',
        tamil: 'சேனைப் பயிர்ச்செய்கை நிலம்',
        english: 'Chena cultivation land (Slash-and-burn rain-fed highland farm)',
        pos: 'Noun',
        confidence: 0.815,
        reason: 'Stage 9 Confidence Gate (0.815 < 0.880 threshold): Requires human verification of regional Dry Zone (රජරට/රුහුණ) agricultural collocations before marking VERIFIED.',
        payload: {
          sinhalaWord: 'හේන',
          romanizedPronunciation: 'hēna',
          ipaTranscription: '/heːnə/',
          tamilPronunciationGuide: 'ஹேன (சேனை)',
          syllableBreakdown: 'හේ-න (hē-na)',
          primaryTamilTranslation: 'சேனைப் பயிர்ச்செய்கை நிலம்',
          primaryEnglishTranslation: 'Chena cultivation plot (rain-fed shifting highland agriculture)',
          partOfSpeech: 'Noun',
          grammaticalClassification: 'Inanimate Agricultural Place Noun',
          difficultyLevel: 'Intermediate',
          usageContext: 'Traditional dry-zone highland farming plot in Sri Lanka (borrowed into Sri Lankan English as "chena" and Sri Lankan Tamil as "சேனை").',
          register: 'Both',
          spokenVsLiterary: 'Spoken & Literary',
          regionalVariations: 'Widespread in Rajarata, Uva, and Ruhuna dry zones.',
          etymologyNotes: 'From Classical Elu "සේන" (sēna) -> "හේන" (hēna) via s > h sound change; borrowed into Sri Lankan Tamil as சேனை (cēṉai).',
          categorySlugs: ['a-nouns', 'c-agricultural-environments', 'c-countryside', 'd-agriculture', 'g-intermediate', 'i-traditional-sinhala-words'],
          sourceCodes: ['CARTER_1924', 'HELA_ATUVAVA'],
        },
      },
      {
        sinhala: 'පින්තූරය',
        romanized: 'pintūraya',
        tamil: 'படம் / ஓவியம்',
        english: 'Picture; Painting; Photograph',
        pos: 'Noun',
        confidence: 0.790,
        reason: 'Loanword etymology cross-check flagged for linguist review: Verify Portuguese "pintura" vs. classical Elu/Sanskrit synonym "චිත්‍රය" (citraya) register distinction.',
        payload: {
          sinhalaWord: 'පින්තූරය',
          romanizedPronunciation: 'pintūraya',
          ipaTranscription: '/pint̪uːrəjə/',
          tamilPronunciationGuide: 'பின்தூரய (படம்)',
          syllableBreakdown: 'පින්-තූ-ර-ය (pin-tū-ra-ya)',
          primaryTamilTranslation: 'படம் / ஓவியம் / புகைப்படம்',
          primaryEnglishTranslation: 'Picture; Painting; Image',
          partOfSpeech: 'Noun',
          grammaticalClassification: 'Inanimate Countable Noun',
          difficultyLevel: 'Beginner',
          usageContext: 'Everyday word for a picture, illustration, or framed image; formal artistic synonym is චිත්‍රය (citraya) or සිතුවම (situvama).',
          register: 'Both',
          spokenVsLiterary: 'Spoken & Literary',
          etymologyNotes: 'Borrowed from Portuguese "pintura" (painting/picture).',
          categorySlugs: ['a-nouns', 'd-art', 'g-beginner', 'i-loanwords', 'i-portuguese-derived-vocabulary'],
          sourceCodes: ['CARTER_1924'],
        },
      },
    ];

    for (const rc of reviewCandidates) {
      await pool.query(
        `INSERT INTO review_queue (
          candidate_sinhala, candidate_romanized, candidate_tamil, candidate_english,
          part_of_speech, candidate_payload, confidence_score, review_reason, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'PENDING')`,
        [
          rc.sinhala,
          rc.romanized,
          rc.tamil,
          rc.english,
          rc.pos,
          JSON.stringify(rc.payload),
          rc.confidence,
          rc.reason,
        ]
      );
    }
    console.log(`[SEED] Seeded ${reviewCandidates.length} human review queue candidates.`);
  }

  // 5. Seed Initial User Contributions for Moderation
  const existingContribCount = await pool.query(`SELECT COUNT(*)::int AS cnt FROM user_contributions`);
  if (existingContribCount.rows[0].cnt === 0) {
    await pool.query(
      `INSERT INTO user_contributions (
        contribution_type, sinhala_word, romanized_pronunciation, proposed_tamil, proposed_english,
        part_of_speech, example_sinhala, example_tamil, example_english,
        regional_dialect_note, source_reference, contributor_name, contributor_role, notes, status
      ) VALUES
      (
        'NEW_WORD',
        'කමත',
        'kamata',
        'சூடு மிதிக்கும் களம் (நெற்களம்)',
        'Traditional paddy threshing floor',
        'Noun',
        'අස්වැන්න නෙළා ගත් ගොවියෝ ගොයම් මිටි කමතට රැස් කළහ.',
        'அறுவடை செய்த விவசாயிகள் நெற்கட்டுகளைக் களத்தில் சேர்த்தனர்.',
        'Having harvested the crop, the farmers gathered the sheaves of paddy onto the threshing floor.',
        'Used with specialized sacred agricultural language (කමත් භාෂාව - Kamath Bhashava).',
        'Carter (1924), p. 157; Traditional Sinhala Agricultural Lexicon',
        'Dr. Nimal Perera',
        'Linguist & Folklorist',
        'Essential agricultural heritage word connected to කුඹුර (paddy field).',
        'PENDING'
      ),
      (
        'REGIONAL_VOCABULARY',
        'දොඩම්',
        'doḍam',
        'தோடம்பழம் / ஆரஞ்சு',
        'Orange (Citrus sinensis)',
        'Noun',
        'ලෙඩාට බොන්න අලුත් දොඩම් යුෂ වීදුරුවක් හදලා දුන්නා.',
        'நோயாளி குடிக்கப் புதிய தோடம்பழச்சாறு ஒரு குவளை தயாரித்துக் கொடுத்தார்கள்.',
        'A glass of fresh orange juice was prepared and given to the patient to drink.',
        'Shared phonological link with Sri Lankan Tamil தோடம்பழம் (tōṭampaḻam).',
        'Department of Official Languages Trilingual Glossary',
        'K. Sivakumar',
        'Bilingual Translator (Tamil-Sinhala)',
        'Illustrates the shared Sinhala දොඩම් / Sri Lankan Tamil தோடம் lexical pair.',
        'PENDING'
      )`
    );
    console.log('[SEED] Seeded initial community contributions awaiting moderation.');
  }

  // 6. Seed an Initial Completed Research Job & 10-Stage Agent Logs
  const existingJobCount = await pool.query(`SELECT COUNT(*)::int AS cnt FROM research_jobs`);
  if (existingJobCount.rows[0].cnt === 0) {
    const jobRes = await pool.query<{ id: number }>(
      `INSERT INTO research_jobs (
        job_name, job_type, target_domain, target_category_slug, source_corpus,
        status, batch_size, processed_count, verified_added_count, review_queued_count,
        duplicate_skipped_count, failed_count, llm_provider, progress_percent,
        started_at, completed_at
      ) VALUES (
        'Initial Foundation Lexicon & Trilingual Verification Batch #1',
        'CORPUS_DISCOVERY',
        'Core Everyday, Academic, Medical & Heritage Vocabulary',
        'all-dimensions',
        'CARTER_1924 + DOL_TRILINGUAL + EPD_TECHNICAL',
        'COMPLETED',
        6,
        6,
        6,
        0,
        0,
        0,
        'corpus_verified',
        100,
        NOW() - INTERVAL '10 minutes',
        NOW() - INTERVAL '9 minutes'
      ) RETURNING id`
    );

    const jobId = jobRes.rows[0].id;
    const stages = [
      { num: 1, name: 'Word Discovery', msg: 'Discovered 6 candidate headwords from Carter (1924) & DOL Trilingual Glossaries (පන්සල, ගුරුවරයා, ව්‍යවස්ථාව, ප්‍රතිශක්තිය, අලමන්දාව, දොදොල්).' },
      { num: 2, name: 'Sinhala Spelling Verification', msg: 'Validated NFC Unicode normalization, rakaransaya/yansaya ZWJ sequences, and retroflex ණ/ළ orthography (score: 1.00).' },
      { num: 3, name: 'Linguistic Classification', msg: 'Classified parts of speech, animate/inanimate noun declensions, and spoken vs. literary registers.' },
      { num: 4, name: 'Tamil Translation', msg: 'Verified context-sensitive Tamil translations and Tamil script phonetic guides.' },
      { num: 5, name: 'English Translation', msg: 'Verified scholarly English glosses, IPA transcriptions, and ISO-15919 Romanization.' },
      { num: 6, name: 'Contextual Meaning Verification', msg: 'Validated trilingual example sentences across Formal, Academic, and Colloquial registers.' },
      { num: 7, name: 'Duplicate Detection', msg: 'Checked normalized Sinhala forms and pg_trgm similarity indexes; 0 duplicates found.' },
      { num: 8, name: 'Source Verification', msg: 'Cross-referenced citations against CARTER_1924, DOL_TRILINGUAL, EPD_TECHNICAL, and HELA_ATUVAVA.' },
      { num: 9, name: 'Confidence Scoring', msg: 'Computed composite confidence scores (mean: 0.985, range: 0.945–0.996).' },
      { num: 10, name: 'Database Persistence & Review Routing', msg: 'Committed 6 verified entries to vocabulary_entries and routed 2 borderline candidates to review_queue.' },
    ];

    for (const st of stages) {
      await pool.query(
        `INSERT INTO agent_logs (job_id, stage_number, stage_name, candidate_sinhala, log_level, confidence_score, message)
         VALUES ($1, $2, $3, $4, 'INFO', 0.985, $5)`,
        [jobId, st.num, st.name, 'පන්සල, ගුරුවරයා, ව්‍යවස්ථාව...', st.msg]
      );
    }
    console.log('[SEED] Seeded initial research job and 10-stage pipeline logs.');
  }

  console.log('[SEED] Database seeding completed successfully.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  runSeed()
    .then(() => pool.end())
    .catch((err) => {
      console.error('[SEED] Error during seeding:', err);
      process.exit(1);
    });
}
