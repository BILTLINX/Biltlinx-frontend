"use client";

import { useSyncExternalStore } from "react";
import type { ListingTarget } from "@/components/shared/CreateListingModal";

/** What the one shared "list a property, stay or service" dialog is open on, or null when it is closed. It is shared so a button on any page can open it without leaving the page. */
let target: ListingTarget | null = null;
const listeners = new Set<() => void>();

function set(next: ListingTarget | null) {
  target = next;
  listeners.forEach((listener) => listener());
}

export const openListingDialog = (next: ListingTarget) => set(next);
export const closeListingDialog = () => set(null);

export function useListingDialogTarget() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => target,
    () => null,
  );
}
