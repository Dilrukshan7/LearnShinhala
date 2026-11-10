import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Compass,
  GraduationCap,
  PlusCircle,
  ShieldCheck,
  Globe,
  Sparkles,
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-ink-950">
      {/* Top Archival Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ceylon-700 to-ceylon-900 text-white flex items-center justify-center font-sinhala-serif font-extrabold text-xl shadow-sm group-hover:scale-105 transition-transform">
              සිං
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-ink-950 tracking-tight">
                  සිංහල ශබ්දකෝෂ විශ්වකෝෂය
                </span>
                <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-leaf-100 text-leaf-800">
                  {stats?.counts?.total_entries ?? 35}+ Verified Entries
                </span>
              </div>
              <div className="text-[11px] text-stone-500 hidden sm:block">
                Sinhala • <span className="font-tamil">தமிழ்</span> • English Linguistic Archive
              </div>
            </div>
          </button>

          {/* Primary Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-1.5">
            {[
              { id: 'home', label: 'Home', icon: BookOpen },
              { id: 'explorer', label: 'Explorer & Categories', icon: Compass },
              { id: 'learning', label: 'Learn & Practice', icon: GraduationCap },
              { id: 'contribute', label: 'Contribute', icon: PlusCircle },
              { id: 'admin', label: 'AI Agent & Admin', icon: Sparkles },
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
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? 'bg-ceylon-700 text-white shadow-sm'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Trilingual Display Filter */}
          <div className="hidden lg:flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
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
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  uiLang === l.id
                    ? 'bg-white text-ink-950 shadow-sm'
                    : 'text-stone-600 hover:text-ink-950'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content View */}
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

      {/* Scholarly Preservation Footer */}
      <footer className="bg-[#181512] text-stone-300 border-t border-stone-800 py-8 px-4 sm:px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs">
          <div className="space-y-1.5 max-w-2xl">
            <div className="font-bold text-white flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Complete Sinhala Vocabulary Encyclopedia (සිංහල • தமிழ் • English)
            </div>
            <p className="text-stone-400 leading-relaxed">
              An open, continuously expanding trilingual linguistic preservation platform. All
              entries are verified against public-domain dictionaries (Carter 1924, Clough 1892),
              official trilingual glossaries, and human linguist review. No artificial vocabulary
              cap is imposed, and unverified AI candidates are strictly segregated from verified
              lexical facts.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-stone-400">
            <button onClick={() => setActiveTab('explorer')} className="hover:text-white">
              Orthographic Explorer (අ → ෆ)
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('learning')} className="hover:text-white">
              Trilingual Flashcards
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('contribute')} className="hover:text-white">
              Contribute Vocabulary
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('admin')} className="hover:text-white">
              10-Stage AI Pipeline
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
