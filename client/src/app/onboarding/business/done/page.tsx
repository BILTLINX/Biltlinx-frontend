"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OnboardingDoneView, type DoneStep } from "@/components/shared/OnboardingDoneView";
import { comingSoonHref } from "@/lib/coming-soon";
import { NEW_BUSINESS } from "@/lib/dummy-onboarding";
import { loadBusinessDraft, type BusinessDraft } from "@/lib/onboarding-draft";

const DEFAULT_STRENGTH = 75;

/** Onboarding · Business · Done (Figma node 1073:32754): the storefront is live and what happens next. */
export default function BusinessDonePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BusinessDraft | null>(null);

  // The choices from earlier steps live in the tab session, so they are read after mount.
  useEffect(() => setDraft(loadBusinessDraft()), []);

  const name = draft?.details?.name ?? NEW_BUSINESS.name;
  const products = draft?.sell?.products ?? 0;
  const strength = Math.round(draft?.strength ?? DEFAULT_STRENGTH);
  const verification = draft?.verification;
  const hasCertificate = Boolean(verification && (verification.certificate || verification.registration));
  const toVerification = () => router.push("/verification");

  const verificationStep: DoneStep =
    verification?.ownerId && hasCertificate
      ? { id: "verification", title: "Business verification", note: "We are checking your registration and ID", icon: "/icons/onboarding-user-shield.svg", tone: "pending", pill: "In review" }
      : hasCertificate
        ? { id: "verification", title: "Business verification", note: "Registration certificate received. Upload your Ghana Card to finish", icon: "/icons/onboarding-user-shield.svg", tone: "todo", action: { label: "Upload ID", onClick: toVerification } }
        : { id: "verification", title: "Business verification", note: "Add your registration certificate and Ghana Card to get the badge", icon: "/icons/onboarding-user-shield.svg", tone: "todo", action: { label: "Verify now", onClick: toVerification } };

  const steps: DoneStep[] = [
    {
      id: "storefront",
      title: "Storefront published",
      note: products > 0 ? `Visible in Marketplace and search with ${products} ${products === 1 ? "product" : "products"}` : "Visible in Marketplace and search",
      icon: "/icons/onboarding-building.svg",
      iconClass: "-scale-y-100",
      tone: "done",
      pill: "Live",
    },
    verificationStep,
    {
      id: "products",
      title: "Add more products",
      note: "Shops with 10 or more products get more enquiries",
      icon: "/icons/onboarding-image-add.svg",
      tone: "todo",
      action: { label: "Add products", onClick: () => router.push(comingSoonHref("Add products")) },
    },
    {
      id: "staff",
      title: "Need staff accounts?",
      note: "Upgrade to an Organization for branches and team permissions",
      icon: "/icons/onboarding-user-group.svg",
      tone: "todo",
      action: { label: "Learn more", onClick: () => router.push(comingSoonHref("Organization accounts")) },
    },
  ];

  return (
    <OnboardingDoneView
      title={`${name} is open`}
      subtitle="Your storefront is live in Marketplace. The “Business verified” badge appears once your registration and ID checks pass."
      strength={strength}
      steps={steps}
      primary={{ label: "Go to Manage", onClick: () => router.push("/manage") }}
      secondary={{ label: "View storefront", onClick: () => router.push(comingSoonHref("Storefront")) }}
      note={`Switch between Personal and ${name} from your name in the top bar.`}
      onClose={() => router.push("/home")}
    />
  );
}
