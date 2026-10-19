"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { Switch } from "@/components/shared/SettingsParts";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { BEDROOM_OPTIONS, PERSONAL_AREAS, PERSONAL_INTERESTS, PERSONAL_STEPS, RENT_BUDGETS } from "@/lib/dummy-onboarding";
import { savePersonalDraft } from "@/lib/onboarding-draft";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6";

function toggled<T>(items: T[], item: T) {
  return items.includes(item) ? items.filter((existing) => existing !== item) : [...items, item];
}

function Tip({ icon, title, children }: { icon: string; title: string; children: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[14px] bg-[#eff5ff] p-4">
      <NavIcon icon={icon} size={20} className="shrink-0 bg-brand-900" />
      <div className="flex min-w-0 flex-col gap-1 text-[13px] leading-[1.45]">
        <p className="font-bold text-[#0f172a]">{title}</p>
        <p className="text-[#334155]">{children}</p>
      </div>
    </div>
  );
}

/** Onboarding · Personal · 1 Interests (Figma node 1069:31195): what the person is looking for, and where and how much. */
export default function PersonalInterestsPage() {
  const router = useRouter();
  const [interests, setInterests] = useState(["rent", "build"]);
  const [areas, setAreas] = useState(["East Legon", "Cantonments"]);
  const [areaOptions, setAreaOptions] = useState(PERSONAL_AREAS);
  const [newArea, setNewArea] = useState<string | null>(null);
  const [budget, setBudget] = useState(RENT_BUDGETS[2]);
  const [bedrooms, setBedrooms] = useState(BEDROOM_OPTIONS[2]);
  const [alerts, setAlerts] = useState(true);

  function addArea() {
    const name = (newArea ?? "").trim();
    setNewArea(null);
    if (!name) return;
    const existing = areaOptions.find((area) => area.toLowerCase() === name.toLowerCase());
    if (existing) {
      setAreas((current) => (current.includes(existing) ? current : [...current, existing]));
      return;
    }
    setAreaOptions((current) => [...current, name]);
    setAreas((current) => [...current, name]);
  }

  function handleContinue() {
    savePersonalDraft({ interests, areas, bedrooms, alerts });
    router.push("/onboarding/personal/profile");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar title="Setting up your personal account" actionLabel="Save and finish later" onAction={() => router.push("/home")} />

      <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pb-12 pt-8 sm:px-12 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:gap-8">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <OnboardingStepper title="Personal setup" duration="About 1 minute" icon="/icons/onboarding-user.svg" steps={PERSONAL_STEPS} current={0} />
        </div>

        <main className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-1.5 leading-[1.45]">
            <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 1 of 2</p>
            <h1 className="text-[28px] font-bold text-[#0f172a]">What are you looking for?</h1>
            <p className="text-[15px] text-gray-500">We use this to fill your Home feed and suggest people to follow. Pick as many as you like.</p>
          </div>

          <section className={CARD}>
            <h2 className="text-base font-bold leading-[1.45] text-[#0f172a]">I want to</h2>
            <div role="group" aria-label="I want to" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PERSONAL_INTERESTS.map((interest) => {
                const selected = interests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setInterests((current) => toggled(current, interest.id))}
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-3.5 text-left text-sm font-semibold leading-[1.45]",
                      selected ? "border-[1.5px] border-brand-900 bg-[#eff5ff] text-brand-900" : "border border-gray-200 bg-white text-[#0f172a] hover:border-gray-300",
                    )}
                  >
                    <NavIcon icon={interest.icon} size={22} className={cn("shrink-0", selected ? "bg-brand-900" : "bg-[#334155]", interest.iconClass)} />
                    <span className="min-w-0 flex-1">{interest.label}</span>
                    {selected && <NavIcon icon="/icons/onboarding-check-circle.svg" size={18} className="shrink-0 bg-brand-900" />}
                  </button>
                );
              })}
            </div>
          </section>

          <section className={CARD}>
            <div className="flex flex-col gap-1 leading-[1.45]">
              <h2 className="text-base font-bold text-[#0f172a]">Where and how much?</h2>
              <p className="text-[13px] text-gray-500">Helps us show homes and providers near you.</p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-medium leading-[1.45] text-[#334155]">Preferred areas</p>
              <div role="group" aria-label="Preferred areas" className="flex flex-wrap gap-2">
                {areaOptions.map((area) => {
                  const selected = areas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setAreas((current) => toggled(current, area))}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] leading-[1.45]",
                        selected ? "border-brand-900 bg-[#eff5ff] font-semibold text-brand-900" : "border-gray-200 bg-white font-medium text-[#334155] hover:border-gray-300",
                      )}
                    >
                      {selected && <NavIcon icon="/icons/onboarding-tick.svg" size={10} className="bg-brand-900" />}
                      {area}
                    </button>
                  );
                })}
                {newArea === null ? (
                  <button type="button" onClick={() => setNewArea("")} className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-[13px] font-medium leading-[1.45] text-[#334155] hover:border-gray-300">
                    + Add area
                  </button>
                ) : (
                  <input
                    autoFocus
                    value={newArea}
                    maxLength={40}
                    aria-label="New area"
                    placeholder="Area name"
                    onChange={(event) => setNewArea(event.target.value)}
                    onBlur={addArea}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addArea();
                      if (event.key === "Escape") setNewArea(null);
                    }}
                    className="w-36 rounded-full border border-brand-900 bg-white px-3.5 py-2 text-[13px] leading-[1.45] text-[#0f172a] focus:outline-none"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Monthly rent budget</span>
                <OptionSelectField value={budget} options={RENT_BUDGETS} onChange={setBudget} />
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Bedrooms</span>
                <OptionSelectField value={bedrooms} options={BEDROOM_OPTIONS} onChange={setBedrooms} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f1f5f9]">
                <NavIcon icon="/icons/onboarding-flash.svg" size={18} className="bg-[#334155]" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col leading-[1.45]">
                <p className="text-sm font-semibold text-[#0f172a]">Alert me when new homes match</p>
                <p className="text-xs text-gray-500">Sent on WhatsApp and in Notifications. Turn off anytime.</p>
              </div>
              <Switch checked={alerts} label="Alert me when new homes match" onToggle={() => setAlerts(!alerts)} />
            </div>
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
          <Tip icon="/icons/onboarding-sparkles.svg" title="Your Home feed will show">
            {areas.length > 0
              ? `Rentals in ${new Intl.ListFormat("en").format(areas)}, contractors and architects for your build, and communities nearby.`
              : "Rentals near you, contractors and architects for your build, and communities nearby."}
          </Tip>
          <Tip icon="/icons/onboarding-lock.svg" title="Kept private">
            Your budget and saved areas are never shown on your profile.
          </Tip>
        </aside>
      </div>
      </div>
    </div>
  );
}
