-- ============================================================================
-- COMPLETE SINHALA VOCABULARY ENCYCLOPEDIA - RELATIONAL DATABASE SCHEMA
-- PostgreSQL 15+ | UTF-8 Sinhala & Tamil Unicode | pg_trgm & Full-Text Search
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 1. USERS & ROLE-BASED AUTHENTICATION
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'LEARNER' CHECK (role IN ('ADMIN', 'LINGUIST_REVIEWER', 'CONTRIBUTOR', 'LEARNER')),
  password_hash TEXT,
  native_language VARCHAR(30) DEFAULT 'si',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. VOCABULARY ENTRIES (Core Headword Entity)
CREATE TABLE IF NOT EXISTS vocabulary_entries (
  id SERIAL PRIMARY KEY,
  sinhala_word TEXT NOT NULL,
  normalized_sinhala TEXT NOT NULL,
  sinhala_initial_letter VARCHAR(16) NOT NULL,
  sinhala_sort_key TEXT NOT NULL,
  romanized_pronunciation TEXT NOT NULL,
  tamil_pronunciation_guide TEXT,
  primary_tamil_translation TEXT NOT NULL,
  primary_english_translation TEXT NOT NULL,
  part_of_speech VARCHAR(80) NOT NULL,
  grammatical_classification TEXT,
  difficulty_level VARCHAR(60) NOT NULL DEFAULT 'Beginner',
  usage_context TEXT,
  register VARCHAR(60) NOT NULL DEFAULT 'Both' CHECK (register IN ('Formal', 'Informal', 'Colloquial', 'Literary', 'Academic', 'Both')),
  spoken_vs_literary TEXT NOT NULL DEFAULT 'Spoken & Literary',
  regional_variations TEXT,
  etymology_notes TEXT,
  verification_status VARCHAR(60) NOT NULL DEFAULT 'VERIFIED'
    CHECK (verification_status IN ('VERIFIED', 'SOURCE_SUPPORTED', 'AI_SUGGESTION', 'UNVERIFIED', 'DISPUTED_OR_REGIONAL')),
  confidence_score NUMERIC(4,3) NOT NULL DEFAULT 0.950 CHECK (confidence_score >= 0.000 AND confidence_score <= 1.000),
  is_demo_dataset BOOLEAN NOT NULL DEFAULT FALSE,
  is_daily_featured BOOLEAN NOT NULL DEFAULT FALSE,
  view_count INTEGER NOT NULL DEFAULT 0,
  search_vector tsvector,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (normalized_sinhala, part_of_speech)
);

