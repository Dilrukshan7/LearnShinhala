import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Database,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  GitBranch,
  Terminal,
} from 'lucide-react';

interface TechnologyViewProps {
  onNavigateTab: (tab: 'home' | 'explorer' | 'learning' | 'contribute' | 'admin') => void;
}

const PIPELINE_STAGES = [
  {
    stage: '01',
    name: 'Word Discovery',
    desc: 'Harvests candidate Sinhala headwords from permitted open-access corpora, public-domain dictionaries, and academic domain seeds.',
  },
  {
    stage: '02',
    name: 'Unicode & Spelling Verification',
    desc: 'Normalizes Unicode (NFC), validates Sinhala codepoints (U+0D80–U+0DFF), inspects ZWJ conjuncts (්‍ර, ්‍ය), and checks dental vs. retroflex orthography (න/ණ, ල/ළ).',
  },
  {
    stage: '03',
    name: 'Linguistic Classification',
    desc: 'Identifies grammatical part of speech, animate/inanimate gender, root stem, and registers (spoken vs. literary).',
  },
  {
    stage: '04',
    name: 'Tamil Translation & Phonetics',
    desc: 'Generates context-sensitive Tamil translations and Tamil script phonetic guides for cross-linguistic pronunciation.',
  },
  {
    stage: '05',
    name: 'English Translation & Romanization',
    desc: 'Extracts fluent English meanings, ISO-15919 standardized Romanization, and intuitive Singlish pronunciation.',
  },
  {
    stage: '06',
    name: 'Trilingual Contextual Examples',
    desc: 'Constructs verified natural sentences in Sinhala, Tamil, and English and maps the word into the 9-dimensional category taxonomy.',
  },
  {
    stage: '07',
    name: 'Duplicate & Variant Detection',
    desc: 'Executes trigram similarity and normalized string matching against the database to prevent duplicate headwords.',
  },
  {
    stage: '08',
    name: 'Source & Citation Verification',
    desc: 'Links the candidate entry to documented archival dictionaries, academic glossaries, or corpus citations.',
  },
  {
    stage: '09',
    name: 'Confidence Scoring',
    desc: 'Calculates a deterministic composite score (0.00–1.00) based on source tier, orthographic validity, and translation consistency.',
  },
  {
    stage: '10',
    name: 'Human Review & Audit',
    desc: 'High-confidence entries are committed to the public encyclopedia; uncertain or disputed items are routed to the human lexicographer review queue.',
  },
];

export const TechnologyView: React.FC<TechnologyViewProps> = ({ onNavigateTab }) => {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
          <Cpu className="w-3.5 h-3.5 text-amber-700" />
          Technical Architecture & AI
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-ink-950 tracking-tight">
          AI Integration & Technology
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          LearnSinhala combines modern web technologies with an autonomous 10-stage AI research
          and verification pipeline to expand and protect Sinhala linguistic heritage without
          fabrication.
        </p>
      </div>

      {/* High-Level Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-leaf-50 text-leaf-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-ink-950">Strict Epistemic Integrity</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            AI-generated candidate words are never presented as established facts. Unverified
            suggestions are strictly segregated until verified against primary sources or reviewed by human linguists.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-ceylon-50 text-ceylon-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-ink-950">Scalable Relational Architecture</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Engineered with PostgreSQL 15+, UTF-8 NFC collation, GIN full-text indexes, and pg_trgm trigram
            similarity to scale seamlessly to hundreds of thousands of multi-sense entries without artificial limits.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-ink-950">Autonomous Research Agent</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Continuously harvests academic domains, extracts grammatical inflections, generates trilingual
            examples, and performs duplicate detection in scheduled background batches.
          </p>
        </div>
      </div>

      {/* 10-Stage Pipeline Interactive Breakdown */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-ceylon-700" />
              10-Stage AI Discovery & Verification Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Every lexical entry discovered by the autonomous agent must successfully pass through 10 sequential checks:
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('admin')}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-ceylon-700 hover:bg-ceylon-800 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            Launch Batch in Admin <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pipeline stage cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PIPELINE_STAGES.map((s, idx) => {
            const isSelected = activeStage === idx;
            return (
              <div
                key={s.stage}
                onClick={() => setActiveStage(idx)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-ceylon-50/80 border-ceylon-600 shadow-sm'
                    : 'bg-stone-50/60 border-stone-200 hover:bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-stone-500">
                    STAGE {s.stage}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-ceylon-700" />}
                </div>
                <div className="font-bold text-xs text-ink-950">{s.name}</div>
              </div>
            );
          })}
        </div>

        {/* Selected Stage Detail Box */}
        <div className="p-5 rounded-xl bg-[#FAF8F5] border border-stone-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-ceylon-800 uppercase">
              Selected Stage {PIPELINE_STAGES[activeStage].stage} Details
            </span>
            <h3 className="text-base font-bold text-ink-950">
              {PIPELINE_STAGES[activeStage].name}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">
              {PIPELINE_STAGES[activeStage].desc}
            </p>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-stone-200 text-stone-700">
              Logged in PostgreSQL <Terminal className="w-3 h-3 text-stone-500" />
            </span>
          </div>
        </div>
      </section>

      {/* Verification Tiers & Epistemic Badges */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink-950">
            Epistemic Classification Tiers
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            To prevent misinformation, every headword displayed in the encyclopedia visibly displays its verification level:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-leaf-300 bg-leaf-50/50 space-y-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-leaf-100 text-leaf-800">
              <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
            </span>
            <p className="text-xs text-stone-600 leading-relaxed">
              Attested in official trilingual government glossaries or classical dictionaries and validated by linguistic review.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 space-y-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
              SOURCE_SUPPORTED
            </span>
            <p className="text-xs text-stone-600 leading-relaxed">
              Extracted from verified public-domain corpora with citation page and author attestation.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-sky-300 bg-sky-50/50 space-y-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-900">
              AI_SUGGESTION
            </span>
            <p className="text-xs text-stone-600 leading-relaxed">
              Candidate discovered during batch research. Clearly marked as pending human verification.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-stone-300 bg-stone-50 space-y-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-200 text-stone-800">
              DISPUTED / REGIONAL
            </span>
            <p className="text-xs text-stone-600 leading-relaxed">
              Colloquial slang or regional dialect variant undergoing clarification by native speakers.
            </p>
          </div>
        </div>
      </section>

      {/* Admin and Console Link */}
      <div className="bg-[#FAF6F0] rounded-2xl border border-stone-200 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <h3 className="text-lg sm:text-xl font-bold text-ink-950">
            Lexicographer Dashboard & Queue Monitor
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Interested in seeing the research agent run live? The Admin Console provides real-time job
            execution, batch progress bars, candidate review approvals, and category generation.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('admin')}
          className="px-6 py-2.5 rounded-xl bg-ink-900 hover:bg-black text-white font-bold text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-2 shrink-0"
        >
          Open Admin & Review Queue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
