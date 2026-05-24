import { normalizeSemanticKey } from "@/lib/relationships/semantic/normalize";

/** Phrases and tokens that carry little thematic specificity. */
const GENERIC_PHRASES = [
  "held in continuity",
  "awaiting further connection",
  "thought preserved",
  "captured thought",
  "open loop at capture",
  "context may deepen",
  "preserved thought",
  "further connection",
];

const GENERIC_TOKENS = new Set([
  "note",
  "notes",
  "idea",
  "ideas",
  "thought",
  "thoughts",
  "stuff",
  "thing",
  "things",
  "todo",
  "test",
  "misc",
  "general",
  "random",
  "update",
  "reminder",
  "draft",
  "entry",
]);

export function isGenericTheme(key: string): boolean {
  const normalized = normalizeSemanticKey(key);
  if (!normalized) return true;
  if (GENERIC_TOKENS.has(normalized)) return true;
  if (normalized.length < 3) return true;
  return GENERIC_PHRASES.some((phrase) => normalized.includes(phrase));
}

export function isGenericToken(token: string): boolean {
  return GENERIC_TOKENS.has(token) || token.length < 4;
}

export function specificThemeCount(themes: string[]): number {
  return themes.filter((t) => !isGenericTheme(t)).length;
}
