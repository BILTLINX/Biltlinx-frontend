"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState, type EmptyIcon } from "@/components/shared/EmptyState";

interface ListingLinkHelpProps {
  /** What is being posted, in the singular: "property", "stay" or "service". */
  noun: string;
  /** Where the listing is added and managed. */
  manageHref: string;
  /** Name of that place, as it appears in the navigation. */
  manageLabel: string;
  /** Closes the modal before leaving for the listing page. */
  onNavigate: () => void;
}

function useGoToListings(manageHref: string, onNavigate: () => void) {
  const router = useRouter();
  return () => {
    onNavigate();
    router.push(manageHref);
  };
}

/** Shown instead of the post form when nothing verified exists yet: only a verified listing can be posted. */
export function NoVerifiedListing({ icon, noun, manageHref, manageLabel, onNavigate }: ListingLinkHelpProps & { icon: EmptyIcon }) {
  const goToListings = useGoToListings(manageHref, onNavigate);
  return (
    <EmptyState
      size="section"
      icon={icon}
      title={`No verified ${noun} listing yet`}
      body={`You can only post a ${noun} that has been verified through your listings. Add your ${noun} in ${manageLabel}, and once it is verified it will be available here to post.`}
      primary={{ label: `Go to ${manageLabel}`, onClick: goToListings }}
    />
  );
}

/** A toggle under the listing picker that explains how a listing gets here. */
export function ListingLinkHelp({ noun, manageHref, manageLabel, onNavigate }: ListingLinkHelpProps) {
  const goToListings = useGoToListings(manageHref, onNavigate);
  const [open, setOpen] = useState(false);
  const steps = [
    `Open ${manageLabel} from Manage and add your ${noun} with its photos, price and details.`,
    "Once it is verified it shows up in this list automatically.",
    "Come back here, choose it and post it to your feed.",
  ];

  return (
    <div className="flex flex-col gap-2.5">
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="self-start text-[13px] font-medium text-brand-900 hover:underline">
        How do I link a different {noun}?
      </button>
      {open && (
        <div className="flex flex-col gap-3 rounded-xl bg-[#f8fafc] p-3.5">
          <ol className="flex list-decimal flex-col gap-1.5 pl-4 text-[13px] leading-[19px] text-[#334155]">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <button type="button" onClick={goToListings} className="h-9 self-start rounded-lg bg-brand-900 px-4 text-[13px] font-medium text-white hover:bg-brand-900/90">
            Open {manageLabel}
          </button>
        </div>
      )}
    </div>
  );
}
