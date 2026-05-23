export function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readStorageRaw(key: string): string | null {
  if (!canUseLocalStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorageRaw(key: string, value: string): boolean {
  if (!canUseLocalStorage()) return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function readStorageJson<T>(
  key: string,
  parse: (raw: unknown) => T | null
): T | null {
  const raw = readStorageRaw(key);
  if (!raw) return null;
  try {
    return parse(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function writeStorageJson(key: string, value: unknown): boolean {
  try {
    return writeStorageRaw(key, JSON.stringify(value));
  } catch {
    return false;
  }
}
