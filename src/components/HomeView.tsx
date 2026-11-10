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
  'අ', 'ආ', 'ඇ', 'ඉ', 'උ', 'එ', 'ඔ',
  'ක', 'ග', 'ච', 'ජ', 'ට', 'ඩ', 'ණ',
  'ත', 'ද', 'න', 'ප', 'බ', 'ම', 'ය',
  'ර', 'ල', 'ව', 'ශ', 'ෂ', 'ස', 'හ',
  'ළ', 'ඳ', 'ඟ', 'ඬ', 'ඹ', 'ා', 'ැ', 'ි', 'ී', 'ු', 'ූ', 'ෙ', 'ේ', 'ො', '්',
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
    <div className="space-y-10 pb-12">
      {/* Hero Trilingual Search & Archival Header */}
      <section className="relative bg-gradient-to-b from-[#1F1712] via-[#2B1F18] to-[#1D2822] text-white py-12 sm:py-16 px-4 sm:px-6 border-b border-ceylon-800/40">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-amber-200 font-medium">
            <span>මහා සිංහල ශබ්දකෝෂ විශ්වකෝෂය</span>
            <span>•</span>
            <span className="font-tamil">முழுமையான சிங்கள சொற்களஞ்சிய கலைக்களஞ்சியம்</span>
            <span>•</span>
            <span>Unbounded Linguistic Archive</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Complete Sinhala Vocabulary Encyclopedia
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-stone-300 leading-relaxed">
            Preserving, translating, and documenting authentic Sinhala vocabulary across{' '}
            <strong className="text-amber-200">Sinhala (සිංහල)</strong>,{' '}
            <strong className="text-emerald-200 font-tamil">Tamil (தமிழ்)</strong>, and{' '}
            <strong className="text-white">English</strong> — with verified etymology, inflections,
            pronunciation, 9-dimensional categorization, and a 10-stage autonomous research agent.
          </p>

          {/* Search Scope Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: 'all', label: 'All Languages (සිං / தமிழ் / EN / Roman)' },
              { id: 'si', label: 'සිංහල අකුරෙන් (Sinhala Script)' },
              { id: 'ta', label: 'தமிழ் (Tamil Translation)' },
              { id: 'en', label: 'English Meaning' },
              { id: 'roman', label: 'Singlish / Romanized' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSearchScope(item.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  searchScope === item.id
                    ? 'bg-ceylon-600 text-white shadow'
                    : 'bg-white/10 text-stone-300 hover:bg-white/20'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Main Search Bar */}
          <div className="relative max-w-3xl mx-auto pt-1">
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2 rounded-2xl shadow-xl border-2 border-ceylon-500/40"
            >
              <div className="flex items-center flex-1 px-3 py-1.5">
                <Search className="w-5 h-5 text-ceylon-700 shrink-0 mr-3" />
                <input
                  id="hero-trilingual-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Sinhala (ආයුබෝවන්), Tamil (வணக்கம்), English (University), or Romanized (vatura)..."
                  className="w-full text-base text-ink-950 placeholder:text-stone-400 focus:outline-none font-sinhala-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-stone-400 hover:text-stone-700 px-2"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                  title="Toggle Sinhala Script Input Helper"
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                    showVirtualKeyboard
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  <Keyboard className="w-4 h-4" />
                  <span className="hidden md:inline">සිංහල යතුරු</span>
                </button>

                <button
                  id="hero-search-submit-btn"
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-ceylon-700 hover:bg-ceylon-800 text-white font-bold text-sm transition-colors shadow"
                >
                  Search Encyclopedia
                </button>
              </div>
            </form>

            {/* Virtual Sinhala Character Bar */}
            {showVirtualKeyboard && (
              <div className="mt-2 p-3 rounded-xl bg-[#271E19] border border-white/15 text-left">
                <div className="text-[11px] text-amber-200/90 font-semibold mb-2 flex items-center justify-between">
                  <span>Click characters to compose Sinhala script directly:</span>
                  <button
                    type="button"
                    onClick={() => setShowVirtualKeyboard(false)}
                    className="text-stone-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {VIRTUAL_SINHALA_KEYS.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setSearchQuery((prev) => prev + ch)}
                      className="w-8 h-8 rounded bg-white/10 hover:bg-ceylon-600 text-white font-sinhala-sans font-bold text-sm flex items-center justify-center transition-colors"
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Instant Trilingual Autocomplete Dropdown */}
            {(autocompleteResults.length > 0 || spellingSuggestions.length > 0) && (
              <div className="absolute left-0 right-0 mt-2 bg-white text-ink-950 rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-30 text-left">
                {autocompleteResults.length > 0 && (
                  <div className="divide-y divide-stone-100">
                    {autocompleteResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectWord(item.id)}
                        className="w-full px-4 py-3 hover:bg-[#FAF6F0] flex items-center justify-between gap-4 transition-colors text-left"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold font-sinhala-serif text-ink-950">
                              {item.sinhala_word}
                            </span>
                            <span className="text-xs font-mono text-stone-500">
                              /{item.romanized_pronunciation}/
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold">
                              {item.part_of_speech}
                            </span>
                          </div>
                          <div className="text-xs text-stone-700 mt-0.5">
                            <span className="font-tamil text-ceylon-800 font-medium">
                              {item.primary_tamil_translation}
                            </span>{' '}
                            • <span className="font-semibold">{item.primary_english_translation}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-ceylon-700 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {spellingSuggestions.length > 0 && (
                  <div className="p-3 bg-amber-50/70 border-t border-amber-200">
                    <div className="text-[11px] font-bold uppercase text-amber-900 mb-1.5">
                      Fuzzy Trigram Spelling Matches:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {spellingSuggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => onSelectWord(s.id)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-ink-900 hover:bg-amber-100"
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

          {/* Quick Suggested Searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-stone-300 pt-1">
            <span className="text-stone-400">Try searching:</span>
            {['ආයුබෝවන්', 'විශ්වවිද්‍යාලය', 'කෘත්‍රිම බුද්ධිය', 'வணக்கம்', 'குளம்', 'vatura', 'Astronomy'].map(
              (sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => onSearchSubmit(sample, 'all')}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-amber-100 transition-colors"
                >
                  {sample}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Live Vocabulary Statistics & Epistemic Transparency Banner */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
            <div className="text-xs font-semibold text-stone-500 uppercase">Verified Headwords</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-ink-950 mt-1">
              {counts.total_entries ?? 0}
            </div>
            <div className="text-[11px] text-leaf-700 font-medium mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> {counts.verified_count ?? 0} Multi-Source Verified
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
            <div className="text-xs font-semibold text-stone-500 uppercase">9-Dimension Categories</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-ceylon-700 mt-1">
              {counts.total_categories ?? 170}
            </div>
            <div className="text-[11px] text-stone-600 mt-1">
              Expandable Hierarchical Taxonomy
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
            <div className="text-xs font-semibold text-stone-500 uppercase">Trilingual Sentences</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-ink-950 mt-1">
              {counts.total_examples ?? 0}
            </div>
            <div className="text-[11px] text-stone-600 mt-1">
              Sinhala • Tamil • English
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm">
            <div className="text-xs font-semibold text-stone-500 uppercase">Inflected Forms</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-ink-950 mt-1">
              {counts.total_word_forms ?? 0}
            </div>
            <div className="text-[11px] text-stone-600 mt-1">
              Plurals, Cases & Conjugations
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-[#F4EFE6] rounded-xl p-4 border border-ceylon-300/60 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-ceylon-900 uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-ceylon-700" /> AI Research Agent
              </div>
              <p className="text-xs text-stone-700 mt-1 leading-snug">
                Continuous 10-stage discovery & verification from public-domain sources.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('admin')}
              className="mt-2 text-xs font-bold text-ceylon-800 hover:text-ceylon-950 inline-flex items-center gap-1"
            >
              Launch Research Batch <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* Daily Featured Sinhala Word & Learning Collections */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {dailyWord && (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-6 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-ceylon-100 text-ceylon-900">
                    <Sparkles className="w-3.5 h-3.5 text-ceylon-700" />
                    දවසේ සිංහල වචනය • இன்றைய சிங்களச் சொல் • Daily Featured Word
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    Origin: {dailyWord.origin_language || 'Classical Sinhala'}
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2
                        onClick={() => onSelectWord(dailyWord.id)}
                        className="text-4xl font-extrabold font-sinhala-serif text-ink-950 hover:text-ceylon-700 cursor-pointer"
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
                        className="p-2 rounded-xl bg-ceylon-50 hover:bg-ceylon-100 text-ceylon-800 transition-colors"
                        title="Listen to pronunciation"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm font-mono text-stone-600 mt-1">
                      /{dailyWord.romanized_pronunciation}/ •{' '}
                      <span className="font-tamil text-ceylon-800">
                        [{dailyWord.tamil_pronunciation_guide}]
                      </span>{' '}
                      • {dailyWord.part_of_speech}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                  <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-stone-200/80">
                    <span className="text-[11px] font-bold uppercase text-ceylon-800 block">
                      Tamil Translation (தமிழ்)
                    </span>
                    <span className="text-lg font-bold font-tamil text-ink-950">
                      {dailyWord.primary_tamil_translation}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F3FAF7] border border-leaf-200">
                    <span className="text-[11px] font-bold uppercase text-leaf-800 block">
                      English Translation
                    </span>
                    <span className="text-lg font-bold text-ink-950">
                      {dailyWord.primary_english_translation}
                    </span>
                  </div>
                </div>

                {dailyWord.etymology_notes && (
                  <p className="mt-4 text-xs text-stone-600 leading-relaxed">
                    <strong className="text-ink-900">Etymology & Usage: </strong>
                    {dailyWord.etymology_notes}
                  </p>
                )}

                {Array.isArray(dailyWord.examples) && dailyWord.examples.length > 0 && (
                  <div className="mt-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs space-y-1">
                    <div className="font-sinhala-sans font-bold text-sm text-ink-950">
                      “{dailyWord.examples[0].sinhala_sentence}”
                    </div>
                    <div className="font-tamil text-ceylon-900">
                      தமிழ்: {dailyWord.examples[0].tamil_translation}
                    </div>
                    <div className="text-stone-700">
                      EN: {dailyWord.examples[0].english_translation}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Root: <strong className="text-ink-900">{dailyWord.root_word}</strong>
                </span>
                <button
                  onClick={() => onSelectWord(dailyWord.id)}
                  className="text-xs font-bold text-ceylon-700 hover:text-ceylon-900 inline-flex items-center gap-1"
                >
                  Open Complete Word Dossier <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Curated Learning Collections & Practice Launchpad */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-ink-950 font-bold text-lg mb-2">
                <GraduationCap className="w-5 h-5 text-leaf-700" />
                Trilingual Learning Suite
              </div>
              <p className="text-xs text-stone-600 mb-4">
                Practice Sinhala-to-Tamil, Sinhala-to-English, contextual fill-in-the-blanks, and
                spoken pronunciation.
              </p>

              <div className="space-y-3">
                {[
                  {
                    titleSi: 'එදිනෙදා සන්නිවේදන වචන',
                    titleTa: 'அன்றாட உரையாடல் சொற்கள்',
                    titleEn: 'Everyday Greetings & Conversation',
                    badge: 'Beginner',
                  },
                  {
                    titleSi: 'විද්‍යා, වෛද්‍ය සහ තාක්ෂණික වදන්',
                    titleTa: 'அறிவியல், மருத்துவம் மற்றும் தொழில்நுட்பம்',
                    titleEn: 'Science, Medicine, Law & AI Terminology',
                    badge: 'Academic',
                  },
                  {
                    titleSi: 'හෙළ උරුමය, කෘෂිකර්මය සහ ඔසු පැළෑටි',
                    titleTa: 'மரபுரிமை, விவசாயம் மற்றும் மூலிகைகள்',
                    titleEn: 'Heritage, Agriculture & Medicinal Flora',
                    badge: 'Cultural',
                  },
                ].map((col, idx) => (
                  <div
                    key={idx}
                    onClick={() => onNavigateTab('learning')}
                    className="p-3.5 rounded-xl border border-stone-200 hover:border-leaf-600 bg-[#FAF8F5] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-sinhala-sans font-bold text-sm text-ink-950">
                        {col.titleSi}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-leaf-100 text-leaf-800">
                        {col.badge}
                      </span>
                    </div>
                    <div className="text-xs font-tamil text-stone-600 mt-0.5">{col.titleTa}</div>
                    <div className="text-xs font-semibold text-ink-800 mt-0.5">{col.titleEn}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('learning')}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              Start Flashcards & Quizzes <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 9-Dimension Hierarchical Category Explorer Overview */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-ink-950 flex items-center gap-2">
                <Layers className="w-5 h-5 text-ceylon-700" />
                Browse by 9 Linguistic & Knowledge Dimensions
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Explore 170+ hierarchical categories spanning Part of Speech, Everyday Purpose,
                Locations, Academic Domains, Grammar, and Etymological Collections.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('explorer')}
              className="text-xs font-bold text-ceylon-700 hover:text-ceylon-900 inline-flex items-center gap-1"
            >
              Open Full Category & Sinhala Alphabet Explorer <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {byDimension.map((dim) => (
              <div
                key={dim.dimension_code}
                onClick={() => onSelectCategory('', dim.dimension_code)}
                className="group bg-white rounded-xl p-5 border border-stone-200 hover:border-ceylon-600 shadow-sm cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-ceylon-100 text-ceylon-900 font-bold text-xs">
                    {dim.dimension_code}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">
                    {dim.category_count} subcategories • {dim.word_count} tagged entries
                  </span>
                </div>
                <h3 className="text-base font-bold text-ink-950 group-hover:text-ceylon-700 transition-colors">
                  {dim.dimension_name}
                </h3>
                <div className="mt-2 text-xs font-semibold text-ceylon-700 inline-flex items-center gap-1">
                  Explore Dimension {dim.dimension_code} <Compass className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Added Vocabulary */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-ink-950 flex items-center gap-2">
              <Clock className="w-5 h-5 text-ceylon-700" />
              Recently Verified & Added Vocabulary
            </h2>
            <button
              onClick={() => onNavigateTab('explorer')}
              className="text-xs font-bold text-ceylon-700 hover:text-ceylon-900 inline-flex items-center gap-1"
            >
              View All Words <ArrowRight className="w-4 h-4" />
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

        {/* Popular & Foundational Vocabulary */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-ink-950 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-leaf-700" />
              Popular & Essential Trilingual Vocabulary
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
