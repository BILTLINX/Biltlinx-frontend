import { Suspense, type ReactNode } from "react";
import { RedirectIfAuthenticated } from "@/components/providers/RequireAuth";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <RedirectIfAuthenticated>{children}</RedirectIfAuthenticated>
    </Suspense>
  );
}
