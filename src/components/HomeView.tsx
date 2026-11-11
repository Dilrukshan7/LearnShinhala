import React, { useState, useEffect } from 'react';
import {
  Search,
  Volume2,
  Sparkles,
  BookOpen,
  Layers,
  GraduationCap,
  ArrowRight,
  Compass,
  Clock,
  TrendingUp,
  Keyboard,
  Globe2,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Coffee,
  Plane,
  Heart,
  Cpu,
  Bookmark,
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
  onNavigateTab: (
    tab:
      | 'home'
      | 'explorer'
      | 'learning'
      | 'contribute'
      | 'admin'
      | 'about'
      | 'how-it-works'
      | 'technology'
      | 'sources'
  ) => void;
}

const VIRTUAL_SINHALA_KEYS = [
  'අ', 'ආ', 'ඇ', 'ඉ', 'උ', 'එ', 'ඔ',
  'ක', 'ග', 'ච', 'ජ', 'ට', 'ඩ', 'ණ',
  'ත', 'ද', 'න', 'ප', 'බ', 'ම', 'ය',
  'ර', 'ල', 'ව', 'ශ', 'ෂ', 'ස', 'හ',
  'ළ', 'ඳ', 'ඟ', 'ඬ', 'ඹ', 'ා', 'ැ', 'ි', 'ී', 'ු', 'ූ', 'ෙ', 'ේ', 'ො', '්',
];

