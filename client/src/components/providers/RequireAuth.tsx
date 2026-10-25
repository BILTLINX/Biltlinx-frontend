"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/shared/Spinner";
import { useSession } from "@/context/SessionContext";
import { safeNextPath, signInPath } from "@/lib/api";

function FullPageStatus({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-white px-4 text-center">{children}</div>;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, refresh } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => {
    if (status === "anonymous") router.replace(signInPath(search ? `${pathname}?${search}` : pathname));
  }, [status, router, pathname, search]);

  if (status === "authenticated") return <>{children}</>;

  if (status === "error") {
    return (
      <FullPageStatus>
        <p className="text-sm text-gray-500">We couldn&rsquo;t reach Biltlinx. Check your connection and try again.</p>
        <Button variant="primary" className="w-auto px-6" onClick={() => void refresh()}>
          Try again
        </Button>
      </FullPageStatus>
    );
  }

  return (
    <FullPageStatus>
      <Spinner />
    </FullPageStatus>
  );
}

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));

  useEffect(() => {
    if (status === "authenticated") router.replace(next ?? "/home");
  }, [status, router, next]);

  return <>{children}</>;
}
