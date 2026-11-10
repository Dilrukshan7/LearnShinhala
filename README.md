# Complete Sinhala Vocabulary Encyclopedia (මහා සිංහල ශබ්දකෝෂ විශ්වකෝෂය • முழுமையான சிங்கள சொற்களஞ்சிய கலைக்களஞ்சியம்)

A comprehensive, AI-powered, trilingual (**Sinhala • Tamil • English**) vocabulary encyclopedia, linguistic preservation platform, and autonomous lexicographical research system.

---

## 1. Project Vision & Core Principles

- **Unbounded Linguistic Preservation**: Designed to collect, organize, translate, verify, and preserve as much of the Sinhala language as technically and practically possible — with zero artificial maximum vocabulary caps.
- **Full Trilingual Support (සිංහල • தமிழ் • English)**: Every entry includes original Sinhala script (`NFC` normalized Unicode), Romanized & IPA pronunciation, Tamil script pronunciation guide, context-sensitive Tamil & English meanings, multiple senses, trilingual example sentences, inflected word forms, synonyms, antonyms, related words, regional dialect notes, and etymological roots.
- **Strict Epistemic Integrity**: Distinguishes between `VERIFIED`, `SOURCE_SUPPORTED`, `AI_SUGGESTION`, `UNVERIFIED`, and `DISPUTED_OR_REGIONAL` vocabulary. Uncertain or single-source AI discoveries are routed to the **Human Review Queue** before becoming verified entries.
- **Authentic Sinhala Orthographic Ordering**: Supports alphabetical browsing by true Sinhala *Hodiya* order (`අ ආ ඇ ඈ ඉ ඊ උ ඌ ඍ එ ඒ ඓ ඔ ඕ ඖ` Swara followed by `ක` through `ෆ` Vyanjana) in addition to Romanized `A–Z`.

---

## 2. Technology Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 15+ (`UTF-8` encoding, `pg_trgm` trigram similarity indexes, and GIN `tsvector` full-text search)
- **Background Jobs**: BullMQ + Redis (with automatic fallback to a durable PostgreSQL transactional queue when Redis is not running locally)
- **AI Integration**: Provider-independent LLM adapter (`server/agent/llm-provider.ts`) supporting Google Gemini, OpenAI, Anthropic, and a deterministic permitted-corpus philological analyzer. All API keys are kept strictly on the backend.

---

## 3. Nine-Dimensional Category Hierarchy

All 170+ categories across 9 dimensions (`server/db/categories-data.ts`) are dynamically expandable and support many-to-many tagging:
- **A. By Part of Speech**: Nouns, Proper nouns, Pronouns, Verbs, Adjectives, Adverbs, Prepositions and postpositions, Conjunctions, Interjections, Particles, Auxiliary verbs, Numerals, Classifiers, Other grammatical categories.
- **B. By Everyday Purpose**: Greetings, Introductions, Asking questions, Answering questions, Requesting something, Giving instructions, Agreeing, Disagreeing, Apologizing, Thanking, Expressing emotions, Expressing opinions, Giving directions, Describing people, Describing objects, Describing situations, Making conversations.
- **C. By Location and Environment**: Home, Kitchen, Bedroom, Bathroom, University, School, Classroom, Library, Office, Workplace, Hospital, Pharmacy, Restaurant, Hotel, Shopping mall, Market, Bus station, Railway station, Airport, Bank, Police station, Government office, Temple, Village, City, Countryside, Agricultural environments, Industrial environments, Natural environments.
- **D. By Subject and Knowledge Domain**: Mathematics, Physics, Chemistry, Biology, Computer science, Information technology, Artificial intelligence, Engineering, Medicine, Anatomy, Psychology, Sociology, Economics, Business, Accounting, Law, Politics, Geography, Astronomy, Agriculture, Architecture, Automobile, Telecommunications, Education, History, Literature, Art, Music, Sports, Religion and philosophy, Environmental science.
- **E. By Human Life and Activities**: Family relationships, Body parts, Food and beverages, Clothing, Personal hygiene, Health, Education, Employment, Transportation, Travel, Money and finance, Shopping, Entertainment, Relationships, Marriage, Social interactions, Daily routines, Household activities, Exercise and fitness, Technology usage.
- **F. By Grammar and Linguistic Structure**: Singular and plural, Verb conjugations, Tenses, Gender and grammatical classifications, Case forms, Inflections, Compound words, Derived words, Root words, Prefixes and suffixes, Idioms, Proverbs, Phrasal expressions, Colloquial expressions, Formal expressions, Literary vocabulary.
- **G. By Vocabulary Difficulty**: Beginner, Elementary, Intermediate, Upper intermediate, Advanced, Native-level, Academic, Specialized terminology.
- **H. By Communication Situation**: Casual conversations, Formal conversations, Academic discussions, Professional communication, Business meetings, University conversations, Public speaking, Telephone conversations, Emergency situations, Customer service, Interviews, Social media.
- **I. Specialized Collections**: Traditional Sinhala words, Ancient Sinhala vocabulary, Modern Sinhala vocabulary, Rare words, Regional dialects, Slang, Loanwords, Sanskrit-derived, Pali-derived, Tamil-derived, Portuguese-derived, Dutch-derived, English-derived, Technical terminology, Scientific terminology, Literary words, Onomatopoeia, Animal names, Plant names, Insect names, Bird names, Fish names, Medicinal plants.

