import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Volume2,
  RotateCw,
  CheckCircle2,
  XCircle,
  Bookmark,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
} from 'lucide-react';
import { speakText } from '../utils/speech';

interface LearningViewProps {
  onSelectWord: (idOrWord: number | string) => void;
}

type LearningMode =
  | 'flashcards'
  | 'si_to_ta_quiz'
  | 'si_to_en_quiz'
  | 'fill_blanks'
  | 'pronunciation'
  | 'personal_list';

export const LearningView: React.FC<LearningViewProps> = ({ onSelectWord }) => {
  const [mode, setMode] = useState<LearningMode>('flashcards');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [deck, setDeck] = useState<any[]>([]);
  const [fillBlanks, setFillBlanks] = useState<any[]>([]);
  const [personalList, setPersonalList] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Flashcard state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  // Fill in the blank state
  const [blankIndex, setBlankIndex] = useState(0);
  const [blankChoice, setBlankChoice] = useState<string | null>(null);

  const loadExercises = (diff = difficultyFilter) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (diff) params.set('difficulty', diff);
    params.set('learnerKey', 'default_learner');

    fetch(`/api/learning/exercises?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setDeck(data.flashcards || []);
        setFillBlanks(data.fillInTheBlanks || []);
        setPersonalList(data.personalProgress || []);
        setCollections(data.collections || []);
        setCardIndex(0);
        setQuizIndex(0);
        setBlankIndex(0);
        setSelectedOption(null);
        setBlankChoice(null);
        setIsFlipped(false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadExercises(difficultyFilter);
  }, [difficultyFilter]);

  const recordProgress = async (entryId: number, isCorrect?: boolean, inPersonalList?: boolean) => {
    try {
      await fetch('/api/learning/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerKey: 'default_learner',
          entryId,
          isCorrect,
          inPersonalList,
        }),
      });
      // Refresh personal list quietly
      fetch('/api/learning/exercises?learnerKey=default_learner')
        .then((r) => r.json())
        .then((d) => setPersonalList(d.personalProgress || []))
        .catch(() => {});
    } catch {
      // Ignore
    }
  };

  const currentCard = deck[cardIndex] || null;
  const currentQuizWord = deck[quizIndex % Math.max(1, deck.length)] || null;

  // Build deterministic multiple-choice options for the current quiz word
  const getQuizOptions = (targetLang: 'ta' | 'en') => {
    if (!currentQuizWord || deck.length === 0) return [];
    const correctVal =
      targetLang === 'ta'
        ? currentQuizWord.primary_tamil_translation
        : currentQuizWord.primary_english_translation;

    const distractors = deck
      .filter((w) => w.id !== currentQuizWord.id)
      .slice(0, 6)
      .map((w) =>
        targetLang === 'ta' ? w.primary_tamil_translation : w.primary_english_translation
      )
      .filter((v, idx, arr) => v !== correctVal && arr.indexOf(v) === idx)
      .slice(0, 3);

    const allOptions = [correctVal, ...distractors];
    // Deterministic sort based on string length + charCode so options don't jump on re-render
    return allOptions.sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));
  };

  const currentBlank = fillBlanks[blankIndex % Math.max(1, fillBlanks.length)] || null;
  const getBlankWordChoices = () => {
    if (!currentBlank) return [];
    const correctWord = currentBlank.answerSinhala;
    const others = deck
      .map((w) => w.sinhala_word)
      .filter((w) => w !== correctWord)
      .slice(0, 3);
    return [correctWord, ...others].sort();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Daily Collections */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-ink-950 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-leaf-700" />
              Interactive Trilingual Sinhala Learning & Practice Center
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Master Sinhala vocabulary through flashcards, Sinhala-to-Tamil & Sinhala-to-English
              quizzes, contextual fill-in-the-blanks, and phonetic pronunciation drills.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-stone-50 text-ink-900"
            >
              <option value="">All Difficulty Levels ({deck.length} words)</option>
              <option value="Beginner">Beginner Collection</option>
              <option value="Elementary">Elementary Collection</option>
              <option value="Intermediate">Intermediate & STEM</option>
              <option value="Academic">Academic Terminology</option>
            </select>
          </div>
        </div>

        {/* Daily Learning Collections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {collections.map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => setDifficultyFilter(col.filterDifficulty)}
              className={`text-left p-3.5 rounded-xl border transition-all ${
                difficultyFilter === col.filterDifficulty
                  ? 'bg-leaf-50 border-leaf-600 shadow-sm'
                  : 'bg-[#FAF7F2] border-stone-200 hover:border-ceylon-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-leaf-800 uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Collection
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-white border border-stone-200 font-semibold">
                  {col.difficulty}
                </span>
              </div>
              <div className="font-sinhala-sans font-bold text-sm text-ink-950 mt-1">
                {col.titleSi}
              </div>
              <div className="font-tamil text-xs text-stone-600">{col.titleTa}</div>
              <div className="text-xs font-semibold text-ink-800 mt-0.5">{col.titleEn}</div>
            </button>
          ))}
        </div>

        {/* Learning Mode Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
          {[
            { id: 'flashcards', label: '1. Vocabulary Flashcards' },
            { id: 'si_to_ta_quiz', label: '2. Sinhala → Tamil Practice (සිංහල → தமிழ்)' },
            { id: 'si_to_en_quiz', label: '3. Sinhala → English Practice' },
            { id: 'fill_blanks', label: '4. Fill-in-the-Blanks' },
            { id: 'pronunciation', label: '5. Listening & Pronunciation' },
            {
              id: 'personal_list',
              label: `6. Personal List & Progress (${personalList.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMode(tab.id as LearningMode);
                setSelectedOption(null);
                setBlankChoice(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                mode === tab.id
                  ? 'bg-ceylon-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-sm text-stone-500">
          Loading interactive learning deck...
        </div>
      ) : (
        <>
          {/* MODE 1: FLASHCARDS */}
          {mode === 'flashcards' && currentCard && (
            <section className="max-w-3xl mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-bold text-ink-900">
                  Flashcard {cardIndex + 1} of {deck.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
                  {currentCard.part_of_speech} • {currentCard.difficulty_level}
                </span>
              </div>

              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[260px] rounded-2xl border-2 border-ceylon-200 bg-gradient-to-br from-[#FCF9F4] to-[#F4EFE6] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-ceylon-500"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-ceylon-700 mb-2">
                  {isFlipped
                    ? 'Trilingual Meaning & Context (Click to Flip)'
                    : 'Sinhala Headword & Phonetics (Click to Reveal Translations)'}
                </div>

                <h2 className="text-4xl sm:text-5xl font-extrabold font-sinhala-serif text-ink-950">
                  {currentCard.sinhala_word}
                </h2>
                <p className="text-sm font-mono text-stone-600 mt-2">
                  /{currentCard.romanized_pronunciation}/ •{' '}
                  <span className="font-tamil text-ceylon-800">
                    [{currentCard.tamil_pronunciation_guide}]
                  </span>
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(
                      currentCard.sinhala_word,
                      'si-LK',
                      currentCard.romanized_pronunciation
                    );
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-semibold text-ceylon-800 hover:bg-ceylon-50"
                >
                  <Volume2 className="w-4 h-4" /> Listen Pronunciation
                </button>

                {isFlipped && (
                  <div className="mt-6 pt-5 border-t border-stone-300/70 w-full space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-white border border-stone-200">
                        <span className="text-[10px] font-bold uppercase text-ceylon-700 block">
                          தமிழ் கருத்து (Tamil)
                        </span>
                        <span className="text-lg font-bold font-tamil text-ink-950">
                          {currentCard.primary_tamil_translation}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-stone-200">
                        <span className="text-[10px] font-bold uppercase text-leaf-700 block">
                          English Meaning
                        </span>
                        <span className="text-lg font-bold text-ink-950">
                          {currentCard.primary_english_translation}
                        </span>
                      </div>
                    </div>
                    {currentCard.usage_context && (
                      <p className="text-xs text-stone-600">{currentCard.usage_context}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFlipped(false);
                      setCardIndex((prev) => (prev - 1 + deck.length) % deck.length);
                    }}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-bold text-ink-900 hover:bg-stone-100"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-stone-100 text-xs font-bold text-ink-900 hover:bg-stone-200"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> {isFlipped ? 'Hide Answer' : 'Reveal Answer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFlipped(false);
                      setCardIndex((prev) => (prev + 1) % deck.length);
                    }}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-ceylon-700 text-white text-xs font-bold hover:bg-ceylon-800"
                  >
                    Next Card <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => recordProgress(currentCard.id, true, true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-leaf-600 text-white text-xs font-bold hover:bg-leaf-700"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark Mastered & Save
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectWord(currentCard.id)}
                    className="text-xs font-bold text-ceylon-700 hover:underline"
                  >
                    Open Word Page
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* MODE 2 & 3: SINHALA-TO-TAMIL & SINHALA-TO-ENGLISH MULTIPLE-CHOICE QUIZZES */}
          {(mode === 'si_to_ta_quiz' || mode === 'si_to_en_quiz') && currentQuizWord && (
            <section className="max-w-3xl mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ceylon-800">
                  {mode === 'si_to_ta_quiz'
                    ? 'Sinhala → Tamil Translation Practice (සිංහල → தமிழ்)'
                    : 'Sinhala → English Translation Practice'}
                </span>
                <span className="px-3 py-1 rounded-full bg-leaf-100 text-leaf-900 text-xs font-bold">
                  Score: {quizScore.correct} / {quizScore.total}
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF6F0] border border-stone-200 text-center space-y-2">
                <div className="text-xs text-stone-500">
                  Select the accurate{' '}
                  <strong>{mode === 'si_to_ta_quiz' ? 'Tamil (தமிழ்)' : 'English'}</strong> meaning
                  for:
                </div>
                <div className="flex items-center justify-center gap-3">
                  <h3 className="text-4xl font-extrabold font-sinhala-serif text-ink-950">
                    {currentQuizWord.sinhala_word}
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      speakText(
                        currentQuizWord.sinhala_word,
                        'si-LK',
                        currentQuizWord.romanized_pronunciation
                      )
                    }
                    className="p-2 rounded-lg bg-white border border-stone-200 text-ceylon-700"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs font-mono text-stone-600">
                  /{currentQuizWord.romanized_pronunciation}/ • {currentQuizWord.part_of_speech}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {getQuizOptions(mode === 'si_to_ta_quiz' ? 'ta' : 'en').map((option) => {
                  const correctAns =
                    mode === 'si_to_ta_quiz'
                      ? currentQuizWord.primary_tamil_translation
                      : currentQuizWord.primary_english_translation;
                  const isChosen = selectedOption === option;
                  const isCorrect = option === correctAns;

                  let btnClass =
                    'bg-white border-stone-200 hover:border-ceylon-600 text-ink-950';
                  if (selectedOption) {
                    if (isCorrect) {
                      btnClass = 'bg-leaf-100 border-leaf-600 text-leaf-950 font-bold';
                    } else if (isChosen) {
                      btnClass = 'bg-red-50 border-red-400 text-red-900';
                    }
                  }

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={Boolean(selectedOption)}
                      onClick={() => {
                        setSelectedOption(option);
                        const ok = option === correctAns;
                        setQuizScore((prev) => ({
                          correct: prev.correct + (ok ? 1 : 0),
                          total: prev.total + 1,
                        }));
                        recordProgress(currentQuizWord.id, ok);
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-2 ${btnClass}`}
                    >
                      <span className={mode === 'si_to_ta_quiz' ? 'font-tamil text-base' : 'text-sm'}>
                        {option}
                      </span>
                      {selectedOption && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-leaf-700 shrink-0" />
                      )}
                      {selectedOption && isChosen && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedOption && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="text-xs text-stone-700">
                    <strong>{currentQuizWord.sinhala_word}</strong> ({currentQuizWord.romanized_pronunciation}
                    ): <span className="font-tamil">{currentQuizWord.primary_tamil_translation}</span> —{' '}
                    {currentQuizWord.primary_english_translation}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOption(null);
                      setQuizIndex((prev) => prev + 1);
                    }}
                    className="px-4 py-2 rounded-xl bg-ceylon-700 text-white text-xs font-bold"
                  >
                    Next Question →
                  </button>
                </div>
              )}
            </section>
          )}

          {/* MODE 4: FILL-IN-THE-BLANKS */}
          {mode === 'fill_blanks' && currentBlank && (
            <section className="max-w-3xl mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-bold text-ink-900">
                  Contextual Fill-in-the-Blank #{blankIndex + 1} of {fillBlanks.length}
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF6F0] border border-stone-200 space-y-3">
                <div className="text-xl font-sinhala-sans font-bold text-ink-950">
                  {currentBlank.blankedSentence}
                </div>
                <div className="text-xs font-tamil text-ceylon-900">
                  தமிழ் குறிப்பு (Tamil Hint): {currentBlank.tamilHint}
                </div>
                <div className="text-xs text-stone-700">
                  English Hint: {currentBlank.englishHint}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {getBlankWordChoices().map((choice) => {
                  const isCorrect = choice === currentBlank.answerSinhala;
                  const isPicked = blankChoice === choice;
                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => {
                        setBlankChoice(choice);
                        recordProgress(currentBlank.entryId, isCorrect);
                      }}
                      className={`p-3.5 rounded-xl border-2 font-sinhala-serif font-bold text-lg transition-colors ${
                        blankChoice
                          ? isCorrect
                            ? 'bg-leaf-100 border-leaf-600 text-leaf-950'
                            : isPicked
                            ? 'bg-red-50 border-red-400 text-red-900'
                            : 'bg-white border-stone-200'
                          : 'bg-white border-stone-200 hover:border-ceylon-600'
                      }`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>

              {blankChoice && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="text-xs font-sinhala-sans text-ink-900">
                    Complete Sentence: <strong>{currentBlank.fullSinhalaSentence}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBlankChoice(null);
                      setBlankIndex((prev) => prev + 1);
                    }}
                    className="px-4 py-2 rounded-xl bg-ceylon-700 text-white text-xs font-bold"
                  >
                    Next Sentence →
                  </button>
                </div>
              )}
            </section>
          )}

          {/* MODE 5: LISTENING & PRONUNCIATION EXERCISES */}
          {mode === 'pronunciation' && (
            <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-ink-950">
                Listening, Syllable Breakdown & Phonetic Articulation Studio
              </h2>
              <p className="text-xs text-stone-600">
                Click the speaker button on any entry to hear Sinhala, Tamil, and English audio
                synthesis while comparing Romanized IPA and Tamil script phonetic guides.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deck.slice(0, 10).map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-xl border border-stone-200 bg-[#FCFBF9] flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold font-sinhala-serif text-ink-950">
                          {w.sinhala_word}
                        </span>
                        <span className="text-xs font-mono text-ceylon-800">
                          {w.ipa_transcription || `/${w.romanized_pronunciation}/`}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 mt-1">
                        Syllables: <strong className="font-mono">{w.syllable_breakdown || w.sinhala_word}</strong>
                      </div>
                      <div className="text-xs font-tamil text-stone-700 mt-0.5">
                        Tamil Phonetic: <strong>{w.tamil_pronunciation_guide}</strong> —{' '}
                        {w.primary_tamil_translation}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        speakText(w.sinhala_word, 'si-LK', w.romanized_pronunciation)
                      }
                      className="px-3.5 py-2 rounded-xl bg-ceylon-700 hover:bg-ceylon-800 text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
                    >
                      <Volume2 className="w-4 h-4" /> Play Audio
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* MODE 6: PERSONAL VOCABULARY LIST & PROGRESS */}
          {mode === 'personal_list' && (
            <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink-950 flex items-center gap-2">
                  <Award className="w-5 h-5 text-leaf-700" />
                  Personal Vocabulary List & Mastery Progress
                </h2>
                <span className="text-xs font-semibold text-stone-500">
                  {personalList.length} tracked words
                </span>
              </div>

              {personalList.length === 0 ? (
                <div className="p-8 text-center text-sm text-stone-600 bg-stone-50 rounded-xl border border-stone-200">
                  <Bookmark className="w-6 h-6 text-ceylon-700 mx-auto mb-2" />
                  Practice flashcards or quizzes, or click "Save to Personal List" on any word page
                  to build your personal study deck.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {personalList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectWord(item.entry_id)}
                      className="p-4 rounded-xl border border-stone-200 hover:border-ceylon-600 cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-xl font-bold font-sinhala-serif text-ink-950">
                          {item.sinhala_word}{' '}
                          <span className="text-xs font-mono text-stone-500">
                            /{item.romanized_pronunciation}/
                          </span>
                        </div>
                        <div className="text-xs text-stone-700 mt-0.5">
                          <span className="font-tamil">{item.primary_tamil_translation}</span> •{' '}
                          {item.primary_english_translation}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-leaf-700">
                          Mastery: {item.mastery_score}%
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Practiced {item.times_practiced}x
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};
