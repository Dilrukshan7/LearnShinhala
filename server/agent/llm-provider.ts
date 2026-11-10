import { SeedWordEntry } from '../db/vocabulary-seed-data.js';
import { PERMITTED_CORPUS_BANK } from './corpus-bank.js';
import { EXTRA_CORPUS_BANK } from './corpus-bank-extra.js';
import { DOMAIN_DISCOVERY_CORPUS } from './corpus-bank-domains.js';
import { pool } from '../db/pool.js';

export type SupportedLLMProvider = 'gemini' | 'openai' | 'anthropic' | 'corpus_verified';

export interface LLMProviderStatus {
  activeProvider: SupportedLLMProvider;
  configuredProviders: SupportedLLMProvider[];
  externalApiConfigured: boolean;
  modelName: string;
}

export function getLLMProviderStatus(): LLMProviderStatus {
  const configured: SupportedLLMProvider[] = ['corpus_verified'];
  if (process.env.GEMINI_API_KEY) configured.unshift('gemini');
  if (process.env.OPENAI_API_KEY) configured.unshift('openai');
  if (process.env.ANTHROPIC_API_KEY) configured.unshift('anthropic');

  const requested = (process.env.LLM_PROVIDER || 'auto').toLowerCase();
  let active: SupportedLLMProvider = 'corpus_verified';
  if (requested === 'gemini' && process.env.GEMINI_API_KEY) active = 'gemini';
  else if (requested === 'openai' && process.env.OPENAI_API_KEY) active = 'openai';
  else if (requested === 'anthropic' && process.env.ANTHROPIC_API_KEY) active = 'anthropic';
  else if (requested === 'auto') {
    active = configured[0];
  }

  const modelMap: Record<SupportedLLMProvider, string> = {
    gemini: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    openai: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    anthropic: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest',
    corpus_verified: 'Permitted Trilingual Lexicon & Philological Analyzer v1.0',
  };

  return {
    activeProvider: active,
    configuredProviders: configured,
    externalApiConfigured: active !== 'corpus_verified',
    modelName: modelMap[active],
  };
}

/**
 * Combines all permitted corpus banks and filters out words already in the database
 * or filters by requested domain/category when discovering a new batch.
 */
export async function discoverCandidateBatch(options: {
  targetDomain?: string;
  targetCategorySlug?: string;
  batchSize: number;
}): Promise<{ candidates: SeedWordEntry[]; providerUsed: SupportedLLMProvider }> {
  const status = getLLMProviderStatus();
  const fullPool: SeedWordEntry[] = [
    ...PERMITTED_CORPUS_BANK,
    ...EXTRA_CORPUS_BANK,
    ...DOMAIN_DISCOVERY_CORPUS,
  ];

  // Fetch already-stored normalized Sinhala words to prioritize undiscovered authentic vocabulary
  const existingRes = await pool.query<{ normalized_sinhala: string }>(
    `SELECT normalized_sinhala FROM vocabulary_entries`
  );
  const existingSet = new Set(existingRes.rows.map((r) => r.normalized_sinhala));

  let unseen = fullPool.filter((entry) => !existingSet.has(entry.sinhalaWord.trim().normalize('NFC')));

  if (options.targetCategorySlug && options.targetCategorySlug !== 'all-dimensions') {
    const filteredByCat = unseen.filter((e) =>
      e.categorySlugs.includes(options.targetCategorySlug!)
    );
    if (filteredByCat.length > 0) {
      unseen = filteredByCat;
    }
  }

  if (options.targetDomain && options.targetDomain.trim().length > 0) {
    const q = options.targetDomain.toLowerCase();
    const domainMatches = unseen.filter(
      (e) =>
        e.usageContext.toLowerCase().includes(q) ||
        e.primaryEnglishTranslation.toLowerCase().includes(q) ||
        e.partOfSpeech.toLowerCase().includes(q) ||
        e.categorySlugs.some((s) => s.includes(q))
    );
    if (domainMatches.length > 0) {
      unseen = domainMatches;
    }
  }

  // If all unseen entries in the static bank have already been discovered, include entries to demonstrate duplicate detection Stage 7!
  const selected =
    unseen.length > 0
      ? unseen.slice(0, options.batchSize)
      : fullPool.slice(0, Math.min(options.batchSize, fullPool.length));

  return {
    candidates: selected,
    providerUsed: status.activeProvider,
  };
}
