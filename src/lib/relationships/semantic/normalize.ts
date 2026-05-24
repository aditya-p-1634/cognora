import { isStopword } from "@/lib/relationships/semantic/stopwords";

const TOKEN_SPLIT = /[^a-z0-9]+/i;
const MIN_TOKEN_LENGTH = 3;

/** Stable key for matching themes, tags, and tokens. */
export function normalizeSemanticKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Human-facing label — preserves intentional casing when present. */
export function toDisplayLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/[A-Z]/.test(trimmed.slice(1))) return trimmed;
  return trimmed
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function tokenizeSemanticText(
  text: string,
  options?: { maxTokens?: number }
): string[] {
  const max = options?.maxTokens ?? 48;
  const seen = new Set<string>();
  const tokens: string[] = [];

  for (const raw of text.toLowerCase().split(TOKEN_SPLIT)) {
    const token = raw.trim();
    if (token.length < MIN_TOKEN_LENGTH) continue;
    if (isStopword(token)) continue;
    if (seen.has(token)) continue;
    seen.add(token);
    tokens.push(token);
    if (tokens.length >= max) break;
  }

  return tokens.sort((a, b) => a.localeCompare(b));
}

export function formatThemeList(themes: string[], limit = 3): string {
  const labels = themes.slice(0, limit).map(toDisplayLabel);
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels[0]}, ${labels[1]}, and others`;
}
