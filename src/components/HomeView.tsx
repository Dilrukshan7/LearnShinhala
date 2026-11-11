import React, { useState, useEffect } from 'react';
import {
  Search,
  Volume2,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Layers,
  GraduationCap,
  ArrowRight,
  Compass,
  Clock,
  TrendingUp,
  Keyboard,
  X,
  CheckCircle2,
} from 'lucide-react';
import { UILanguage, VocabularySummary } from '../types';
import { WordCard } from './WordCard';
import { speakText } from '../utils/speech';

interface HomeViewProps {
  stats: any;
  uiLang: UILanguage;
  onSearchSubmit: (query: string, langScope?: string) => void;
  onSelectWord: (idOrWord: number | string) => void;
  onSelectCategory: (slug: string, dimensionCode?: string) => void;
  onNavigateTab: (tab: 'home' | 'explorer' | 'learning' | 'contribute' | 'admin') => void;
}

const VIRTUAL_SINHALA_KEYS = [
  'අ', 'ආ', 'ඇ', 'ඈ', 'ඉ', 'ඊ', 'උ', 'ඌ', 'එ', 'ඒ', 'ඔ', 'ඕ',
  'ක', 'ඛ', 'ග', 'ඝ', 'ච', 'ජ', 'ට', 'ඩ', 'ණ',
  'ත', 'ථ', 'ද', 'ධ', 'න', 'ප', 'ඵ', 'බ', 'භ', 'ම', 'ය',
  'ර', 'ල', 'ව', 'ශ', 'ෂ', 'ස', 'හ',
  'ළ', 'ඳ', 'ඟ', 'ඬ', 'ඹ',
  '්', 'ා', 'ැ', 'ෑ', 'ි', 'ී', 'ු', 'ූ', 'ෙ', 'ේ', 'ො', 'ෝ', 'ෞ', 'ං', 'ඃ',
];

