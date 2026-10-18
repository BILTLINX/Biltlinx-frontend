"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { showErrorToast, showSuccessToast } from "@/components/shared/AppToast";
import { CompareTray } from "@/components/shared/CompareTray";

/** How many things can be compared side by side. */
export const MAX_COMPARE = 4;

/** What is being compared. Only things of the same kind are compared together. */
export type CompareKind = "home" | "stay" | "project" | "professional" | "artisan";

export const COMPARE_KIND_PLURAL: Record<CompareKind, string> = {
  home: "homes",
  stay: "stays",
  project: "projects",
  professional: "professionals",
  artisan: "artisans",
};

export interface CompareItem {
  id: string;
  kind: CompareKind;
  title: string;
  price: string;
  /** A line of detail under the title, e.g. the area and who lists it. */
  subtitle?: string;
  image: string;
  /** The item's own page, when it has one. */
  href?: string;
}

interface CompareContextValue {
  items: CompareItem[];
  has: (id: string) => boolean;
  /** Adds the home, or takes it out if it is already in the tray. */
  toggle: (item: CompareItem) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

/** Holds the homes picked for comparison and shows the tray that lists them, on every page. */
export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  // The latest list, so two quick additions in a row never read a stale one.
  const latest = useRef<CompareItem[]>([]);

  const update = useCallback((next: CompareItem[]) => {
    latest.current = next;
    setItems(next);
  }, []);

  const has = useCallback((id: string) => items.some((item) => item.id === id), [items]);
  const remove = useCallback((id: string) => update(latest.current.filter((item) => item.id !== id)), [update]);
  const clear = useCallback(() => update([]), [update]);

  const toggle = useCallback(
    (item: CompareItem) => {
      if (latest.current.some((entry) => entry.id === item.id)) {
        remove(item.id);
        return;
      }
      const current = latest.current[0];
      if (current && current.kind !== item.kind) {
        showErrorToast(`You’re comparing ${COMPARE_KIND_PLURAL[current.kind]}. Clear them to compare ${COMPARE_KIND_PLURAL[item.kind]}.`);
        return;
      }
      if (latest.current.length >= MAX_COMPARE) {
        showErrorToast(`You can compare up to ${MAX_COMPARE} ${COMPARE_KIND_PLURAL[item.kind]}. Remove one to add another.`);
        return;
      }
      update([...latest.current, item]);
      showSuccessToast("Added to compare");
    },
    [remove, update],
  );

  const value = useMemo(() => ({ items, has, toggle, remove, clear }), [items, has, toggle, remove, clear]);

  return (
    <CompareContext.Provider value={value}>
      {children}
      <CompareTray />
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) throw new Error("useCompare must be used within a CompareProvider");
  return context;
}
