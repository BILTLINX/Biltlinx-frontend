"use client";

import { PostRequestModal } from "@/components/shared/PostRequestModal";
import { closeRequestModal, useRequestModalOpen } from "@/hooks/useRequestModal";

/** The one "Post a request" dialog, mounted once for the whole app and opened with `openRequestModal()`. */
export function RequestModalHost() {
  return <PostRequestModal open={useRequestModalOpen()} onClose={closeRequestModal} />;
}
