"use client";

import { useDisplayName } from "@/hooks/useDisplayName";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OnboardingDoneView, type DoneStep } from "@/components/shared/OnboardingDoneView";
import { comingSoonHref } from "@/lib/coming-soon";
import { feedSummary, loadPersonalDraft, type PersonalDraft } from "@/lib/onboarding-draft";

const DEFAULT_STRENGTH = 60;

/** Onboarding · Personal · Done (Figma node 1069:31557): the setup is finished and what happens next. */
export default function PersonalDonePage() {
  const accountName = useDisplayName();
  const router = useRouter();
  const [draft, setDraft] = useState<PersonalDraft | null>(null);

  // The choices from earlier steps live in the tab session, so they are read after mount.
  useEffect(() => setDraft(loadPersonalDraft()), []);

  const firstName = (draft?.displayName?.split(" ")[0] || accountName).trim();
  const strength = Math.round(draft?.strength ?? DEFAULT_STRENGTH);
  const savedSearch = draft?.interests.includes("rent") && draft.areas.length > 0 ? `rentals in ${draft.areas[0]}` : null;

  const steps: DoneStep[] = [
    { id: "phone", title: "Phone number verified", note: "Done when you signed up", icon: "/icons/onboarding-check-circle.svg", tone: "done", pill: "Done" },
    ...(savedSearch
      ? [
          {
            id: "search",
            title: `Saved search: ${savedSearch}`,
            note: "We will tell you on WhatsApp when a new home matches",
            icon: "/icons/onboarding-search.svg",
            iconClass: "-scale-x-100",
            tone: "done" as const,
            pill: "Active",
          },
        ]
      : []),
    {
      id: "identity",
      title: "Verify your identity",
      note: "Adds an “ID verified” badge so landlords and providers reply faster",
      icon: "/icons/onboarding-id-verified.svg",
      tone: "todo",
      action: { label: "Verify now", onClick: () => router.push("/verification") },
    },
    {
      id: "role",
      title: "Do you offer services too?",
      note: "Add a Professional, Artisan, Business or Organization role anytime",
      icon: "/icons/briefcase-01.svg",
      tone: "todo",
      action: { label: "Add a role", onClick: () => router.push(comingSoonHref("Add a role")) },
    },
  ];

  return (
    <OnboardingDoneView
      title={`You're all set, ${firstName}`}
      subtitle={feedSummary(draft)}
      strength={strength}
      steps={steps}
      primary={{ label: "Go to Home", onClick: () => router.push("/home") }}
      secondary={{ label: "View my profile", onClick: () => router.push(comingSoonHref("My profile")) }}
      note="Your roles live under your name in the top bar. Switch or add one anytime."
      notePlacement="above"
      onClose={() => router.push("/home")}
    />
  );
}
