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
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-leaf-100 text-leaf-800 border border-leaf-300">
        <ShieldCheck className="w-3.5 h-3.5 text-leaf-700" />
        Verified {confPct && <span className="opacity-80">• {confPct}</span>}
      </span>
    );
  }
  if (status === 'SOURCE_SUPPORTED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
        <BookOpen className="w-3.5 h-3.5 text-amber-700" />
        Source-Supported {confPct && <span className="opacity-80">• {confPct}</span>}
      </span>
    );
  }
  if (status === 'AI_SUGGESTION') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-900 border border-sky-300">
        <Sparkles className="w-3.5 h-3.5 text-sky-700" />
        AI Candidate (Pending Review)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300">
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
  return (
    <article
      onClick={() => onSelectWord(word.id)}
      className="group bg-white rounded-xl border border-stone-200/90 hover:border-ceylon-600/60 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold font-sinhala-serif text-ink-950 group-hover:text-ceylon-700 transition-colors">
                {word.sinhala_word}
              </h3>
              <button
                type="button"
                title="Listen to Sinhala pronunciation"
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(word.sinhala_word, 'si-LK', word.romanized_pronunciation);
                }}
                className="p-1.5 rounded-lg text-stone-500 hover:text-ceylon-700 hover:bg-ceylon-50 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-stone-600 font-mono">
              <span>/{word.romanized_pronunciation}/</span>
              {word.tamil_pronunciation_guide && (
                <span className="font-tamil text-stone-500">
                  • [{word.tamil_pronunciation_guide}]
                </span>
              )}
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-stone-100 text-stone-800 shrink-0">
            {word.part_of_speech}
          </span>
        </div>

        {/* Trilingual Meanings */}
        <div className="space-y-2 mt-3 pt-3 border-t border-stone-100">
          {(uiLang === 'all' || uiLang === 'ta' || uiLang === 'si') && (
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-ceylon-50 text-ceylon-800 shrink-0">
                தமிழ்
              </span>
              <p className="text-sm font-medium font-tamil text-ink-900">
                {word.primary_tamil_translation}
              </p>
            </div>
          )}

          {(uiLang === 'all' || uiLang === 'en' || uiLang === 'si') && (
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 shrink-0">
                ENG
              </span>
              <p className="text-sm font-semibold text-ink-900">
                {word.primary_english_translation}
              </p>
            </div>
          )}
        </div>

        {word.usage_context && (
          <p className="mt-2.5 text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {word.usage_context}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <VerificationBadge
            status={word.verification_status}
            confidence={word.confidence_score}
          />
          <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
            {word.difficulty_level}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-ceylon-700 group-hover:translate-x-0.5 transition-transform">
          Full Entry <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {word.categories && word.categories.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
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
              className="text-[11px] px-2 py-0.5 rounded bg-[#F5EFE6] hover:bg-ceylon-100 text-stone-700 transition-colors"
            >
              {cat.name_en} • {cat.name_si}
            </button>
          ))}
        </div>
      )}
    </article>
  );
};
