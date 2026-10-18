"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { setActiveOrganizationId } from "@/lib/api";

const STORAGE_KEY = "biltlinx:active-organization";

interface OrganizationContextValue {
  activeOrganizationId: string | null;
  switchOrganization: (id: string | null) => void;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

function readStored(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(id: string | null) {
  try {
    if (id) window.localStorage.setItem(STORAGE_KEY, id);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [activeOrganizationId, setActive] = useState<string | null>(() => {
    const stored = readStored();
    setActiveOrganizationId(stored);
    return stored;
  });

  const switchOrganization = useCallback(
    (id: string | null) => {
      setActiveOrganizationId(id);
      writeStored(id);
      setActive(id);
      void queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] !== "me" });
    },
    [queryClient],
  );

  const value = useMemo(() => ({ activeOrganizationId, switchOrganization }), [activeOrganizationId, switchOrganization]);
  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization() {
  const value = useContext(OrganizationContext);
  if (!value) throw new Error("useOrganization must be used inside OrganizationProvider");
  return value;
}
