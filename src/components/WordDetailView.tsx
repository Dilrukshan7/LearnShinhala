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
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-8 animate-pulse space-y-4">
          <div className="h-10 bg-stone-200 rounded w-1/3" />
          <div className="h-6 bg-stone-100 rounded w-1/2" />
          <div className="h-32 bg-stone-100 rounded" />
        </div>
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-ceylon-700 hover:text-ceylon-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vocabulary Explorer
        </button>
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
          <p className="text-lg font-semibold text-ink-900">{error || 'Entry not found'}</p>
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
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          id="word-detail-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-stone-200 hover:border-ceylon-600 text-sm font-semibold text-ink-900 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-ceylon-700" />
          Back to Encyclopedia Explorer
        </button>

        <div className="flex items-center gap-2">
          <button
            id="save-personal-list-btn"
            onClick={handleSaveToPersonalList}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              savedToBookmark
                ? 'bg-leaf-600 text-white border-leaf-600'
                : 'bg-white text-ink-900 border-stone-200 hover:border-leaf-600'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            {savedToBookmark ? 'Saved to Personal Learning List' : 'Save to Personal List'}
          </button>

          {onOpenContributeForWord && (
            <button
              id="suggest-improvement-btn"
              onClick={() => onOpenContributeForWord(entry.sinhala_word, entry.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-ceylon-50 text-ceylon-900 border border-ceylon-200 hover:bg-ceylon-100 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-ceylon-700" />
              Suggest Example / Regional Variant
            </button>
          )}
        </div>
      </div>

      {/* Hero Lexicon Header Card */}
      <section className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#221A15] via-[#2E2119] to-[#1F2D27] text-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <VerificationBadge
                  status={entry.verification_status}
                  confidence={entry.confidence_score}
                />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 text-amber-200">
                  {entry.part_of_speech}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-stone-200">
                  Level: {entry.difficulty_level}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-stone-200">
                  Register: {entry.register}
                </span>
                {entry.is_demo_dataset && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-400/20 text-amber-200 border border-amber-300/30">
                    Foundation Reference Entry
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-4xl sm:text-5xl font-extrabold font-sinhala-serif tracking-wide text-white">
                  {entry.sinhala_word}
                </h1>
                <button
                  type="button"
                  onClick={() =>
                    speakText(entry.sinhala_word, 'si-LK', entry.romanized_pronunciation)
                  }
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ceylon-600 hover:bg-ceylon-500 text-white text-xs font-semibold shadow transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  Pronounce ({entry.romanized_pronunciation})
                </button>
              </div>

              {entry.grammatical_classification && (
                <p className="mt-2 text-sm text-stone-300">
                  {entry.grammatical_classification} •{' '}
                  <span className="text-amber-200/90">{entry.spoken_vs_literary}</span>
                </p>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/15 min-w-[240px]">
              <div className="text-[11px] uppercase tracking-wider text-stone-300 font-semibold mb-1.5">
                Phonetic & Orthographic Profile
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between gap-4">
                  <span className="text-stone-300">Romanized:</span>
                  <span className="font-mono font-semibold text-amber-200">
                    {pronunciation?.romanized_standard || entry.romanized_pronunciation}
                  </span>
                </div>
                {pronunciation?.ipa_transcription && (
                  <div className="flex justify-between gap-4">
                    <span className="text-stone-300">IPA:</span>
                    <span className="font-mono text-white">{pronunciation.ipa_transcription}</span>
                  </div>
                )}
                {(pronunciation?.tamil_script_phonetic || entry.tamil_pronunciation_guide) && (
                  <div className="flex justify-between gap-4">
                    <span className="text-stone-300">Tamil Phonetic:</span>
                    <span className="font-tamil font-semibold text-emerald-200">
                      {pronunciation?.tamil_script_phonetic || entry.tamil_pronunciation_guide}
                    </span>
                  </div>
                )}
                {pronunciation?.syllable_breakdown && (
                  <div className="flex justify-between gap-4">
                    <span className="text-stone-300">Syllables:</span>
                    <span className="font-mono text-stone-200">
                      {pronunciation.syllable_breakdown}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trilingual Core Meaning Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200 bg-[#FCF9F5]">
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-ceylon-800 bg-ceylon-100 px-2.5 py-0.5 rounded">
                தமிழ் கருத்து • Tamil Meaning
              </span>
              <button
                type="button"
                onClick={() => speakText(entry.primary_tamil_translation, 'ta-LK')}
                className="text-xs text-stone-500 hover:text-ceylon-700 inline-flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" /> Listen Tamil
              </button>
            </div>
            <p className="text-xl sm:text-2xl font-bold font-tamil text-ink-950 mt-1">
              {entry.primary_tamil_translation}
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-leaf-800 bg-leaf-100 px-2.5 py-0.5 rounded">
                English Meaning
              </span>
              <button
                type="button"
                onClick={() => speakText(entry.primary_english_translation, 'en-US')}
                className="text-xs text-stone-500 hover:text-leaf-700 inline-flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" /> Listen English
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
          {/* Multiple Definitions & Contextual Usage */}
          <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink-950 flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-ceylon-700" />
              Definitions, Senses & Contextual Usage ({senses.length})
            </h2>

            {entry.usage_context && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#FAF6F0] border border-stone-200/80 text-sm text-ink-800">
                <strong className="text-ink-950">Contextual Overview: </strong>
                {entry.usage_context}
              </div>
            )}

            <div className="space-y-4">
              {senses.map((sense) => (
                <div
                  key={sense.id}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md bg-ink-900 text-white text-xs font-bold">
                      Sense #{sense.sense_number}
                    </span>
                    {sense.domain_tag && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-ceylon-50 text-ceylon-800 border border-ceylon-200">
                        {sense.domain_tag}
                      </span>
                    )}
                  </div>

                  {sense.sinhala_definition && (
                    <p className="text-base font-sinhala-sans font-semibold text-ink-950">
                      {sense.sinhala_definition}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-lg bg-white border border-stone-200/80">
                      <span className="text-[10px] font-bold uppercase text-ceylon-700 block">
                        Tamil Meaning (தமிழ்)
                      </span>
                      <span className="text-sm font-medium font-tamil text-ink-900">
                        {sense.tamil_meaning}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-stone-200/80">
                      <span className="text-[10px] font-bold uppercase text-leaf-700 block">
                        English Meaning
                      </span>
                      <span className="text-sm font-medium text-ink-900">
                        {sense.english_meaning}
                      </span>
                    </div>
                  </div>

                  {(sense.formal_usage_note || sense.informal_usage_note) && (
                    <div className="pt-2 space-y-1 text-xs text-stone-600">
                      {sense.formal_usage_note && (
                        <div>
                          <span className="font-semibold text-ink-900">Formal Usage: </span>
                          {sense.formal_usage_note}
                        </div>
                      )}
                      {sense.informal_usage_note && (
                        <div>
                          <span className="font-semibold text-ink-900">Informal / Spoken Usage: </span>
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
          <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink-950 flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-ceylon-700" />
              Trilingual Example Sentences (සිංහල • தமிழ் • English)
            </h2>

            {examples.length === 0 ? (
              <p className="text-sm text-stone-500">No example sentences recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {examples.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-4 rounded-xl border border-stone-200 bg-[#FCFBF9] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-lg font-sinhala-sans font-bold text-ink-950">
                        {ex.sinhala_sentence}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-200/80 text-stone-800">
                          {ex.usage_register}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            speakText(ex.sinhala_sentence, 'si-LK', ex.sinhala_romanized)
                          }
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-ceylon-100 text-stone-700"
                          title="Listen to sentence"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {ex.sinhala_romanized && (
                      <p className="text-xs font-mono text-stone-600 italic">
                        {ex.sinhala_romanized}
                      </p>
                    )}

                    <div className="pt-2 border-t border-stone-200/70 space-y-1.5 text-sm">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[11px] font-bold text-ceylon-800 bg-ceylon-50 px-1.5 py-0.5 rounded shrink-0">
                          தமிழ்
                        </span>
                        <span className="font-tamil text-ink-900">{ex.tamil_translation}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[11px] font-bold text-leaf-800 bg-leaf-50 px-1.5 py-0.5 rounded shrink-0">
                          ENG
                        </span>
                        <span className="text-ink-900 font-medium">{ex.english_translation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Inflected Word Forms & Grammatical Structure */}
          {wordForms.length > 0 && (
            <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-ink-950 flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-ceylon-700" />
                Inflected Word Forms, Declensions & Conjugations
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs uppercase text-stone-500">
                      <th className="py-2.5 pr-4">Grammatical Form</th>
                      <th className="py-2.5 pr-4">Sinhala Script</th>
                      <th className="py-2.5 pr-4">Romanized</th>
                      <th className="py-2.5 pr-4">Tamil Equivalent</th>
                      <th className="py-2.5">English Gloss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {wordForms.map((wf) => (
                      <tr key={wf.id} className="hover:bg-stone-50/80">
                        <td className="py-2.5 pr-4 font-semibold text-xs text-stone-700">
                          {wf.form_type}
                        </td>
                        <td className="py-2.5 pr-4 font-sinhala-sans font-bold text-base text-ink-950">
                          {wf.sinhala_form}
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-xs text-stone-600">
                          {wf.romanized_form}
                        </td>
                        <td className="py-2.5 pr-4 font-tamil text-ink-900">
                          {wf.tamil_equivalent}
                        </td>
                        <td className="py-2.5 text-ink-800">{wf.english_gloss}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Historical Etymology & Linguistic Roots */}
          {(linguisticRoot || entry.etymology_notes || entry.regional_variations) && (
            <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-ink-950 flex items-center gap-2">
                <History className="w-5 h-5 text-ceylon-700" />
                Etymology, Linguistic Root & Regional Variations
              </h2>

              {linguisticRoot && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#FAF6F0] border border-stone-200">
                  <div>
                    <span className="text-xs uppercase font-bold text-stone-500 block">
                      Origin Stratum
                    </span>
                    <span className="text-sm font-bold text-ink-950">
                      {linguisticRoot.origin_language}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-stone-500 block">
                      Root / Etymon
                    </span>
                    <span className="text-sm font-mono font-semibold text-ceylon-800">
                      {linguisticRoot.root_word}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs uppercase font-bold text-stone-500 block">
                      Historical Evolution
                    </span>
                    <span className="text-sm text-ink-900">
                      {linguisticRoot.historical_evolution}
                    </span>
                  </div>
                  {linguisticRoot.cognates && (
                    <div className="sm:col-span-2">
                      <span className="text-xs uppercase font-bold text-stone-500 block">
                        Areal & Indo-Aryan / Dravidian Cognates
                      </span>
                      <span className="text-sm text-ink-900">{linguisticRoot.cognates}</span>
                    </div>
                  )}
                </div>
              )}

              {entry.etymology_notes && (
                <p className="text-sm text-stone-700 leading-relaxed">
                  <strong className="text-ink-950">Philological Notes: </strong>
                  {entry.etymology_notes}
                </p>
              )}

              {entry.regional_variations && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-sm text-amber-950">
                  <strong>Regional & Dialectal Variations: </strong>
                  {entry.regional_variations}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right Column: Synonyms, Antonyms, Related Words, Categories, Sources */}
        <div className="space-y-6">
          {/* Synonyms, Antonyms, Related Words */}
          <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-ink-950 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-ceylon-700" />
              Semantic Network
            </h3>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-leaf-800 mb-2">
                Synonyms (සමානාර්ථ පද)
              </h4>
              {synonyms.length === 0 ? (
                <p className="text-xs text-stone-500">None listed</p>
              ) : (
                <div className="space-y-2">
                  {synonyms.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => onSelectWord(s.synonym_sinhala)}
                      className="p-2.5 rounded-lg border border-stone-200 hover:border-leaf-600 bg-stone-50/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-sinhala-sans font-bold text-ink-950">
                          {s.synonym_sinhala}
                        </span>
                        <span className="text-xs font-mono text-stone-500">
                          {s.synonym_romanized}
                        </span>
                      </div>
                      <div className="text-xs text-stone-700 mt-0.5">
                        {s.tamil_meaning} • {s.english_meaning}
                      </div>
                      {s.nuance_note && (
                        <div className="text-[11px] text-stone-500 mt-0.5 italic">
                          {s.nuance_note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {antonyms.length > 0 && (
              <div className="pt-2 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ceylon-800 mb-2">
                  Antonyms (විරුද්ධාර්ථ පද)
                </h4>
                <div className="space-y-2">
                  {antonyms.map((a) => (
                    <div
                      key={a.id}
                      className="p-2.5 rounded-lg border border-stone-200 bg-stone-50/60"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-sinhala-sans font-bold text-ink-950">
                          {a.antonym_sinhala}
                        </span>
                        <span className="text-xs font-mono text-stone-500">
                          {a.antonym_romanized}
                        </span>
                      </div>
                      <div className="text-xs text-stone-700 mt-0.5">
                        {a.tamil_meaning} • {a.english_meaning}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {relatedWords.length > 0 && (
              <div className="pt-2 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Related & Derived Words
                </h4>
                <div className="space-y-2">
                  {relatedWords.map((r) => (
                    <div
                      key={r.id}
                      className="p-2.5 rounded-lg border border-stone-200 bg-stone-50/60"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-sinhala-sans font-bold text-ink-950">
                          {r.related_sinhala}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                          {r.relation_type}
                        </span>
                      </div>
                      <div className="text-xs text-stone-700 mt-0.5">
                        {r.tamil_meaning} • {r.english_meaning}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Assigned Hierarchical Categories */}
          <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
            <h3 className="text-base font-bold text-ink-950 mb-3">
              Encyclopedia Categories ({categories.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => onSelectCategory(cat.slug)}
                  className="text-left px-3 py-1.5 rounded-lg bg-[#F5EFE6] hover:bg-ceylon-100 border border-stone-200/80 transition-colors"
                >
                  <div className="text-xs font-bold text-ink-900">
                    [{cat.dimension_code}] {cat.name_en}
                  </div>
                  <div className="text-[11px] text-stone-600">
                    {cat.name_si} • <span className="font-tamil">{cat.name_ta}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Authoritative Sources & Licensing */}
          <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-ink-950 flex items-center gap-2">
              <Scale className="w-4 h-4 text-leaf-700" />
              Verified Linguistic Sources
            </h3>
            {sources.map((src) => (
              <div
                key={src.source_code}
                className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-ink-950">
                  <span>{src.title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-leaf-100 text-leaf-800 text-[10px]">
                    {src.license_status}
                  </span>
                </div>
                <div className="text-stone-600">{src.author_or_institution}</div>
                {src.citation_locator && (
                  <div className="font-mono text-[11px] text-ceylon-800">
                    Citation: {src.citation_locator}
                  </div>
                )}
              </div>
            ))}

            {auditHistory.length > 0 && (
              <div className="pt-3 border-t border-stone-100">
                <div className="text-xs font-bold text-stone-500 uppercase mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-leaf-700" /> Verification Audit Trail
                </div>
                {auditHistory.slice(0, 3).map((a) => (
                  <div key={a.id} className="text-[11px] text-stone-600 py-1">
                    <span className="font-semibold text-ink-900">{a.actor}:</span> {a.summary}
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
