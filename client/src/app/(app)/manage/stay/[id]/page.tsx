"use client";

import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

/** Editing a stay is a dialog on the listings page now; this keeps old links to a stay's editor working. */
export default function StayEditorRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(id === "new" ? "/manage/listings?create=stay" : `/manage/listings?create=stay&edit=${id}`);
  }, [id, router]);

  return null;
}
