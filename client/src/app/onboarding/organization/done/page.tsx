"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OnboardingDoneView, type DoneStep } from "@/components/shared/OnboardingDoneView";
import { loadOrganizationDraft, type OrganizationDraft } from "@/lib/onboarding-draft";

const DEFAULT_STRENGTH = 50;

/** Onboarding · Organization · Done: the role request and documents are with the review team, and what happens next. */
export default function OrganizationDonePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<OrganizationDraft | null>(null);

  useEffect(() => setDraft(loadOrganizationDraft()), []);

  const name = draft?.name ?? "Your organization";
  const shortName = name.replace(/\s+(ltd|limited|llc|inc|plc)\.?$/i, "");
  const strength = Math.round(draft?.strength ?? DEFAULT_STRENGTH);
  const sentDocuments = Boolean(draft?.verification?.incorporation || draft?.verification?.authority || draft?.verification?.ownerId);

  const steps: DoneStep[] = [
    { id: "request", title: "Role request sent", note: "The review team approves your role before you can create the organization account", icon: "/icons/onboarding-city.svg", iconClass: "-scale-y-100", tone: "pending", pill: "In review" },
    sentDocuments
      ? { id: "verification", title: "Documents received", note: "We are checking your incorporation papers and ID", icon: "/icons/onboarding-user-shield.svg", tone: "pending", pill: "In review" }
      : { id: "verification", title: "Organization verification", note: "Add your incorporation documents to get the badge", icon: "/icons/onboarding-user-shield.svg", tone: "todo", action: { label: "Verify now", onClick: () => router.push("/verification") } },
    { id: "team", title: "Create the account and invite your team", note: "Once approved, create it under Roles and teams and invite staff with the right access", icon: "/icons/onboarding-user-group.svg", tone: "todo", action: { label: "Open Roles and teams", onClick: () => router.push("/account-settings?tab=teams") } },
  ];

  return (
    <OnboardingDoneView
      title={`${shortName} is on its way`}
      subtitle="We have your request. You will see it under Needs your attention as soon as there is an update."
      strength={strength}
      steps={steps}
      primary={{ label: "Go to Manage", onClick: () => router.push("/manage") }}
      secondary={{ label: "Open Roles and teams", onClick: () => router.push("/account-settings?tab=teams") }}
      note="Your personal account keeps working while you wait."
      onClose={() => router.push("/home")}
    />
  );
}