const POPULAR_TOPICS = [
  {
    nameSi: 'ආචාර සමාචාර',
    nameTa: 'வாழ்த்துகள்',
    nameEn: 'Greetings & Essentials',
    slug: 'greetings',
    dimCode: 'B',
    icon: MessageCircle,
    color: 'bg-ceylon-50 text-ceylon-800 border-ceylon-200',
  },
  {
    nameSi: 'ආහාර පාන',
    nameTa: 'உணவு & பானங்கள்',
    nameEn: 'Food & Dining',
    slug: 'food-beverages',
    dimCode: 'E',
    icon: Coffee,
    color: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    nameSi: 'ගමනාගමනය',
    nameTa: 'பயணம் & போக்குவரத்து',
    nameEn: 'Travel & Transport',
    slug: 'transportation',
    dimCode: 'E',
    icon: Plane,
    color: 'bg-leaf-50 text-leaf-800 border-leaf-200',
  },
  {
    nameSi: 'පවුල සහ සබඳතා',
    nameTa: 'குடும்பம் & உறவுகள்',
    nameEn: 'Family & Relations',
    slug: 'family-relationships',
    dimCode: 'E',
    icon: Heart,
    color: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  {
    nameSi: 'විද්‍යාව සහ තාක්ෂණය',
    nameTa: 'அறிவியல் & தொழில்நுட்பம்',
    nameEn: 'Technology & AI',
    slug: 'artificial-intelligence',
    dimCode: 'D',
    icon: Cpu,
    color: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  {
    nameSi: 'පාසල සහ අධ්‍යාපනය',
    nameTa: 'பள்ளி & கல்வி',
    nameEn: 'Education & Study',
    slug: 'school',
    dimCode: 'C',
    icon: GraduationCap,
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
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
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Clean, Modern, Learner-First Hero Section */}
      <section className="relative bg-gradient-to-b from-[#F6F1EA] via-[#FAF7F2] to-[#FAF7F2] border-b border-stone-200/80 pt-12 sm:pt-16 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          {/* Subtle product badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-xs text-stone-700 shadow-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-leaf-600 animate-pulse" />
            <span>Trilingual Language Platform</span>
            <span className="text-stone-300">•</span>
            <span className="font-sinhala-sans font-semibold">සිංහල</span>
            <span className="text-stone-300">•</span>
            <span className="font-tamil font-semibold">தமிழ்</span>
            <span className="text-stone-300">•</span>
            <span className="font-semibold">English</span>
          </div>

          {/* Clean Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-ink-950 tracking-tight leading-tight">
            Master Sinhala, <span className="text-ceylon-700 font-serif italic">Naturally</span>
          </h1>

          {/* User-friendly subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-600 leading-relaxed font-sans">
            Explore authentic Sinhala vocabulary with instant Tamil and English translations,
            native audio pronunciation, and interactive practice flashcards.
          </p>

          {/* Clear Call-To-Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              id="hero-start-learning-btn"
              onClick={() => onNavigateTab('learning')}
              className="px-6 py-3 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-white font-bold text-sm shadow-sm transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" /> Start Practicing Free
            </button>
            <button
              type="button"
              id="hero-browse-dictionary-btn"
              onClick={() => onNavigateTab('explorer')}
              className="px-6 py-3 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-ink-900 font-bold text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-ceylon-700" /> Browse Dictionary
            </button>
          </div>

          {/* Search Box Container */}
          <div className="relative max-w-2xl mx-auto pt-4 text-left">
            {/* Scope Filter Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2.5">
              {[
                { id: 'all', label: 'All (සිං / தமிழ் / EN)' },
                { id: 'si', label: 'සිංහල අකුරෙන්' },
                { id: 'ta', label: 'தமிழ்' },
                { id: 'en', label: 'English' },
                { id: 'roman', label: 'Singlish (vatura)' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSearchScope(item.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    searchScope === item.id
                      ? 'bg-ink-900 text-white shadow-xs'
                      : 'bg-white/80 border border-stone-200 text-stone-600 hover:bg-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleFormSubmit}
              className="flex items-center gap-2 bg-white p-2 sm:p-2.5 rounded-2xl shadow-lg border border-stone-300/80 focus-within:border-ceylon-600 transition-colors"
            >
              <div className="flex items-center flex-1 px-3">
                <Search className="w-5 h-5 text-stone-400 shrink-0 mr-3" />
                <input
                  id="hero-trilingual-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search a word in Sinhala, Tamil, English, or Singlish (e.g. ayubowan)..."
                  className="w-full text-sm sm:text-base text-ink-950 placeholder:text-stone-400 focus:outline-none"
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

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                  title="Toggle Sinhala Script Input Keyboard"
                  className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                    showVirtualKeyboard
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  <Keyboard className="w-4 h-4 text-stone-600" />
                  <span className="hidden sm:inline">සිංහල යතුරු</span>
                </button>

                <button
                  id="hero-search-submit-btn"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-ceylon-700 hover:bg-ceylon-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Virtual Sinhala Keyboard Overlay */}
            {showVirtualKeyboard && (
              <div className="mt-2.5 p-3 rounded-xl bg-white border border-stone-200 shadow-md">
                <div className="text-[11px] text-stone-600 font-semibold mb-2 flex items-center justify-between">
                  <span>Click any letter to type Sinhala directly:</span>
                  <button
                    type="button"
                    onClick={() => setShowVirtualKeyboard(false)}
                    className="text-stone-400 hover:text-stone-700"
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
                      className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-ceylon-100 hover:text-ceylon-900 text-ink-950 font-sinhala-sans font-bold text-sm flex items-center justify-center transition-colors"
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trilingual Autocomplete Dropdown */}
            {(autocompleteResults.length > 0 || spellingSuggestions.length > 0) && (
              <div className="absolute left-0 right-0 mt-2 bg-white text-ink-950 rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-30">
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
                          <div className="text-xs text-stone-600 mt-0.5">
                            <span className="font-tamil text-ceylon-800 font-medium">
                              {item.primary_tamil_translation}
                            </span>{' '}
                            • <span className="font-semibold text-ink-900">{item.primary_english_translation}</span>
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
                      Did you mean:
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

            {/* Quick suggested words */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-stone-500 pt-2.5">
              <span>Popular searches:</span>
              {['ආයුබෝවන්', 'විශ්වවිද්‍යාලය', 'வணக்கம்', 'water', 'vatura'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => onSearchSubmit(sample, 'all')}
                  className="px-2.5 py-0.5 rounded-full bg-white border border-stone-200 hover:border-stone-300 text-stone-700 transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
        {/* Simple, Clean Highlights Bar */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-ceylon-50 text-ceylon-800 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-ink-950">
                {counts.total_entries ?? 35}+
              </div>
              <div className="text-xs text-stone-500 font-medium">Verified Vocabulary</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-leaf-50 text-leaf-800 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-ink-950">
                {counts.total_categories ?? 170}+
              </div>
              <div className="text-xs text-stone-500 font-medium">Curated Topics</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-ink-950">3 Languages</div>
              <div className="text-xs text-stone-500 font-medium">Sinhala • Tamil • English</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center shrink-0">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-ink-950">Native Voice</div>
              <div className="text-xs text-stone-500 font-medium">Audio Pronunciation</div>
            </div>
          </div>
        </section>

        {/* Word of the Day & Quick Practice Deck */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {dailyWord && (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between">
              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    Word of the Day • දවසේ වචනය • இன்றைய சொல்
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    Part of Speech: <strong className="text-ink-900">{dailyWord.part_of_speech}</strong>
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h2
                      onClick={() => onSelectWord(dailyWord.id)}
                      className="text-4xl sm:text-5xl font-extrabold font-sinhala-serif text-ink-950 hover:text-ceylon-700 cursor-pointer transition-colors"
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
                      className="p-2 rounded-xl bg-stone-100 hover:bg-ceylon-50 hover:text-ceylon-800 text-stone-600 transition-colors"
                      title="Listen to native pronunciation"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm font-mono text-stone-600 mt-1.5">
                    /{dailyWord.romanized_pronunciation}/
                    {dailyWord.tamil_pronunciation_guide && (
                      <span className="font-tamil text-ceylon-800 ml-2">
                        [{dailyWord.tamil_pronunciation_guide}]
                      </span>
                    )}
                  </p>
                </div>

                {/* Trilingual Meanings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-stone-200">
                    <span className="text-[11px] font-bold uppercase text-ceylon-800 block mb-1">
                      Tamil Translation (தமிழ்)
                    </span>
                    <span className="text-base sm:text-lg font-bold font-tamil text-ink-950">
                      {dailyWord.primary_tamil_translation}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F4F9F6] border border-leaf-200">
                    <span className="text-[11px] font-bold uppercase text-leaf-800 block mb-1">
                      English Meaning
                    </span>
                    <span className="text-base sm:text-lg font-bold text-ink-950">
                      {dailyWord.primary_english_translation}
                    </span>
                  </div>
                </div>

                {/* Contextual Sentence */}
                {Array.isArray(dailyWord.examples) && dailyWord.examples.length > 0 && (
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm space-y-1">
                    <div className="font-sinhala-sans font-bold text-ink-950">
                      “{dailyWord.examples[0].sinhala_sentence}”
                    </div>
                    <div className="font-tamil text-ceylon-900 text-xs">
                      தமிழ்: {dailyWord.examples[0].tamil_translation}
                    </div>
                    <div className="text-stone-600 text-xs">
                      English: {dailyWord.examples[0].english_translation}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Difficulty: <strong className="text-ink-900">{dailyWord.difficulty_level}</strong>
                </span>
                <button
                  onClick={() => onSelectWord(dailyWord.id)}
                  className="text-xs font-bold text-ceylon-700 hover:text-ceylon-900 inline-flex items-center gap-1"
                >
                  View Full Word Entry <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Learning Collections Launchpad */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-ink-950 font-bold text-lg mb-1.5">
                <GraduationCap className="w-5 h-5 text-leaf-700" />
                Start Practicing
              </div>
              <p className="text-xs text-stone-600 mb-4">
                Interactive flashcards, trilingual quizzes, and sentence exercises to help you remember words faster.
              </p>

              <div className="space-y-3">
                {[
                  {
                    titleSi: 'එදිනෙදා ආචාර සමාචාර',
                    titleTa: 'அன்றாட உரையாடல்',
                    titleEn: 'Everyday Greetings & Phrases',
                    badge: 'Beginner',
                  },
                  {
                    titleSi: 'විද්‍යාව, පරිගණක සහ AI',
                    titleTa: 'அறிவியல் & தொழில்நுட்பம்',
                    titleEn: 'Science, Technology & AI',
                    badge: 'Academic',
                  },
                  {
                    titleSi: 'හෙළ උරුමය සහ පරිසරය',
                    titleTa: 'மரபுரிமை & இயற்கை',
                    titleEn: 'Heritage, Nature & Living',
                    badge: 'Cultural',
                  },
                ].map((col, idx) => (
                  <div
                    key={idx}
                    onClick={() => onNavigateTab('learning')}
                    className="p-3.5 rounded-xl border border-stone-200 hover:border-leaf-600 bg-[#FAF9F7] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-sinhala-sans font-bold text-sm text-ink-950">
                        {col.titleSi}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-leaf-100 text-leaf-800">
                        {col.badge}
                      </span>
                    </div>
                    <div className="text-xs font-tamil text-stone-500 mt-0.5">{col.titleTa}</div>
                    <div className="text-xs font-semibold text-stone-700 mt-0.5">{col.titleEn}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('learning')}
              className="mt-6 w-full py-3 px-4 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              Start Flashcards & Quizzes <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Browse by Popular Topics */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-ink-950">
                Explore by Topic
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Quickly discover vocabulary tailored to everyday communication, travel, and knowledge domains.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('explorer')}
              className="text-xs font-bold text-ceylon-700 hover:text-ceylon-900 inline-flex items-center gap-1"
            >
              All 170+ Categories <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {POPULAR_TOPICS.map((topic) => {
              const Icon = topic.icon;
              return (
                <div
                  key={topic.slug}
                  onClick={() => onSelectCategory(topic.slug, topic.dimCode)}
                  className="bg-white rounded-2xl p-4 border border-stone-200 hover:border-ceylon-600 shadow-xs hover:shadow-sm cursor-pointer transition-all flex flex-col items-center text-center space-y-2 group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 ${topic.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-ink-950 group-hover:text-ceylon-700 transition-colors">
                      {topic.nameEn}
                    </div>
                    <div className="text-[11px] font-sinhala-sans text-stone-600 mt-0.5">
                      {topic.nameSi}
                    </div>
                    <div className="text-[10px] font-tamil text-stone-500">
                      {topic.nameTa}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recently Added Vocabulary */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-ink-950 flex items-center gap-2">
                <Clock className="w-5 h-5 text-ceylon-700" />
                Recently Added Words
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Freshly documented and verified trilingual vocabulary.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('explorer')}
              className="text-xs font-bold text-ceylon-700 hover:text-ceylon-900 inline-flex items-center gap-1"
            >
              View Full Dictionary <ArrowRight className="w-4 h-4" />
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
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink-950 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-leaf-700" />
              Essential Vocabulary
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Fundamental headwords for everyday fluency and cross-cultural understanding.
            </p>
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

        {/* Simple, Non-Intrusive AI Language Assistance Note */}
        <section className="bg-[#F8F5EE] rounded-2xl border border-stone-200/90 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Intelligent Verification
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-ink-950">
              AI-powered language assistance to help you learn authentic Sinhala.
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              We continuously cross-verify definitions, inflections, and contextual example sentences
              against accredited linguistic references, ensuring you learn accurate, natural Sinhala.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('technology')}
            className="px-5 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-ink-900 font-bold text-xs sm:text-sm transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
          >
            How our AI technology works <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      </div>
    </div>
  );
};
