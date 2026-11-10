import { pool } from './pool.js';
import { SeedWordEntry } from './vocabulary-seed-data.js';
import {
  normalizeSinhalaWord,
  getSinhalaInitialLetter,
  computeSinhalaSortKey,
} from '../utils/sinhala-linguistics.js';

export async function insertVocabularyEntryComplete(
  entry: SeedWordEntry,
  actor = 'SYSTEM_SEED'
): Promise<{ entryId: number; inserted: boolean }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const normalized = normalizeSinhalaWord(entry.sinhalaWord);
    const initialLetter = getSinhalaInitialLetter(normalized);
    const sortKey = computeSinhalaSortKey(normalized);

    const existing = await client.query<{ id: number }>(
      `SELECT id FROM vocabulary_entries WHERE normalized_sinhala = $1 AND part_of_speech = $2`,
      [normalized, entry.partOfSpeech]
    );

    if (existing.rows.length > 0) {
      await client.query('COMMIT');
      return { entryId: existing.rows[0].id, inserted: false };
    }

    const insertRes = await client.query<{ id: number }>(
      `INSERT INTO vocabulary_entries (
        sinhala_word,
        normalized_sinhala,
        sinhala_initial_letter,
        sinhala_sort_key,
        romanized_pronunciation,
        tamil_pronunciation_guide,
        primary_tamil_translation,
        primary_english_translation,
        part_of_speech,
        grammatical_classification,
        difficulty_level,
        usage_context,
        register,
        spoken_vs_literary,
        regional_variations,
        etymology_notes,
        verification_status,
        confidence_score,
        is_demo_dataset,
        is_daily_featured
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
      ) RETURNING id`,
      [
        entry.sinhalaWord,
        normalized,
        initialLetter,
        sortKey,
        entry.romanizedPronunciation,
        entry.tamilPronunciationGuide,
        entry.primaryTamilTranslation,
        entry.primaryEnglishTranslation,
        entry.partOfSpeech,
        entry.grammaticalClassification,
        entry.difficultyLevel,
        entry.usageContext,
        entry.register,
        entry.spokenVsLiterary,
        entry.regionalVariations || null,
        entry.etymologyNotes,
        entry.verificationStatus,
        entry.confidenceScore,
        entry.isDemoDataset,
        entry.isDailyFeatured || false,
      ]
    );

    const entryId = insertRes.rows[0].id;

    // Insert pronunciation
    await client.query(
      `INSERT INTO pronunciation (
        entry_id,
        romanized_standard,
        romanized_phonetic,
        ipa_transcription,
        tamil_script_phonetic,
        syllable_breakdown,
        regional_accent_notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (entry_id) DO NOTHING`,
      [
        entryId,
        entry.romanizedPronunciation,
        entry.romanizedPronunciation,
        entry.ipaTranscription,
        entry.tamilPronunciationGuide,
        entry.syllableBreakdown,
        entry.regionalVariations || null,
      ]
    );

    // Insert senses and translations
    for (const sense of entry.senses) {
      const senseRes = await client.query<{ id: number }>(
        `INSERT INTO vocabulary_senses (
          entry_id,
          sense_number,
          sinhala_definition,
          tamil_meaning,
          english_meaning,
          contextual_usage,
          formal_usage_note,
          informal_usage_note,
          domain_tag
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [
          entryId,
          sense.senseNumber,
          sense.sinhalaDefinition,
          sense.tamilMeaning,
          sense.englishMeaning,
          sense.contextualUsage,
          sense.formalUsageNote || null,
          sense.informalUsageNote || null,
          sense.domainTag || null,
        ]
      );

      const senseId = senseRes.rows[0].id;

      await client.query(
        `INSERT INTO translations (
          entry_id, sense_id, language_code, translated_word, pronunciation_guide, context_note, is_primary, confidence_score
        ) VALUES
        ($1, $2, 'ta', $3, $4, $5, $6, $7),
        ($1, $2, 'en', $8, $9, $5, $6, $7)`,
        [
          entryId,
          senseId,
          sense.tamilMeaning,
          entry.tamilPronunciationGuide,
          sense.contextualUsage,
          sense.senseNumber === 1,
          entry.confidenceScore,
          sense.englishMeaning,
          entry.romanizedPronunciation,
        ]
      );
    }

    // Insert examples
    for (const ex of entry.examples) {
      await client.query(
        `INSERT INTO example_sentences (
          entry_id,
          sinhala_sentence,
          sinhala_romanized,
          tamil_translation,
          english_translation,
          usage_register,
          context_note
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          entryId,
          ex.sinhalaSentence,
          ex.sinhalaRomanized,
          ex.tamilTranslation,
          ex.englishTranslation,
          ex.usageRegister,
          ex.contextNote,
        ]
      );
    }

    // Insert synonyms
    for (const syn of entry.synonyms) {
      await client.query(
        `INSERT INTO synonyms (
          entry_id, synonym_sinhala, synonym_romanized, tamil_meaning, english_meaning, nuance_note
        ) VALUES ($1,$2,$3,$4,$5,$6)`,
        [entryId, syn.sinhala, syn.romanized, syn.tamil, syn.english, syn.nuance]
      );
    }

    // Insert antonyms
    for (const ant of entry.antonyms) {
      await client.query(
        `INSERT INTO antonyms (
          entry_id, antonym_sinhala, antonym_romanized, tamil_meaning, english_meaning, contrast_note
        ) VALUES ($1,$2,$3,$4,$5,$6)`,
        [entryId, ant.sinhala, ant.romanized, ant.tamil, ant.english, ant.contrast]
      );
    }

    // Insert related words
    for (const rel of entry.relatedWords) {
      await client.query(
        `INSERT INTO related_words (
          entry_id, related_sinhala, related_romanized, relation_type, tamil_meaning, english_meaning
        ) VALUES ($1,$2,$3,$4,$5,$6)`,
        [entryId, rel.sinhala, rel.romanized, rel.type, rel.tamil, rel.english]
      );
    }

    // Insert word forms
    for (const wf of entry.wordForms) {
      await client.query(
        `INSERT INTO word_forms (
          entry_id, form_type, sinhala_form, romanized_form, tamil_equivalent, english_gloss, grammatical_note
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          entryId,
          wf.formType,
          wf.sinhalaForm,
          wf.romanizedForm,
          wf.tamilEquivalent,
          wf.englishGloss,
          wf.grammaticalNote,
        ]
      );
    }

    // Insert linguistic root
    if (entry.linguisticRoot) {
      await client.query(
        `INSERT INTO linguistic_roots (
          entry_id, origin_language, root_word, derivation_type, historical_evolution, cognates, etymology_reference
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (entry_id) DO NOTHING`,
        [
          entryId,
          entry.linguisticRoot.originLanguage,
          entry.linguisticRoot.rootWord,
          entry.linguisticRoot.derivationType,
          entry.linguisticRoot.historicalEvolution,
          entry.linguisticRoot.cognates,
          entry.linguisticRoot.etymologyReference,
        ]
      );
    }

    // Link categories
    for (let i = 0; i < entry.categorySlugs.length; i++) {
      const slug = entry.categorySlugs[i];
      const catRes = await client.query<{ id: number }>(
        `SELECT id FROM categories WHERE slug = $1`,
        [slug]
      );
      if (catRes.rows.length > 0) {
        await client.query(
          `INSERT INTO word_category_relations (entry_id, category_id, is_primary, assigned_by)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (entry_id, category_id) DO NOTHING`,
          [entryId, catRes.rows[0].id, i === 0, actor]
        );
      }
    }

    // Link sources
    for (const code of entry.sourceCodes) {
      const srcRes = await client.query<{ id: number }>(
        `SELECT id FROM vocabulary_sources WHERE source_code = $1`,
        [code]
      );
      if (srcRes.rows.length > 0) {
        await client.query(
          `INSERT INTO entry_sources (entry_id, source_id, citation_locator, verification_note)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (entry_id, source_id) DO NOTHING`,
          [
            entryId,
            srcRes.rows[0].id,
            entry.linguisticRoot?.etymologyReference || 'Standard lexical attestation',
            `Verified via ${code}`,
          ]
        );
      }
    }

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, actor, summary, new_data)
       VALUES ('vocabulary_entry', $1, 'CREATE_VERIFIED_ENTRY', $2, $3, $4)`,
      [
        entryId,
        actor,
        `Added Sinhala headword '${entry.sinhalaWord}' (${entry.romanizedPronunciation}) [${entry.verificationStatus}]`,
        JSON.stringify({
          sinhalaWord: entry.sinhalaWord,
          tamil: entry.primaryTamilTranslation,
          english: entry.primaryEnglishTranslation,
          confidenceScore: entry.confidenceScore,
        }),
      ]
    );

    await client.query('COMMIT');
    return { entryId, inserted: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
