import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  Bookmark,
  BookOpen,
  History,
  GitBranch,
  Layers,
  CheckCircle2,
  Sparkles,
  FileText,
  Scale,
} from 'lucide-react';
import { WordDetailDossier, UILanguage } from '../types';
import { VerificationBadge } from './WordCard';
import { speakText } from '../utils/speech';

interface WordDetailViewProps {
  wordIdOrText: number | string;
  uiLang: UILanguage;
  onBack: () => void;
  onSelectWord: (idOrWord: number | string) => void;
  onSelectCategory: (slug: string) => void;
  onOpenContributeForWord?: (sinhalaWord: string, entryId: number) => void;
}

export const WordDetailView: React.FC<WordDetailViewProps> = ({
  wordIdOrText,
  onBack,
  onSelectWord,
  onSelectCategory,
  onOpenContributeForWord,
}) => {
  const [dossier, setDossier] = useState<WordDetailDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedToBookmark, setSavedToBookmark] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/vocabulary/${encodeURIComponent(String(wordIdOrText))}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Word entry not found');
        return res.json();
      })
      .then((data) => {
        setDossier(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load word entry');
        setLoading(false);
      });
  }, [wordIdOrText]);

  const handleSaveToPersonalList = async () => {
    if (!dossier) return;
    try {
      await fetch('/api/learning/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerKey: 'default_learner',
          entryId: dossier.entry.id,
          inPersonalList: true,
        }),
      });
      setSavedToBookmark(true);
    } catch {
      // Ignore error
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white rounded-xl border border-parchment-300 p-8 animate-pulse space-y-4">
          <div className="h-8 bg-parchment-200 rounded w-1/4" />
          <div className="h-12 bg-parchment-100 rounded w-1/2" />
          <div className="h-32 bg-parchment-100 rounded" />
        </div>
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ceylon-700 hover:text-ceylon-900 focus-ring rounded"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vocabulary Explorer</span>
        </button>
        <div className="bg-white rounded-xl border border-parchment-300 p-8 text-center shadow-subtle">
          <p className="text-base font-semibold text-ink-900">{error || 'Entry not found'}</p>
        </div>
      </div>
    );
  }

  const {
    entry,
    pronunciation,
    senses,
    examples,
    synonyms,
    antonyms,
    relatedWords,
    wordForms,
    linguisticRoot,
    categories,
    sources,
    auditHistory,
  } = dossier;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Action & Navigation Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          id="word-detail-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-parchment-300 hover:border-ceylon-400 text-xs font-semibold text-ink-800 shadow-subtle transition-colors focus-ring"
        >
          <ArrowLeft className="w-4 h-4 text-ceylon-700" />
          <span>Back to Explorer</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="save-personal-list-btn"
            onClick={handleSaveToPersonalList}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all focus-ring ${
              savedToBookmark
                ? 'bg-forest-700 text-white border-forest-700 shadow-subtle'
                : 'bg-white text-ink-800 border-parchment-300 hover:border-forest-600'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{savedToBookmark ? 'Saved to Practice List' : 'Save for Practice'}</span>
          </button>

          {onOpenContributeForWord && (
            <button
              id="suggest-improvement-btn"
              onClick={() => onOpenContributeForWord(entry.sinhala_word, entry.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-ceylon-50 text-ceylon-900 border border-ceylon-200 hover:bg-ceylon-100 transition-colors focus-ring"
            >
              <Sparkles className="w-3.5 h-3.5 text-ceylon-700" />
              <span>Suggest Sentence / Dialect Note</span>
            </button>
          )}
        </div>
      </div>

      {/* Lexical Dossier Master Headpiece */}
      <section className="bg-white rounded-xl border border-parchment-300 shadow-subtle overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-parchment-200">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3">
              {/* Status and Register Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <VerificationBadge
                  status={entry.verification_status}
                  confidence={entry.confidence_score}
                />
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-parchment-100 text-ink-700 border border-parchment-200">
                  {entry.part_of_speech}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-parchment-50 text-ink-600 border border-parchment-200">
                  Level: {entry.difficulty_level}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-parchment-50 text-ink-600 border border-parchment-200">
                  Register: {entry.register}
                </span>
                {entry.is_demo_dataset && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Attested Academic Reference
                  </span>
                )}
              </div>

              {/* Headword & Spoken Audio Button */}
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-4xl sm:text-5xl font-bold font-sinhala-serif tracking-tight text-ink-950">
                  {entry.sinhala_word}
                </h1>
                <button
                  type="button"
                  onClick={() =>
                    speakText(entry.sinhala_word, 'si-LK', entry.romanized_pronunciation)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ceylon-50 hover:bg-ceylon-100 text-ceylon-800 border border-ceylon-200 text-xs font-semibold transition-colors focus-ring"
                  title="Listen to Sinhala pronunciation"
                  aria-label={`Pronounce ${entry.sinhala_word}`}
                >
                  <Volume2 className="w-4 h-4 text-ceylon-700" />
                  <span>Pronounce ({entry.romanized_pronunciation})</span>
                </button>
              </div>

              {entry.grammatical_classification && (
                <p className="text-xs sm:text-sm text-ink-600">
                  {entry.grammatical_classification}
                  {entry.spoken_vs_literary && (
                    <span className="text-ceylon-800 font-medium"> • {entry.spoken_vs_literary}</span>
                  )}
                </p>
              )}
            </div>

            {/* Phonetic & Orthographic Profile Ledger */}
            <div className="bg-parchment-50 rounded-lg p-3.5 border border-parchment-300 min-w-[260px] text-xs">
              <div className="text-[10px] uppercase tracking-wider text-ink-500 font-bold mb-2 pb-1.5 border-b border-parchment-200">
                Phonetic & Transcription Profile
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between gap-4">
                  <span className="text-ink-500">Romanized:</span>
                  <span className="font-mono font-semibold text-ceylon-800">
                    {pronunciation?.romanized_standard || entry.romanized_pronunciation}
                  </span>
                </div>
                {pronunciation?.ipa_transcription && (
                  <div className="flex justify-between gap-4">
                    <span className="text-ink-500">IPA Transcription:</span>
                    <span className="font-mono text-ink-900 font-medium">{pronunciation.ipa_transcription}</span>
                  </div>
                )}
                {(pronunciation?.tamil_script_phonetic || entry.tamil_pronunciation_guide) && (
                  <div className="flex justify-between gap-4">
                    <span className="text-ink-500">Tamil Phonetic:</span>
                    <span className="font-tamil font-semibold text-ink-900">
                      {pronunciation?.tamil_script_phonetic || entry.tamil_pronunciation_guide}
                    </span>
                  </div>
                )}
                {pronunciation?.syllable_breakdown && (
                  <div className="flex justify-between gap-4">
                    <span className="text-ink-500">Syllables:</span>
                    <span className="font-mono text-ink-700">
                      {pronunciation.syllable_breakdown}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trilingual Core Primary Meanings */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-parchment-200 bg-parchment-50/50">
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ceylon-800 bg-ceylon-50 border border-ceylon-200 px-2 py-0.5 rounded font-tamil">
                தமிழ் கருத்து • Tamil Translation
              </span>
              <button
                type="button"
                onClick={() => speakText(entry.primary_tamil_translation, 'ta-LK')}
                className="text-xs text-ink-500 hover:text-ceylon-700 inline-flex items-center gap-1 focus-ring rounded"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen</span>
              </button>
            </div>
            <p className="text-xl sm:text-2xl font-bold font-tamil text-ink-950 mt-1">
              {entry.primary_tamil_translation}
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 border border-forest-200 px-2 py-0.5 rounded">
                English Translation
              </span>
              <button
                type="button"
                onClick={() => speakText(entry.primary_english_translation, 'en-US')}
                className="text-xs text-ink-500 hover:text-forest-700 inline-flex items-center gap-1 focus-ring rounded"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen</span>
              </button>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-ink-950 mt-1">
              {entry.primary_english_translation}
            </p>
          </div>
        </div>
      </section>

      {/* Main Two-Column Encyclopedia Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Senses, Examples, Inflections, Etymology */}
        <div className="lg:col-span-2 space-y-6">
          {/* Multiple Definitions & Contextual Senses */}
          <section className="bg-white rounded-xl border border-parchment-300 p-6 shadow-subtle space-y-4">
            <h2 className="text-base font-bold text-ink-950 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-ceylon-700 shrink-0" />
              <span>Definitions, Senses & Usages ({senses.length})</span>
            </h2>

            {entry.usage_context && (
              <div className="p-3.5 rounded-lg bg-parchment-50 border border-parchment-200 text-xs text-ink-800 leading-relaxed">
                <strong className="text-ink-950 font-semibold">Contextual Overview: </strong>
                {entry.usage_context}
              </div>
            )}

            <div className="space-y-3.5">
              {senses.map((sense) => (
                <div
                  key={sense.id}
                  className="p-4 rounded-lg border border-parchment-200 bg-parchment-50/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-ink-900 text-white text-[10px] font-bold">
                      Sense #{sense.sense_number}
                    </span>
                    {sense.domain_tag && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-ceylon-50 text-ceylon-800 border border-ceylon-200">
                        {sense.domain_tag}
                      </span>
                    )}
                  </div>

                  {sense.sinhala_definition && (
                    <p className="text-sm sm:text-base font-sinhala-sans font-semibold text-ink-950">
                      {sense.sinhala_definition}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded bg-white border border-parchment-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ceylon-800 font-tamil block">
                        Tamil Meaning
                      </span>
                      <span className="text-xs sm:text-sm font-medium font-tamil text-ink-900">
                        {sense.tamil_meaning}
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-white border border-parchment-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 block">
                        English Meaning
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-ink-900">
                        {sense.english_meaning}
                      </span>
                    </div>
                  </div>

                  {(sense.formal_usage_note || sense.informal_usage_note) && (
                    <div className="pt-1.5 space-y-1 text-xs text-ink-600">
                      {sense.formal_usage_note && (
                        <div>
                          <span className="font-semibold text-ink-900">Formal Usage: </span>
                          {sense.formal_usage_note}
                        </div>
                      )}
                      {sense.informal_usage_note && (
                        <div>
                          <span className="font-semibold text-ink-900">Informal / Colloquial: </span>
                          {sense.informal_usage_note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Trilingual Example Sentences */}
          <section className="bg-white rounded-xl border border-parchment-300 p-6 shadow-subtle space-y-4">
            <h2 className="text-base font-bold text-ink-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-ceylon-700 shrink-0" />
              <span>Trilingual Example Sentences</span>
            </h2>

            {examples.length === 0 ? (
              <p className="text-xs text-ink-500">No attested example sentences cataloged yet.</p>
            ) : (
              <div className="space-y-3">
                {examples.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-lg border border-parchment-200 bg-parchment-50/30 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-base font-sinhala-sans font-semibold text-ink-950">
                        “{ex.sinhala_sentence}”
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-parchment-100 text-ink-700 border border-parchment-200">
                          {ex.usage_register}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            speakText(ex.sinhala_sentence, 'si-LK', ex.sinhala_romanized)
                          }
                          className="p-1.5 rounded bg-parchment-100 hover:bg-ceylon-100 text-ink-700 hover:text-ceylon-800 transition-colors focus-ring"
                          title="Listen to sentence"
                          aria-label={`Listen to sentence ${ex.sinhala_sentence}`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {ex.sinhala_romanized && (
                      <p className="text-xs font-mono text-ink-500 italic">
                        /{ex.sinhala_romanized}/
                      </p>
                    )}

                    <div className="pt-2 border-t border-parchment-200 space-y-1 text-xs">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-bold text-ceylon-800 bg-ceylon-50 border border-ceylon-200 px-1.5 py-0.2 rounded shrink-0 font-tamil">
                          தமிழ்
                        </span>
                        <span className="font-tamil text-ink-900">{ex.tamil_translation}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-bold text-forest-700 bg-forest-50 border border-forest-200 px-1.5 py-0.2 rounded shrink-0">
                          ENG
                        </span>
                        <span className="text-ink-800 font-medium">{ex.english_translation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Inflected Word Forms & Grammatical Structure */}
          {wordForms.length > 0 && (
            <section className="bg-white rounded-xl border border-parchment-300 p-6 shadow-subtle space-y-4">
              <h2 className="text-base font-bold text-ink-950 flex items-center gap-2">
                <Layers className="w-4 h-4 text-ceylon-700 shrink-0" />
                <span>Inflected Word Forms & Conjugations</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-parchment-200 uppercase tracking-wider text-[10px] text-ink-500">
                      <th className="py-2 pr-3">Form Type</th>
                      <th className="py-2 pr-3">Sinhala Script</th>
                      <th className="py-2 pr-3">Romanized</th>
                      <th className="py-2 pr-3">Tamil Equivalent</th>
                      <th className="py-2">English Gloss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-parchment-100">
                    {wordForms.map((wf) => (
                      <tr key={wf.id} className="hover:bg-parchment-50/60">
                        <td className="py-2 pr-3 font-semibold text-ink-700">
                          {wf.form_type}
                        </td>
                        <td className="py-2 pr-3 font-sinhala-sans font-bold text-sm text-ink-950">
                          {wf.sinhala_form}
                        </td>
                        <td className="py-2 pr-3 font-mono text-ink-500">
                          {wf.romanized_form}
                        </td>
                        <td className="py-2 pr-3 font-tamil text-ink-900">
                          {wf.tamil_equivalent}
                        </td>
                        <td className="py-2 text-ink-800">{wf.english_gloss}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Historical Etymology & Linguistic Roots */}
          {(linguisticRoot || entry.etymology_notes || entry.regional_variations) && (
            <section className="bg-white rounded-xl border border-parchment-300 p-6 shadow-subtle space-y-3.5">
              <h2 className="text-base font-bold text-ink-950 flex items-center gap-2">
                <History className="w-4 h-4 text-ceylon-700 shrink-0" />
                <span>Etymology, Philological Roots & Regional Dialect</span>
              </h2>

              {linguisticRoot && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-parchment-50 border border-parchment-200 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ink-500 block">
                      Origin Stratum
                    </span>
                    <span className="font-semibold text-ink-950">
                      {linguisticRoot.origin_language}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ink-500 block">
                      Linguistic Etymon
                    </span>
                    <span className="font-mono font-semibold text-ceylon-800">
                      {linguisticRoot.root_word}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-ink-500 block">
                      Historical Evolution
                    </span>
                    <span className="text-ink-800 leading-relaxed">
                      {linguisticRoot.historical_evolution}
                    </span>
                  </div>
                  {linguisticRoot.cognates && (
                    <div className="sm:col-span-2">
                      <span className="text-[10px] uppercase font-bold text-ink-500 block">
                        Areal Indo-Aryan / Dravidian Cognates
                      </span>
                      <span className="text-ink-800">{linguisticRoot.cognates}</span>
                    </div>
                  )}
                </div>
              )}

              {entry.etymology_notes && (
                <p className="text-xs text-ink-700 leading-relaxed">
                  <strong className="text-ink-950 font-semibold">Philological Notes: </strong>
                  {entry.etymology_notes}
                </p>
              )}

              {entry.regional_variations && (
                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-950">
                  <strong className="font-semibold">Regional & Dialectal Variations: </strong>
                  {entry.regional_variations}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right Column: Synonyms, Antonyms, Related Words, Categories, Sources */}
        <div className="space-y-6">
          {/* Semantic Network (Synonyms, Antonyms, Related) */}
          <section className="bg-white rounded-xl border border-parchment-300 p-5 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-ink-950 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-ceylon-700 shrink-0" />
              <span>Semantic Lexical Network</span>
            </h3>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-forest-700 mb-2">
                Synonyms (සමානාර්ථ පද)
              </h4>
              {synonyms.length === 0 ? (
                <p className="text-xs text-ink-400">None cataloged</p>
              ) : (
                <div className="space-y-1.5">
                  {synonyms.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => onSelectWord(s.synonym_sinhala)}
                      className="p-2 rounded-lg border border-parchment-200 hover:border-forest-600 bg-parchment-50/60 cursor-pointer transition-colors focus-ring"
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectWord(s.synonym_sinhala)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-sinhala-sans font-bold text-xs text-ink-950">
                          {s.synonym_sinhala}
                        </span>
                        <span className="text-[11px] font-mono text-ink-500">
                          /{s.synonym_romanized}/
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-600 mt-0.5">
                        {s.tamil_meaning} • {s.english_meaning}
                      </div>
                      {s.nuance_note && (
                        <div className="text-[10px] text-ink-500 mt-0.5 italic">
                          {s.nuance_note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {antonyms.length > 0 && (
              <div className="pt-3 border-t border-parchment-200">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-ceylon-800 mb-2">
                  Antonyms (විරුද්ධාර්ථ පද)
                </h4>
                <div className="space-y-1.5">
                  {antonyms.map((a) => (
                    <div
                      key={a.id}
                      className="p-2 rounded-lg border border-parchment-200 bg-parchment-50/60 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-sinhala-sans font-bold text-ink-950">
                          {a.antonym_sinhala}
                        </span>
                        <span className="text-[11px] font-mono text-ink-500">
                          /{a.antonym_romanized}/
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-600 mt-0.5">
                        {a.tamil_meaning} • {a.english_meaning}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {relatedWords.length > 0 && (
              <div className="pt-3 border-t border-parchment-200">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mb-2">
                  Related & Derived Lexemes
                </h4>
                <div className="space-y-1.5">
                  {relatedWords.map((r) => (
                    <div
                      key={r.id}
                      className="p-2 rounded-lg border border-parchment-200 bg-parchment-50/60 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-sinhala-sans font-bold text-ink-950">
                          {r.related_sinhala}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-parchment-200 text-ink-700">
                          {r.relation_type}
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-600 mt-0.5">
                        {r.tamil_meaning} • {r.english_meaning}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Assigned Categories */}
          <section className="bg-white rounded-xl border border-parchment-300 p-5 shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-ink-950">
              Taxonomy Categories ({categories.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => onSelectCategory(cat.slug)}
                  className="text-left px-2.5 py-1 rounded-md bg-parchment-50 hover:bg-ceylon-50 border border-parchment-300 hover:border-ceylon-300 transition-colors focus-ring"
                >
                  <div className="text-xs font-semibold text-ink-900">
                    [{cat.dimension_code}] {cat.name_en}
                  </div>
                  <div className="text-[10px] text-ink-500">
                    {cat.name_si} • <span className="font-tamil">{cat.name_ta}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Attested Linguistic Sources */}
          <section className="bg-white rounded-xl border border-parchment-300 p-5 shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-ink-950 flex items-center gap-2">
              <Scale className="w-4 h-4 text-forest-700 shrink-0" />
              <span>Attested Citations & Evidence</span>
            </h3>
            {sources.map((src) => (
              <div
                key={src.source_code}
                className="p-3 rounded-lg bg-parchment-50 border border-parchment-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-ink-950">
                  <span>{src.title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-forest-50 text-forest-700 border border-forest-200 text-[10px]">
                    {src.license_status}
                  </span>
                </div>
                <div className="text-ink-600 text-[11px]">{src.author_or_institution}</div>
                {src.citation_locator && (
                  <div className="font-mono text-[10px] text-ceylon-800">
                    Citation: {src.citation_locator}
                  </div>
                )}
              </div>
            ))}

            {auditHistory.length > 0 && (
              <div className="pt-2 border-t border-parchment-200">
                <div className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest-700" />
                  <span>Audit Trail</span>
                </div>
                {auditHistory.slice(0, 3).map((a) => (
                  <div key={a.id} className="text-[11px] text-ink-600 py-0.5">
                    <span className="font-semibold text-ink-800">{a.actor}:</span> {a.summary}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
