import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { DimensionGroup, UILanguage, VocabularySummary } from '../types';
import { WordCard } from './WordCard';
import { Button } from './ui/Button';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Alphabetical & Orthographic Browser */}
      <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-ink-950 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-ceylon-700" />
              Sinhala Orthographic & 9-Dimension Vocabulary Explorer
            </h1>
            <p className="text-xs text-stone-600 mt-0.5">
              Browse by authentic Sinhala Hodiya alphabetical ordering (ස්වර → ව්‍යඤ්ජන), Romanized
              A–Z, or multi-dimensional categories.
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200">
            <button
              type="button"
              onClick={() => {
                setAlphabetMode('sinhala');
                setSelectedLetterRoman('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                alphabetMode === 'sinhala'
                  ? 'bg-ceylon-700 text-white shadow-sm'
                  : 'text-stone-700 hover:text-ink-950'
              }`}
            >
              සිංහල හෝඩිය (Sinhala Order: අ → ෆ)
            </button>
            <button
              type="button"
              onClick={() => {
                setAlphabetMode('roman');
                setSelectedLetterSi('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                alphabetMode === 'roman'
                  ? 'bg-ceylon-700 text-white shadow-sm'
                  : 'text-stone-700 hover:text-ink-950'
              }`}
            >
              Romanized (A → Z)
            </button>
          </div>
        </div>

        {alphabetMode === 'sinhala' ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setSelectedLetterSi('');
                setPage(1);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                !selectedLetterSi
                  ? 'bg-ink-900 text-white border-ink-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
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
                  className={`px-2.5 py-1 rounded-lg border text-sm font-sinhala-sans font-bold flex items-center gap-1 transition-colors ${
                    active
                      ? 'bg-ceylon-700 text-white border-ceylon-700 shadow-sm'
                      : item.count > 0
                      ? 'bg-[#FAF6F0] text-ink-950 border-ceylon-200 hover:bg-ceylon-100'
                      : 'bg-stone-50 text-stone-400 border-stone-200/60 hover:bg-stone-100'
                  }`}
                >
                  <span>{item.letter}</span>
                  {item.count > 0 && (
                    <span
                      className={`text-[10px] font-mono ${
                        active ? 'text-amber-200' : 'text-ceylon-700'
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
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setSelectedLetterRoman('');
                setPage(1);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${
                !selectedLetterRoman
                  ? 'bg-ink-900 text-white border-ink-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200'
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
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1 ${
                    active
                      ? 'bg-ceylon-700 text-white border-ceylon-700'
                      : item.count > 0
                      ? 'bg-[#FAF6F0] text-ink-950 border-ceylon-200 hover:bg-ceylon-100'
                      : 'bg-stone-50 text-stone-400 border-stone-200/60'
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

      {/* Main Explorer Grid: Left Sidebar (Expandable 9-Dimension Category Tree) + Right Search & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Expandable Hierarchical Category Tree */}
        <aside className="lg:col-span-1 bg-white rounded-2xl border border-stone-200 p-4 shadow-sm h-fit max-h-[820px] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200">
            <h2 className="text-sm font-extrabold text-ink-950 uppercase tracking-wider">
              9-Dimension Taxonomy
            </h2>
            {(selectedCategory || selectedDimension) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedDimension('');
                }}
                className="text-xs text-ceylon-700 font-semibold hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-2">
            {dimensions.map((dim) => {
              const isExpanded = Boolean(expandedDims[dim.code]);
              const isDimSelected = selectedDimension === dim.code && !selectedCategory;

              return (
                <div
                  key={dim.code}
                  className="rounded-xl border border-stone-200/80 overflow-hidden"
                >
                  <div
                    className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors ${
                      isDimSelected ? 'bg-ceylon-100 text-ceylon-950' : 'bg-[#FAF7F2] hover:bg-stone-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDim(dim.code)}
                      className="flex items-center gap-2 text-left flex-1"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-ceylon-700 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-stone-500 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-ink-950">
                          {dim.code}. {dim.nameEn}
                        </div>
                        <div className="text-[11px] text-stone-600 font-sinhala-sans">
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
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-700 hover:border-ceylon-600"
                    >
                      All ({dim.categories.length})
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-2 bg-white divide-y divide-stone-100 max-h-64 overflow-y-auto">
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
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 text-xs transition-colors ${
                              isCatSelected
                                ? 'bg-ceylon-700 text-white font-bold'
                                : 'text-ink-900 hover:bg-stone-100'
                            }`}
                          >
                            <div className="truncate">
                              <div>{cat.name_en}</div>
                              <div
                                className={`text-[11px] truncate ${
                                  isCatSelected ? 'text-amber-100' : 'text-stone-500'
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
                                  ? 'bg-ceylon-50 text-ceylon-800 font-bold'
                                  : 'bg-stone-100 text-stone-400'
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
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  id="explorer-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Filter by Sinhala word, Tamil meaning, English meaning, Romanized pronunciation, or subject..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-ceylon-600"
                />
              </div>

              <select
                value={langScope}
                onChange={(e) => setLangScope(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-stone-50 text-ink-900"
              >
                <option value="all">All Languages (සිං / தமிழ் / EN)</option>
                <option value="si">Sinhala Script Only</option>
                <option value="ta">Tamil Meaning Only</option>
                <option value="en">English Meaning Only</option>
                <option value="roman">Romanized Pronunciation</option>
              </select>

              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-xs font-semibold text-stone-700"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-stone-100">
              <select
                value={selectedPos}
                onChange={(e) => {
                  setSelectedPos(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white text-ink-900"
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
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white text-ink-900"
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
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white text-ink-900"
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
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white text-ink-900"
              >
                <option value="">All Verification States</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="SOURCE_SUPPORTED">Source-Supported</option>
                <option value="AI_SUGGESTION">AI Suggestion</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold bg-[#FAF6F0] text-ceylon-900"
              >
                <option value="sinhala_asc">Sort: Sinhala Orthographic (අ → ෆ)</option>
                <option value="roman_asc">Sort: Romanized (A → Z)</option>
                <option value="confidence">Sort: Confidence Score</option>
                <option value="popular">Sort: Most Viewed</option>
                <option value="newest">Sort: Recently Added</option>
              </select>
            </div>

            {/* Active Filter Summary Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
              <div className="flex flex-wrap items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-ceylon-700" />
                <span>
                  Showing <strong className="text-ink-950">{entries.length}</strong> of{' '}
                  <strong className="text-ink-950">{pagination.total}</strong> matching vocabulary
                  entries
                </span>
                {selectedLetterSi && (
                  <span className="px-2 py-0.5 rounded bg-ceylon-100 text-ceylon-900 font-bold">
                    Letter: {selectedLetterSi}
                  </span>
                )}
                {selectedCategory && (
                  <span className="px-2 py-0.5 rounded bg-ceylon-100 text-ceylon-900 font-bold">
                    Category: {selectedCategory}
                  </span>
                )}
                {selectedDimension && (
                  <span className="px-2 py-0.5 rounded bg-ceylon-100 text-ceylon-900 font-bold">
                    Dimension: {selectedDimension}
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
                  className="h-44 rounded-xl bg-white border border-stone-200 p-5 animate-pulse"
                />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-4">
              <p className="text-base font-bold text-ink-950">
                No exact vocabulary matches found for current filters.
              </p>
              {fuzzySuggestions.length > 0 && (
                <div className="max-w-lg mx-auto p-4 rounded-xl bg-amber-50 border border-amber-200 text-left">
                  <div className="text-xs font-bold text-amber-900 uppercase flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    Did you mean (Fuzzy Trigram Similarity Matches):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {fuzzySuggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onSelectWord(s.id)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-ink-950 hover:bg-amber-100"
                      >
                        <span className="font-sinhala-sans font-bold">{s.sinhala_word}</span> (
                        {s.romanized_pronunciation}) — {s.primary_english_translation}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-2">
                <Button variant="primary" size="sm" onClick={resetAllFilters}>
                  Reset Search & Filters
                </Button>
              </div>
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

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-stone-200 pt-4 px-2">
                  <div className="text-xs text-stone-500">
                    Page <strong className="text-ink-900">{page}</strong> of{' '}
                    <strong className="text-ink-900">{pagination.totalPages}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => {
                        setPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => {
                        setPage((p) => Math.min(pagination.totalPages, p + 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
