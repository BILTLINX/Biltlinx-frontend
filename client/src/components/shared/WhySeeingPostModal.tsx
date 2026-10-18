"use client";

import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { NavIcon } from "@/components/shared/NavIcon";

interface WhySeeingPostModalProps {
  open: boolean;
  onClose: () => void;
  authorName: string;
  onHideSponsored: () => void;
  onManageAdPreferences: () => void;
}

/** "Why you're seeing this post" dialog (Figma node 1054:32033). The reasons are placeholders until a recommendations API exists. */
export function WhySeeingPostModal({
  open,
  onClose,
  authorName,
  onHideSponsored,
  onManageAdPreferences,
}: WhySeeingPostModalProps) {
  const reasons = [
    { icon: "/icons/post-options-report.svg", text: `Sponsored by ${authorName}. Sponsored posts are always labelled.` },
    { icon: "/icons/post-options-location.svg", text: "You searched for homes in East Legon in the last 7 days." },
    { icon: "/icons/post-options-bookmark.svg", text: "You saved 3 similar 4-bed listings under GHS 2,000,000." },
  ];

  return (
    <CenteredDialog open={open} onClose={onClose} labelledBy="why-seeing-title">
      <div className="flex min-h-0 flex-col gap-3.5 overflow-y-auto px-[clamp(16px,5vw,24px)] pb-5 pt-6">
        <div className="flex w-full items-center justify-between gap-3">
          <h2 id="why-seeing-title" className="text-lg font-bold leading-[26px] text-[#0f172a]">
            Why you’re seeing this post
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-lg font-medium leading-[26px] text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {reasons.map((reason) => (
          <div key={reason.icon} className="flex items-start gap-3">
            <span className="flex size-[18px] shrink-0 items-center justify-center">
              <NavIcon icon={reason.icon} size={15} className="bg-[#334155]" />
            </span>
            <p className="min-w-0 flex-1 text-sm leading-5 text-[#334155]">{reason.text}</p>
          </div>
        ))}

        <p className="text-xs leading-[17px] text-gray-500">Paid placement never affects verification badges.</p>

        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              onHideSponsored();
              onClose();
            }}
            className="h-10 whitespace-nowrap rounded-[10px] border border-gray-200 bg-white px-[18px] text-sm sm:flex-auto font-medium text-[#0f172a] hover:bg-gray-50"
          >
            Hide sponsored posts like this
          </button>
          <button
            type="button"
            onClick={() => {
              onManageAdPreferences();
              onClose();
            }}
            className="h-10 whitespace-nowrap rounded-[10px] bg-[#eff5ff] px-[18px] text-sm sm:flex-auto font-medium text-brand-900 hover:bg-[#e2edff]"
          >
            Manage ad preferences
          </button>
        </div>
      </div>
    </CenteredDialog>
  );
}
