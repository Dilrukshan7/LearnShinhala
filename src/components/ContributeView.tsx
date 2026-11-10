import React, { useEffect, useState } from 'react';
import {
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';

interface ContributeViewProps {
  initialSinhalaWord?: string;
  initialTargetEntryId?: number | null;
}

export const ContributeView: React.FC<ContributeViewProps> = ({
  initialSinhalaWord = '',
  initialTargetEntryId = null,
}) => {
  const [contributionType, setContributionType] = useState(
    initialTargetEntryId ? 'EXAMPLE_SENTENCE' : 'NEW_WORD'
  );
  const [sinhalaWord, setSinhalaWord] = useState(initialSinhalaWord);
  const [romanizedPronunciation, setRomanizedPronunciation] = useState('');
  const [proposedTamil, setProposedTamil] = useState('');
  const [proposedEnglish, setProposedEnglish] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('Noun');
  const [exampleSinhala, setExampleSinhala] = useState('');
  const [exampleTamil, setExampleTamil] = useState('');
  const [exampleEnglish, setExampleEnglish] = useState('');
  const [regionalDialectNote, setRegionalDialectNote] = useState('');
  const [sourceReference, setSourceReference] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [contributorRole, setContributorRole] = useState('Native Speaker / Linguist');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [contributions, setContributions] = useState<any[]>([]);

  const loadContributions = () => {
    fetch('/api/contributions')
      .then((r) => r.json())
      .then((data) => setContributions(data.contributions || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadContributions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sinhalaWord.trim() || !contributorName.trim()) return;
    setSubmitting(true);
    setSubmitSuccess(null);

    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributionType,
          targetEntryId: initialTargetEntryId,
          sinhalaWord,
          romanizedPronunciation,
          proposedTamil,
          proposedEnglish,
          partOfSpeech,
          exampleSinhala,
          exampleTamil,
          exampleEnglish,
          regionalDialectNote,
          sourceReference,
          contributorName,
          contributorRole,
          notes,
        }),
      });

      if (res.ok) {
        setSubmitSuccess(
          `Thank you! Your contribution for "${sinhalaWord}" has been recorded and queued for linguist verification before becoming part of the verified encyclopedia.`
        );
        setSinhalaWord('');
        setRomanizedPronunciation('');
        setProposedTamil('');
        setProposedEnglish('');
        setExampleSinhala('');
        setExampleTamil('');
        setExampleEnglish('');
        setRegionalDialectNote('');
        setSourceReference('');
        setNotes('');
        loadContributions();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ceylon-100 text-ceylon-900 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-ceylon-700" />
            Linguistic Preservation & Peer-Reviewed Contribution System
          </div>
          <h1 className="text-2xl font-extrabold text-ink-950">
            Contribute to the Sinhala Vocabulary Encyclopedia
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed">
            Suggest authentic Sinhala words, submit regional dialects (උඩරට, රුහුණු, රජරට), refine
            Tamil or English translations, contribute trilingual example sentences, or cite
            dictionary sources. All submissions undergo review before becoming verified entries.
          </p>
        </div>

        {submitSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-leaf-50 border border-leaf-300 text-leaf-950 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-leaf-700 shrink-0" />
            <span>{submitSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-ink-900 mb-1">
              Contribution Type *
            </label>
            <select
              value={contributionType}
              onChange={(e) => setContributionType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold bg-stone-50"
            >
              <option value="NEW_WORD">1. Suggest New Sinhala Word (නව වචනයක්)</option>
              <option value="TRANSLATION_CORRECTION">
                2. Correct Tamil / English Translation (පරිවර්තන නිවැරදි කිරීමක්)
              </option>
              <option value="REGIONAL_VOCABULARY">
                3. Submit Regional Dialect Vocabulary (ප්‍රාදේශීය ව්‍යවහාර)
              </option>
              <option value="EXAMPLE_SENTENCE">
                4. Suggest Trilingual Example Sentence (උදාහරණ වාක්‍යයක්)
              </option>
              <option value="INCORRECT_DEFINITION_REPORT">
                5. Report Incorrect Definition (අර්ථ දැක්වීමේ දෝෂයක්)
              </option>
              <option value="SOURCE_REFERENCE">
                6. Submit Dictionary / Academic Reference (මූලාශ්‍ර සාක්ෂි)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-900 mb-1">
              Part of Speech (පද බෙදීම)
            </label>
            <select
              value={partOfSpeech}
              onChange={(e) => setPartOfSpeech(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold bg-white"
            >
              <option value="Noun">Noun (නාම පදය)</option>
              <option value="Verb">Verb (ක්‍රියා පදය)</option>
              <option value="Adjective">Adjective (නාම විශේෂණය)</option>
              <option value="Adverb">Adverb (ක්‍රියා විශේෂණය)</option>
              <option value="Pronoun">Pronoun (සර්වනාමය)</option>
              <option value="Postposition">Postposition / Particle (නිපාත පදය)</option>
              <option value="Interjection">Interjection (විස්මයාර්ථ / ආචාර පදය)</option>
              <option value="Idiom / Proverb">Idiom / Proverb (ප්‍රස්තාව පිරුළු / රූඪි)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-900 mb-1">
              Sinhala Word (සිංහල වචනය) *
            </label>
            <input
              id="contrib-sinhala-word-input"
              type="text"
              required
              value={sinhalaWord}
              onChange={(e) => setSinhalaWord(e.target.value)}
              placeholder="උදා: කමත / අලමන්දාව"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-sinhala-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-900 mb-1">
              Romanized Pronunciation (උච්චාරණය)
            </label>
            <input
              type="text"
              value={romanizedPronunciation}
              onChange={(e) => setRomanizedPronunciation(e.target.value)}
              placeholder="e.g., kamata"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-900 mb-1">
              Tamil Meaning & Pronunciation (தமிழ் கருத்து)
            </label>
            <input
              type="text"
              value={proposedTamil}
              onChange={(e) => setProposedTamil(e.target.value)}
              placeholder="e.g., நெற்களம் / சூடு மிதிக்கும் களம்"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-tamil"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-900 mb-1">
              English Meaning
            </label>
            <input
              type="text"
              value={proposedEnglish}
              onChange={(e) => setProposedEnglish(e.target.value)}
              placeholder="e.g., Traditional paddy threshing floor"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm"
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-[#FAF7F2] border border-stone-200">
            <div>
              <label className="block text-[11px] font-bold text-ink-900 mb-1">
                Example Sentence in Sinhala
              </label>
              <input
                type="text"
                value={exampleSinhala}
                onChange={(e) => setExampleSinhala(e.target.value)}
                placeholder="සිංහල උදාහරණ වාක්‍යය..."
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-sinhala-sans bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-900 mb-1">
                Tamil Translation of Example
              </label>
              <input
                type="text"
                value={exampleTamil}
                onChange={(e) => setExampleTamil(e.target.value)}
                placeholder="தமிழ் மொழிபெயர்ப்பு..."
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-tamil bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-900 mb-1">
                English Translation of Example
              </label>
              <input
                type="text"
                value={exampleEnglish}
                onChange={(e) => setExampleEnglish(e.target.value)}
                placeholder="English translation..."
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-900 mb-1">
              Regional Dialect / Spoken vs. Literary Notes
            </label>
            <input
              type="text"
              value={regionalDialectNote}
              onChange={(e) => setRegionalDialectNote(e.target.value)}
              placeholder="e.g., Up-country (උඩරට), Southern (රුහුණු), or Literary Elu"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-900 mb-1">
              Dictionary / Literary Source Reference
            </label>
            <input
              type="text"
              value={sourceReference}
              onChange={(e) => setSourceReference(e.target.value)}
              placeholder="e.g., Carter (1924), Official Languages Glossary, Classical Text"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-900 mb-1">
              Your Name / Attribution *
            </label>
            <input
              id="contrib-author-input"
              type="text"
              required
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
              placeholder="e.g., Kasun Jayawardena"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-900 mb-1">
              Your Background / Role
            </label>
            <input
              type="text"
              value={contributorRole}
              onChange={(e) => setContributorRole(e.target.value)}
              placeholder="e.g., Native Speaker, Translator, University Researcher"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              id="contrib-submit-btn"
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-ceylon-700 hover:bg-ceylon-800 text-white text-xs font-bold inline-flex items-center gap-2 shadow"
            >
              <PlusCircle className="w-4 h-4" />
              {submitting ? 'Submitting for Review...' : 'Submit Contribution to Review Queue'}
            </button>
          </div>
        </form>
      </section>

      {/* Community Contribution Queue Feed */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-ink-950 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-ceylon-700" />
          Recent Community & Linguist Contributions ({contributions.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contributions.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl border border-stone-200 bg-[#FCFBF9] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold font-sinhala-serif text-ink-950">
                  {c.sinhala_word}{' '}
                  {c.romanized_pronunciation && (
                    <span className="text-xs font-mono text-stone-500">
                      /{c.romanized_pronunciation}/
                    </span>
                  )}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                    c.status === 'APPROVED'
                      ? 'bg-leaf-100 text-leaf-800'
                      : c.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  <Clock className="w-3 h-3" /> {c.status}
                </span>
              </div>

              <div className="text-xs text-stone-700">
                <span className="font-tamil font-medium text-ceylon-900">
                  {c.proposed_tamil}
                </span>{' '}
                • <strong>{c.proposed_english}</strong>
              </div>

              {c.example_sinhala && (
                <div className="text-xs font-sinhala-sans text-stone-600 italic">
                  “{c.example_sinhala}”
                </div>
              )}

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span>
                  By <strong>{c.contributor_name}</strong> ({c.contributor_role})
                </span>
                <span>{c.contribution_type.replace(/_/g, ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
