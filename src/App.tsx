import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Compass,
  GraduationCap,
  PlusCircle,
  Globe,
  Sparkles,
  Menu,
  X,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Github,
} from 'lucide-react';
import { UILanguage } from './types';
import { HomeView } from './components/HomeView';
import { ExplorerView } from './components/ExplorerView';
import { WordDetailView } from './components/WordDetailView';
import { LearningView } from './components/LearningView';
import { ContributeView } from './components/ContributeView';
import { AdminView } from './components/AdminView';
import { AboutView } from './components/AboutView';
import { HowItWorksView } from './components/HowItWorksView';
import { TechnologyView } from './components/TechnologyView';
import { SourcesView } from './components/SourcesView';

export type ActiveTab =
  | 'home'
  | 'explorer'
  | 'learning'
  | 'contribute'
  | 'admin'
  | 'word-detail'
  | 'about'
  | 'how-it-works'
  | 'technology'
  | 'sources';

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchFromHome = (query: string, langScope = 'all') => {
    setExplorerQuery(query);
    setExplorerLangScope(langScope);
    setExplorerCategorySlug('');
    setExplorerDimensionCode('');
    setActiveTab('explorer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (slug: string, dimensionCode = '') => {
    setExplorerQuery('');
    setExplorerCategorySlug(slug);
    setExplorerDimensionCode(dimensionCode);
    setActiveTab('explorer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-ink-950 font-sans">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-ceylon-700 text-white flex items-center justify-center font-sinhala-serif font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
              සිං
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-ink-950 tracking-tight group-hover:text-ceylon-700 transition-colors">
                  LearnSinhala
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-leaf-50 text-leaf-800 border border-leaf-200">
                  {stats?.counts?.total_entries ?? 35}+ Words
                </span>
              </div>
              <div className="text-[10px] text-stone-500 hidden md:block">
                Sinhala • <span className="font-tamil">தமிழ்</span> • English
              </div>
            </div>
          </button>

          {/* Primary Learning Navigation (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'home', label: 'Home', icon: BookOpen },
              { id: 'explorer', label: 'Dictionary', icon: Compass },
              { id: 'learning', label: 'Practice & Learn', icon: GraduationCap },
              { id: 'contribute', label: 'Contribute', icon: PlusCircle },
            ].map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (activeTab === 'word-detail' && item.id === 'explorer');
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  type="button"
                  onClick={() => navigateTo(item.id as ActiveTab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? 'bg-ink-900 text-white shadow-xs'
                      : 'text-stone-700 hover:text-ink-950 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Trilingual Filter & Mobile Hamburger */}
          <div className="flex items-center gap-2">
            {/* Trilingual Display Filter */}
            <div className="hidden lg:flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <Globe className="w-3.5 h-3.5 text-stone-500 ml-1.5" />
              {[
                { id: 'all', label: 'සිං • தமிழ் • EN' },
                { id: 'ta', label: 'සිං + தமிழ்' },
                { id: 'en', label: 'සිං + EN' },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setUiLang(l.id as UILanguage)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    uiLang === l.id
                      ? 'bg-white text-ink-950 shadow-xs'
                      : 'text-stone-600 hover:text-ink-950'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100 border border-stone-200 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-3 shadow-lg">
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'home', label: 'Home', icon: BookOpen },
                { id: 'explorer', label: 'Dictionary', icon: Compass },
                { id: 'learning', label: 'Practice', icon: GraduationCap },
                { id: 'contribute', label: 'Contribute', icon: PlusCircle },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id as ActiveTab)}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                      isActive
                        ? 'bg-ink-900 text-white'
                        : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Trilingual toggle in mobile drawer */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
              <span className="font-semibold">Display:</span>
              <div className="flex gap-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'ta', label: 'Tamil' },
                  { id: 'en', label: 'English' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setUiLang(l.id as UILanguage)}
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      uiLang === l.id ? 'bg-ceylon-700 text-white' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick links to secondary pages in mobile */}
            <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-2 text-xs text-stone-600">
              <button onClick={() => navigateTo('about')} className="hover:text-ink-950">About</button>
              <span>•</span>
              <button onClick={() => navigateTo('how-it-works')} className="hover:text-ink-950">How it Works</button>
              <span>•</span>
              <button onClick={() => navigateTo('technology')} className="hover:text-ink-950">Technology</button>
              <span>•</span>
              <button onClick={() => navigateTo('sources')} className="hover:text-ink-950">Sources</button>
              <span>•</span>
              <button onClick={() => navigateTo('admin')} className="text-ceylon-700 font-semibold">Admin</button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            stats={stats}
            uiLang={uiLang}
            onSearchSubmit={handleSearchFromHome}
            onSelectWord={handleOpenWordDetail}
            onSelectCategory={handleSelectCategory}
            onNavigateTab={(t) => navigateTo(t as ActiveTab)}
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
            onBack={() => navigateTo(previousTab === 'word-detail' ? 'explorer' : previousTab)}
            onSelectWord={handleOpenWordDetail}
            onSelectCategory={(slug) => handleSelectCategory(slug)}
            onOpenContributeForWord={(w, id) => {
              setContribWord(w);
              setContribEntryId(id);
              navigateTo('contribute');
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

        {activeTab === 'about' && (
          <AboutView onNavigateTab={(t) => navigateTo(t as ActiveTab)} />
        )}

        {activeTab === 'how-it-works' && (
          <HowItWorksView onNavigateTab={(t) => navigateTo(t as ActiveTab)} />
        )}

        {activeTab === 'technology' && (
          <TechnologyView onNavigateTab={(t) => navigateTo(t as ActiveTab)} />
        )}

        {activeTab === 'sources' && (
          <SourcesView onNavigateTab={(t) => navigateTo(t as ActiveTab)} />
        )}
      </main>

      {/* Clean, Minimal Educational Footer */}
      <footer className="bg-white border-t border-stone-200 mt-16 pt-12 pb-8 px-4 sm:px-6 text-xs text-stone-600">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-ceylon-700 text-white flex items-center justify-center font-sinhala-serif font-bold text-base">
                  සිං
                </div>
                <span className="font-extrabold text-base text-ink-950 tracking-tight">
                  LearnSinhala
                </span>
              </div>
              <p className="text-stone-500 leading-relaxed text-xs">
                A clean, open-access trilingual learning platform and living Sinhala linguistic encyclopedia.
              </p>
              <div className="text-[11px] text-stone-400">
                Sinhala • தமிழ் • English
              </div>
            </div>

            {/* Learning Column */}
            <div className="space-y-2.5">
              <div className="font-bold text-xs uppercase tracking-wider text-ink-950">
                Learning
              </div>
              <ul className="space-y-1.5 text-stone-600">
                <li>
                  <button onClick={() => navigateTo('explorer')} className="hover:text-ceylon-700 transition-colors">
                    Dictionary & Explorer
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('learning')} className="hover:text-ceylon-700 transition-colors">
                    Flashcards & Practice
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('explorer')} className="hover:text-ceylon-700 transition-colors">
                    Sinhala Alphabet (අ → ෆ)
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('contribute')} className="hover:text-ceylon-700 transition-colors">
                    Contribute Vocabulary
                  </button>
                </li>
              </ul>
            </div>

            {/* Information Column */}
            <div className="space-y-2.5">
              <div className="font-bold text-xs uppercase tracking-wider text-ink-950">
                Information
              </div>
              <ul className="space-y-1.5 text-stone-600">
                <li>
                  <button onClick={() => navigateTo('about')} className="hover:text-ceylon-700 transition-colors">
                    About LearnSinhala
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('how-it-works')} className="hover:text-ceylon-700 transition-colors">
                    How LearnSinhala Works
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('technology')} className="hover:text-ceylon-700 transition-colors">
                    AI Integration & Technology
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('sources')} className="hover:text-ceylon-700 transition-colors">
                    Data Sources & Methodology
                  </button>
                </li>
              </ul>
            </div>

            {/* Tools & Platform Column */}
            <div className="space-y-2.5">
              <div className="font-bold text-xs uppercase tracking-wider text-ink-950">
                Platform
              </div>
              <ul className="space-y-1.5 text-stone-600">
                <li>
                  <button onClick={() => navigateTo('admin')} className="text-ceylon-700 hover:text-ceylon-900 font-semibold inline-flex items-center gap-1 transition-colors">
                    <Sparkles className="w-3.5 h-3.5" /> AI Agent & Admin
                  </button>
                </li>
                <li>
                  <a
                    href="https://github.com/Dilrukshan7/LearnShinhala"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ink-950 inline-flex items-center gap-1 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" /> GitHub Repository
                  </a>
                </li>
                <li>
                  <span className="inline-flex items-center gap-1 text-[11px] text-leaf-700 font-medium">
                    <ShieldCheck className="w-3 h-3" /> Multi-Source Attested
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Status Bar */}
          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-400">
            <div>
              © 2026 LearnSinhala. Dedicated to living language preservation.
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => navigateTo('technology')} className="hover:underline">
                10-Stage Verification Pipeline
              </button>
              <span>•</span>
              <button onClick={() => navigateTo('sources')} className="hover:underline">
                Archival Citations
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
