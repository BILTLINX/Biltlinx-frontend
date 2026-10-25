"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { comingSoonHref } from "@/lib/coming-soon";
import { loadOrganisationDraft, type OrganisationDraft } from "@/lib/organisation-draft";
import { cn } from "@/lib/utils";

interface NextStep {
  id: string;
  title: string;
  note: string;
  icon: string;
  /** Some design icons are exported upside-down and are flipped back when drawn. */
  iconClass?: string;
  action: string;
  feature: string;
  primary?: boolean;
}

const NEXT_STEPS: NextStep[] = [
  { id: "team", title: "Invite your team", note: "Add agents and staff with the right roles", icon: "/icons/user-group.svg", action: "Invite staff", feature: "Invite staff", primary: true },
  { id: "listings", title: "Move listings in", note: "Assign your listings to branches", icon: "/icons/house-03.svg", iconClass: "-scale-y-100", action: "Assign listings", feature: "Assign listings" },
  { id: "page", title: "Finish your page", note: "Add a cover photo and services", icon: "/icons/building-03.svg", action: "View page", feature: "Organisation page" },
];

/** Organisation created · success (Figma node 1084:35566): the organisation exists; three things to do next. */
export default function OrganisationCreatedPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<OrganisationDraft | null>(null);

  // The name from step 1 lives in the tab session, so it is read after mount.
  useEffect(() => setDraft(loadOrganisationDraft()), []);

  const name = draft?.name || "Your organisation";
  const inReview = (draft?.documents ?? 0) > 0;

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer className="items-center py-6 sm:py-12">
        <span className="flex size-[72px] items-center justify-center rounded-full bg-[#dcfce7]">
          <NavIcon icon="/icons/onboarding-check-circle.svg" size={36} className="bg-[#16a34a]" />
        </span>

        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-[22px] font-bold leading-[30px] text-[#0f172a] sm:text-[26px] sm:leading-[34px]">{name} is ready</h1>
          <p className="text-sm leading-5 text-gray-500">
            {inReview ? "Your public page is live and verification is in review." : "Your public page is live. Add your documents any time to get verified."} Here&rsquo;s what to do next.
          </p>
        </div>

        <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {NEXT_STEPS.map((step) => (
            <li key={step.id} className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#eff5ff]">
                <NavIcon icon={step.icon} size={20} className={cn("bg-brand-900", step.iconClass)} />
              </span>
              <p className="text-[15px] font-bold leading-[22px] text-[#0f172a]">{step.title}</p>
              <p className="flex-1 text-[13px] leading-[19px] text-gray-500">{step.note}</p>
              <button
                type="button"
                onClick={() => router.push(comingSoonHref(step.feature))}
                className={cn("h-10 rounded-[10px] px-4 text-sm font-medium", step.primary ? "bg-brand-900 text-white hover:opacity-90" : "border border-gray-200 bg-white text-[#0f172a] hover:bg-gray-50")}
              >
                {step.action}
              </button>
            </li>
          ))}
        </ul>

        <Link href="/manage" className="text-sm font-medium leading-5 text-brand-900">
          Go to organisation dashboard &rsaquo;
        </Link>
      </PageContainer>
    </AppShell>
  );
}
