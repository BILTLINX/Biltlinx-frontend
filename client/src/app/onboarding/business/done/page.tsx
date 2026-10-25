"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OnboardingDoneView, type DoneStep } from "@/components/shared/OnboardingDoneView";
import { loadBusinessDraft, type BusinessDraft } from "@/lib/onboarding-draft";

const DEFAULT_STRENGTH = 75;

/** Onboarding · Business · Done: the role request and documents are with the review team, and what happens next. */
export default function BusinessDonePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BusinessDraft | null>(null);

  useEffect(() => setDraft(loadBusinessDraft()), []);

  const name = draft?.details?.name ?? "Your business";
  const strength = Math.round(draft?.strength ?? DEFAULT_STRENGTH);
  const verification = draft?.verification;
  const sentDocuments = Boolean(verification && (verification.certificate || verification.ownerId));
  const isStay = draft?.typeId === "stay";

  const steps: DoneStep[] = [
    { id: "request", title: isStay ? "Stay operator request sent" : "Agent request sent", note: "The review team approves your role before you can publish listings", icon: "/icons/onboarding-building.svg", iconClass: "-scale-y-100", tone: "pending", pill: "In review" },
    sentDocuments
      ? { id: "verification", title: "Documents received", note: "We are checking your registration and ID", icon: "/icons/onboarding-user-shield.svg", tone: "pending", pill: "In review" }
      : { id: "verification", title: "Business verification", note: "Add your registration certificate and Ghana Card to get the badge", icon: "/icons/onboarding-user-shield.svg", tone: "todo", action: { label: "Verify now", onClick: () => router.push("/verification") } },
    isStay
      ? { id: "first", title: "Set up your first property", note: "Add rooms and rates once you are approved", icon: "/icons/onboarding-image-add.svg", tone: "todo", action: { label: "Open stay tools", onClick: () => router.push("/manage/stay") } }
      : { id: "first", title: "Add your first listing", note: "Start a draft now and publish when you are approved", icon: "/icons/onboarding-image-add.svg", tone: "todo", action: { label: "New listing", onClick: () => router.push("/manage/listings/new") } },
    { id: "staff", title: "Work as a team", note: "Once approved, create a business account to add staff", icon: "/icons/onboarding-user-group.svg", tone: "todo", action: { label: "Roles and teams", onClick: () => router.push("/account-settings?tab=teams") } },
  ];

  return (
    <OnboardingDoneView
      title={`${name} is on its way`}
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
