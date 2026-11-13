"use client";

import { useCallback, useSyncExternalStore } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { useSession } from "@/context/SessionContext";
import type { SavedCollection, SavedDraft, SavedItem } from "@/lib/saved-items";

// There is no saved-items API yet, so saves and their collections live in this browser, one list of each per signed-in account.
const CHANGED = "biltlinx:saved-changed";
const NONE: never[] = [];
const parsed = new Map<string, { raw: string | null; items: unknown[] }>();

function read<T>(storageKey: string): T[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch {
    // Storage can be blocked; saving then simply does not stick.
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

function write(storageKey: string, items: unknown[]) {
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

function useStorageKeys() {
  const { user } = useSession();
  const owner = user?.id ?? "guest";
  return { itemsKey: `biltlinx.saved.${owner}`, collectionsKey: `biltlinx.saved-collections.${owner}` };
}

function useStore() {
  const { itemsKey } = useStorageKeys();
  const items = useSyncExternalStore<SavedItem[]>(subscribe, () => read(itemsKey), () => NONE);

  const toggle = useCallback(
    (draft: SavedDraft) => {
      const current = read<SavedItem>(itemsKey);
      const exists = current.some((item) => item.key === draft.key);
      write(itemsKey, exists ? current.filter((item) => item.key !== draft.key) : [{ ...draft, savedAt: new Date().toISOString() }, ...current]);
      showSuccessToast(exists ? "Removed from saved" : "Saved. Find it on your Saved page.");
    },
    [itemsKey],
  );

  return { items, toggle };
}

/** Everything the signed-in user saved, newest first, with a way to unsave. */
export function useSavedItems() {
  const { items, toggle } = useStore();
  const remove = useCallback((item: SavedItem) => toggle(item), [toggle]);
  return { items, remove };
}

/** The user's collections, with ways to add one, delete one, and move a saved item into or out of one. */
export function useSavedCollections() {
  const { itemsKey, collectionsKey } = useStorageKeys();
  const collections = useSyncExternalStore<SavedCollection[]>(subscribe, () => read(collectionsKey), () => NONE);

  const create = useCallback(
    (name: string) => {
      const collection: SavedCollection = { id: crypto.randomUUID(), name };
      write(collectionsKey, [...read<SavedCollection>(collectionsKey), collection]);
      return collection;
    },
    [collectionsKey],
  );

  /** Without a collection the item goes back to being saved on its own. */
  const move = useCallback(
    (item: SavedItem, collection?: SavedCollection) => {
      write(itemsKey, read<SavedItem>(itemsKey).map((saved) => (saved.key === item.key ? { ...saved, collectionId: collection?.id } : saved)));
      showSuccessToast(collection ? `Moved to ${collection.name}` : "Removed from the collection");
    },
    [itemsKey],
  );

  /** Deletes the collection only; what was in it stays saved. */
  const remove = useCallback(
    (collection: SavedCollection) => {
      write(collectionsKey, read<SavedCollection>(collectionsKey).filter((entry) => entry.id !== collection.id));
      write(itemsKey, read<SavedItem>(itemsKey).map((saved) => (saved.collectionId === collection.id ? { ...saved, collectionId: undefined } : saved)));
      showSuccessToast("Collection deleted. Its items are still saved.");
    },
    [itemsKey, collectionsKey],
  );

  return { collections, create, move, remove };
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
