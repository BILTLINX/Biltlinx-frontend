"use client";

import { useDisplayName } from "@/hooks/useDisplayName";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingRadioDot } from "@/components/shared/OnboardingRadioDot";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { ARTISAN_STEPS, EXPERIENCE_OPTIONS, TEAM_SIZES, TRADES } from "@/lib/dummy-onboarding";
import { initialsOf } from "@/lib/initials";
import { saveArtisanDraft } from "@/lib/onboarding-draft";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6";
const INPUT = "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900";
const TEAM_OPTIONS = [
  { id: "alone", label: "I work alone", icon: "/icons/onboarding-user.svg" },
  { id: "team", label: "I have a team", icon: "/icons/onboarding-user-group.svg" },
] as const;

/** Each finished part adds a tenth: the account itself, a trade, and experience with a location. */
function profileStrength({ trade, experience, basedIn }: { trade: string; experience: string; basedIn: string }) {
  return 10 + (trade ? 10 : 0) + (experience && basedIn.trim() ? 10 : 0);
}

/** "3 people" becomes "3"; ranges are kept as they read. */
function teamCount(size: string) {
  return size.replace(/ people$/, "");
}

/** Onboarding · Artisan · 1 Trade (Figma node 1071:31503): what trade, experience and whether they work alone. */
export default function ArtisanTradePage() {
  const accountName = useDisplayName();
  const router = useRouter();
  const [trade, setTrade] = useState(TRADES[0]);
  const [experience, setExperience] = useState("11 years");
  const [basedIn, setBasedIn] = useState("");
  const [team, setTeam] = useState<(typeof TEAM_OPTIONS)[number]["id"]>("team");
  const [teamSize, setTeamSize] = useState(TEAM_SIZES[1]);

  const strength = profileStrength({ trade, experience, basedIn });

  function handleContinue() {
    saveArtisanDraft({ trade, experience, basedIn: basedIn.trim(), team: team === "team" ? `team of ${teamCount(teamSize)}` : "", strength });
    router.push("/onboarding/artisan/work-area");
  }
  const where = basedIn.trim();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar title="Setting up your artisan profile" actionLabel="Save and finish later" onAction={() => router.push("/home")} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pb-12 pt-8 sm:px-12 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:gap-8">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <OnboardingStepper
              title="Artisan setup"
              duration="About 3 minutes"
              icon="/icons/onboarding-wrench.svg"
              steps={ARTISAN_STEPS}
              current={0}
              note="Customers let you into their homes, so an ID check is needed before you can accept jobs."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 1 of 4</p>
              <h1 className="text-[28px] font-bold text-[#0f172a]">What is your trade?</h1>
              <p className="text-[15px] text-gray-500">Pick your main trade. You can add other skills on your profile later.</p>
            </div>

            <section className={cn(CARD, "@container")}>
              <h2 className="text-base font-bold leading-[1.45] text-[#0f172a]">Trade</h2>
              {/* Columns follow the card's own width, which changes with the layout around it: 2 on a phone, 3 in a narrow column, 4 once there is room. */}
              <div role="radiogroup" aria-label="Trade" className="grid grid-cols-2 gap-3 @md:grid-cols-3 @xl:grid-cols-4">
                {TRADES.map((option) => {
                  const selected = option === trade;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setTrade(option)}
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
            </section>

            <section className={CARD}>
              <h2 className="text-base font-bold leading-[1.45] text-[#0f172a]">Experience and team</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Years in this trade</span>
                  <OptionSelectField value={experience} options={EXPERIENCE_OPTIONS} onChange={setExperience} />
                </div>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Based in</span>
                  <span className={INPUT}>
                    <NavIcon icon="/icons/location-01.svg" size={18} className="bg-gray-500" />
                    <input value={basedIn} maxLength={60} placeholder="Madina, Accra" onChange={(event) => setBasedIn(event.target.value)} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                  </span>
                </label>
              </div>

              <div role="radiogroup" aria-label="How you work" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {TEAM_OPTIONS.map((option) => {
                  const selected = option.id === team;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setTeam(option.id)}
                      className={cn("flex items-center gap-3.5 rounded-xl p-4 text-left", selected ? "border-[1.5px] border-brand-900 bg-[#eff5ff] p-[15.5px]" : "border border-gray-200 bg-white hover:border-gray-300")}
                    >
                      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-[10px]", selected ? "bg-white" : "bg-[#f1f5f9]")}>
                        <NavIcon icon={option.icon} size={20} className={selected ? "bg-brand-900" : "bg-[#334155]"} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                        <span className="text-sm font-semibold text-[#0f172a]">{option.label}</span>
                        {option.id === "team" && selected && <span className="text-[13px] text-gray-500">Team size: {teamSize}</span>}
                      </span>
                      <OnboardingRadioDot selected={selected} />
                    </button>
                  );
                })}
              </div>

              {team === "team" && (
                <div className="flex max-w-sm flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Team size</span>
                  <OptionSelectField value={teamSize} options={TEAM_SIZES} onChange={setTeamSize} />
                </div>
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
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-full border-[3px] border-white bg-[#eff5ff] text-lg font-bold text-brand-900">{initialsOf(accountName)}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                    <p className="truncate text-base font-bold text-[#0f172a]">{accountName}</p>
                    <p className="truncate text-[13px] text-gray-500">{[trade, where].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-gray-500">Not verified yet</span>
                </div>
                <dl className="flex flex-col gap-2 text-[13px] leading-[1.45]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Experience</dt>
                    <dd className="text-right font-semibold text-[#0f172a]">{team === "team" ? `${experience} · team of ${teamCount(teamSize)}` : experience}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Travels up to</dt>
                    <dd className="font-semibold text-[#94a3b8]">Not set yet</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Call-out fee</dt>
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

            {trade === "Electrician" && (
              <div className="flex items-start gap-3 rounded-[14px] bg-[#fef3c7] p-4">
                <NavIcon icon="/icons/onboarding-alert-circle.svg" size={20} className="shrink-0 bg-[#b45309]" />
                <div className="flex min-w-0 flex-col gap-1 text-[13px] leading-[1.45]">
                  <p className="font-bold text-[#0f172a]">Electrical work is safety-critical</p>
                  <p className="text-[#334155]">We will ask for your Energy Commission wiring licence in step 3. Without it you can still take non-electrical jobs.</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