export const HomeView: React.FC<HomeViewProps> = ({
  stats,
  uiLang,
  onSearchSubmit,
  onSelectWord,
  onSelectCategory,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'all' | 'si' | 'ta' | 'en' | 'roman'>('all');
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<any[]>([]);
  const [spellingSuggestions, setSpellingSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setAutocompleteResults([]);
      setSpellingSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/vocabulary/autocomplete?q=${encodeURIComponent(trimmed)}`)
        .then((r) => r.json())
        .then((data) => {
          setAutocompleteResults(data.suggestions || []);
          setSpellingSuggestions(data.spellingSuggestions || []);
        })
        .catch(() => {});
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(searchQuery, searchScope);
  };

  const counts = stats?.counts || {};
  const dailyWord = stats?.dailyWord;
  const recentWords: VocabularySummary[] = stats?.recentWords || [];
  const popularWords: VocabularySummary[] = stats?.popularWords || [];
  const byDimension: any[] = stats?.byDimension || [];

  return (
    <div className="space-y-12 pb-16">
      {/* Archival Research Header & Trilingual Search */}
      <section className="bg-white border-b border-parchment-300 pt-10 pb-12 sm:pb-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-parchment-100 border border-parchment-300 text-xs font-semibold text-ink-700">
            <span className="w-2 h-2 rounded-full bg-forest-600"></span>
            <span>ශබ්දකෝෂ සම්පාදනය</span>
            <span className="text-parchment-400">•</span>
            <span className="font-tamil">தேசிய அகராதி ஆவணம்</span>
            <span className="text-parchment-400">•</span>
            <span>National Linguistic Archive</span>
          </div>

          {/* Master Headings */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-ink-950 font-sinhala-serif leading-tight">
              මහා සිංහල ශබ්දකෝෂ විශ්වකෝෂය
            </h1>
            <p className="text-base sm:text-lg text-ink-700 font-sans font-medium">
              Complete Sinhala Vocabulary Encyclopedia & Trilingual Archive
            </p>
          </div>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-ink-600 leading-relaxed">
            Preserving and cross-referencing authentic Sinhala vocabulary across{' '}
            <strong className="text-ink-900 font-semibold">Sinhala (සිංහල)</strong>,{' '}
            <strong className="text-ink-900 font-tamil font-semibold">Tamil (தமிழ்)</strong>, and{' '}
            <strong className="text-ink-900 font-semibold">English</strong> with etymology, inflections,
            and 9-dimensional linguistic classification.
          </p>

          {/* Search Scope Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2" role="tablist" aria-label="Search Scope">
            {[
              { id: 'all', label: 'All Languages (සිං • தமிழ் • EN • Roman)' },
              { id: 'si', label: 'සිංහල අකුරෙන්' },
              { id: 'ta', label: 'தமிழ்' },
              { id: 'en', label: 'English' },
              { id: 'roman', label: 'Singlish / Roman' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSearchScope(item.id as any)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all focus-ring ${
                  searchScope === item.id
                    ? 'bg-ceylon-700 text-white shadow-subtle'
                    : 'bg-parchment-100 text-ink-700 hover:bg-parchment-200 border border-parchment-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Central Search Form */}
          <div className="relative max-w-2xl mx-auto pt-1">
            <form
              onSubmit={handleFormSubmit}
              className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-parchment-400 focus-within:border-ceylon-700 focus-within:ring-2 focus-within:ring-ceylon-100 shadow-card transition-all"
            >
              <div className="flex items-center flex-1 px-2.5">
                <Search className="w-5 h-5 text-ink-400 shrink-0 mr-2.5" />
                <input
                  id="hero-trilingual-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Sinhala (ආයුබෝවන්), Tamil (வணக்கம்), English (water), or Singlish (vatura)..."
                  className="w-full text-sm sm:text-base text-ink-950 placeholder:text-ink-400 focus:outline-none font-sinhala-sans bg-transparent py-1.5"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-ink-400 hover:text-ink-700 px-1.5 py-1 rounded focus-ring"
                    aria-label="Clear search input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                  title="Toggle Sinhala character input palette"
                  className={`px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors focus-ring ${
                    showVirtualKeyboard
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-parchment-100 text-ink-700 border-parchment-300 hover:bg-parchment-200'
                  }`}
                >
                  <Keyboard className="w-4 h-4" />
                  <span className="hidden sm:inline font-sinhala-sans">යතුරු</span>
                </button>

                <button
                  id="hero-search-submit-btn"
                  type="submit"
                  className="px-4 sm:px-5 py-2 rounded-lg bg-ceylon-700 hover:bg-ceylon-800 text-white font-semibold text-xs sm:text-sm transition-colors shadow-subtle focus-ring"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Virtual Sinhala Input Palette */}
            {showVirtualKeyboard && (
              <div className="mt-2.5 p-3.5 rounded-xl bg-white border border-parchment-300 shadow-dropdown text-left animate-in fade-in duration-150">
                <div className="text-[11px] text-ink-600 font-semibold mb-2 flex items-center justify-between">
                  <span className="font-sinhala-sans">සිංහල අකුරු තේරීම (Click to insert):</span>
                  <button
                    type="button"
                    onClick={() => setShowVirtualKeyboard(false)}
                    className="text-ink-400 hover:text-ink-800 text-xs focus-ring rounded"
                  >
                    Close
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
                  {VIRTUAL_SINHALA_KEYS.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setSearchQuery((prev) => prev + ch)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-parchment-100 hover:bg-ceylon-700 hover:text-white text-ink-900 font-sinhala-sans font-bold text-xs sm:text-sm flex items-center justify-center transition-colors border border-parchment-200"
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trilingual Autocomplete & Spelling Suggestions Dropdown */}
            {(autocompleteResults.length > 0 || spellingSuggestions.length > 0) && (
              <div className="absolute left-0 right-0 mt-2 bg-white text-ink-950 rounded-xl shadow-dropdown border border-parchment-300 overflow-hidden z-30 text-left">
                {autocompleteResults.length > 0 && (
                  <div className="divide-y divide-parchment-200">
                    {autocompleteResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectWord(item.id)}
                        className="w-full px-4 py-2.5 hover:bg-parchment-50 flex items-center justify-between gap-4 transition-colors text-left focus-ring"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold font-sinhala-serif text-ink-950">
                              {item.sinhala_word}
                            </span>
                            <span className="text-xs font-mono text-ink-500">
                              /{item.romanized_pronunciation}/
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-parchment-100 text-ink-700 border border-parchment-300 font-semibold">
                              {item.part_of_speech}
                            </span>
                          </div>
                          <div className="text-xs text-ink-600 mt-0.5">
                            <span className="font-tamil text-ceylon-800 font-medium">
                              {item.primary_tamil_translation}
                            </span>{' '}
                            • <span className="font-semibold text-ink-800">{item.primary_english_translation}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-ceylon-700 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {spellingSuggestions.length > 0 && (
                  <div className="p-3 bg-amber-50/80 border-t border-amber-200">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 mb-1.5">
                      Fuzzy Spelling Suggestions:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {spellingSuggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => onSelectWord(s.id)}
                          className="px-2.5 py-1 rounded bg-white border border-amber-300 text-xs font-medium text-ink-900 hover:bg-amber-100 focus-ring"
                        >
                          {s.sinhala_word} ({s.romanized_pronunciation}) — {s.primary_english_translation}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Search Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-ink-500 pt-1">
            <span className="text-ink-400">Sample searches:</span>
            {['ආයුබෝවන්', 'විශ්වවිද්‍යාලය', 'කෘත්‍රිම බුද්ධිය', 'வணக்கம்', 'குளம்', 'vatura', 'Astronomy'].map(
              (sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => onSearchSubmit(sample, 'all')}
                  className="px-2 py-0.5 rounded bg-parchment-100 hover:bg-parchment-200 text-ink-700 font-medium transition-colors border border-parchment-200 focus-ring"
                >
                  {sample}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* Main Encyclopedia Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Curated Ledger Statistics Bar */}
        <section aria-label="Archive Statistics">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl p-4 border border-parchment-300 shadow-subtle">
              <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Verified Headwords</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-ink-950 mt-1 font-mono">
                {counts.total_entries ?? 0}
              </div>
              <div className="text-[11px] text-forest-700 font-semibold mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{counts.verified_count ?? 0} Multi-Source Attested</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-parchment-300 shadow-subtle">
              <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Taxonomy Categories</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-ceylon-700 mt-1 font-mono">
                {counts.total_categories ?? 170}
              </div>
              <div className="text-[11px] text-ink-600 mt-1">
                9 Hierarchical Dimensions
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-parchment-300 shadow-subtle">
              <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Trilingual Sentences</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-ink-950 mt-1 font-mono">
                {counts.total_examples ?? 0}
              </div>
              <div className="text-[11px] text-ink-600 mt-1">
                Sinhala • Tamil • English
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-parchment-300 shadow-subtle">
              <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Inflected Forms</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-ink-950 mt-1 font-mono">
                {counts.total_word_forms ?? 0}
              </div>
              <div className="text-[11px] text-ink-600 mt-1">
                Plurals, Cases & Tenses
              </div>
            </div>

            <div className="col-span-2 md:col-span-1 bg-parchment-100 rounded-xl p-4 border border-parchment-300 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-ceylon-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-ceylon-700 shrink-0" /> AI Research Agent
                </div>
                <p className="text-xs text-ink-700 mt-1 leading-snug">
                  Autonomous 10-stage discovery and validation pipeline.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('admin')}
                className="mt-2 text-xs font-bold text-ceylon-700 hover:text-ceylon-900 inline-flex items-center gap-1 focus-ring rounded"
              >
                <span>Launch Batch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Daily Word Feature & Learning Suite */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {dailyWord && (
            <div className="lg:col-span-2 bg-white rounded-xl border border-parchment-300 shadow-subtle p-6 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-parchment-200">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-ceylon-50 text-ceylon-800 border border-ceylon-200">
                    <BookOpen className="w-3.5 h-3.5 text-ceylon-700 shrink-0" />
                    දවසේ සිංහල වචනය • Daily Featured Headword
                  </span>
                  <span className="text-xs font-mono text-ink-500">
                    Origin: {dailyWord.origin_language || 'Classical Sinhala'}
                  </span>
                </div>

                <div className="mt-5">
                  <div className="flex items-center gap-3">
                    <h2
                      onClick={() => onSelectWord(dailyWord.id)}
                      className="text-3xl sm:text-4xl font-bold font-sinhala-serif text-ink-950 hover:text-ceylon-700 cursor-pointer tracking-tight transition-colors"
                    >
                      {dailyWord.sinhala_word}
                    </h2>
                    <button
                      type="button"
                      onClick={() =>
                        speakText(
                          dailyWord.sinhala_word,
                          'si-LK',
                          dailyWord.romanized_pronunciation
                        )
                      }
                      className="p-2 rounded-lg bg-parchment-100 hover:bg-ceylon-100 text-ceylon-800 transition-colors focus-ring"
                      title="Listen to pronunciation"
                      aria-label={`Listen to pronunciation of ${dailyWord.sinhala_word}`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs font-mono text-ink-500 mt-1">
                    <span className="text-ceylon-800 font-semibold">/{dailyWord.romanized_pronunciation}/</span>
                    {dailyWord.tamil_pronunciation_guide && (
                      <span className="font-tamil ml-2 text-ink-500 font-normal">
                        [{dailyWord.tamil_pronunciation_guide}]
                      </span>
                    )}
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-parchment-100 text-ink-600 font-sans font-medium text-[11px]">
                      {dailyWord.part_of_speech}
                    </span>
                  </p>
                </div>

                {/* Trilingual Translation Pairs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                  <div className="p-3.5 rounded-lg bg-parchment-50 border border-parchment-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ceylon-800 font-tamil block">
                      Tamil Translation (தமிழ்)
                    </span>
                    <span className="text-base font-bold font-tamil text-ink-950 mt-0.5 block">
                      {dailyWord.primary_tamil_translation}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-parchment-50 border border-parchment-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 block">
                      English Translation
                    </span>
                    <span className="text-base font-bold text-ink-950 mt-0.5 block">
                      {dailyWord.primary_english_translation}
                    </span>
                  </div>
                </div>

                {dailyWord.etymology_notes && (
                  <p className="mt-4 text-xs text-ink-600 leading-relaxed">
                    <strong className="text-ink-800 font-semibold">Etymology & Usage: </strong>
                    {dailyWord.etymology_notes}
                  </p>
                )}

                {Array.isArray(dailyWord.examples) && dailyWord.examples.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-parchment-100/60 border border-parchment-200 text-xs space-y-1">
                    <div className="font-sinhala-sans font-semibold text-ink-950">
                      “{dailyWord.examples[0].sinhala_sentence}”
                    </div>
                    <div className="font-tamil text-ink-700">
                      தமிழ்: {dailyWord.examples[0].tamil_translation}
                    </div>
                    <div className="text-ink-600">
                      EN: {dailyWord.examples[0].english_translation}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-5 border-t border-parchment-200 flex items-center justify-between text-xs">
                <span className="text-ink-500">
                  Linguistic Root: <strong className="text-ink-900 font-semibold">{dailyWord.root_word}</strong>
                </span>
                <button
                  onClick={() => onSelectWord(dailyWord.id)}
                  className="font-semibold text-ceylon-700 hover:text-ceylon-900 inline-flex items-center gap-1 focus-ring rounded"
                >
                  <span>Open Full Lexical Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Curated Learning Collections */}
          <div className="bg-white rounded-xl border border-parchment-300 p-6 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-ink-950 font-bold text-base mb-1">
                <GraduationCap className="w-5 h-5 text-forest-700 shrink-0" />
                Trilingual Learning Suite
              </div>
              <p className="text-xs text-ink-600 mb-4">
                Interactive flashcards, reverse translation quizzes, and spoken pronunciation drills.
              </p>

              <div className="space-y-2.5">
                {[
                  {
                    titleSi: 'එදිනෙදා සන්නිවේදන වචන',
                    titleTa: 'அன்றாட உரையாடல் சொற்கள்',
                    titleEn: 'Greetings & Everyday Discourse',
                    badge: 'Beginner',
                  },
                  {
                    titleSi: 'විද්‍යා, වෛද්‍ය සහ තාක්ෂණික වදන්',
                    titleTa: 'அறிவியல், மருத்துவம் மற்றும் தொழில்நுட்பம்',
                    titleEn: 'Science, Medicine & AI Terminology',
                    badge: 'Academic',
                  },
                  {
                    titleSi: 'හෙළ උරුමය, කෘෂිකර්මය සහ ඔසු පැළෑටි',
                    titleTa: 'மரபுரிமை, விவசாயம் மற்றும் மூலிகைகள்',
                    titleEn: 'Heritage, Agronomy & Native Flora',
                    badge: 'Cultural',
                  },
                ].map((col, idx) => (
                  <div
                    key={idx}
                    onClick={() => onNavigateTab('learning')}
                    className="p-3 rounded-lg border border-parchment-200 hover:border-ceylon-400 bg-parchment-50 cursor-pointer transition-colors focus-ring"
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onNavigateTab('learning')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-sinhala-sans font-semibold text-xs text-ink-950">
                        {col.titleSi}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-forest-50 text-forest-700 border border-forest-200">
                        {col.badge}
                      </span>
                    </div>
                    <div className="text-[11px] font-tamil text-ink-500 mt-0.5">{col.titleTa}</div>
                    <div className="text-[11px] font-medium text-ink-700 mt-0.5">{col.titleEn}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('learning')}
              className="mt-5 w-full py-2.5 px-4 rounded-lg bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-subtle focus-ring"
            >
              <span>Launch Practice Exercises</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 9-Dimension Category Taxonomy Explorer */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-ink-950 flex items-center gap-2">
                <Layers className="w-5 h-5 text-ceylon-700 shrink-0" />
                Browse by 9 Linguistic & Knowledge Dimensions
              </h2>
              <p className="text-xs text-ink-600 mt-0.5">
                Comprehensive taxonomy spanning Grammar, Purpose, Environments, Knowledge Domains, Human Life, and Dialect Collections.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('explorer')}
              className="text-xs font-semibold text-ceylon-700 hover:text-ceylon-900 inline-flex items-center gap-1 focus-ring rounded"
            >
              <span>Explore All 170+ Categories</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {byDimension.map((dim) => (
              <div
                key={dim.dimension_code}
                onClick={() => onSelectCategory('', dim.dimension_code)}
                className="group bg-white rounded-xl p-4 border border-parchment-300 hover:border-ceylon-400 shadow-subtle hover:shadow-card-hover cursor-pointer transition-all focus-ring"
                tabIndex={0}
                role="button"
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectCategory('', dim.dimension_code)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-ceylon-100 text-ceylon-900 font-bold text-xs">
                    {dim.dimension_code}
                  </span>
                  <span className="text-[11px] font-medium text-ink-500">
                    {dim.category_count} categories • {dim.word_count} entries
                  </span>
                </div>
                <h3 className="text-sm font-bold text-ink-950 group-hover:text-ceylon-700 transition-colors">
                  {dim.dimension_name}
                </h3>
                <div className="mt-2 text-xs font-semibold text-ceylon-700 inline-flex items-center gap-1">
                  <span>Browse Dimension {dim.dimension_code}</span>
                  <Compass className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Added Vocabulary Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-ceylon-700 shrink-0" />
              Recently Documented & Attested Vocabulary
            </h2>
            <button
              onClick={() => onNavigateTab('explorer')}
              className="text-xs font-semibold text-ceylon-700 hover:text-ceylon-900 inline-flex items-center gap-1 focus-ring rounded"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentWords.slice(0, 4).map((word) => (
              <WordCard
                key={word.id}
                word={word}
                uiLang={uiLang}
                onSelectWord={onSelectWord}
                onSelectCategory={(slug) => onSelectCategory(slug)}
              />
            ))}
          </div>
        </section>

        {/* Popular & Foundational Vocabulary Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink-950 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-forest-700 shrink-0" />
              Essential & High-Frequency Trilingual Vocabulary
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularWords.slice(0, 4).map((word) => (
              <WordCard
                key={word.id}
                word={word}
                uiLang={uiLang}
                onSelectWord={onSelectWord}
                onSelectCategory={(slug) => onSelectCategory(slug)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
