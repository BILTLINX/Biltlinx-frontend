"use client";

import { Fragment, type RefObject } from "react";
import { FloatingMenu } from "@/components/shared/FloatingMenu";
import { NavIcon } from "@/components/shared/NavIcon";
import { cn } from "@/lib/utils";

const MENU_WIDTH = 264;

export interface PostOptionsItem {
  key: string;
  icon: string;
  /** Rendered glyph size inside the 18px icon slot (the exported SVGs are cropped to their artwork). */
  iconSize: number;
  label: string;
  description?: string;
  destructive?: boolean;
  onSelect: () => void;
}

export type PostOptionsGroup = PostOptionsItem[];

interface ViewerOptionsInput {
  authorName: string;
  saved: boolean;
  following: boolean;
  onToggleSave: () => void;
  /** Whether this home is already in the compare tray. */
  inCompare: boolean;
  onAddToCompare: () => void;
  onCopyLink: () => void;
  onShare: () => void;
  onToggleFollow: () => void;
  onMute: () => void;
  onNotInterested: () => void;
  onWhySeeing: () => void;
  onReport: () => void;
}

/** Options for someone else's post (Figma node 1054:26067). */
export function buildViewerOptions(input: ViewerOptionsInput): PostOptionsGroup[] {
  const { authorName, saved, following, inCompare } = input;
  return [
    [
      { key: "save", icon: "/icons/post-options-bookmark.svg", iconSize: 15, label: saved ? "Unsave post" : "Save post", onSelect: input.onToggleSave },
      {
        key: "compare",
        icon: "/icons/post-options-compare.svg",
        iconSize: 15,
        label: inCompare ? "Remove from compare" : "Add to compare",
        description: inCompare ? "Take this out of the compare tray" : "Compare this with others you’ve picked",
        onSelect: input.onAddToCompare,
      },
      { key: "copy", icon: "/icons/post-options-copy-link.svg", iconSize: 14, label: "Copy link", onSelect: input.onCopyLink },
      { key: "share", icon: "/icons/post-options-share-to.svg", iconSize: 14, label: "Share to…", onSelect: input.onShare },
    ],
    [
      {
        key: "follow",
        icon: "/icons/post-options-follow.svg",
        iconSize: 15,
        label: `${following ? "Unfollow" : "Follow"} ${authorName}`,
        onSelect: input.onToggleFollow,
      },
      {
        key: "mute",
        icon: "/icons/post-options-mute.svg",
        iconSize: 15,
        label: `Mute ${authorName}`,
        description: "Hide their posts without unfollowing",
        onSelect: input.onMute,
      },
      {
        key: "not-interested",
        icon: "/icons/post-options-not-interested.svg",
        iconSize: 15,
        label: "Not interested",
        description: "Show fewer posts like this",
        onSelect: input.onNotInterested,
      },
      { key: "why", icon: "/icons/post-options-why-seeing.svg", iconSize: 15, label: "Why am I seeing this post?", onSelect: input.onWhySeeing },
    ],
    [{ key: "report", icon: "/icons/post-options-report.svg", iconSize: 15, label: "Report post", destructive: true, onSelect: input.onReport }],
  ];
}

interface OwnerOptionsInput {
  onEdit: () => void;
  onPin: () => void;
  onViewInsights: () => void;
  onWhoCanComment: () => void;
  onTurnOffComments: () => void;
  onHideLikeCount: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
}

/** Options for a post you published yourself (Figma node 1054:27904). */
export function buildOwnerOptions(input: OwnerOptionsInput): PostOptionsGroup[] {
  return [
    [
      { key: "edit", icon: "/icons/post-options-report.svg", iconSize: 15, label: "Edit post", onSelect: input.onEdit },
      { key: "pin", icon: "/icons/post-options-bookmark.svg", iconSize: 15, label: "Pin to your profile", onSelect: input.onPin },
      {
        key: "insights",
        icon: "/icons/post-options-insights.svg",
        iconSize: 14,
        label: "View insights",
        description: "Reach, saves and enquiries",
        onSelect: input.onViewInsights,
      },
    ],
    [
      {
        key: "who-can-comment",
        icon: "/icons/post-options-who-can-comment.svg",
        iconSize: 15,
        label: "Who can comment",
        description: "Everyone",
        onSelect: input.onWhoCanComment,
      },
      { key: "comments-off", icon: "/icons/post-options-not-interested.svg", iconSize: 15, label: "Turn off comments", onSelect: input.onTurnOffComments },
      { key: "hide-likes", icon: "/icons/post-options-hide-likes.svg", iconSize: 15, label: "Hide like count", onSelect: input.onHideLikeCount },
    ],
    [{ key: "copy", icon: "/icons/post-options-copy-link.svg", iconSize: 14, label: "Copy link", onSelect: input.onCopyLink }],
    [{ key: "delete", icon: "/icons/post-options-report.svg", iconSize: 15, label: "Delete post", destructive: true, onSelect: input.onDelete }],
  ];
}

interface PostOptionsMenuProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  groups: PostOptionsGroup[];
}

/** Post options dropdown in the shared frosted-glass menu frame; content comes from the build*Options helpers. */
export function PostOptionsMenu({ open, onClose, anchorRef, groups }: PostOptionsMenuProps) {
  return (
    <FloatingMenu open={open} onClose={onClose} anchorRef={anchorRef} width={MENU_WIDTH} role="menu">
      {groups.map((group, groupIndex) => (
        <Fragment key={groupIndex}>
          {groupIndex > 0 && <div className="h-px w-full bg-gray-200" />}
          <div className="flex flex-col py-0.5">
            {group.map((item) => (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                onClick={() => {
                  item.onSelect();
                  onClose();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-gray-50"
              >
                <span className="flex size-[18px] shrink-0 items-center justify-center">
                  <NavIcon icon={item.icon} size={item.iconSize} className={item.destructive ? "bg-[#dc2626]" : "bg-[#0f172a]"} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-px">
                  <span className={cn("text-[13px] font-medium leading-[18px]", item.destructive ? "text-[#dc2626]" : "text-[#0f172a]")}>{item.label}</span>
                  {item.description && <span className="text-[11px] leading-[15px] text-gray-500">{item.description}</span>}
                </span>
              </button>
            ))}
          </div>
        </Fragment>
      ))}
    </FloatingMenu>
  );
}
