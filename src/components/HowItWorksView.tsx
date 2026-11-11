import React from 'react';
import {
  Search,
  Volume2,
  Layers,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface HowItWorksViewProps {
  onNavigateTab: (tab: 'home' | 'explorer' | 'learning' | 'contribute' | 'technology') => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onNavigateTab }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-leaf-100 text-leaf-800">
          <GraduationCap className="w-3.5 h-3.5 text-leaf-700" />
          Learner Guide
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-ink-950 tracking-tight">
          How LearnSinhala Works
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          From first-time greetings to academic research, LearnSinhala gives you the tools,
          phonetics, and interactive practice you need to master authentic Sinhala.
        </p>
      </div>

      {/* 5-Step Learning Roadmap */}
      <div className="space-y-6">
        {[
          {
            step: '01',
            icon: Search,
            title: 'Trilingual Instant Search',
            subtitle: 'Search in Sinhala, Tamil, English, or Singlish',
            description:
              'You do not need a Sinhala keyboard to get started. Type Romanized Singlish (e.g., "vatura" or "ayubowan"), search directly in Tamil ("வணக்கம்"), English ("water"), or use our built-in one-click Sinhala virtual keyboard. Instant autocomplete and fuzzy trigram matching help you find the exact word even with imperfect spelling.',
            actionLabel: 'Try the Search Bar',
            tab: 'home' as const,
          },
          {
            step: '02',
            icon: Volume2,
            title: 'Authentic Audio & Pronunciation',
            subtitle: 'Listen to native Sinhala cadence and phonetics',
            description:
              'Every word features one-click audio pronunciation powered by localized text-to-speech. Alongside audio, each entry provides standardized ISO Romanization and a Tamil script phonetic guide so you can pronounce every vowel and consonant with confidence.',
            actionLabel: 'Explore Word Dossiers',
            tab: 'explorer' as const,
          },
          {
            step: '03',
            icon: Layers,
            title: 'Orthographic & 9-Dimension Explorer',
            subtitle: 'Browse from අ to ෆ across 170+ categories',
            description:
              'Browse vocabulary using authentic Sinhala orthographic ordering (vowels අ, ආ, ඇ... through consonants ක, ග, ච... to ෆ). Filter by 9 knowledge dimensions including everyday conversation, places, academic fields (medicine, law, AI), grammatical parts of speech, and difficulty levels from beginner to academic.',
            actionLabel: 'Open Category Explorer',
            tab: 'explorer' as const,
          },
          {
            step: '04',
            icon: GraduationCap,
            title: 'Interactive Practice Suite',
            subtitle: 'Flashcards, quizzes, and fill-in-the-blanks',
            description:
              'Reinforce your retention with trilingual flashcards, Sinhala-to-Tamil and Sinhala-to-English multiple choice quizzes, and contextual fill-in-the-blank sentence challenges. Bookmark difficult words into your Personal Vocabulary List to track your learning progress over time.',
            actionLabel: 'Start Practice Sessions',
            tab: 'learning' as const,
          },
          {
            step: '05',
            icon: PlusCircle,
            title: 'Community & Expert Contributions',
            subtitle: 'A living lexicon shaped by speakers and scholars',
            description:
              'Languages live and evolve. Our contribution portal allows learners, translators, and native speakers to propose new words, submit regional dialect variations, report nuance corrections, or suggest natural example sentences. All contributions are reviewed by lexicographers before publication.',
            actionLabel: 'Contribute a Word',
            tab: 'contribute' as const,
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start gap-6"
            >
              <div className="flex items-center gap-4 shrink-0">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-stone-300">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-xl bg-ceylon-50 border border-ceylon-200 text-ceylon-800 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-bold text-ink-950">{item.title}</h2>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                    {item.subtitle}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {item.description}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateTab(item.tab)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-ceylon-700 hover:text-ceylon-900 transition-colors"
                  >
                    {item.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Call to action footer banner */}
      <div className="bg-[#FAF6F0] rounded-2xl border border-stone-200 p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-ink-950">Ready to expand your Sinhala vocabulary?</h3>
        <p className="text-sm text-stone-600 max-w-xl mx-auto">
          Start with our curated beginner collection or jump straight into the full trilingual dictionary.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigateTab('learning')}
            className="px-6 py-2.5 rounded-xl bg-ceylon-700 hover:bg-ceylon-800 text-white font-bold text-sm shadow-sm transition-colors"
          >
            Start Practice Deck
          </button>
          <button
            onClick={() => onNavigateTab('explorer')}
            className="px-6 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-ink-950 font-bold text-sm transition-colors"
          >
            Open Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
