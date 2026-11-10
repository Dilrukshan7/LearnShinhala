export type UILanguage = 'all' | 'si' | 'ta' | 'en';

export interface CategoryTag {
  id?: number;
  slug: string;
  dimension_code: string;
  dimension_name?: string;
  name_si: string;
  name_ta: string;
  name_en: string;
  word_count?: number;
}

export interface VocabularySummary {
  id: number;
  sinhala_word: string;
  normalized_sinhala: string;
  sinhala_initial_letter: string;
  romanized_pronunciation: string;
  tamil_pronunciation_guide?: string;
  primary_tamil_translation: string;
  primary_english_translation: string;
  part_of_speech: string;
  grammatical_classification?: string;
  difficulty_level: string;
  usage_context?: string;
  register: string;
  spoken_vs_literary?: string;
  regional_variations?: string;
  verification_status: 'VERIFIED' | 'SOURCE_SUPPORTED' | 'AI_SUGGESTION' | 'UNVERIFIED' | 'DISPUTED_OR_REGIONAL';
  confidence_score: number | string;
  is_demo_dataset?: boolean;
  view_count?: number;
  origin_language?: string;
  root_word?: string;
  categories?: CategoryTag[];
}

export interface WordDetailDossier {
  entry: VocabularySummary & {
    etymology_notes?: string;
    created_at: string;
    updated_at: string;
  };
  pronunciation: {
    romanized_standard: string;
    romanized_phonetic?: string;
    ipa_transcription?: string;
    tamil_script_phonetic?: string;
    syllable_breakdown?: string;
    regional_accent_notes?: string;
  } | null;
  senses: Array<{
    id: number;
    sense_number: number;
    sinhala_definition: string;
    tamil_meaning: string;
    english_meaning: string;
    contextual_usage: string;
    formal_usage_note?: string;
    informal_usage_note?: string;
    domain_tag?: string;
  }>;
  translations: Array<{
    id: number;
    language_code: 'ta' | 'en';
    translated_word: string;
    pronunciation_guide?: string;
    context_note?: string;
    is_primary: boolean;
    confidence_score: number;
  }>;
  examples: Array<{
    id: number;
    sinhala_sentence: string;
    sinhala_romanized?: string;
    tamil_translation: string;
    english_translation: string;
    usage_register: string;
    context_note?: string;
  }>;
  synonyms: Array<{
    id: number;
    synonym_sinhala: string;
    synonym_romanized?: string;
    tamil_meaning?: string;
    english_meaning?: string;
    nuance_note?: string;
  }>;
  antonyms: Array<{
    id: number;
    antonym_sinhala: string;
    antonym_romanized?: string;
    tamil_meaning?: string;
    english_meaning?: string;
    contrast_note?: string;
  }>;
  relatedWords: Array<{
    id: number;
    related_sinhala: string;
    related_romanized?: string;
    relation_type: string;
    tamil_meaning?: string;
    english_meaning?: string;
  }>;
  wordForms: Array<{
    id: number;
    form_type: string;
    sinhala_form: string;
    romanized_form?: string;
    tamil_equivalent?: string;
    english_gloss?: string;
    grammatical_note?: string;
  }>;
  linguisticRoot: {
    origin_language: string;
    root_word: string;
    derivation_type: string;
    historical_evolution: string;
    cognates?: string;
    etymology_reference?: string;
  } | null;
  categories: CategoryTag[];
  sources: Array<{
    source_code: string;
    title: string;
    author_or_institution: string;
    publication_year?: number;
    source_type: string;
    license_status: string;
    reference_url?: string;
    reliability_weight: number;
    citation_locator?: string;
    verification_note?: string;
  }>;
  auditHistory: Array<{
    id: number;
    action: string;
    actor: string;
    summary: string;
    created_at: string;
  }>;
}

export interface DimensionGroup {
  code: string;
  nameEn: string;
  nameSi: string;
  nameTa: string;
  description: string;
  totalWordsInDimension: number;
  categories: CategoryTag[];
}
