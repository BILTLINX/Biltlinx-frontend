"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

/** Creating a listing is a dialog on the listings page now; this keeps old links (including `?draft=` and `?edit=`) working. */
function RedirectToDialog() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const next = new URLSearchParams({ create: "property" });
    for (const key of ["draft", "edit"]) {
      const value = params.get(key);
      if (value) next.set(key, value);
    }
    router.replace(`/manage/listings?${next.toString()}`);
  }, [params, router]);

  return null;
}

export default function CreateListingRedirectPage() {
  return (
    <Suspense fallback={null}>
      <RedirectToDialog />
    </Suspense>
  );
}
