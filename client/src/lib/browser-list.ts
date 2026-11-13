// Lists kept in this browser for features whose API does not exist yet (saved items, communities you start): one JSON array per storage key.
const CHANGED = "biltlinx:list-changed";
export const NONE: never[] = [];
const parsed = new Map<string, { raw: string | null; items: unknown[] }>();

/** The list under `storageKey`. The same array is returned until the stored text changes, so it is safe as a `useSyncExternalStore` snapshot. */
export function readList<T>(storageKey: string): T[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch {
    // Storage can be blocked; changes then simply do not stick.
  }
  const cached = parsed.get(storageKey);
  if (cached && cached.raw === raw) return cached.items as T[];
  let items: unknown[] = NONE;
  try {
    const value: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(value)) items = value;
  } catch {
    // A damaged list is treated as empty.
  }
  parsed.set(storageKey, { raw, items });
  return items as T[];
}

export function writeList(storageKey: string, items: unknown[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {
    // See readList().
  }
  window.dispatchEvent(new Event(CHANGED));
}

/** Calls back when any list changes, in this tab or another one. */
export function subscribeToLists(callback: () => void) {
  window.addEventListener(CHANGED, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGED, callback);
    window.removeEventListener("storage", callback);
  };
}
