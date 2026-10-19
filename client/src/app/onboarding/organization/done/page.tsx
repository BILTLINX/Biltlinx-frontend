"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OnboardingDoneView, type DoneStep } from "@/components/shared/OnboardingDoneView";
import { comingSoonHref } from "@/lib/coming-soon";
import { NEW_ORGANIZATION } from "@/lib/dummy-onboarding";
import { loadOrganizationDraft, type OrganizationDraft } from "@/lib/onboarding-draft";

const DEFAULT_STRENGTH = 50;

/** Onboarding · Organization · Done (Figma node 1074:33006): the organization page is live and what happens next. */
export default function OrganizationDonePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<OrganizationDraft | null>(null);

  // The choices from earlier steps live in the tab session, so they are read after mount.
  useEffect(() => setDraft(loadOrganizationDraft()), []);

  const name = draft?.name ?? NEW_ORGANIZATION.name;
  // The design's title drops the legal suffix ("Kharis Developments is set up").
  const shortName = name.replace(/\s+(ltd|limited|llc|inc|plc)\.?$/i, "");
  const locations = (draft?.branches?.length ?? 0) + 1;
  const invited = draft?.invited ?? 0;
  const strength = Math.round(draft?.strength ?? DEFAULT_STRENGTH);
  const verification = draft?.verification;
  const hasIncorporation = Boolean(verification?.incorporation);
  const hasLetter = Boolean(verification?.authority);
  const hasOwnerId = Boolean(verification?.ownerId);
  const toVerification = () => router.push("/verification");

  const verificationStep: DoneStep =
    hasIncorporation && hasLetter && hasOwnerId
      ? { id: "verification", title: "Organization verification", note: "We are checking your documents", icon: "/icons/onboarding-user-shield.svg", tone: "pending", pill: "In review" }
      : hasIncorporation && hasOwnerId
        ? { id: "verification", title: "Organization verification", note: "Upload your authorisation letter to finish the check", icon: "/icons/onboarding-user-shield.svg", tone: "todo", action: { label: "Upload letter", onClick: toVerification } }
        : { id: "verification", title: "Organization verification", note: "Add your incorporation documents and authorisation letter to get the badge", icon: "/icons/onboarding-user-shield.svg", tone: "todo", action: { label: "Verify now", onClick: toVerification } };

  const steps: DoneStep[] = [
    {
      id: "page",
      title: "Organization page published",
      note: `Visible in search with ${locations} ${locations === 1 ? "location" : "locations"}`,
      icon: "/icons/onboarding-city.svg",
      iconClass: "-scale-y-100",
      tone: "done",
      pill: "Live",
    },
    invited > 0
      ? {
          id: "team",
          title: `${invited} team ${invited === 1 ? "invite" : "invites"} sent`,
          note: "Each person accepts with their own Biltlinx account",
          icon: "/icons/onboarding-user-group.svg",
          tone: "pending",
          pill: "Waiting",
        }
      : {
          id: "team",
          title: "Invite your team",
          note: "Each person accepts with their own Biltlinx account",
          icon: "/icons/onboarding-user-group.svg",
          tone: "todo",
          action: { label: "Invite team", onClick: () => router.push("/onboarding/organization/team") },
        },
    verificationStep,
    {
      id: "project",
      title: "Add your first project",
      note: "Projects hold units, updates, documents and sales",
      icon: "/icons/onboarding-crane.svg",
      tone: "todo",
      action: { label: "Add project", onClick: () => router.push(comingSoonHref("Add project")) },
    },
  ];

  return (
    <OnboardingDoneView
      title={`${shortName} is set up`}
      subtitle={`Your organization page is live${invited > 0 ? " and your team has been invited" : ""}. You can start adding projects, units and listings in Manage.`}
      strength={strength}
      steps={steps}
      primary={{ label: "Go to Manage", onClick: () => router.push("/manage") }}
      secondary={{ label: "View organization page", onClick: () => router.push(comingSoonHref("Organization page")) }}
      note={`Switch between Personal and ${shortName} from your name in the top bar.`}
      onClose={() => router.push("/home")}
    />
  );
}