---

## 4. 10-Stage Autonomous AI Research & Verification Pipeline

Implemented in `server/agent/verification-pipeline.ts`:
1. **Stage 1 — Word Discovery**: Harvests candidate words from permitted corpora, public-domain dictionaries, or target domains.
2. **Stage 2 — Sinhala Spelling Verification**: Validates `NFC` Unicode, `U+0D80..U+0DFF` range, ZWJ sequences, and retroflex `ණ/ළ` orthography.
3. **Stage 3 — Linguistic Classification**: Verifies part of speech, animate/inanimate class, register, and inflected forms.
4. **Stage 4 — Tamil Translation**: Verifies Tamil Unicode (`U+0B80..U+0BFF`) meanings and phonetic guide.
5. **Stage 5 — English Translation**: Verifies English glosses, IPA, and ISO-15919 Romanization.
6. **Stage 6 — Contextual Meaning Verification**: Validates trilingual example sentences and category assignments.
7. **Stage 7 — Duplicate Detection**: Checks normalized Sinhala headwords and `pg_trgm` similarity.
8. **Stage 8 — Source Verification**: Matches entries against `vocabulary_sources` (`CARTER_1924`, `CLOUGH_1892`, `DOL_TRILINGUAL`, `EPD_TECHNICAL`, `HELA_ATUVAVA`).
9. **Stage 9 — Confidence Scoring**: Computes weighted composite confidence score (`0.000`–`1.000`).
10. **Stage 10 — Human Review Routing / Verified Persistence**: Commits high-confidence source-backed entries to `vocabulary_entries` and routes uncertain entries to `review_queue`.

---

## 5. Installation & Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (UTF-8 database `learn_sinhala`)
- Optional: Redis 7+ (for BullMQ distributed worker mode)

### Setup Steps
```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env

# 3. Run PostgreSQL schema migrations and seed the trilingual dataset
npm run db:setup

# 4. Start full-stack development server (API on :3001, Vite Web UI on :5173)
npm run dev
```

### Running a CLI Research Batch
```bash
npm run agent:run-batch
```

### Running Tests
```bash
npm test
```

---

## 6. Environment Variables (`.env.example`)

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Backend API & production web port | `3001` |
| `DATABASE_URL` | PostgreSQL UTF-8 connection string | `postgresql://postgres@localhost:5432/learn_sinhala` |
| `REDIS_URL` | Optional Redis URL for BullMQ worker queue | *(empty — uses PG durable queue)* |
| `LLM_PROVIDER` | `auto` \| `gemini` \| `openai` \| `anthropic` \| `corpus_verified` | `auto` |
| `GEMINI_API_KEY` | Optional Google Gemini API key (backend only) | *(empty)* |
| `OPENAI_API_KEY` | Optional OpenAI API key (backend only) | *(empty)* |
| `ANTHROPIC_API_KEY` | Optional Anthropic API key (backend only) | *(empty)* |
| `ADMIN_ACCESS_CODE` | Role-based admin access code | `SINHALA-ADMIN-2026` |
| `AGENT_BATCH_SIZE` | Default number of candidate words per batch job | `8` |
| `AGENT_MIN_AUTO_VERIFY_CONFIDENCE` | Minimum confidence score (`0`–`1`) before human review gate | `0.88` |

---

## 7. API Overview

- `GET /api/health` — Database, LLM provider, and queue health check.
- `GET /api/stats` — Encyclopedia statistics, daily featured word, recent & popular words.
- `GET /api/vocabulary` — Advanced trilingual search (`q`, `lang`, `pos`, `category`, `dimension`, `difficulty`, `register`, `status`, `letterSi`, `letterRoman`, `sort`, `page`, `limit`).
- `GET /api/vocabulary/autocomplete` — Instant trilingual autocomplete & trigram fuzzy spelling suggestions.
- `GET /api/vocabulary/alphabet` — Authentic Sinhala *Hodiya* (`අ`–`ෆ`) and Romanized (`A`–`Z`) word counts.
- `GET /api/vocabulary/:idOrWord` — Full dedicated word encyclopedia dossier.
- `GET /api/categories` / `POST /api/categories` — 9-dimension hierarchical category tree & dynamic expansion.
- `GET /api/learning/exercises` / `POST /api/learning/progress` — Flashcards, Sinhala-to-Tamil & Sinhala-to-English quizzes, fill-in-the-blanks, and personal learning list.
- `GET /api/contributions` / `POST /api/contributions` — Community & linguist contribution portal.
- `GET /api/admin/dashboard` — Admin telemetry, duplicate detection report, review queue, and audit logs.
- `POST /api/admin/research-jobs` — Launch a 10-stage autonomous vocabulary discovery batch job.
- `POST /api/admin/review-queue/:id/decision` — Approve or reject items in the human review queue.
- `POST /api/admin/contributions/:id/moderate` — Approve or reject user contributions.

---

## 8. Docker Deployment & Backup / Recovery

### Docker Compose Deployment
```bash
docker compose up -d --build
```

### Backup & Restore Procedures
```bash
# Create a timestamped UTF-8 SQL dump in ./backups/
npm run backup

# Restore from the latest backup or a specific dump file
npm run restore
```
