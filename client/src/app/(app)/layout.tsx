import { Suspense, type ReactNode } from "react";
import { RequireAuth } from "@/components/providers/RequireAuth";
import { MessagingProvider } from "@/context/MessagingContext";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <RequireAuth>
        <MessagingProvider>{children}</MessagingProvider>
      </RequireAuth>
    </Suspense>
  );
}
