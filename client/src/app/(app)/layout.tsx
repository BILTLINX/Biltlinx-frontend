import { Suspense, type ReactNode } from "react";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { MessagingProvider } from "@/context/MessagingContext";
import { SearchProvider } from "@/context/SearchContext";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <RequireAuth>
        <MessagingProvider>
          <SearchProvider>{children}</SearchProvider>
        </MessagingProvider>
      </RequireAuth>
    </Suspense>
  );
}
