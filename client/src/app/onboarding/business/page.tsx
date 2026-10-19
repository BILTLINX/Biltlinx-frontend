"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingRadioDot } from "@/components/shared/OnboardingRadioDot";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { BUSINESS_STEPS, BUSINESS_TYPES, NEW_BUSINESS } from "@/lib/dummy-onboarding";
import { initialsOf } from "@/lib/initials";
import { saveBusinessDraft } from "@/lib/onboarding-draft";
import { cn } from "@/lib/utils";

/** The account itself earns 10% and choosing what kind of business it is adds 15%; one type is always selected. */
const STRENGTH = 25;

/** Onboarding · Business · 1 Business type (Figma node 1073:31677): what kind of business they run. */
export default function BusinessTypePage() {
  const router = useRouter();
  const [typeId, setTypeId] = useState("supplies");
  const [otherNote, setOtherNote] = useState("");

  const type = BUSINESS_TYPES.find((option) => option.id === typeId) ?? BUSINESS_TYPES[0];

  function handleContinue() {
    saveBusinessDraft({ typeId, otherNote: typeId === "other" ? otherNote.trim() : "" });
    router.push("/onboarding/business/details");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar title="Setting up your business" actionLabel="Save and finish later" onAction={() => router.push("/home")} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pb-12 pt-8 sm:px-12 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:gap-8">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <OnboardingStepper
              title="Business setup"
              duration="About 5 minutes"
              icon="/icons/onboarding-building.svg"
              iconClass="-scale-y-100"
              steps={BUSINESS_STEPS}
              current={0}
              note="Your personal account stays separate. You manage the business from Manage once it is set up."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 1 of 5</p>
              <h1 className="text-[28px] font-bold text-[#0f172a]">What kind of business do you run?</h1>
              <p className="text-[15px] text-gray-500">We set up your storefront, listings and Manage tools to match.</p>
            </div>

            <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6">
              <div role="radiogroup" aria-label="Kind of business" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {BUSINESS_TYPES.map((option) => {
                  const selected = option.id === typeId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setTypeId(option.id)}
                      className={cn("flex items-center gap-3.5 rounded-xl p-4 text-left", selected ? "border-[1.5px] border-brand-900 bg-[#eff5ff] p-[15.5px]" : "border border-gray-200 bg-white hover:border-gray-300")}
                    >
                      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-[10px]", selected ? "bg-white" : "bg-[#f1f5f9]")}>
                        <NavIcon icon={option.icon} size={20} className={cn(selected ? "bg-brand-900" : "bg-[#334155]", option.iconClass)} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                        <span className="text-sm font-semibold text-[#0f172a]">{option.title}</span>
                        <span className="text-[13px] text-gray-500">{option.note}</span>
                      </span>
                      <OnboardingRadioDot selected={selected} />
                    </button>
                  );
                })}
              </div>

              {typeId === "other" && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Tell us in a few words</span>
                  <input
                    value={otherNote}
                    maxLength={80}
                    placeholder="e.g. Scaffolding inspections"
                    onChange={(event) => setOtherNote(event.target.value)}
                    className="rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none"
                  />
                </label>
              )}
            </section>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding")} className="flex items-center gap-2 whitespace-nowrap rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Change account type
              </button>
              <button type="button" onClick={handleContinue} className="flex items-center gap-2 rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                Continue
                <NavIcon icon="/icons/onboarding-arrow-right.svg" size={10} className="bg-white" />
              </button>
            </div>
          </main>

          <aside className="flex flex-col gap-4 lg:col-start-2 xl:sticky xl:top-8 xl:col-start-3 xl:self-start">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs font-semibold leading-[1.45] text-gray-500">Preview · how others see you</p>
                <NavIcon icon="/icons/onboarding-preview-eye.svg" size={16} className="bg-gray-500" />
              </div>
              <div className="h-16 bg-gradient-to-r from-[#0a1f44] to-brand-900" />
              <div className="flex flex-col gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-xl border-[3px] border-white bg-[#eff5ff] text-lg font-bold text-brand-900">{initialsOf(NEW_BUSINESS.name)}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                    <p className="truncate text-base font-bold text-[#0f172a]">{NEW_BUSINESS.name}</p>
                    <p className="truncate text-[13px] text-gray-500">
                      {type.category} · {NEW_BUSINESS.location}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-gray-500">Not verified yet</span>
                </div>
                <dl className="flex flex-col gap-2 text-[13px] leading-[1.45]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Open</dt>
                    <dd className="font-semibold text-[#94a3b8]">Not set yet</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">{type.offers}</dt>
                    <dd className="font-semibold text-[#94a3b8]">None yet</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Plan</dt>
                    <dd className="font-semibold text-[#0f172a]">Free</dd>
                  </div>
                </dl>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs leading-[1.45]">
                    <span className="font-medium text-gray-500">Profile strength</span>
                    <span className="font-bold text-[#16a34a]">{STRENGTH}%</span>
                  </div>
                  <div role="progressbar" aria-label="Profile strength" aria-valuemin={0} aria-valuemax={100} aria-valuenow={STRENGTH} className="h-1.5 overflow-hidden rounded-[3px] bg-[#e2e8f0]">
                    <div className="h-full rounded-[3px] bg-[#16a34a] transition-all" style={{ width: `${STRENGTH}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-[14px] bg-[#eff5ff] p-4">
              <NavIcon icon="/icons/onboarding-user-group.svg" size={20} className="shrink-0 bg-brand-900" />
              <div className="flex min-w-0 flex-col gap-1 text-[13px] leading-[1.45]">
                <p className="font-bold text-[#0f172a]">Have staff or several branches?</p>
                <p className="text-[#334155]">Choose Organization instead. It adds branches, staff accounts and permissions. You can also upgrade this business later.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

