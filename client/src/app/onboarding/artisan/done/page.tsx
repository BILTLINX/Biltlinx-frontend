"use client";

import { useDisplayName } from "@/hooks/useDisplayName";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OnboardingDoneView, type DoneStep } from "@/components/shared/OnboardingDoneView";

import { loadArtisanDraft, type ArtisanDraft } from "@/lib/onboarding-draft";

const DEFAULT_STRENGTH = 70;

/** "10 km" becomes "within 10 km of Madina"; "Anywhere in Greater Accra" stays a place, not a distance. */
function alertsReach(travel: string, place: string) {
  if (travel.startsWith("Anywhere")) return travel.charAt(0).toLowerCase() + travel.slice(1);
  return `within ${travel}${place ? ` of ${place}` : ""}`;
}

/** Onboarding · Artisan · Done (Figma node 1071:32295): the profile is live and what happens next. */
export default function ArtisanDonePage() {
  const accountName = useDisplayName();
  const router = useRouter();
  const [draft, setDraft] = useState<ArtisanDraft | null>(null);

  // The choices from earlier steps live in the tab session, so they are read after mount.
  useEffect(() => setDraft(loadArtisanDraft()), []);

  const firstName = accountName.split(" ")[0];
  const place = draft?.basedIn.split(",")[0].trim() ?? "";
  const strength = Math.round(draft?.strength ?? DEFAULT_STRENGTH);
  const verification = draft?.verification;
  const licenceRequired = verification?.licenceRequired ?? draft?.trade === "Electrician";
  const workArea = draft?.workArea;
  const toVerification = () => router.push("/verification");

  const steps: DoneStep[] = [
    { id: "published", title: "Profile published", note: "Visible in Artisans, Services and Marketplace", icon: "/icons/onboarding-user-check.svg", tone: "done", pill: "Live" },
    verification?.identity
      ? { id: "identity", title: "ID check", note: "We are checking your Ghana Card", icon: "/icons/onboarding-id-verified.svg", tone: "pending", pill: "In review" }
      : { id: "identity", title: "Verify your identity", note: "Needed before you can accept jobs", icon: "/icons/onboarding-id-verified.svg", tone: "todo", action: { label: "Verify now", onClick: toVerification } },
    ...(workArea?.jobAlerts
      ? [{ id: "alerts", title: "Job alerts", note: `WhatsApp alerts for jobs ${alertsReach(workArea.travel, place)}`, icon: "/icons/onboarding-flash.svg", tone: "done" as const, pill: "On" }]
      : []),
    ...(licenceRequired
      ? [
          verification?.licence
            ? { id: "licence", title: "Energy Commission licence", note: "We are checking your licence card", icon: "/icons/onboarding-license.svg", tone: "pending" as const, pill: "In review" }
            : { id: "licence", title: "Energy Commission licence", note: "Upload your licence card so we can check it", icon: "/icons/onboarding-license.svg", tone: "todo" as const, action: { label: "Upload licence", onClick: toVerification } },
        ]
      : []),
  ];

  return (
    <OnboardingDoneView
      title={`${firstName}, your profile is live`}
      subtitle={`Customers ${place ? `in and around ${place}` : "near you"} can now find you.${licenceRequired ? " Electrical job requests start as soon as your Energy Commission licence is checked." : ""}`}
      strength={strength}
      steps={steps}
      primary={{ label: "Go to my jobs", onClick: () => router.push("/manage/artisan/jobs") }}
      secondary={{ label: "View my profile", onClick: () => router.push("/manage/provider") }}
      note="Switch between Personal and Artisan from your name in the top bar."
      notePlacement="above"
      onClose={() => router.push("/home")}
    />
  );
}
