import { Suspense, type ReactNode } from "react";
import { RequireAuth } from "@/components/providers/RequireAuth";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <RequireAuth>{children}</RequireAuth>
    </Suspense>
  );
}
