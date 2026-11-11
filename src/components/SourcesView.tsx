import React from 'react';
import {
  BookOpen,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Compass,
  GraduationCap,
  Scale,
} from 'lucide-react';

interface SourcesViewProps {
  onNavigateTab: (tab: 'home' | 'explorer' | 'learning' | 'contribute' | 'technology') => void;
}

const PRIMARY_SOURCES = [
  {
    code: 'CARTER_1924',
    title: 'An English-Sinhalese & Sinhalese-English Dictionary',
    author: 'Rev. Charles Carter',
    year: '1924',
    type: 'Public Domain Classical Lexicon',
    description:
      'Widely regarded as the authoritative gold standard of scholarly Sinhala-English lexicography. Covers deep classical Elu roots, literary inflections, and grammatical cases.',
  },
  {
    code: 'CLOUGH_1892',
    title: 'Sinhalese-English Dictionary',
    author: 'Rev. Benjamin Clough',
    year: '1892',
    type: 'Public Domain Historical Lexicon',
    description:
      'Comprehensive historical dictionary detailing Sanskrit and Pali derivations, Buddhist philosophical terminology, and archaic colloquial usages.',
  },
  {
    code: 'DEPT_OFFICIAL_LANG',
    title: 'Trilingual Technical & Administrative Glossaries',
    author: 'Department of Official Languages, Sri Lanka',
    year: '1970–2024',
    type: 'Official Trilingual Standard',
    description:
      'Standardized Sinhala-Tamil-English terminology across legal systems, medicine, public administration, engineering, physics, chemistry, and computing.',
  },
  {
    code: 'SL_LINGUISTIC_CORPUS',
    title: 'Contemporary & Academic Sinhala Text Corpora',
    author: 'National University Linguistic Departments',
    year: 'Modern',
    type: 'Permitted Academic Corpora',
    description:
      'Open-access research publications, contemporary news archives, and conversational transcripts used to verify modern loanwords and colloquial idioms.',
  },
];

export const SourcesView: React.FC<SourcesViewProps> = ({ onNavigateTab }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-leaf-100 text-leaf-800">
          <BookOpen className="w-3.5 h-3.5 text-leaf-700" />
          Linguistic Provenance
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-ink-950 tracking-tight">
          Data Sources & Methodology
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          LearnSinhala is built on foundational scholarship, public-domain lexicons, and official
          trilingual glossaries. Every entry is grounded in verifiable evidence.
        </p>
      </div>

      {/* Primary Sources Grid */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink-950">
            Primary Dictionaries & Reference Works
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Our autonomous agents and lexicographers harvest and verify definitions against these accredited works:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PRIMARY_SOURCES.map((src) => (
            <div
              key={src.code}
              className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-ceylon-100 text-ceylon-900">
                    {src.code}
                  </span>
                  <span className="text-xs text-stone-500 font-semibold">{src.year}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-ink-950">{src.title}</h3>
                <div className="text-xs font-semibold text-stone-600">
                  {src.author} • <span className="text-leaf-700">{src.type}</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed pt-1">{src.description}</p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span className="inline-flex items-center gap-1 text-leaf-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Multi-Source Attested
                </span>
                <span>Relational FK Indexed</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Etymological Lineage & Language Roots */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink-950 flex items-center gap-2">
            <Scale className="w-5 h-5 text-ceylon-700" />
            Etymological Classification System
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Sinhala has a rich 2,500-year history influenced by indigenous roots and cultural interactions:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] space-y-1.5">
            <div className="font-bold text-ink-950 text-sm">හෙළ / Elu (Indigenous)</div>
            <p className="text-stone-600">
              Native Sinhala root stems, including fundamental nature, agricultural, and anatomical words.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] space-y-1.5">
            <div className="font-bold text-ink-950 text-sm">Sanskrit & Pali (තත්සම / තද්භව)</div>
            <p className="text-stone-600">
              Philosophical, academic, and spiritual terms preserved intact or adapted over centuries.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] space-y-1.5">
            <div className="font-bold text-ink-950 text-sm">Tamil Loanwords (ද්‍රවිඩ)</div>
            <p className="text-stone-600">
              Historical linguistic exchange in culinary, trade, maritime, and daily household terms.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] space-y-1.5">
            <div className="font-bold text-ink-950 text-sm">European Loanwords</div>
            <p className="text-stone-600">
              Portuguese, Dutch, and English borrowings naturalized into modern Sinhala speech.
            </p>
          </div>
        </div>
      </section>

      {/* Continuous Verification Commitment */}
      <div className="bg-[#FAF6F0] rounded-2xl border border-stone-200 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-ceylon-800">
            <ShieldCheck className="w-4 h-4 text-leaf-700" />
            Our Linguistic Pledge
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-ink-950">
            Never Claim Completeness When a Language is Living
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            A living language of over 17 million speakers is never complete. We never impose an
            artificial ceiling on our vocabulary database and welcome contributions, corrections,
            and research partnerships from all language enthusiasts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('contribute')}
            className="px-5 py-2.5 rounded-xl bg-ceylon-700 hover:bg-ceylon-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
          >
            Submit a Reference or Correction
          </button>
          <button
            onClick={() => onNavigateTab('explorer')}
            className="px-5 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-ink-950 font-bold text-xs sm:text-sm transition-colors"
          >
            Browse Vocabulary
          </button>
        </div>
      </div>
    </div>
  );
};