-- 3. DEFINITIONS / MULTIPLE SENSES PER WORD
CREATE TABLE IF NOT EXISTS vocabulary_senses (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES vocabulary_entries(id) ON DELETE CASCADE,
  sense_number INTEGER NOT NULL DEFAULT 1,
  sinhala_definition TEXT,
  tamil_meaning TEXT NOT NULL,
  english_meaning TEXT NOT NULL,
  contextual_usage TEXT,
  formal_usage_note TEXT,
  informal_usage_note TEXT,
  domain_tag VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TRANSLATIONS (Context-dependent Tamil & English Translations)
CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES vocabulary_entries(id) ON DELETE CASCADE,
  sense_id INTEGER REFERENCES vocabulary_senses(id) ON DELETE SET NULL,
  language_code VARCHAR(10) NOT NULL CHECK (language_code IN ('ta', 'en')),
  translated_word TEXT NOT NULL,
  pronunciation_guide TEXT,
  context_note TEXT,
  formality VARCHAR(50) DEFAULT 'Neutral',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  confidence_score NUMERIC(4,3) NOT NULL DEFAULT 0.950,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRONUNCIATION (Romanized, IPA, Tamil Script Phonetic, Syllables)
CREATE TABLE IF NOT EXISTS pronunciation (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL UNIQUE REFERENCES vocabulary_entries(id) ON DELETE CASCADE,
  romanized_standard TEXT NOT NULL,
  romanized_phonetic TEXT,
  ipa_transcription TEXT,
  tamil_script_phonetic TEXT,
  syllable_breakdown TEXT,
  stress_pattern VARCHAR(100),
  audio_reference TEXT,
  regional_accent_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CATEGORIES (Hierarchical Multi-Dimensional Taxonomy A through I)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(140) UNIQUE NOT NULL,
  dimension_code VARCHAR(10) NOT NULL,
  dimension_name VARCHAR(120) NOT NULL,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name_si TEXT NOT NULL,
  name_ta TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_en TEXT,
  icon_name VARCHAR(60),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_expandable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. WORD_CATEGORY_RELATIONS & WORD_CATEGORIES VIEW
CREATE TABLE IF NOT EXISTS word_category_relations (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES vocabulary_entries(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_by VARCHAR(60) NOT NULL DEFAULT 'SYSTEM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (entry_id, category_id)
);

CREATE OR REPLACE VIEW word_categories AS
SELECT
  wcr.id,
  wcr.entry_id,
  wcr.category_id,
  c.slug AS category_slug,
  c.dimension_code,
  c.dimension_name,
  c.name_si,
  c.name_ta,
  c.name_en,
  wcr.is_primary,
  wcr.assigned_by
FROM word_category_relations wcr
JOIN categories c ON c.id = wcr.category_id;

-- 8. EXAMPLE SENTENCES (Sinhala + Tamil + English + Formal/Informal Context)
CREATE TABLE IF NOT EXISTS example_sentences (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES vocabulary_entries(id) ON DELETE CASCADE,
  sense_id INTEGER REFERENCES vocabulary_senses(id) ON DELETE SET NULL,
  sinhala_sentence TEXT NOT NULL,
  sinhala_romanized TEXT,
  tamil_translation TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  usage_register VARCHAR(50) NOT NULL DEFAULT 'Neutral' CHECK (usage_register IN ('Formal', 'Informal', 'Literary', 'Colloquial', 'Academic', 'Neutral')),
  context_note TEXT,
  source_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. SYNONYMS
CREATE TABLE IF NOT EXISTS synonyms (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES vocabulary_entries(id) ON DELETE CASCADE,
  synonym_entry_id INTEGER REFERENCES vocabulary_entries(id) ON DELETE SET NULL,
  synonym_sinhala TEXT NOT NULL,
  synonym_romanized TEXT,
  tamil_meaning TEXT,
  english_meaning TEXT,
  nuance_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ANTONYMS
CREATE TABLE IF NOT EXISTS antonyms (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES vocabulary_entries(id) ON DELETE CASCADE,
  antonym_entry_id INTEGER REFERENCES vocabulary_entries(id) ON DELETE SET NULL,
  antonym_sinhala TEXT NOT NULL,
  antonym_romanized TEXT,
  tamil_meaning TEXT,
  english_meaning TEXT,
  contrast_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. RELATED WORDS (Compounds, Derivatives, Collocations)
CREATE TABLE IF NOT EXISTS related_words (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES vocabulary_entries(id) ON DELETE CASCADE,
  related_sinhala TEXT NOT NULL,
  related_romanized TEXT,
  relation_type VARCHAR(80) NOT NULL DEFAULT 'Derived',
  tamil_meaning TEXT,
  english_meaning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. WORD FORMS (Inflections, Plural, Case Forms, Verb Conjugations, Tenses)
CREATE TABLE IF NOT EXISTS word_forms (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES vocabulary_entries(id) ON DELETE CASCADE,
  form_type VARCHAR(100) NOT NULL,
  sinhala_form TEXT NOT NULL,
  romanized_form TEXT,
  tamil_equivalent TEXT,
  english_gloss TEXT,
  grammatical_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. LINGUISTIC ROOTS (Etymology, Origin Language, Sanskrit/Pali/Elu/Tamil/Loanword Lineage)
CREATE TABLE IF NOT EXISTS linguistic_roots (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL UNIQUE REFERENCES vocabulary_entries(id) ON DELETE CASCADE,
  origin_language VARCHAR(100) NOT NULL,
  root_word TEXT NOT NULL,
  derivation_type VARCHAR(80) NOT NULL DEFAULT 'Tadbhava (Evolved)',
  historical_evolution TEXT,
  cognates TEXT,
  etymology_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. VOCABULARY SOURCES & ENTRY CITATIONS
CREATE TABLE IF NOT EXISTS vocabulary_sources (
  id SERIAL PRIMARY KEY,
  source_code VARCHAR(80) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author_or_institution TEXT NOT NULL,
  publication_year INTEGER,
  source_type VARCHAR(80) NOT NULL,
  license_status VARCHAR(120) NOT NULL,
  reference_url TEXT,
  reliability_weight NUMERIC(3,2) NOT NULL DEFAULT 0.95,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entry_sources (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES vocabulary_entries(id) ON DELETE CASCADE,
  source_id INTEGER NOT NULL REFERENCES vocabulary_sources(id) ON DELETE CASCADE,
  citation_locator TEXT,
  verification_note TEXT,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (entry_id, source_id)
);

-- 15. RESEARCH JOBS (Autonomous Vocabulary Collection AI Agent Batch Jobs)
CREATE TABLE IF NOT EXISTS research_jobs (
  id SERIAL PRIMARY KEY,
  job_name TEXT NOT NULL,
  job_type VARCHAR(80) NOT NULL DEFAULT 'DOMAIN_DISCOVERY',
  target_domain VARCHAR(120) NOT NULL,
  target_category_slug VARCHAR(140),
  source_corpus VARCHAR(120),
  status VARCHAR(40) NOT NULL DEFAULT 'QUEUED'
    CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING')),
  batch_size INTEGER NOT NULL DEFAULT 5,
  processed_count INTEGER NOT NULL DEFAULT 0,
  verified_added_count INTEGER NOT NULL DEFAULT 0,
  review_queued_count INTEGER NOT NULL DEFAULT 0,
  duplicate_skipped_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  retry_count INTEGER NOT NULL DEFAULT 0,
  llm_provider VARCHAR(80) NOT NULL DEFAULT 'corpus_verified',
  progress_percent INTEGER NOT NULL DEFAULT 0,
  error_log TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. AGENT LOGS (10-Stage Verification Pipeline Telemetry)
CREATE TABLE IF NOT EXISTS agent_logs (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES research_jobs(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL CHECK (stage_number BETWEEN 1 AND 10),
  stage_name VARCHAR(100) NOT NULL,
  candidate_sinhala TEXT,
  log_level VARCHAR(30) NOT NULL DEFAULT 'INFO',
  confidence_score NUMERIC(4,3),
  message TEXT NOT NULL,
  details_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. REVIEW QUEUE (Human-in-the-Loop Linguist Review Workflow)
CREATE TABLE IF NOT EXISTS review_queue (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER REFERENCES vocabulary_entries(id) ON DELETE SET NULL,
  job_id INTEGER REFERENCES research_jobs(id) ON DELETE SET NULL,
  candidate_sinhala TEXT NOT NULL,
  candidate_romanized TEXT NOT NULL,
  candidate_tamil TEXT NOT NULL,
  candidate_english TEXT NOT NULL,
  part_of_speech VARCHAR(80) NOT NULL,
  candidate_payload JSONB NOT NULL,
  confidence_score NUMERIC(4,3) NOT NULL DEFAULT 0.720,
  review_reason TEXT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EDITED_AND_APPROVED')),
  reviewer_name VARCHAR(120),
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- 18. USER CONTRIBUTIONS (Community & Expert Submissions)
CREATE TABLE IF NOT EXISTS user_contributions (
  id SERIAL PRIMARY KEY,
  contribution_type VARCHAR(80) NOT NULL
    CHECK (contribution_type IN ('NEW_WORD', 'TRANSLATION_CORRECTION', 'REGIONAL_VOCABULARY', 'EXAMPLE_SENTENCE', 'INCORRECT_DEFINITION_REPORT', 'SOURCE_REFERENCE')),
  target_entry_id INTEGER REFERENCES vocabulary_entries(id) ON DELETE SET NULL,
  sinhala_word TEXT NOT NULL,
  romanized_pronunciation TEXT,
  proposed_tamil TEXT,
  proposed_english TEXT,
  part_of_speech VARCHAR(80),
  example_sinhala TEXT,
  example_tamil TEXT,
  example_english TEXT,
  regional_dialect_note TEXT,
  source_reference TEXT,
  contributor_name VARCHAR(120) NOT NULL,
  contributor_role VARCHAR(80) NOT NULL DEFAULT 'Community Member',
  notes TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  moderator_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  moderated_at TIMESTAMPTZ
);

-- 19. AUDIT HISTORY LOGS (Immutable Correction & Verification Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(60) NOT NULL,
  entity_id INTEGER,
  action VARCHAR(80) NOT NULL,
  actor VARCHAR(120) NOT NULL,
  summary TEXT NOT NULL,
  previous_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. LEARNING PROGRESS & PERSONAL VOCABULARY LISTS
CREATE TABLE IF NOT EXISTS user_learning_progress (
  id SERIAL PRIMARY KEY,
  learner_key VARCHAR(120) NOT NULL,
  entry_id INTEGER NOT NULL REFERENCES vocabulary_entries(id) ON DELETE CASCADE,
  in_personal_list BOOLEAN NOT NULL DEFAULT FALSE,
  mastery_score INTEGER NOT NULL DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
  times_practiced INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (learner_key, entry_id)
);

-- ============================================================================
-- FULL-TEXT SEARCH & TRIGRAM INDEXES FOR SCALABILITY TO 100,000+ ENTRIES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_vocab_normalized_si ON vocabulary_entries (normalized_sinhala);
CREATE INDEX IF NOT EXISTS idx_vocab_initial_letter ON vocabulary_entries (sinhala_initial_letter);
CREATE INDEX IF NOT EXISTS idx_vocab_sort_key ON vocabulary_entries (sinhala_sort_key);
CREATE INDEX IF NOT EXISTS idx_vocab_pos ON vocabulary_entries (part_of_speech);
CREATE INDEX IF NOT EXISTS idx_vocab_difficulty ON vocabulary_entries (difficulty_level);
CREATE INDEX IF NOT EXISTS idx_vocab_status ON vocabulary_entries (verification_status);

-- Trigram indexes for fast partial and fuzzy matching across Sinhala, Tamil, English, and Romanized
CREATE INDEX IF NOT EXISTS idx_vocab_si_trgm ON vocabulary_entries USING gin (sinhala_word gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vocab_roman_trgm ON vocabulary_entries USING gin (romanized_pronunciation gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vocab_ta_trgm ON vocabulary_entries USING gin (primary_tamil_translation gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vocab_en_trgm ON vocabulary_entries USING gin (primary_english_translation gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vocab_fts ON vocabulary_entries USING gin (search_vector);

CREATE INDEX IF NOT EXISTS idx_categories_dimension ON categories (dimension_code, sort_order);
CREATE INDEX IF NOT EXISTS idx_word_cat_entry ON word_category_relations (entry_id);
CREATE INDEX IF NOT EXISTS idx_word_cat_category ON word_category_relations (category_id);

-- Trigger to automatically maintain search_vector and updated_at on vocabulary_entries
CREATE OR REPLACE FUNCTION update_vocabulary_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := NOW();
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.sinhala_word, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.romanized_pronunciation, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.primary_tamil_translation, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.primary_english_translation, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.usage_context, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.etymology_notes, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vocabulary_search_vector ON vocabulary_entries;
CREATE TRIGGER trg_vocabulary_search_vector
BEFORE INSERT OR UPDATE ON vocabulary_entries
FOR EACH ROW EXECUTE FUNCTION update_vocabulary_search_vector();
