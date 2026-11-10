/**
 * Sinhala Orthographic, Phonetic, and Unicode Verification Utilities
 * Preserves authentic Sinhala Unicode (U+0D80..U+0DFF + ZWJ U+200D) and implements
 * true Sinhala alphabetical ordering (Swara -> Vyanjana -> Pillam diacritics).
 */

export interface SinhalaLetterInfo {
  letter: string;
  roman: string;
  tamilApprox: string;
  type: 'vowel' | 'consonant';
  orderIndex: number;
}

/**
 * Canonical Sinhala Alphabet (Hodiya) in strict traditional lexicographical order.
 */
export const SINHALA_ALPHABET: SinhalaLetterInfo[] = [
  // Swara (Vowels)
  { letter: 'අ', roman: 'a', tamilApprox: 'அ', type: 'vowel', orderIndex: 1 },
  { letter: 'ආ', roman: 'ā', tamilApprox: 'ஆ', type: 'vowel', orderIndex: 2 },
  { letter: 'ඇ', roman: 'æ', tamilApprox: 'அ(ए)', type: 'vowel', orderIndex: 3 },
  { letter: 'ඈ', roman: 'ǣ', tamilApprox: 'ஆ(ஏ)', type: 'vowel', orderIndex: 4 },
  { letter: 'ඉ', roman: 'i', tamilApprox: 'இ', type: 'vowel', orderIndex: 5 },
  { letter: 'ඊ', roman: 'ī', tamilApprox: 'ஈ', type: 'vowel', orderIndex: 6 },
  { letter: 'උ', roman: 'u', tamilApprox: 'உ', type: 'vowel', orderIndex: 7 },
  { letter: 'ඌ', roman: 'ū', tamilApprox: 'ஊ', type: 'vowel', orderIndex: 8 },
  { letter: 'ඍ', roman: 'ṛ', tamilApprox: 'ரு', type: 'vowel', orderIndex: 9 },
  { letter: 'එ', roman: 'e', tamilApprox: 'எ', type: 'vowel', orderIndex: 10 },
  { letter: 'ඒ', roman: 'ē', tamilApprox: 'ஏ', type: 'vowel', orderIndex: 11 },
  { letter: 'ඓ', roman: 'ai', tamilApprox: 'ஐ', type: 'vowel', orderIndex: 12 },
  { letter: 'ඔ', roman: 'o', tamilApprox: 'ஒ', type: 'vowel', orderIndex: 13 },
  { letter: 'ඕ', roman: 'ō', tamilApprox: 'ஓ', type: 'vowel', orderIndex: 14 },
  { letter: 'ඖ', roman: 'au', tamilApprox: 'ஔ', type: 'vowel', orderIndex: 15 },

  // Vyanjana (Consonants)
  { letter: 'ක', roman: 'ka', tamilApprox: 'க', type: 'consonant', orderIndex: 16 },
  { letter: 'ඛ', roman: 'kha', tamilApprox: 'க', type: 'consonant', orderIndex: 17 },
  { letter: 'ග', roman: 'ga', tamilApprox: 'க/ग', type: 'consonant', orderIndex: 18 },
  { letter: 'ඝ', roman: 'gha', tamilApprox: 'க', type: 'consonant', orderIndex: 19 },
  { letter: 'ඞ', roman: 'ṅa', tamilApprox: 'ங', type: 'consonant', orderIndex: 20 },
  { letter: 'ඟ', roman: 'ṉga', tamilApprox: 'ங்க', type: 'consonant', orderIndex: 21 },
  { letter: 'ච', roman: 'ca', tamilApprox: 'ச', type: 'consonant', orderIndex: 22 },
  { letter: 'ඡ', roman: 'cha', tamilApprox: 'ச', type: 'consonant', orderIndex: 23 },
  { letter: 'ජ', roman: 'ja', tamilApprox: 'ஜ', type: 'consonant', orderIndex: 24 },
  { letter: 'ඣ', roman: 'jha', tamilApprox: 'ஜ', type: 'consonant', orderIndex: 25 },
  { letter: 'ඤ', roman: 'ña', tamilApprox: 'ஞ', type: 'consonant', orderIndex: 26 },
  { letter: 'ඥ', roman: 'jña', tamilApprox: 'ஞ', type: 'consonant', orderIndex: 27 },
  { letter: 'ඦ', roman: 'ṉja', tamilApprox: 'ஞ்ச', type: 'consonant', orderIndex: 28 },
  { letter: 'ට', roman: 'ṭa', tamilApprox: 'ட', type: 'consonant', orderIndex: 29 },
  { letter: 'ඨ', roman: 'ṭha', tamilApprox: 'ட', type: 'consonant', orderIndex: 30 },
  { letter: 'ඩ', roman: 'ḍa', tamilApprox: 'ட/ड', type: 'consonant', orderIndex: 31 },
  { letter: 'ඪ', roman: 'ḍha', tamilApprox: 'ட', type: 'consonant', orderIndex: 32 },
  { letter: 'ණ', roman: 'ṇa', tamilApprox: 'ண', type: 'consonant', orderIndex: 33 },
  { letter: 'ඬ', roman: 'ṉḍa', tamilApprox: 'ண்ட', type: 'consonant', orderIndex: 34 },
  { letter: 'ත', roman: 'ta', tamilApprox: 'த', type: 'consonant', orderIndex: 35 },
  { letter: 'ථ', roman: 'tha', tamilApprox: 'த', type: 'consonant', orderIndex: 36 },
  { letter: 'ද', roman: 'da', tamilApprox: 'த/द', type: 'consonant', orderIndex: 37 },
  { letter: 'ධ', roman: 'dha', tamilApprox: 'த', type: 'consonant', orderIndex: 38 },
  { letter: 'න', roman: 'na', tamilApprox: 'ந/ன', type: 'consonant', orderIndex: 39 },
  { letter: 'ඳ', roman: 'ṉda', tamilApprox: 'ந்த', type: 'consonant', orderIndex: 40 },
  { letter: 'ප', roman: 'pa', tamilApprox: 'ப', type: 'consonant', orderIndex: 41 },
  { letter: 'ඵ', roman: 'pha', tamilApprox: 'ப', type: 'consonant', orderIndex: 42 },
  { letter: 'බ', roman: 'ba', tamilApprox: 'ப/ब', type: 'consonant', orderIndex: 43 },
  { letter: 'භ', roman: 'bha', tamilApprox: 'ப', type: 'consonant', orderIndex: 44 },
  { letter: 'ම', roman: 'ma', tamilApprox: 'ம', type: 'consonant', orderIndex: 45 },
  { letter: 'ඹ', roman: 'mba', tamilApprox: 'ம்ப', type: 'consonant', orderIndex: 46 },
  { letter: 'ය', roman: 'ya', tamilApprox: 'ய', type: 'consonant', orderIndex: 47 },
  { letter: 'ර', roman: 'ra', tamilApprox: 'ர', type: 'consonant', orderIndex: 48 },
  { letter: 'ල', roman: 'la', tamilApprox: 'ல', type: 'consonant', orderIndex: 49 },
  { letter: 'ව', roman: 'va', tamilApprox: 'வ', type: 'consonant', orderIndex: 50 },
  { letter: 'ශ', roman: 'śa', tamilApprox: 'ஶ', type: 'consonant', orderIndex: 51 },
  { letter: 'ෂ', roman: 'ṣa', tamilApprox: 'ஷ', type: 'consonant', orderIndex: 52 },
  { letter: 'ස', roman: 'sa', tamilApprox: 'ஸ/ச', type: 'consonant', orderIndex: 53 },
  { letter: 'හ', roman: 'ha', tamilApprox: 'ஹ', type: 'consonant', orderIndex: 54 },
  { letter: 'ළ', roman: 'ḷa', tamilApprox: 'ள', type: 'consonant', orderIndex: 55 },
  { letter: 'ෆ', roman: 'fa', tamilApprox: 'ஃப', type: 'consonant', orderIndex: 56 },
];

