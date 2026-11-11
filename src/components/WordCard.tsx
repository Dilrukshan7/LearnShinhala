import React from 'react';
import { Volume2, ShieldCheck, BookOpen, Sparkles, ArrowUpRight } from 'lucide-react';
import { VocabularySummary, UILanguage } from '../types';
import { speakText } from '../utils/speech';
import { Badge } from './ui/Badge';

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
      <Badge variant="success" size="sm">
        <ShieldCheck className="w-3 h-3 text-leaf-700" />
        <span>Verified</span>
        {confPct && <span className="opacity-75">({confPct})</span>}
      </Badge>
    );
  }
  if (status === 'SOURCE_SUPPORTED') {
    return (
      <Badge variant="warning" size="sm">
        <BookOpen className="w-3 h-3 text-amber-700" />
        <span>Source-Supported</span>
        {confPct && <span className="opacity-75">({confPct})</span>}
      </Badge>
    );
  }
  if (status === 'AI_SUGGESTION') {
    return (
      <Badge variant="info" size="sm">
        <Sparkles className="w-3 h-3 text-sky-700" />
        <span>AI Candidate (Review Pending)</span>
      </Badge>
    );
  }
  return (
    <Badge variant="neutral" size="sm">
      <span>{status.replace(/_/g, ' ')}</span>
    </Badge>
  );
};

export const WordCard: React.FC<WordCardProps> = ({
  word,
  uiLang,
  onSelectWord,
  onSelectCategory,
}) => {
  return (
    <article
      onClick={() => onSelectWord(word.id)}
      className="group bg-white rounded-xl border border-stone-200 hover:border-stone-400 shadow-xs hover:shadow-sm transition-all duration-150 p-4 sm:p-5 flex flex-col justify-between cursor-pointer focus-within:ring-2 focus-within:ring-ceylon-700 text-left"
    >
      <div>
        {/* Header: Sinhala Word, Audio & Part of Speech */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-bold font-sinhala-serif text-ink-950 group-hover:text-ceylon-700 transition-colors truncate">
                {word.sinhala_word}
              </h3>
              <button
                type="button"
                aria-label={`Listen to pronunciation for ${word.sinhala_word}`}
                title="Listen to Sinhala pronunciation"
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(word.sinhala_word, 'si-LK', word.romanized_pronunciation);
                }}
                className="p-1 rounded-md text-stone-400 hover:text-ceylon-700 hover:bg-stone-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ceylon-700"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs text-stone-500 font-mono">
              <span>/{word.romanized_pronunciation}/</span>
              {word.tamil_pronunciation_guide && (
                <span className="font-tamil text-stone-400">
                  • [{word.tamil_pronunciation_guide}]
                </span>
              )}
            </div>
          </div>

          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700 shrink-0 border border-stone-200">
            {word.part_of_speech}
          </span>
        </div>

        {/* Trilingual Meanings */}
        <div className="space-y-1.5 mt-3 pt-2.5 border-t border-stone-100">
          {(uiLang === 'all' || uiLang === 'ta' || uiLang === 'si') && (
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-ceylon-50 text-ceylon-900 border border-ceylon-200 shrink-0">
                தமிழ்
              </span>
              <p className="text-xs sm:text-sm font-medium font-tamil text-ink-900 truncate">
                {word.primary_tamil_translation}
              </p>
            </div>
          )}

          {(uiLang === 'all' || uiLang === 'en' || uiLang === 'si') && (
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
                ENG
              </span>
              <p className="text-xs sm:text-sm font-semibold text-ink-900 truncate">
                {word.primary_english_translation}
              </p>
            </div>
          )}
        </div>

        {word.usage_context && (
          <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {word.usage_context}
          </p>
        )}
      </div>

      {/* Footer Info: Badges & Link */}
      <div className="mt-3.5 pt-2.5 border-t border-stone-100 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <VerificationBadge
              status={word.verification_status}
              confidence={word.confidence_score}
            />
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
              {word.difficulty_level}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-ceylon-700 group-hover:translate-x-0.5 transition-transform">
            Details <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {word.categories && word.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {word.categories.slice(0, 2).map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={(e) => {
                  if (onSelectCategory) {
                    e.stopPropagation();
                    onSelectCategory(cat.slug);
                  }
                }}
                className="text-[10px] px-2 py-0.5 rounded bg-[#FAF7F2] hover:bg-stone-200 text-stone-600 border border-stone-200 transition-colors"
              >
                {cat.name_en}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};
