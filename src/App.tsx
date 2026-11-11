import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Compass,
  GraduationCap,
  PlusCircle,
  ShieldCheck,
  Globe,
  Sparkles,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { UILanguage } from './types';
import { HomeView } from './components/HomeView';
import { ExplorerView } from './components/ExplorerView';
import { WordDetailView } from './components/WordDetailView';
import { LearningView } from './components/LearningView';
import { ContributeView } from './components/ContributeView';
import { AdminView } from './components/AdminView';

type ActiveTab = 'home' | 'explorer' | 'learning' | 'contribute' | 'admin' | 'word-detail';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [previousTab, setPreviousTab] = useState<ActiveTab>('home');
  const [uiLang, setUiLang] = useState<UILanguage>('all');
  const [stats, setStats] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Explorer navigation parameters
  const [explorerQuery, setExplorerQuery] = useState('');
  const [explorerLangScope, setExplorerLangScope] = useState('all');
  const [explorerCategorySlug, setExplorerCategorySlug] = useState('');
  const [explorerDimensionCode, setExplorerDimensionCode] = useState('');

  // Word detail parameter
  const [selectedWordParam, setSelectedWordParam] = useState<number | string | null>(null);

  // Contribute prefill
  const [contribWord, setContribWord] = useState('');
  const [contribEntryId, setContribEntryId] = useState<number | null>(null);

  const fetchStats = () => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleOpenWordDetail = (idOrWord: number | string) => {
    if (activeTab !== 'word-detail') {
      setPreviousTab(activeTab);
    }
    setSelectedWordParam(idOrWord);
    setActiveTab('word-detail');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchFromHome = (query: string, langScope = 'all') => {
    setExplorerQuery(query);
    setExplorerLangScope(langScope);
    setExplorerCategorySlug('');
    setExplorerDimensionCode('');
    setActiveTab('explorer');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (slug: string, dimensionCode = '') => {
    setExplorerQuery('');
    setExplorerCategorySlug(slug);
    setExplorerDimensionCode(dimensionCode);
    setActiveTab('explorer');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'home', label: 'Encyclopedia', icon: BookOpen },
    { id: 'explorer', label: 'Explorer & Taxonomy', icon: Compass },
    { id: 'learning', label: 'Practice & Cards', icon: GraduationCap },
    { id: 'contribute', label: 'Contribute', icon: PlusCircle },
    { id: 'admin', label: 'AI Engine & Review', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-ink-950">
      {/* Editorial Global Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-parchment-300 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Seal & Monogram */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 text-left group focus-ring rounded-lg p-1 -ml-1 transition-opacity hover:opacity-95"
            aria-label="Sinhala Vocabulary Encyclopedia Home"
          >
            <div className="w-10 h-10 rounded-lg bg-ceylon-700 text-white flex items-center justify-center font-sinhala-serif font-bold text-xl shadow-subtle border border-ceylon-800 transition-transform group-hover:scale-[1.02]">
              සිං
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-ink-950 tracking-tight font-sinhala-serif">
                  සිංහල ශබ්දකෝෂ විශ්වකෝෂය
                </span>
                <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-forest-50 text-forest-700 border border-forest-200">
                  {stats?.counts?.total_entries ?? 35}+ Verified Entries
                </span>
              </div>
              <div className="text-[11px] text-ink-500 font-medium hidden sm:block">
                Sinhala • <span className="font-tamil text-ink-600">தமிழ்</span> • English Trilingual Linguistic Archive
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (activeTab === 'word-detail' && item.id === 'explorer');
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  type="button"
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all focus-ring ${
                    isActive
                      ? 'bg-ceylon-700 text-white shadow-subtle'
                      : 'text-ink-700 hover:text-ink-950 hover:bg-parchment-200'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Trilingual Segment Control & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-parchment-200/80 p-0.5 rounded-lg border border-parchment-300">
              <Globe className="w-3.5 h-3.5 text-ink-500 ml-1.5 shrink-0" />
              {[
                { id: 'all', label: 'සිං • தமிழ் • EN' },
                { id: 'ta', label: 'සිං + தமிழ்' },
                { id: 'en', label: 'සිං + EN' },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setUiLang(l.id as UILanguage)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all focus-ring ${
                    uiLang === l.id
                      ? 'bg-white text-ink-950 shadow-subtle'
                      : 'text-ink-600 hover:text-ink-950'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-ink-700 hover:text-ink-950 hover:bg-parchment-200 focus-ring"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-parchment-300 bg-white px-4 py-3 space-y-2 shadow-dropdown">
            <div className="flex sm:hidden items-center justify-between gap-1 pb-2 border-b border-parchment-200">
              <span className="text-xs font-semibold text-ink-600">Language Script:</span>
              <div className="flex items-center gap-1 bg-parchment-100 p-0.5 rounded-md border border-parchment-300">
                {[
                  { id: 'all', label: 'All 3' },
                  { id: 'ta', label: 'සිං + தமிழ்' },
                  { id: 'en', label: 'සිං + EN' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setUiLang(l.id as UILanguage)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold ${
                      uiLang === l.id ? 'bg-white text-ink-950 shadow-subtle' : 'text-ink-600'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id as ActiveTab);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 text-left transition-colors ${
                      isActive
                        ? 'bg-ceylon-700 text-white'
                        : 'text-ink-800 hover:bg-parchment-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Presentation View */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            stats={stats}
            uiLang={uiLang}
            onSearchSubmit={handleSearchFromHome}
            onSelectWord={handleOpenWordDetail}
            onSelectCategory={handleSelectCategory}
            onNavigateTab={(t) => setActiveTab(t)}
          />
        )}

        {activeTab === 'explorer' && (
          <ExplorerView
            uiLang={uiLang}
            initialQuery={explorerQuery}
            initialLangScope={explorerLangScope}
            initialCategorySlug={explorerCategorySlug}
            initialDimensionCode={explorerDimensionCode}
            onSelectWord={handleOpenWordDetail}
          />
        )}

        {activeTab === 'word-detail' && selectedWordParam !== null && (
          <WordDetailView
            wordIdOrText={selectedWordParam}
            uiLang={uiLang}
            onBack={() => setActiveTab(previousTab === 'word-detail' ? 'explorer' : previousTab)}
            onSelectWord={handleOpenWordDetail}
            onSelectCategory={(slug) => handleSelectCategory(slug)}
            onOpenContributeForWord={(w, id) => {
              setContribWord(w);
              setContribEntryId(id);
              setActiveTab('contribute');
            }}
          />
        )}

        {activeTab === 'learning' && (
          <LearningView onSelectWord={handleOpenWordDetail} />
        )}

        {activeTab === 'contribute' && (
          <ContributeView
            initialSinhalaWord={contribWord}
            initialTargetEntryId={contribEntryId}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            onSelectWord={handleOpenWordDetail}
            onStatsUpdated={fetchStats}
          />
        )}
      </main>

      {/* Archival Preservation Institutional Footer */}
      <footer className="bg-ink-950 text-parchment-200 border-t border-ink-900 py-10 px-4 sm:px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 text-xs">
          <div className="space-y-2 max-w-2xl">
            <div className="font-bold text-white flex items-center gap-2 text-sm font-sinhala-serif">
              <ShieldCheck className="w-4 h-4 text-forest-400 shrink-0" />
              මහා සිංහල ශබ්දකෝෂ විශ්වකෝෂය • Complete Sinhala Vocabulary Encyclopedia
            </div>
            <p className="text-parchment-400 leading-relaxed">
              An open, continuously expanding trilingual linguistic preservation platform. All
              entries are verified against public-domain historical dictionaries (Carter 1924, Clough 1892),
              academic glossaries, and native linguist review. No artificial vocabulary cap is imposed,
              and AI-discovered candidates are strictly quarantined until verified.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-parchment-300 font-medium">
            <button
              onClick={() => {
                setActiveTab('explorer');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors focus-ring rounded"
            >
              Orthographic Index (අ → ෆ)
            </button>
            <span className="text-ink-700">•</span>
            <button
              onClick={() => {
                setActiveTab('learning');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors focus-ring rounded"
            >
              Trilingual Exercises
            </button>
            <span className="text-ink-700">•</span>
            <button
              onClick={() => {
                setActiveTab('contribute');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors focus-ring rounded"
            >
              Linguistic Contributions
            </button>
            <span className="text-ink-700">•</span>
            <button
              onClick={() => {
                setActiveTab('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors focus-ring rounded"
            >
              10-Stage Pipeline
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
