"use client";

import { useSyncExternalStore } from "react";

/** Whether the "Post a request" dialog is open. It is shared so any button on any page can open the one dialog the app mounts. */
let open = false;
const listeners = new Set<() => void>();

function set(next: boolean) {
  open = next;
  listeners.forEach((listener) => listener());
}

export const openRequestModal = () => set(true);
export const closeRequestModal = () => set(false);

export function useRequestModalOpen() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => open,
    () => false,
  );
}
