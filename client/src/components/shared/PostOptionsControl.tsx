"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { showErrorToast, showSuccessToast } from "@/components/shared/AppToast";
import { DeletePostModal } from "@/components/shared/DeletePostModal";
import { buildOwnerOptions, buildViewerOptions, PostOptionsMenu } from "@/components/shared/PostOptionsMenu";
import { ReportPostModal } from "@/components/shared/ReportPostModal";
import { Tooltip } from "@/components/shared/Tooltip";
import { WhySeeingPostModal } from "@/components/shared/WhySeeingPostModal";
import { useCompare, type CompareKind } from "@/context/CompareContext";
import { usePostsFeed } from "@/context/PostsContext";
import { comingSoonHref } from "@/lib/coming-soon";
import { copyPostLink, sharePost } from "@/lib/post-actions";
import type { PostCardData } from "@/types/post";

/** What a post can be compared as; polls and plain text posts cannot. */
const COMPARE_KIND: Partial<Record<NonNullable<PostCardData["variant"]>, CompareKind>> = {
  property: "home",
  stay: "stay",
  project: "project",
  professional: "professional",
  artisan: "artisan",
};

interface PostOptionsControlProps {
  post: PostCardData;
  saved: boolean;
  onToggleSave: () => void;
  following: boolean;
  onToggleFollow: () => void;
  /** Classes for the trigger button; its icon is passed as `children`. */
  className?: string;
  children: ReactNode;
}

/** The "Post options" trigger together with its menu and the report / delete / why-am-I-seeing-this dialogs it opens. */
export function PostOptionsControl({
  post,
  saved,
  onToggleSave,
  following,
  onToggleFollow,
  className,
  children,
}: PostOptionsControlProps) {
  const router = useRouter();
  const { removePost } = usePostsFeed();
  const compare = useCompare();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [whySeeingOpen, setWhySeeingOpen] = useState(false);
  const optionsRef = useRef<HTMLButtonElement | null>(null);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <>
      <Tooltip label="Post options">
        <button
          ref={optionsRef}
          type="button"
          aria-label="Post options"
          aria-haspopup="menu"
          aria-expanded={optionsOpen}
          onClick={() => setOptionsOpen((v) => !v)}
          className={className}
        >
          {children}
        </button>
      </Tooltip>
      <PostOptionsMenu
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        anchorRef={optionsRef}
        groups={
          post.isOwn
            ? buildOwnerOptions({
                onEdit: comingSoon("Edit post"),
                onPin: comingSoon("Pin to your profile"),
                onViewInsights: comingSoon("View insights"),
                onWhoCanComment: comingSoon("Who can comment"),
                onTurnOffComments: comingSoon("Turn off comments"),
                onHideLikeCount: comingSoon("Hide like count"),
                onCopyLink: () => copyPostLink(post),
                onDelete: () => setDeleteOpen(true),
              })
            : buildViewerOptions({
                authorName: post.authorName,
                saved,
                following,
                onToggleSave,
                inCompare: compare.has(post.id),
                onAddToCompare: () => {
                  const kind = post.variant ? COMPARE_KIND[post.variant] : undefined;
                  if (!kind) {
                    showErrorToast("Only listings, projects and providers can be compared");
                    return;
                  }
                  compare.toggle({
                    id: post.id,
                    kind,
                    title: post.subLine ?? post.authorName,
                    price: `${post.priceLine ?? ""}${post.priceSuffix ?? ""}` || post.roleLine,
                    subtitle: post.authorName,
                    image: post.images?.[0] ?? post.image ?? post.avatar,
                    // Only property posts have a detail page that is keyed by the post.
                    href: post.variant === "property" ? `/properties/${post.id}` : undefined,
                  });
                },
                onCopyLink: () => copyPostLink(post),
                onShare: () => sharePost(post),
                onToggleFollow,
                onMute: comingSoon("Mute"),
                onNotInterested: comingSoon("Not interested"),
                onWhySeeing: () => setWhySeeingOpen(true),
                onReport: () => setReportOpen(true),
              })
        }
      />
      <DeletePostModal
        open={deleteOpen}
        likes={post.likes}
        comments={post.comments}
        onCancel={() => {
          setDeleteOpen(false);
          setOptionsOpen(true);
        }}
        onConfirm={() => {
          setDeleteOpen(false);
          void removePost(post.id).then((deleted) => {
            if (deleted) showSuccessToast("Post deleted");
          });
        }}
      />
      <WhySeeingPostModal
        open={whySeeingOpen}
        onClose={() => setWhySeeingOpen(false)}
        authorName={post.authorName}
        onHideSponsored={() => showSuccessToast("We’ll show fewer sponsored posts like this")}
        onManageAdPreferences={comingSoon("Ad preferences")}
      />
      <ReportPostModal open={reportOpen} onClose={() => setReportOpen(false)} authorName={post.authorName} />
    </>
  );
}
