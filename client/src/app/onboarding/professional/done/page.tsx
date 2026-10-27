"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OnboardingDoneView, type DoneStep } from "@/components/shared/OnboardingDoneView";
import { MATCHING_REQUESTS } from "@/lib/dummy-onboarding";
import { loadProfessionalDraft, type ProfessionalDraft } from "@/lib/onboarding-draft";

const DEFAULT_STRENGTH = 80;

/** Onboarding · Professional · Done (Figma node 1070:32089): the profile is live and what happens next. */
export default function ProfessionalDonePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<ProfessionalDraft | null>(null);

  // The choices from earlier steps live in the tab session, so they are read after mount.
  useEffect(() => setDraft(loadProfessionalDraft()), []);

  const strength = Math.round(draft?.strength ?? DEFAULT_STRENGTH);
  const registration = draft?.registration?.hasNumber ? draft.registration.abbreviation || "professional" : null;
  const region = draft?.worksIn?.[0] === "Remote" || !draft?.worksIn?.[0] ? "your area" : draft.worksIn[0];

  const steps: DoneStep[] = [
    { id: "published", title: "Profile published", note: "Visible in Professionals, search and Marketplace", icon: "/icons/onboarding-user-check.svg", tone: "done", pill: "Live" },
    ...(registration
      ? [
          {
            id: "registration",
            title: `${registration} registration check`,
            note: "We will email you when it is confirmed or if we need anything else",
            icon: "/icons/onboarding-license.svg",
            tone: "pending" as const,
            pill: "In review",
          },
        ]
      : []),
    {
      id: "identity",
      title: "Identity check",
      note: "Upload your Ghana Card to get the ID verified badge",
      icon: "/icons/onboarding-id-verified.svg",
      tone: "todo",
      action: { label: "Upload now", onClick: () => router.push("/verification") },
    },
    {
      id: "client",
      title: "Find your first client",
      note: `${MATCHING_REQUESTS} open requests in ${region} on the Request Board`,
      icon: "/icons/onboarding-file.svg",
      tone: "todo",
      action: { label: "Open Request Board", onClick: () => router.push("/request-board") },
    },
  ];

  return (
    <OnboardingDoneView
      title="Your professional profile is live"
      subtitle={`People can now find you in Professionals, Services and Marketplace.${registration ? ` We are checking your ${registration} registration and will add the badge as soon as it is confirmed.` : ""}`}
      strength={strength}
      steps={steps}
      primary={{ label: "Go to Manage", onClick: () => router.push("/manage/provider") }}
      secondary={{ label: "View my profile", onClick: () => router.push("/manage/provider") }}
      note="Switch between Personal and Professional from your name in the top bar."
      notePlacement="above"
      onClose={() => router.push("/home")}
    />
  );
}
