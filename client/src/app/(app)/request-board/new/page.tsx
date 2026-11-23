"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { openRequestModal } from "@/hooks/useRequestModal";

/** Posting a request is a dialog now. This keeps old links to /request-board/new working: it opens the dialog over the request board. */
export default function NewRequestPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/request-board");
    openRequestModal();
  }, [router]);
  return null;
}
