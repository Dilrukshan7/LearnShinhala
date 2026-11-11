import React from 'react';
import { Volume2, ShieldCheck, BookOpen, Sparkles, ArrowUpRight } from 'lucide-react';
import { VocabularySummary, UILanguage } from '../types';
import { speakText } from '../utils/speech';

interface WordCardProps {
  word: VocabularySummary;
  uiLang: UILanguage;
  onSelectWord: (idOrWord: number | string) => void;
  onSelectCategory?: (slug: string) => void;
}

export const VerificationBadge: React.FC<{
  status: VocabularySummary['verification_status'];
  confidence?: number | string;
}> = ({ status, confidence }) => {
  const confPct = confidence ? `${Math.round(Number(confidence) * 100)}%` : '';

  if (status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-forest-50 text-forest-700 border border-forest-200">
        <ShieldCheck className="w-3.5 h-3.5 text-forest-600 shrink-0" />
        <span>Verified</span>
        {confPct && <span className="text-forest-600 font-mono text-[10px]">({confPct})</span>}
      </span>
    );
  }
  if (status === 'SOURCE_SUPPORTED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Source-Attested</span>
        {confPct && <span className="text-amber-700 font-mono text-[10px]">({confPct})</span>}
      </span>
    );
  }
  if (status === 'AI_SUGGESTION') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-ink-700 border border-stone-200">
        <Sparkles className="w-3.5 h-3.5 text-ceylon-600 shrink-0" />
        <span>AI Candidate (Review Pending)</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-parchment-100 text-ink-700 border border-parchment-300">
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export const WordCard: React.FC<WordCardProps> = ({
  word,
  uiLang,
  onSelectWord,
  onSelectCategory,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectWord(word.id);
    }
  };

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`View entry for Sinhala word ${word.sinhala_word}`}
      onClick={() => onSelectWord(word.id)}
      onKeyDown={handleKeyDown}
      className="group bg-white rounded-xl border border-parchment-300 hover:border-ceylon-400 p-5 flex flex-col justify-between cursor-pointer transition-all duration-150 shadow-subtle hover:shadow-card-hover focus-ring text-left"
    >
      <div>
        {/* Header: Sinhala Word + Audio + Part of Speech */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold font-sinhala-serif text-ink-950 group-hover:text-ceylon-700 transition-colors tracking-tight">
                {word.sinhala_word}
              </h3>
              <button
                type="button"
                aria-label={`Listen to pronunciation of ${word.sinhala_word}`}
                title="Listen to Sinhala pronunciation"
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(word.sinhala_word, 'si-LK', word.romanized_pronunciation);
                }}
                className="p-1.5 rounded-md text-ink-400 hover:text-ceylon-700 hover:bg-ceylon-50 transition-colors focus-ring"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Phonetic & Tamil Pronunciation Guides */}
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-ink-500 font-mono">
              <span className="text-ceylon-800 font-medium">/{word.romanized_pronunciation}/</span>
              {word.tamil_pronunciation_guide && (
                <span className="font-tamil text-ink-500 font-normal">
                  [{word.tamil_pronunciation_guide}]
                </span>
              )}
            </div>
          </div>

          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-parchment-100 text-ink-700 border border-parchment-300 shrink-0">
            {word.part_of_speech}
          </span>
        </div>

        {/* Trilingual Definitions */}
        <div className="space-y-1.5 mt-3.5 pt-3 border-t border-parchment-200">
          {(uiLang === 'all' || uiLang === 'ta' || uiLang === 'si') && (
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-parchment-200 text-ink-700 shrink-0 font-tamil">
                தமிழ்
              </span>
              <p className="text-sm font-medium font-tamil text-ink-900 leading-snug">
                {word.primary_tamil_translation}
              </p>
            </div>
          )}

          {(uiLang === 'all' || uiLang === 'en' || uiLang === 'si') && (
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-parchment-200 text-ink-700 shrink-0 font-mono">
                EN
              </span>
              <p className="text-sm font-semibold text-ink-900 leading-snug">
                {word.primary_english_translation}
              </p>
            </div>
          )}
        </div>

        {/* Usage Context Snippet */}
        {word.usage_context && (
          <p className="mt-2 text-xs text-ink-600 line-clamp-2 leading-relaxed font-normal">
            {word.usage_context}
          </p>
        )}
      </div>

      <div>
        {/* Category Chips */}
        {word.categories && word.categories.length > 0 && (
          <div className="mt-3.5 pt-2.5 border-t border-parchment-100 flex flex-wrap gap-1">
            {word.categories.slice(0, 3).map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.stopPropagation();
                    onSelectCategory(cat.slug);
                  }
                }}
                className="text-[10px] px-2 py-0.5 rounded bg-parchment-100 hover:bg-ceylon-50 hover:text-ceylon-800 text-ink-600 font-medium transition-colors border border-parchment-200"
              >
                {cat.name_en} • {cat.name_si}
              </button>
            ))}
          </div>
        )}

        {/* Footer Meta: Verification, Difficulty & Entry CTA */}
        <div className="mt-3 pt-2.5 border-t border-parchment-200 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <VerificationBadge
              status={word.verification_status}
              confidence={word.confidence_score}
            />
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-parchment-100 text-ink-600 font-medium border border-parchment-200">
              {word.difficulty_level}
            </span>
          </div>

          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-ceylon-700 group-hover:text-ceylon-800 transition-colors">
            <span>Dossier</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </article>
  );
};
