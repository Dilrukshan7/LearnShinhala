import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  X,
  ChevronLeft,
} from 'lucide-react';
import { DimensionGroup, UILanguage, VocabularySummary } from '../types';
import { WordCard } from './WordCard';

interface ExplorerViewProps {
  uiLang: UILanguage;
  initialQuery?: string;
  initialLangScope?: string;
  initialCategorySlug?: string;
  initialDimensionCode?: string;
  onSelectWord: (idOrWord: number | string) => void;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  uiLang,
  initialQuery = '',
  initialLangScope = 'all',
  initialCategorySlug = '',
  initialDimensionCode = '',
  onSelectWord,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [langScope, setLangScope] = useState(initialLangScope || 'all');
  const [selectedCategory, setSelectedCategory] = useState(initialCategorySlug);
  const [selectedDimension, setSelectedDimension] = useState(initialDimensionCode);
  const [selectedPos, setSelectedPos] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRegister, setSelectedRegister] = useState('');
  const [selectedLetterSi, setSelectedLetterSi] = useState('');
  const [selectedLetterRoman, setSelectedLetterRoman] = useState('');
  const [alphabetMode, setAlphabetMode] = useState<'sinhala' | 'roman'>('sinhala');
  const [sortBy, setSortBy] = useState('sinhala_asc');
  const [page, setPage] = useState(1);

  const [dimensions, setDimensions] = useState<DimensionGroup[]>([]);
  const [expandedDims, setExpandedDims] = useState<Record<string, boolean>>({
    A: true,
    B: true,
    C: false,
    D: true,
    E: false,
    F: false,
    G: false,
    H: false,
    I: true,
  });

  const [sinhalaAlphabet, setSinhalaAlphabet] = useState<any[]>([]);
  const [romanAlphabet, setRomanAlphabet] = useState<any[]>([]);
  const [entries, setEntries] = useState<VocabularySummary[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 24, totalPages: 1 });
  const [fuzzySuggestions, setFuzzySuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQuery(initialQuery);
    if (initialLangScope) setLangScope(initialLangScope);
    setSelectedCategory(initialCategorySlug);
    setSelectedDimension(initialDimensionCode);
  }, [initialQuery, initialLangScope, initialCategorySlug, initialDimensionCode]);

  // Load 9-dimension categories and Sinhala/Roman alphabet distributions
  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/vocabulary/alphabet').then((r) => r.json()),
    ])
      .then(([catData, alphaData]) => {
        setDimensions(catData.dimensions || []);
        setSinhalaAlphabet(alphaData.sinhalaAlphabet || []);
        setRomanAlphabet(alphaData.romanAlphabet || []);
      })
      .catch(() => {});
  }, []);

  // Load filtered vocabulary entries
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (langScope && langScope !== 'all') params.set('lang', langScope);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedDimension) params.set('dimension', selectedDimension);
    if (selectedPos) params.set('pos', selectedPos);
    if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedRegister) params.set('register', selectedRegister);
    if (selectedLetterSi) params.set('letterSi', selectedLetterSi);
    if (selectedLetterRoman) params.set('letterRoman', selectedLetterRoman);
    if (sortBy) params.set('sort', sortBy);
    params.set('page', String(page));
    params.set('limit', '24');

    fetch(`/api/vocabulary?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries || []);
        setPagination(data.pagination || { total: 0, page: 1, limit: 24, totalPages: 1 });
        setFuzzySuggestions(data.fuzzySuggestions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [
    query,
    langScope,
    selectedCategory,
    selectedDimension,
    selectedPos,
    selectedDifficulty,
    selectedStatus,
    selectedRegister,
    selectedLetterSi,
    selectedLetterRoman,
    sortBy,
    page,
  ]);

  const resetAllFilters = () => {
    setQuery('');
    setLangScope('all');
    setSelectedCategory('');
    setSelectedDimension('');
    setSelectedPos('');
    setSelectedDifficulty('');
    setSelectedStatus('');
    setSelectedRegister('');
    setSelectedLetterSi('');
    setSelectedLetterRoman('');
    setSortBy('sinhala_asc');
    setPage(1);
  };

  const toggleDim = (code: string) => {
    setExpandedDims((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Alphabetical & Orthographic Browser */}
      <section className="bg-white rounded-xl border border-parchment-300 p-5 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-ink-950 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-ceylon-700 shrink-0" />
              <span>Orthographic Index & Category Taxonomy</span>
            </h1>
            <p className="text-xs text-ink-600 mt-0.5">
              Browse headwords in authentic Sinhala Hodiya orthographic sequence (ස්වර → ව්‍යඤ්ජන), Romanized alphabet, or 9 structured dimensions.
            </p>
          </div>

          <div className="inline-flex rounded-lg bg-parchment-100 p-0.5 border border-parchment-300">
            <button
              type="button"
              onClick={() => {
                setAlphabetMode('sinhala');
                setSelectedLetterRoman('');
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all focus-ring ${
                alphabetMode === 'sinhala'
                  ? 'bg-ceylon-700 text-white shadow-subtle'
                  : 'text-ink-700 hover:text-ink-950'
              }`}
            >
              සිංහල හෝඩිය (අ → ෆ)
            </button>
            <button
              type="button"
              onClick={() => {
                setAlphabetMode('roman');
                setSelectedLetterSi('');
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all focus-ring ${
                alphabetMode === 'roman'
                  ? 'bg-ceylon-700 text-white shadow-subtle'
                  : 'text-ink-700 hover:text-ink-950'
              }`}
            >
              Romanized (A → Z)
            </button>
          </div>
        </div>

        {alphabetMode === 'sinhala' ? (
          <div className="flex flex-wrap gap-1 pt-1" aria-label="Sinhala Alphabet Filter">
            <button
              type="button"
              onClick={() => {
                setSelectedLetterSi('');
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors focus-ring ${
                !selectedLetterSi
                  ? 'bg-ink-950 text-white border-ink-950'
                  : 'bg-parchment-50 text-ink-700 border-parchment-300 hover:bg-parchment-100'
              }`}
            >
              සියල්ල (All)
            </button>
            {sinhalaAlphabet.map((item) => {
              const active = selectedLetterSi === item.letter;
              return (
                <button
                  key={item.letter}
                  type="button"
                  onClick={() => {
                    setSelectedLetterSi(active ? '' : item.letter);
                    setPage(1);
                  }}
                  title={`${item.letter} (${item.roman} / ${item.tamilApprox}) — ${item.count} words`}
                  className={`px-2 py-1 rounded-md border text-xs font-sinhala-sans font-bold flex items-center gap-1 transition-all focus-ring ${
                    active
                      ? 'bg-ceylon-700 text-white border-ceylon-700 shadow-subtle'
                      : item.count > 0
                      ? 'bg-parchment-50 text-ink-950 border-parchment-300 hover:bg-ceylon-50 hover:border-ceylon-300'
                      : 'bg-white text-ink-400 border-parchment-200 hover:bg-parchment-50'
                  }`}
                >
                  <span>{item.letter}</span>
                  {item.count > 0 && (
                    <span
                      className={`text-[10px] font-mono ${
                        active ? 'text-amber-100' : 'text-ceylon-700'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1 pt-1" aria-label="Romanized Alphabet Filter">
            <button
              type="button"
              onClick={() => {
                setSelectedLetterRoman('');
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors focus-ring ${
                !selectedLetterRoman
                  ? 'bg-ink-950 text-white border-ink-950'
                  : 'bg-parchment-50 text-ink-700 border-parchment-300 hover:bg-parchment-100'
              }`}
            >
              All A–Z
            </button>
            {romanAlphabet.map((item) => {
              const active = selectedLetterRoman === item.letter;
              return (
                <button
                  key={item.letter}
                  type="button"
                  onClick={() => {
                    setSelectedLetterRoman(active ? '' : item.letter);
                    setPage(1);
                  }}
                  className={`px-2 py-1 rounded-md border text-xs font-mono font-semibold flex items-center gap-1 transition-all focus-ring ${
                    active
                      ? 'bg-ceylon-700 text-white border-ceylon-700 shadow-subtle'
                      : item.count > 0
                      ? 'bg-parchment-50 text-ink-950 border-parchment-300 hover:bg-ceylon-50'
                      : 'bg-white text-ink-400 border-parchment-200'
                  }`}
                >
                  <span>{item.letter}</span>
                  {item.count > 0 && <span className="text-[10px] opacity-75">{item.count}</span>}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Main Explorer Grid: Left Sidebar (Taxonomy Tree) + Right Search & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Sidebar: 9-Dimension Category Tree */}
        <aside className="lg:col-span-1 bg-white rounded-xl border border-parchment-300 p-4 shadow-subtle max-h-[820px] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-parchment-200">
            <h2 className="text-xs font-bold text-ink-900 uppercase tracking-wider">
              9-Dimension Taxonomy
            </h2>
            {(selectedCategory || selectedDimension) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedDimension('');
                }}
                className="text-xs text-ceylon-700 font-semibold hover:text-ceylon-900 focus-ring rounded"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {dimensions.map((dim) => {
              const isExpanded = Boolean(expandedDims[dim.code]);
              const isDimSelected = selectedDimension === dim.code && !selectedCategory;

              return (
                <div
                  key={dim.code}
                  className="rounded-lg border border-parchment-200 overflow-hidden"
                >
                  <div
                    className={`flex items-center justify-between px-2.5 py-2 cursor-pointer transition-colors ${
                      isDimSelected ? 'bg-ceylon-50 text-ceylon-950' : 'bg-parchment-50 hover:bg-parchment-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDim(dim.code)}
                      className="flex items-center gap-1.5 text-left flex-1 focus-ring rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-ceylon-700 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-ink-950">
                          {dim.code}. {dim.nameEn}
                        </div>
                        <div className="text-[10px] text-ink-500 font-sinhala-sans">
                          {dim.nameSi}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDimension(dim.code);
                        setSelectedCategory('');
                        setPage(1);
                      }}
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-parchment-300 text-ink-600 hover:border-ceylon-400 focus-ring"
                    >
                      All ({dim.categories.length})
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-1.5 bg-white divide-y divide-parchment-100 max-h-60 overflow-y-auto">
                      {dim.categories.map((cat) => {
                        const isCatSelected = selectedCategory === cat.slug;
                        return (
                          <button
                            key={cat.slug}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(isCatSelected ? '' : cat.slug);
                              setSelectedDimension('');
                              setPage(1);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between gap-2 text-xs transition-colors focus-ring ${
                              isCatSelected
                                ? 'bg-ceylon-700 text-white font-semibold'
                                : 'text-ink-800 hover:bg-parchment-100'
                            }`}
                          >
                            <div className="truncate">
                              <div>{cat.name_en}</div>
                              <div
                                className={`text-[10px] truncate ${
                                  isCatSelected ? 'text-amber-100' : 'text-ink-500'
                                }`}
                              >
                                {cat.name_si} • <span className="font-tamil">{cat.name_ta}</span>
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                                isCatSelected
                                  ? 'bg-white/20 text-white'
                                  : (cat.word_count || 0) > 0
                                  ? 'bg-parchment-100 text-ceylon-800 font-semibold'
                                  : 'bg-parchment-50 text-ink-400'
                              }`}
                            >
                              {cat.word_count || 0}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right 3 Columns: Search Controls, Filters, and Word Cards */}
        <div className="lg:col-span-3 space-y-5">
          {/* Multi-Faceted Search & Filter Panel */}
          <div className="bg-white rounded-xl border border-parchment-300 p-4 shadow-subtle space-y-3.5">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-ink-400 absolute left-3 top-2.5" />
                <input
                  id="explorer-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Filter by Sinhala, Tamil, English, Romanized pronunciation, or subject..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-parchment-300 text-xs sm:text-sm text-ink-950 focus:outline-none focus:border-ceylon-700 font-sinhala-sans focus-ring"
                />
              </div>

              <select
                value={langScope}
                onChange={(e) => setLangScope(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-parchment-300 text-xs font-semibold bg-parchment-50 text-ink-900 focus-ring"
              >
                <option value="all">All Languages (සිං • தமிழ் • EN)</option>
                <option value="si">Sinhala Script Only</option>
                <option value="ta">Tamil Meaning Only</option>
                <option value="en">English Meaning Only</option>
                <option value="roman">Romanized / Singlish</option>
              </select>

              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-parchment-300 hover:bg-parchment-100 text-xs font-semibold text-ink-700 transition-colors focus-ring"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-parchment-200">
              <select
                value={selectedPos}
                onChange={(e) => {
                  setSelectedPos(e.target.value);
                  setPage(1);
                }}
                className="px-2 py-1.5 rounded-md border border-parchment-300 text-xs bg-white text-ink-800 focus-ring"
              >
                <option value="">All Parts of Speech</option>
                <option value="Noun">Nouns (නාම පද)</option>
                <option value="Verb">Verbs (ක්‍රියා පද)</option>
                <option value="Adjective">Adjectives (නාම විශේෂණ)</option>
                <option value="Adverb">Adverbs (ක්‍රියා විශේෂණ)</option>
                <option value="Pronoun">Pronouns (සර්වනාම)</option>
                <option value="Postposition">Postpositions (නිපාත)</option>
                <option value="Interjection">Interjections (ආචාර/විස්මයාර්ථ)</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setPage(1);
                }}
                className="px-2 py-1.5 rounded-md border border-parchment-300 text-xs bg-white text-ink-800 focus-ring"
              >
                <option value="">All Difficulty Levels</option>
                <option value="Beginner">Beginner (ආරම්භක)</option>
                <option value="Elementary">Elementary (මූලික)</option>
                <option value="Intermediate">Intermediate (මධ්‍යම)</option>
                <option value="Upper intermediate">Upper Intermediate</option>
                <option value="Advanced">Advanced (උසස්)</option>
                <option value="Academic">Academic (ශාස්ත්‍රීය)</option>
                <option value="Native-level">Native-level (මව්බස)</option>
              </select>

              <select
                value={selectedRegister}
                onChange={(e) => {
                  setSelectedRegister(e.target.value);
                  setPage(1);
                }}
                className="px-2 py-1.5 rounded-md border border-parchment-300 text-xs bg-white text-ink-800 focus-ring"
              >
                <option value="">All Registers</option>
                <option value="Both">Spoken & Literary</option>
                <option value="Formal">Formal (විධිමත්)</option>
                <option value="Colloquial">Colloquial (කටවහර)</option>
                <option value="Academic">Academic (ශාස්ත්‍රීය)</option>
                <option value="Literary">Literary (සාහිත්‍යමය)</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="px-2 py-1.5 rounded-md border border-parchment-300 text-xs bg-white text-ink-800 focus-ring"
              >
                <option value="">All Verification States</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="SOURCE_SUPPORTED">Source-Supported</option>
                <option value="AI_SUGGESTION">AI Suggestion</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1.5 rounded-md border border-parchment-300 text-xs font-semibold bg-parchment-50 text-ceylon-900 focus-ring"
              >
                <option value="sinhala_asc">Sort: Orthographic (අ → ෆ)</option>
                <option value="roman_asc">Sort: Romanized (A → Z)</option>
                <option value="confidence">Sort: Confidence Score</option>
                <option value="popular">Sort: Most Viewed</option>
                <option value="newest">Sort: Recently Added</option>
              </select>
            </div>

            {/* Active Filter Summary Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-600 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-ceylon-700 shrink-0" />
                <span>
                  Showing <strong className="text-ink-950 font-mono">{entries.length}</strong> of{' '}
                  <strong className="text-ink-950 font-mono">{pagination.total}</strong> entries
                </span>
                {selectedLetterSi && (
                  <span className="px-1.5 py-0.5 rounded bg-ceylon-50 text-ceylon-800 border border-ceylon-200 font-semibold inline-flex items-center gap-1">
                    Letter: {selectedLetterSi}
                    <button onClick={() => setSelectedLetterSi('')} className="hover:text-ceylon-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="px-1.5 py-0.5 rounded bg-ceylon-50 text-ceylon-800 border border-ceylon-200 font-semibold inline-flex items-center gap-1">
                    Category: {selectedCategory}
                    <button onClick={() => setSelectedCategory('')} className="hover:text-ceylon-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedDimension && (
                  <span className="px-1.5 py-0.5 rounded bg-ceylon-50 text-ceylon-800 border border-ceylon-200 font-semibold inline-flex items-center gap-1">
                    Dimension {selectedDimension}
                    <button onClick={() => setSelectedDimension('')} className="hover:text-ceylon-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-44 rounded-xl bg-white border border-parchment-200 p-5 animate-pulse"
                />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="bg-white rounded-xl border border-parchment-300 p-8 text-center space-y-4 shadow-subtle">
              <p className="text-base font-semibold text-ink-950">
                No vocabulary headwords found matching the current search parameters.
              </p>
              {fuzzySuggestions.length > 0 && (
                <div className="max-w-lg mx-auto p-4 rounded-lg bg-amber-50/80 border border-amber-200 text-left">
                  <div className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                    Did you mean (Trigram Phonetic Suggestions):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {fuzzySuggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onSelectWord(s.id)}
                        className="px-2.5 py-1 rounded bg-white border border-amber-300 text-xs font-semibold text-ink-950 hover:bg-amber-100 focus-ring"
                      >
                        <span className="font-sinhala-sans font-bold">{s.sinhala_word}</span> (
                        {s.romanized_pronunciation}) — {s.primary_english_translation}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-2 rounded-lg bg-ceylon-700 hover:bg-ceylon-800 text-white text-xs font-semibold transition-colors focus-ring"
              >
                Reset Search & Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entries.map((word) => (
                  <WordCard
                    key={word.id}
                    word={word}
                    uiLang={uiLang}
                    onSelectWord={onSelectWord}
                    onSelectCategory={(slug) => {
                      setSelectedCategory(slug);
                      setPage(1);
                    }}
                  />
                ))}
              </div>

              {/* Accessible Pagination Navigation */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-parchment-200 text-xs text-ink-600">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-parchment-300 bg-white hover:bg-parchment-50 disabled:opacity-40 disabled:pointer-events-none focus-ring font-semibold text-ink-800"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <span className="font-mono">
                    Page <strong className="text-ink-950">{pagination.page}</strong> of{' '}
                    <strong className="text-ink-950">{pagination.totalPages}</strong>
                  </span>

                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-parchment-300 bg-white hover:bg-parchment-50 disabled:opacity-40 disabled:pointer-events-none focus-ring font-semibold text-ink-800"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
