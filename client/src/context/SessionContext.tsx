"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { ApiError, setActiveOrganizationId } from "@/lib/api";
import { getMe, logout } from "@/lib/auth-api";
import type { CurrentUser } from "@/types/api/auth";

export type SessionStatus = "loading" | "authenticated" | "anonymous" | "error";

interface SessionContextValue {
  user: CurrentUser | null;
  status: SessionStatus;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export const SESSION_QUERY_KEY = ["me"] as const;

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: getMe,
    retry: false,
    staleTime: 60_000,
  });

  const status: SessionStatus = query.data
    ? "authenticated"
    : query.isPending
      ? "loading"
      : query.error instanceof ApiError && query.error.status === 401
        ? "anonymous"
        : "error";

  const refresh = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: SESSION_QUERY_KEY });
  }, [queryClient]);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } finally {
      setActiveOrganizationId(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const value = useMemo(
    () => ({ user: query.data ?? null, status, refresh, signOut }),
    [query.data, status, refresh, signOut],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
