"use client";

import { useDisplayName } from "@/hooks/useDisplayName";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingRadioDot } from "@/components/shared/OnboardingRadioDot";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { comingSoonHref } from "@/lib/coming-soon";
import { EXPERIENCE_OPTIONS, PROFESSIONAL_STEPS, PROFESSIONS, WORK_MODES } from "@/lib/dummy-onboarding";
import { saveProfessionalDraft } from "@/lib/onboarding-draft";
import { initialsOf } from "@/lib/initials";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6";
const INPUT = "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900";

/** Each finished part adds a tenth: the account itself, a profession, and where and how long they have worked. */
function profileStrength({ profession, experience, basedIn }: { profession: string; experience: string; basedIn: string }) {
  return 10 + (profession ? 10 : 0) + (experience && basedIn.trim() ? 10 : 0);
}

/** Onboarding · Professional · 1 Profession (Figma node 1070:31323): what kind of professional, experience and firm. */
export default function ProfessionalProfessionPage() {
  const accountName = useDisplayName();
  const router = useRouter();
  const [profession, setProfession] = useState(PROFESSIONS[0]);
  const [experience, setExperience] = useState("8 years");
  const [basedIn, setBasedIn] = useState("");
  const [workMode, setWorkMode] = useState<(typeof WORK_MODES)[number]["id"]>("firm");
  const [firm, setFirm] = useState("");

  const firmName = workMode === "firm" ? firm.trim() : "";
  const strength = profileStrength({ profession, experience, basedIn });

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar title="Setting up your professional profile" actionLabel="Save and finish later" onAction={() => router.push("/home")} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pb-12 pt-8 sm:px-12 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:gap-8">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <OnboardingStepper
              title="Professional setup"
              duration="About 4 minutes"
              icon="/icons/briefcase-01.svg"
              steps={PROFESSIONAL_STEPS}
              current={0}
              note="You can publish before your credentials are checked. Badges appear once each check passes."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 1 of 4</p>
              <h1 className="text-[28px] font-bold text-[#0f172a]">What kind of professional are you?</h1>
              <p className="text-[15px] text-gray-500">This decides which credentials we ask for and where people find you.</p>
            </div>

            <section className={CARD}>
              <h2 className="text-base font-bold leading-[1.45] text-[#0f172a]">Profession</h2>
              <div role="radiogroup" aria-label="Profession" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PROFESSIONS.map((option) => {
                  const selected = option === profession;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setProfession(option)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl p-3.5 text-left text-sm font-semibold leading-[1.45]",
                        selected ? "border-[1.5px] border-brand-900 bg-[#eff5ff] text-brand-900" : "border border-gray-200 bg-white text-[#0f172a] hover:border-gray-300",
                      )}
                    >
                      <span className="min-w-0 flex-1">{option}</span>
                      <OnboardingRadioDot selected={selected} />
                    </button>
                  );
                })}
              </div>
              <button type="button" onClick={() => router.push(comingSoonHref("Search all professions"))} className="w-fit text-[13px] font-semibold leading-[1.45] text-brand-900">
                Don&apos;t see yours? Search all 40+ professions
              </button>
            </section>

            <section className={CARD}>
              <h2 className="text-base font-bold leading-[1.45] text-[#0f172a]">Experience and firm</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Years of experience</span>
                  <OptionSelectField value={experience} options={EXPERIENCE_OPTIONS} onChange={setExperience} />
                </div>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Based in</span>
                  <span className={INPUT}>
                    <NavIcon icon="/icons/location-01.svg" size={18} className="bg-gray-500" />
                    <input value={basedIn} maxLength={60} placeholder="Osu, Accra" onChange={(event) => setBasedIn(event.target.value)} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                  </span>
                </label>
              </div>

              <div role="radiogroup" aria-label="How you work" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {WORK_MODES.map((mode) => {
                  const selected = mode.id === workMode;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setWorkMode(mode.id)}
                      className={cn(
                        "flex items-center gap-3.5 rounded-xl p-4 text-left",
                        selected ? "border-[1.5px] border-brand-900 bg-[#eff5ff] p-[15.5px]" : "border border-gray-200 bg-white hover:border-gray-300",
                      )}
                    >
                      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-[10px]", selected ? "bg-white" : "bg-[#f1f5f9]")}>
                        <NavIcon icon={mode.icon} size={20} className={cn(selected ? "bg-brand-900" : "bg-[#334155]", mode.iconClass)} />
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-semibold leading-[1.45] text-[#0f172a]">{mode.label}</span>
                      <OnboardingRadioDot selected={selected} />
                    </button>
                  );
                })}
              </div>

              {workMode === "firm" && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Firm name</span>
                  <span className={INPUT}>
                    <input value={firm} maxLength={80} placeholder="Your firm’s name" onChange={(event) => setFirm(event.target.value)} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                  </span>
                  <span className="text-xs leading-[1.45] text-gray-500">If your firm is on Biltlinx, we will ask them to confirm you. Firms can set up an Organization account.</span>
                </label>
              )}
            </section>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding")} className="flex items-center gap-2 whitespace-nowrap rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Change account type
              </button>
              <button type="button" onClick={() => {
                  saveProfessionalDraft({ profession, experience, basedIn: basedIn.trim(), firm: firmName });
                  router.push("/onboarding/professional/services");
                }} className="flex items-center gap-2 rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
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
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-full border-[3px] border-white bg-[#eff5ff] text-lg font-bold text-brand-900">{initialsOf(accountName)}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                    <p className="truncate text-base font-bold text-[#0f172a]">{accountName}</p>
                    <p className="truncate text-[13px] text-gray-500">{[profession, firmName].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-gray-500">Not verified yet</span>
                </div>
                <dl className="flex flex-col gap-2 text-[13px] leading-[1.45]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Experience</dt>
                    <dd className="text-right font-semibold text-[#0f172a]">{experience}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Works in</dt>
                    <dd className="font-semibold text-[#94a3b8]">Not set yet</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Consultation</dt>
                    <dd className="font-semibold text-[#94a3b8]">Not set yet</dd>
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

            <div className="flex items-start gap-3 rounded-[14px] bg-[#eff5ff] p-4">
              <NavIcon icon="/icons/onboarding-info-circle.svg" size={20} className="shrink-0 bg-brand-900" />
              <div className="flex min-w-0 flex-col gap-1 text-[13px] leading-[1.45]">
                <p className="font-bold text-[#0f172a]">Have more than one profession?</p>
                <p className="text-[#334155]">Pick your main one now. You can add a second profession from your profile later.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
