"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingPlanCards } from "@/components/shared/OnboardingPlanCards";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { comingSoonHref } from "@/lib/coming-soon";
import { NEW_ORGANIZATION, ORGANIZATION_PLANS, ORGANIZATION_STEPS, ORGANIZATION_TYPES } from "@/lib/dummy-onboarding";
import { initialsOf } from "@/lib/initials";
import { loadOrganizationDraft, updateOrganizationDraft, type OrganizationDraft } from "@/lib/onboarding-draft";
import { cn } from "@/lib/utils";

/** What steps 1 to 4 earned when nothing was saved. */
const DEFAULT_STRENGTH = 45;

/** Onboarding · Organization · 5 Plan (Figma node 1074:32803): choose how the team starts; nothing is charged today. */
export default function OrganizationPlanPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<OrganizationDraft | null>(null);
  const [planId, setPlanId] = useState("business");

  // Earlier steps' choices live in the tab session, so they are read after mount.
  useEffect(() => setDraft(loadOrganizationDraft()), []);

  const plan = ORGANIZATION_PLANS.find((option) => option.id === planId) ?? ORGANIZATION_PLANS[1];
  const orgName = draft?.name ?? NEW_ORGANIZATION.name;
  const type = ORGANIZATION_TYPES.find((option) => option.id === draft?.typeId) ?? ORGANIZATION_TYPES[0];
  const headOffice = draft?.headOffice ?? "";
  const branchCount = (draft?.branches?.length ?? 0) + 1;
  const invited = draft?.invited ?? 0;
  const verification = draft?.verification;
  const pending = Boolean(verification && (verification.incorporation || verification.authority || verification.ownerId));
  const baseStrength = draft?.strength ?? DEFAULT_STRENGTH;
  const strength = Math.min(100, baseStrength + 5);

  function finish(chosen: string) {
    if (chosen === "enterprise") {
      router.push(comingSoonHref("Contact sales"));
      return;
    }
    updateOrganizationDraft({ plan: chosen, strength: chosen === "free" ? baseStrength : strength });
    router.push("/onboarding/organization/done");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar title="Setting up your organization" actionLabel="Save and finish later" onAction={() => router.push("/home")} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pb-12 pt-8 sm:px-12 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:gap-8">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <OnboardingStepper
              title="Organization setup"
              duration="About 6 minutes"
              icon="/icons/onboarding-city.svg"
              iconClass="-scale-y-100"
              steps={ORGANIZATION_STEPS}
              current={4}
              note="You become the first Admin. Your personal account stays separate from the organization."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 5 of 5</p>
              <h1 className="text-[28px] font-bold text-[#0f172a]">Choose a plan for your team</h1>
              <p className="text-[15px] text-gray-500">Branches and staff permissions start on Business. You can change plans anytime in Manage.</p>
            </div>

            <OnboardingPlanCards plans={ORGANIZATION_PLANS} selectedId={planId} onSelect={setPlanId} />

            <p className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[13px] font-medium leading-[1.45] text-[#334155]">
              <NavIcon icon="/icons/onboarding-info-circle.svg" size={18} className="shrink-0 bg-brand-900" />
              On Free you keep the organization page and head office, but staff invites wait until you upgrade.
            </p>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding/organization/verification")} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => finish("free")} className="whitespace-nowrap rounded-[10px] px-5 py-3 text-sm font-semibold text-brand-900">
                  Start on Free
                </button>
                <button type="button" onClick={() => finish(planId)} className="whitespace-nowrap rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                  {plan.action}
                </button>
              </div>
            </div>
          </main>

          <aside className="lg:col-start-2 xl:sticky xl:top-8 xl:col-start-3 xl:self-start">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs font-semibold leading-[1.45] text-gray-500">Preview · how others see you</p>
                <NavIcon icon="/icons/onboarding-preview-eye.svg" size={16} className="bg-gray-500" />
              </div>
              <div className="h-16 bg-gradient-to-r from-[#0a1f44] to-brand-900" />
              <div className="flex flex-col gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-xl border-[3px] border-white bg-[#eff5ff] text-lg font-bold text-brand-900">{initialsOf(orgName)}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                    <p className="truncate text-base font-bold text-[#0f172a]">{orgName}</p>
                    <p className="text-[13px] text-gray-500">{[type.title, headOffice].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold leading-[1.45]", pending ? "bg-[#fef3c7] text-[#b45309]" : "bg-[#f1f5f9] text-gray-500")}>{pending ? "Organization verification pending" : "Not verified yet"}</span>
                </div>
                <dl className="flex flex-col gap-2 text-[13px] leading-[1.45]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Branches</dt>
                    <dd className={cn("font-semibold", branchCount > 1 ? "text-[#0f172a]" : "text-[#94a3b8]")}>{branchCount > 1 ? `${branchCount} locations` : "Head office only"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Team</dt>
                    <dd className={cn("font-semibold", invited > 0 ? "text-[#0f172a]" : "text-[#94a3b8]")}>{invited > 0 ? `You + ${invited} invited` : "Just you"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Plan</dt>
                    <dd className="font-semibold text-[#0f172a]">{plan.name}</dd>
                  </div>
                </dl>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs leading-[1.45]">
                    <span className="font-medium text-gray-500">Profile strength</span>
                    <span className="font-bold text-[#16a34a]">{strength}%</span>
                  </div>
                  <div role="progressbar" aria-label="Profile strength" aria-valuemin={0} aria-valuemax={100} aria-valuenow={strength} className="h-1.5 overflow-hidden rounded-[3px] bg-[#e2e8f0]">
                    <div className="h-full rounded-[3px] bg-[#16a34a] transition-all" style={{ width: `${strength}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
