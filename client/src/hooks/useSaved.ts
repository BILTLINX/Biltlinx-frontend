"use client";

import { useCallback, useSyncExternalStore } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { useSession } from "@/context/SessionContext";
import type { SavedDraft, SavedItem } from "@/lib/saved-items";

// There is no saved-items API yet, so saves live in this browser, one list per signed-in account.
const CHANGED = "biltlinx:saved-changed";
const NONE: SavedItem[] = [];
const parsed = new Map<string, { raw: string | null; items: SavedItem[] }>();

function read(storageKey: string): SavedItem[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch {
    // Storage can be blocked; saving then simply does not stick.
  }
  const cached = parsed.get(storageKey);
  if (cached && cached.raw === raw) return cached.items;
  let items = NONE;
  try {
    const value: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(value)) items = value as SavedItem[];
  } catch {
    // A damaged list is treated as empty.
  }
  parsed.set(storageKey, { raw, items });
  return items;
}

function write(storageKey: string, items: SavedItem[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {
    // See read().
  }
  window.dispatchEvent(new Event(CHANGED));
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGED, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGED, callback);
    window.removeEventListener("storage", callback);
  };
}

function useStore() {
  const { user } = useSession();
  const storageKey = `biltlinx.saved.${user?.id ?? "guest"}`;
  const items = useSyncExternalStore(subscribe, () => read(storageKey), () => NONE);

  const toggle = useCallback(
    (draft: SavedDraft) => {
      const current = read(storageKey);
      const exists = current.some((item) => item.key === draft.key);
      write(storageKey, exists ? current.filter((item) => item.key !== draft.key) : [{ ...draft, savedAt: new Date().toISOString() }, ...current]);
      showSuccessToast(exists ? "Removed from saved" : "Saved. Find it on your Saved page.");
    },
    [storageKey],
  );

  return { items, toggle };
}

/** Everything the signed-in user saved, newest first, with a way to unsave. */
export function useSavedItems() {
  const { items, toggle } = useStore();
  const remove = useCallback((item: SavedItem) => toggle(item), [toggle]);
  return { items, remove };
}

/** Whether one listing, post or reel is saved, and a toggle that saves it to (or removes it from) the Saved page. `item` is null for something that cannot be saved. */
export function useSaved(item: SavedDraft | null) {
  const { items, toggle } = useStore();
  return {
    canSave: item !== null,
    saved: item !== null && items.some((saved) => saved.key === item.key),
    toggle: () => item && toggle(item),
  };
}
