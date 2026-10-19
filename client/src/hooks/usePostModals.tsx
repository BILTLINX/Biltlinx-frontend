"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateArticleModal } from "@/components/shared/CreateArticleModal";
import { CreatePollModal } from "@/components/shared/CreatePollModal";
import { CreatePostModal } from "@/components/shared/CreatePostModal";

export type PostModalType = "media" | "poll" | "article" | "property" | "stay" | "service";

/** Shared state + JSX for the Media/Poll/Article create-post modals, so any
 * trigger (TopNav's Create button, the feed composer's icons, etc.) can open them. */
export function usePostModals() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<PostModalType>("media");

  const router = useRouter();

  function openPostModal(nextType: PostModalType) {
    if (nextType === "property") return router.push("/manage/listings/new");
    if (nextType === "stay") return router.push("/manage/stay");
    if (nextType === "service") return router.push("/manage/provider");
    setType(nextType);
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  const modals = (
    <>
      <CreatePostModal open={open && type === "media"} onClose={close} onSwitchType={openPostModal} />
      <CreatePollModal open={open && type === "poll"} onClose={close} onSwitchType={openPostModal} />
      <CreateArticleModal open={open && type === "article"} onClose={close} onSwitchType={openPostModal} />
    </>
  );

  return { openPostModal, modals };
}