const LETTER_ORDER_MAP = new Map<string, number>(
  SINHALA_ALPHABET.map((item) => [item.letter, item.orderIndex])
);

const DIACRITIC_ORDER_MAP = new Map<string, number>([
  ['ං', 1], // अनुस्वार (binduva)
  ['ඃ', 2], // विसर्ग (visargaya)
  ['්', 3], // al-lakuna (virama)
  ['ා', 4], // aela-pilla (ā)
  ['ැ', 5], // keti aeda-pilla (æ)
  ['ෑ', 6], // diga aeda-pilla (ǣ)
  ['ි', 7], // keti is-pilla (i)
  ['ී', 8], // diga is-pilla (ī)
  ['ු', 9], // keti paa-pilla (u)
  ['ූ', 10], // diga paa-pilla (ū)
  ['ෘ', 11], // gaetta-pilla (ṛ)
  ['ෙ', 12], // kombuva (e)
  ['ේ', 13], // diga kombuva (ē)
  ['ෛ', 14], // kombu deka (ai)
  ['ො', 15], // kombuva haa aela-pilla (o)
  ['ෝ', 16], // kombuva haa diga aela-pilla (ō)
  ['ෞ', 17], // kombuva haa gayanukitta (au)
]);

/**
 * Normalizes a Sinhala string to canonical Unicode NFC while preserving legitimate
 * Zero-Width Joiner (U+200D) sequences used for yansaya and rakaransaya.
 */
