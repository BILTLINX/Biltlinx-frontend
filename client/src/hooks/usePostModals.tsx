"use client";

import { useState } from "react";
import { CreateArticleModal } from "@/components/shared/CreateArticleModal";
import { CreateCommunityModal } from "@/components/shared/CreateCommunityModal";
import { CreateEventModal } from "@/components/shared/CreateEventModal";
import { CreatePollModal } from "@/components/shared/CreatePollModal";
import { CreatePostModal } from "@/components/shared/CreatePostModal";
import { PostPropertyModal } from "@/components/shared/PostPropertyModal";
import { PostServiceModal } from "@/components/shared/PostServiceModal";
import { PostStayModal } from "@/components/shared/PostStayModal";

export type PostModalType = "media" | "poll" | "article" | "property" | "stay" | "service" | "community" | "event";

/** Shared state + JSX for the create modals (posts, listings, a community), so any
 * trigger (TopNav's Create button, the feed composer's icons, etc.) can open them. */
export function usePostModals() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<PostModalType>("media");

  function openPostModal(nextType: PostModalType) {
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
      <PostPropertyModal open={open && type === "property"} onClose={close} />
      <PostStayModal open={open && type === "stay"} onClose={close} />
      <PostServiceModal open={open && type === "service"} onClose={close} />
      <CreateCommunityModal open={open && type === "community"} onClose={close} />
      <CreateEventModal open={open && type === "event"} onClose={close} onStartCommunity={() => openPostModal("community")} />
    </>
  );

  return { openPostModal, modals };
}
