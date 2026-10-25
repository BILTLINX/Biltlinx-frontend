"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingRadioDot } from "@/components/shared/OnboardingRadioDot";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { NEW_ORGANIZATION, ORGANIZATION_STEPS, ORGANIZATION_TYPES, TEAM_SIZE_OPTIONS } from "@/lib/dummy-onboarding";
import { initialsOf } from "@/lib/initials";
import { saveOrganizationDraft } from "@/lib/onboarding-draft";
import { ORGANIZATION_CAPABILITY } from "@/lib/onboarding-submit";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6";
const INPUT = "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900";
/** The account itself earns 10% and choosing a type adds 15%; one type is always selected. */
const STRENGTH = 25;

/** Onboarding · Organization · 1 Organization (Figma node 1074:31951): the type, name, size and head office. */
export default function OrganizationPage() {
  const router = useRouter();
  const [typeId, setTypeId] = useState<(typeof ORGANIZATION_TYPES)[number]["id"]>("developer");
  const [name, setName] = useState("Your organization");
  const [teamSize, setTeamSize] = useState(TEAM_SIZE_OPTIONS[3]);
  const [headOffice, setHeadOffice] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");

  const type = ORGANIZATION_TYPES.find((option) => option.id === typeId) ?? ORGANIZATION_TYPES[0];

  const supported = Boolean(ORGANIZATION_CAPABILITY[typeId]);

  function handleContinue() {
    if (!supported) return;
    if (!name.trim()) {
      setError("Enter your organization’s name to continue.");
      return;
    }
    saveOrganizationDraft({ typeId, name: name.trim(), teamSize, headOffice: headOffice.trim(), website: website.trim(), strength: STRENGTH });
    router.push("/onboarding/organization/verification");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar title="Setting up your organization" actionLabel="Save and finish later" onAction={() => router.push("/home")} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pb-12 pt-8 sm:px-12 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:gap-8">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <OnboardingStepper
              title="Organization setup"
              duration="About 3 minutes"
              icon="/icons/onboarding-city.svg"
              iconClass="-scale-y-100"
              steps={ORGANIZATION_STEPS}
              current={0}
              note="You become the first Admin. Your personal account stays separate from the organization."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 1 of 2</p>
              <h1 className="text-[28px] font-bold text-[#0f172a]">Set up your organization</h1>
              <p className="text-[15px] text-gray-500">An organization has its own page, branches and staff. People act for it with their own personal accounts.</p>
            </div>

            <section className={cn(CARD, "gap-3")}>
              <h2 className="text-base font-bold leading-[1.45] text-[#0f172a]">What type of organization?</h2>
              <div role="radiogroup" aria-label="Type of organization" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {ORGANIZATION_TYPES.map((option) => {
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
              {!supported && (
                <p className="rounded-xl bg-[#fef3c7] px-4 py-3 text-[13px] leading-[1.45] text-[#b45309]">
                  Estates, institutions and public agencies are not on Biltlinx yet. Pick Property developer or Property management company to set up now.
                </p>
              )}
            </section>

            <section className={CARD}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Organization name</span>
                  <span className={INPUT}>
                    <input value={name} maxLength={80} onChange={(event) => { setName(event.target.value); setError(""); }} className="min-w-0 flex-1 bg-transparent focus:outline-none" />
                    {name.trim() && <NavIcon icon="/icons/onboarding-check-circle.svg" size={18} className="bg-[#16a34a]" />}
                  </span>
                </label>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Team size</span>
                  <OptionSelectField value={teamSize} options={TEAM_SIZE_OPTIONS} onChange={setTeamSize} />
                </div>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Head office</span>
                  <span className={INPUT}>
                    <NavIcon icon="/icons/location-01.svg" size={18} className="bg-gray-500" />
                    <input value={headOffice} maxLength={80} placeholder={NEW_ORGANIZATION.headOffice} onChange={(event) => setHeadOffice(event.target.value)} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                  </span>
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 leading-[1.45]">
                    <span className="text-[13px] font-medium text-[#334155]">Website</span>
                    <span className="text-xs text-[#94a3b8]">Optional</span>
                  </span>
                  <span className={INPUT}>
                    <NavIcon icon="/icons/onboarding-globe.svg" size={18} className="bg-gray-500" />
                    <input value={website} maxLength={80} placeholder="kharisdev.com" onChange={(event) => setWebsite(event.target.value)} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                  </span>
                </label>
              </div>
            </section>

            {error && <p className="text-sm text-[#dc2626]">{error}</p>}

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding")} className="flex items-center gap-2 whitespace-nowrap rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Change account type
              </button>
              <button type="button" onClick={handleContinue} disabled={!supported} className="flex items-center gap-2 rounded-[10px] bg-brand-900 disabled:opacity-50 px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
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
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-xl border-[3px] border-white bg-[#eff5ff] text-lg font-bold text-brand-900">{initialsOf(name)}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                    <p className="truncate text-base font-bold text-[#0f172a]">{name.trim() || "Your organization"}</p>
                    <p className="text-[13px] text-gray-500">{[type.title, headOffice.trim()].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-gray-500">Not verified yet</span>
                </div>
                <dl className="flex flex-col gap-2 text-[13px] leading-[1.45]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Branches</dt>
                    <dd className="font-semibold text-[#94a3b8]">Head office only</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Team</dt>
                    <dd className="font-semibold text-[#94a3b8]">Just you</dd>
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
                    <div className="h-full rounded-[3px] bg-[#16a34a]" style={{ width: `${STRENGTH}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-[14px] bg-[#eff5ff] p-4">
              <NavIcon icon="/icons/onboarding-building.svg" size={20} className="shrink-0 -scale-y-100 bg-brand-900" />
              <div className="flex min-w-0 flex-col gap-1 text-[13px] leading-[1.45]">
                <p className="font-bold text-[#0f172a]">Just you running a shop?</p>
                <p className="text-[#334155]">Choose Business instead. It is quicker and has no team setup.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