export function normalizeSinhalaWord(input: string): string {
  return input
    .trim()
    .normalize('NFC')
    .replace(/\s+/g, ' ');
}

/**
 * Extracts the primary Sinhala base letter for alphabetical indexing.
 */
export function getSinhalaInitialLetter(word: string): string {
  const normalized = normalizeSinhalaWord(word);
  for (const char of normalized) {
    if (LETTER_ORDER_MAP.has(char)) {
      return char;
    }
  }
  return normalized.charAt(0) || 'අ';
}

/**
 * Generates a deterministic lexicographical sort key that respects true Sinhala
 * alphabetical ordering (Swara -> Vyanjana -> Dependent Vowel Signs).
 */
export function computeSinhalaSortKey(word: string): string {
  const normalized = normalizeSinhalaWord(word);
  const parts: string[] = [];

  for (const char of normalized) {
    if (LETTER_ORDER_MAP.has(char)) {
      const idx = LETTER_ORDER_MAP.get(char)!;
      parts.push(`L${String(idx).padStart(3, '0')}`);
    } else if (DIACRITIC_ORDER_MAP.has(char)) {
      const dIdx = DIACRITIC_ORDER_MAP.get(char)!;
      parts.push(`D${String(dIdx).padStart(2, '0')}`);
    } else if (char === '\u200D') {
      parts.push('Z01');
    } else if (char === ' ') {
      parts.push('S00');
    } else {
      parts.push(`U${char.charCodeAt(0).toString(16).padStart(4, '0')}`);
    }
  }

  return parts.join('-');
}

/**
 * Verifies whether a candidate string contains authentic, well-formed Sinhala Unicode
 * without corrupted diacritics or non-Sinhala script contamination.
 */
export function verifySinhalaUnicode(word: string): {
  isValid: boolean;
  normalized: string;
  issues: string[];
  score: number;
} {
  const normalized = normalizeSinhalaWord(word);
  const issues: string[] = [];

  if (!normalized || normalized.length === 0) {
    return { isValid: false, normalized: '', issues: ['Empty Sinhala word'], score: 0 };
  }

  let sinhalaCharCount = 0;
  let prevWasVirama = false;

  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    const ch = normalized[i];

    const isSinhalaRange = code >= 0x0d80 && code <= 0x0dff;
    const isZWJ = code === 0x200d;
    const isAllowedPunct = ch === ' ' || ch === '-' || ch === '/';

    if (isSinhalaRange) {
      sinhalaCharCount++;
    } else if (!isZWJ && !isAllowedPunct) {
      issues.push(`Unexpected non-Sinhala character '${ch}' (U+${code.toString(16).toUpperCase()})`);
    }

    if (ch === '්') {
      if (prevWasVirama) {
        issues.push('Double consecutive al-lakuna (්) detected');
      }
      prevWasVirama = true;
    } else if (code !== 0x200d) {
      prevWasVirama = false;
    }
  }

  if (sinhalaCharCount === 0) {
    issues.push('No Sinhala script characters found');
  }

  // First character cannot be a dependent vowel sign (pillam)
  const firstChar = normalized[0];
  if (DIACRITIC_ORDER_MAP.has(firstChar)) {
    issues.push('Word begins with a detached dependent vowel sign (pillam) instead of a base letter');
  }

  const isValid = issues.length === 0 && sinhalaCharCount > 0;
  const score = isValid ? 1.0 : Math.max(0, 1 - issues.length * 0.35);

  return {
    isValid,
    normalized,
    issues,
    score,
  };
}
