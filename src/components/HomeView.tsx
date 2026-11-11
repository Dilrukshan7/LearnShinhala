import React, { useState, useEffect } from 'react';
import {
  Search,
  Volume2,
  BookOpen,
  Layers,
  GraduationCap,
  ArrowRight,
  Clock,
  TrendingUp,
  Keyboard,
  Globe2,
  MessageCircle,
  Coffee,
  Plane,
  Heart,
  Cpu,
} from 'lucide-react';
import { UILanguage, VocabularySummary } from '../types';
import { WordCard } from './WordCard';
import { speakText } from '../utils/speech';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

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
  },
  {
    nameSi: 'ආහාර පාන',
    nameTa: 'உணவு & பானங்கள்',
    nameEn: 'Food & Dining',
    slug: 'food-beverages',
    dimCode: 'E',
    icon: Coffee,
  },
  {
    nameSi: 'ගමනාගමනය',
    nameTa: 'பயணம் & போக்குவரத்து',
    nameEn: 'Travel & Transport',
    slug: 'transportation',
    dimCode: 'E',
    icon: Plane,
  },
  {
    nameSi: 'පවුල සහ සබඳතා',
    nameTa: 'குடும்பம் & உறவுகள்',
    nameEn: 'Family & Relations',
    slug: 'family-relationships',
    dimCode: 'E',
    icon: Heart,
  },
  {
    nameSi: 'විද්‍යාව සහ තාක්ෂණය',
    nameTa: 'அறிவியல் & தொழில்நுட்பம்',
    nameEn: 'Technology & AI',
    slug: 'artificial-intelligence',
    dimCode: 'D',
    icon: Cpu,
  },
  {
    nameSi: 'පාසල සහ අධ්‍යාපනය',
    nameTa: 'பள்ளி & கல்வி',
    nameEn: 'Education & Study',
    slug: 'school',
    dimCode: 'C',
    icon: GraduationCap,
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

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Clean, Focused Hero Section */}
      <section className="bg-white border-b border-stone-200 pt-10 sm:pt-14 pb-12 sm:pb-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          {/* Subtle Category Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-xs text-stone-700">
            <Globe2 className="w-3.5 h-3.5 text-stone-500" />
            <span>Trilingual Language Platform</span>
            <span className="text-stone-300">•</span>
            <span className="font-sinhala-sans font-semibold">සිංහල</span>
            <span className="text-stone-300">•</span>
            <span className="font-tamil font-semibold">தமிழ்</span>
            <span className="text-stone-300">•</span>
            <span>English</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink-950 tracking-tight leading-tight">
            Learn Sinhala with <span className="text-ceylon-700 font-serif">Clarity</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-600 leading-relaxed">
            Authentic Sinhala vocabulary with instant Tamil and English translations,
            native audio pronunciation, and interactive practice flashcards.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              leftIcon={<GraduationCap className="w-4 h-4" />}
              onClick={() => onNavigateTab('learning')}
            >
              Start Practicing
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<BookOpen className="w-4 h-4 text-ceylon-700" />}
              onClick={() => onNavigateTab('explorer')}
            >
              Browse Dictionary
            </Button>
          </div>

          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto pt-4 text-left">
            {/* Scope Filter Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2.5">
              {[
                { id: 'all', label: 'All Languages' },
                { id: 'si', label: 'සිංහල අකුරෙන්' },
                { id: 'ta', label: 'தமிழ்' },
                { id: 'en', label: 'English' },
                { id: 'roman', label: 'Singlish (vatura)' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSearchScope(item.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    searchScope === item.id
                      ? 'bg-ink-900 text-white shadow-xs'
                      : 'bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleFormSubmit}
              className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-xs border border-stone-300 focus-within:border-ceylon-700 focus-within:ring-2 focus-within:ring-ceylon-700/20 transition-all"
            >
              <div className="flex items-center flex-1 px-2.5">
                <Search className="w-4 h-4 text-stone-400 shrink-0 mr-2.5" />
                <input
                  id="hero-trilingual-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search a word in Sinhala, Tamil, English, or Singlish (e.g. ayubowan)..."
                  className="w-full text-xs sm:text-sm text-ink-950 placeholder:text-stone-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-stone-400 hover:text-stone-700 px-1.5"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                  title="Toggle Sinhala Script Keyboard"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                    showVirtualKeyboard
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5 text-stone-600" />
                  <span className="hidden sm:inline">සිංහල යතුරු</span>
                </button>

                <Button type="submit" size="sm">
                  Search
                </Button>
              </div>
            </form>

            {/* Virtual Sinhala Keyboard */}
            {showVirtualKeyboard && (
              <div className="mt-2 p-3 rounded-xl bg-white border border-stone-200 shadow-md">
                <div className="text-[11px] text-stone-600 font-semibold mb-2 flex items-center justify-between">
                  <span>Click any letter to type Sinhala directly:</span>
                  <button
                    type="button"
                    onClick={() => setShowVirtualKeyboard(false)}
                    className="text-stone-400 hover:text-stone-700 text-xs"
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
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-stone-50 hover:bg-ceylon-50 hover:text-ceylon-900 text-ink-950 font-sinhala-sans font-bold text-xs sm:text-sm flex items-center justify-center border border-stone-200 transition-colors"
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trilingual Autocomplete Dropdown */}
            {(autocompleteResults.length > 0 || spellingSuggestions.length > 0) && (
              <div className="absolute left-0 right-0 mt-2 bg-white text-ink-950 rounded-xl shadow-lg border border-stone-200 overflow-hidden z-30">
                {autocompleteResults.length > 0 && (
                  <div className="divide-y divide-stone-100">
                    {autocompleteResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectWord(item.id)}
                        className="w-full px-4 py-2.5 hover:bg-stone-50 flex items-center justify-between gap-4 transition-colors text-left"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold font-sinhala-serif text-ink-950">
                              {item.sinhala_word}
                            </span>
                            <span className="text-xs font-mono text-stone-500">
                              /{item.romanized_pronunciation}/
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold">
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
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                      </button>
                    ))}
                  </div>
                )}

                {spellingSuggestions.length > 0 && (
                  <div className="p-2.5 bg-amber-50/70 border-t border-amber-200">
                    <div className="text-[11px] font-bold uppercase text-amber-900 mb-1">
                      Did you mean:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {spellingSuggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => onSelectWord(s.id)}
                          className="px-2 py-0.5 rounded bg-white border border-amber-300 text-xs font-semibold text-ink-900 hover:bg-amber-100"
                        >
                          {s.sinhala_word} ({s.romanized_pronunciation}) — {s.primary_english_translation}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick suggested searches */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-stone-500 pt-2.5">
              <span>Try searching:</span>
              {['ආයුබෝවන්', 'විශ්වවිද්‍යාලය', 'வணக்கம்', 'water', 'vatura'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => onSearchSubmit(sample, 'all')}
                  className="px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Simple Highlights Bar */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 text-ceylon-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-ink-950">
                {counts.total_entries ?? 35}+
              </div>
              <div className="text-xs text-stone-500 font-medium">Verified Words</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 text-leaf-800 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-ink-950">
                {counts.total_categories ?? 170}+
              </div>
              <div className="text-xs text-stone-500 font-medium">Curated Topics</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 text-amber-800 flex items-center justify-center shrink-0">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-ink-950">3 Languages</div>
              <div className="text-xs text-stone-500 font-medium">Sinhala • Tamil • English</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 text-sky-800 flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-ink-950">Audio Included</div>
              <div className="text-xs text-stone-500 font-medium">Spoken Pronunciation</div>
            </div>
          </div>
        </section>

        {/* Word of the Day & Practice Deck */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {dailyWord && (
            <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between">
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="brand" size="sm">
                    Word of the Day • දවසේ වචනය
                  </Badge>
                  <span className="text-xs text-stone-500 font-medium">
                    Part of Speech: <strong className="text-ink-900">{dailyWord.part_of_speech}</strong>
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h2
                      onClick={() => onSelectWord(dailyWord.id)}
                      className="text-3xl sm:text-4xl font-extrabold font-sinhala-serif text-ink-950 hover:text-ceylon-700 cursor-pointer transition-colors"
                    >
                      {dailyWord.sinhala_word}
                    </h2>
                    <button
                      type="button"
                      aria-label="Listen to pronunciation"
                      onClick={() =>
                        speakText(
                          dailyWord.sinhala_word,
                          'si-LK',
                          dailyWord.romanized_pronunciation
                        )
                      }
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                      title="Listen to native pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm font-mono text-stone-500 mt-1">
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
                  <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-stone-200">
                    <span className="text-[10px] font-bold uppercase text-ceylon-800 block mb-0.5">
                      Tamil Translation (தமிழ்)
                    </span>
                    <span className="text-sm sm:text-base font-bold font-tamil text-ink-950">
                      {dailyWord.primary_tamil_translation}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200">
                    <span className="text-[10px] font-bold uppercase text-stone-600 block mb-0.5">
                      English Meaning
                    </span>
                    <span className="text-sm sm:text-base font-bold text-ink-950">
                      {dailyWord.primary_english_translation}
                    </span>
                  </div>
                </div>

                {/* Contextual Sentence */}
                {Array.isArray(dailyWord.examples) && dailyWord.examples.length > 0 && (
                  <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-xs space-y-1">
                    <div className="font-sinhala-sans font-bold text-ink-950">
                      “{dailyWord.examples[0].sinhala_sentence}”
                    </div>
                    <div className="font-tamil text-stone-700 text-xs">
                      தமிழ்: {dailyWord.examples[0].tamil_translation}
                    </div>
                    <div className="text-stone-600 text-xs">
                      English: {dailyWord.examples[0].english_translation}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Difficulty: <strong className="text-ink-900">{dailyWord.difficulty_level}</strong>
                </span>
                <button
                  onClick={() => onSelectWord(dailyWord.id)}
                  className="text-xs font-bold text-ceylon-700 hover:text-ceylon-900 inline-flex items-center gap-1"
                >
                  View Full Word Entry <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Learning Collections Launchpad */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-ink-950 font-bold text-base mb-1">
                <GraduationCap className="w-5 h-5 text-leaf-800" />
                Practice Sessions
              </div>
              <p className="text-xs text-stone-600 mb-4">
                Reinforce vocabulary retention with flashcards, quizzes, and sentence exercises.
              </p>

              <div className="space-y-2.5">
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
                    className="p-3 rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-sinhala-sans font-bold text-xs sm:text-sm text-ink-950">
                        {col.titleSi}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                        {col.badge}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-stone-600 mt-0.5">{col.titleEn}</div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="secondary"
              size="md"
              className="mt-5 w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onNavigateTab('learning')}
            >
              Start Flashcards & Quizzes
            </Button>
          </div>
        </section>

        {/* Browse by Popular Topics */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-ink-950">
                Explore by Topic
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Quickly discover vocabulary tailored to everyday communication and knowledge domains.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('explorer')}
              className="text-xs font-bold text-ceylon-700 hover:text-ceylon-900 inline-flex items-center gap-1"
            >
              All Categories <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {POPULAR_TOPICS.map((topic) => {
              const Icon = topic.icon;
              return (
                <div
                  key={topic.slug}
                  onClick={() => onSelectCategory(topic.slug, topic.dimCode)}
                  className="bg-white rounded-xl p-3.5 border border-stone-200 hover:border-stone-400 shadow-xs cursor-pointer transition-all flex flex-col items-center text-center space-y-2 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center transition-transform group-hover:scale-105">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-ink-950 group-hover:text-ceylon-700 transition-colors">
                      {topic.nameEn}
                    </div>
                    <div className="text-[11px] font-sinhala-sans text-stone-500 mt-0.5">
                      {topic.nameSi}
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
              <h2 className="text-lg sm:text-xl font-bold text-ink-950 flex items-center gap-2">
                <Clock className="w-4 h-4 text-ceylon-700" />
                Recently Added Words
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
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
            <h2 className="text-lg sm:text-xl font-bold text-ink-950 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-leaf-800" />
              Essential Vocabulary
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
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

        {/* Simple AI Language Assistance Note */}
        <section className="bg-stone-50 rounded-xl border border-stone-200 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl text-left">
            <h3 className="text-sm sm:text-base font-bold text-ink-950">
              AI-assisted language verification
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We cross-verify definitions, inflections, and contextual example sentences
              against accredited linguistic references, ensuring you learn accurate Sinhala.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => onNavigateTab('technology')}
          >
            How our AI works
          </Button>
        </section>
      </div>
    </div>
  );
};
