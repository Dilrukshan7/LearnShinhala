import React from 'react';
import {
  BookOpen,
  Globe2,
  Users,
  Compass,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Heart,
} from 'lucide-react';

interface AboutViewProps {
  onNavigateTab: (tab: 'home' | 'explorer' | 'learning' | 'contribute' | 'technology') => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigateTab }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-ceylon-100 text-ceylon-800">
          <Globe2 className="w-3.5 h-3.5 text-ceylon-700" />
          Our Mission & Vision
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-ink-950 tracking-tight">
          About LearnSinhala
        </h1>
        <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-sinhala-sans">
          මහා සිංහල ශබ්දකෝෂ විශ්වකෝෂය • முழுமையான சிங்கள சொற்களஞ்சிய கலைக்களஞ்சியம்
        </p>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          LearnSinhala is a modern, open-access trilingual language learning platform and living
          Sinhala linguistic encyclopedia. Our objective is to collect, organize, document, translate,
          and preserve the Sinhala language without artificial caps or boundaries.
        </p>
      </div>

      {/* Core Audiences Grid */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink-950 flex items-center gap-2">
            <Users className="w-5 h-5 text-ceylon-700" />
            Who We Serve
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Built from the ground up to support learners from every background with trilingual clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-stone-200/80 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-leaf-100 text-leaf-800 flex items-center justify-center font-bold text-sm">
              EN
            </div>
            <h3 className="font-bold text-base text-ink-950">English-Speaking Learners</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Step-by-step vocabulary with intuitive Singlish Romanization, grammatical labels, and
              fluent English meanings for diaspora communities, travelers, and global students.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-stone-200/80 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-ceylon-100 text-ceylon-800 flex items-center justify-center font-bold text-sm font-tamil">
              த
            </div>
            <h3 className="font-bold text-base text-ink-950">Tamil-Speaking Learners</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Precise Tamil translations and Tamil script phonetic guides to provide a natural bridge
              between Sri Lanka's official languages and Tamil speakers learning Sinhala.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#FAF8F5] border border-stone-200/80 space-y-2">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm font-sinhala-serif">
              සිං
            </div>
            <h3 className="font-bold text-base text-ink-950">Native Speakers & Researchers</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Detailed etymological origins, classical Elu roots, Sanskrit and Pali cognates,
              spoken vs. literary registers, and official government terminology for students and scholars.
            </p>
          </div>
        </div>
      </section>

      {/* The Trilingual Standard */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink-950 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-leaf-700" />
            The Trilingual Standard
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Every verified headword in LearnSinhala is comprehensively documented across three languages:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-stone-200 bg-white">
            <div className="font-bold text-ink-950 text-sm mb-1">1. Original Script</div>
            <p className="text-stone-600">
              Accurate Sinhala Unicode with proper conjuncts (rakaransaya, yansaya) and full orthography.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-white">
            <div className="font-bold text-ink-950 text-sm mb-1">2. Spoken Audio & Phonetics</div>
            <p className="text-stone-600">
              Text-to-speech audio with standard ISO Romanization and Tamil phonetic guides for pronunciation.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-white">
            <div className="font-bold text-ink-950 text-sm mb-1">3. Trilingual Meanings</div>
            <p className="text-stone-600">
              Multi-sense definitions in Sinhala, Tamil, and English tailored to contextual nuances.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-white">
            <div className="font-bold text-ink-950 text-sm mb-1">4. Real Contextual Sentences</div>
            <p className="text-stone-600">
              Natural example sentences demonstrating how each word functions in formal and colloquial speech.
            </p>
          </div>
        </div>
      </section>

      {/* Epistemic Transparency & Open Access */}
      <div className="bg-[#FAF6F0] rounded-2xl border border-stone-200 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-ceylon-800">
            <ShieldCheck className="w-4 h-4 text-leaf-700" />
            Epistemic Integrity
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-ink-950">
            Never Fabricated, Rigorously Sourced
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            We believe language learning requires absolute authenticity. We never generate artificial
            words just to inflate counts. Every entry is linked to primary linguistic references or
            routed through human review before becoming established fact.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('learning')}
            className="px-5 py-2.5 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <GraduationCap className="w-4 h-4" /> Start Learning
          </button>
          <button
            onClick={() => onNavigateTab('explorer')}
            className="px-5 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-ink-900 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Compass className="w-4 h-4" /> Browse Dictionary
          </button>
        </div>
      </div>
    </div>
  );
};
