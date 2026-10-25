"use client";

import { useDisplayName } from "@/hooks/useDisplayName";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { GENERIC_SERVICES, PRICING_OPTIONS, PROFESSIONAL_STEPS, SERVICES_BY_PROFESSION, WORK_REGIONS, type OfferedService } from "@/lib/dummy-onboarding";
import { loadProfessionalDraft, updateProfessionalDraft } from "@/lib/onboarding-draft";
import { initialsOf } from "@/lib/initials";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6";
const DEFAULT_PROFESSION = "Architect";
const DEFAULT_EXPERIENCE = "8 years";
/** What step 1 already earned: the account, a profession, and experience with a location. */
const STEP_ONE_STRENGTH = 30;

function toggled<T>(items: T[], item: T) {
  return items.includes(item) ? items.filter((existing) => existing !== item) : [...items, item];
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] leading-[1.45]",
        selected ? "border-brand-900 bg-[#eff5ff] font-semibold text-brand-900" : "border-gray-200 bg-white font-medium text-[#334155] hover:border-gray-300",
      )}
    >
      {selected && <NavIcon icon="/icons/onboarding-tick.svg" size={10} className="bg-brand-900" />}
      {label}
    </button>
  );
}

/** Onboarding · Professional · 2 Services (Figma node 1070:31519): which services they offer, where, and how they price. */
export default function ProfessionalServicesPage() {
  const accountName = useDisplayName();
  const router = useRouter();
  const [profession, setProfession] = useState(DEFAULT_PROFESSION);
  const [experience, setExperience] = useState(DEFAULT_EXPERIENCE);
  const [firm, setFirm] = useState("");
  const [services, setServices] = useState<OfferedService[]>(SERVICES_BY_PROFESSION[DEFAULT_PROFESSION]);
  const [chosen, setChosen] = useState<string[]>(["Architectural design", "Building permit drawings", "Site supervision"]);
  const [newService, setNewService] = useState<string | null>(null);
  const [regions, setRegions] = useState<string[]>(["Greater Accra", "Remote / online"]);
  const [pricing, setPricing] = useState<(typeof PRICING_OPTIONS)[number]["id"]>("consultation");
  const [showError, setShowError] = useState(false);

  // Step 1's choices live in the tab session, so they are read after mount.
  useEffect(() => {
    const draft = loadProfessionalDraft();
    if (!draft) return;
    const list = SERVICES_BY_PROFESSION[draft.profession] ?? GENERIC_SERVICES;
    setProfession(draft.profession);
    setExperience(draft.experience);
    setFirm(draft.firm);
    setServices(list);
    setChosen(SERVICES_BY_PROFESSION[draft.profession] ? ["Architectural design", "Building permit drawings", "Site supervision"] : [list[0].label]);
  }, []);

  function addService() {
    const name = (newService ?? "").trim();
    setNewService(null);
    if (!name) return;
    const existing = services.find((service) => service.label.toLowerCase() === name.toLowerCase());
    if (existing) {
      setChosen((current) => (current.includes(existing.label) ? current : [...current, existing.label]));
      return;
    }
    setServices((current) => [...current, { label: name }]);
    setChosen((current) => [...current, name]);
  }

  function handleContinue() {
    if (chosen.length === 0) {
      setShowError(true);
      return;
    }
    updateProfessionalDraft({ services: picked.map((service) => service.short ?? service.label), worksIn, consultation, strength });
    router.push("/onboarding/professional/credentials");
  }

  const picked = services.filter((service) => chosen.includes(service.label));
  const worksIn = WORK_REGIONS.filter((region) => regions.includes(region.label)).map((region) => region.short);
  const strength = STEP_ONE_STRENGTH + (chosen.length > 0 ? 10 : 0) + (regions.length > 0 ? 10 : 0);
  const consultation = PRICING_OPTIONS.find((option) => option.id === pricing)?.preview;

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
              current={1}
              note="You can publish before your credentials are checked. Badges appear once each check passes."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 2 of 4</p>
              <h1 className="text-[28px] font-bold text-[#0f172a]">What services do you offer?</h1>
              <p className="text-[15px] text-gray-500">These become your service listings. They show on your profile, in Services and in Marketplace.</p>
            </div>

            <section className={CARD}>
              <div className="flex flex-col gap-2">
                <p className="text-[13px] font-medium leading-[1.45] text-[#334155]">Services (pick at least one)</p>
                <div role="group" aria-label="Services" className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <Chip
                      key={service.label}
                      label={service.label}
                      selected={chosen.includes(service.label)}
                      onClick={() => {
                        setChosen((current) => toggled(current, service.label));
                        setShowError(false);
                      }}
                    />
                  ))}
                  {newService === null ? (
                    <button type="button" onClick={() => setNewService("")} className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-[13px] font-medium leading-[1.45] text-[#334155] hover:border-gray-300">
                      + Add a service
                    </button>
                  ) : (
                    <input
                      autoFocus
                      value={newService}
                      maxLength={50}
                      aria-label="New service"
                      placeholder="Service name"
                      onChange={(event) => setNewService(event.target.value)}
                      onBlur={addService}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") addService();
                        if (event.key === "Escape") setNewService(null);
                      }}
                      className="w-44 rounded-full border border-brand-900 bg-white px-3.5 py-2 text-[13px] leading-[1.45] text-[#0f172a] focus:outline-none"
                    />
                  )}
                </div>
                {showError && chosen.length === 0 && <p className="text-xs text-[#dc2626]">Pick at least one service to continue.</p>}
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-[13px] font-medium leading-[1.45] text-[#334155]">Where you take work</p>
                <div role="group" aria-label="Where you take work" className="flex flex-wrap gap-2">
                  {WORK_REGIONS.map((region) => (
                    <Chip key={region.label} label={region.label} selected={regions.includes(region.label)} onClick={() => setRegions((current) => toggled(current, region.label))} />
                  ))}
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex flex-col gap-1 leading-[1.45]">
                <h2 className="text-base font-bold text-[#0f172a]">How do you price your work?</h2>
                <p className="text-[13px] text-gray-500">You can set prices for each service later in Manage.</p>
              </div>
              <div role="radiogroup" aria-label="How you price your work" className="flex flex-col gap-3">
                {PRICING_OPTIONS.map((option) => {
                  const selected = option.id === pricing;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setPricing(option.id)}
                      className={cn("flex items-center gap-3.5 rounded-xl p-4 text-left", selected ? "border-[1.5px] border-brand-900 bg-[#eff5ff] p-[15.5px]" : "border border-gray-200 bg-white hover:border-gray-300")}
                    >
                      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-[10px]", selected ? "bg-white" : "bg-[#f1f5f9]")}>
                        <NavIcon icon={option.icon} size={20} className={selected ? "bg-brand-900" : "bg-[#334155]"} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                        <span className="text-sm font-semibold text-[#0f172a]">{option.title}</span>
                        <span className="text-[13px] text-gray-500">{option.note}</span>
                      </span>
                      {"hint" in option && <span className="hidden shrink-0 rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-brand-900 sm:block">{option.hint}</span>}
                      <span aria-hidden className={cn("size-5 shrink-0 rounded-[10px] bg-white", selected ? "border-[6px] border-brand-900" : "border-[1.5px] border-gray-200")} />
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding/professional")} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Back
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
                    <p className="truncate text-[13px] text-gray-500">{[profession, firm].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-gray-500">Not verified yet</span>
                </div>
                {picked.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {picked.map((service) => (
                      <span key={service.label} className="rounded-lg bg-[#f1f5f9] px-2 py-1 text-xs font-medium leading-[1.45] text-[#334155]">
                        {service.short ?? service.label}
                      </span>
                    ))}
                  </div>
                )}
                <dl className="flex flex-col gap-2 text-[13px] leading-[1.45]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Experience</dt>
                    <dd className="text-right font-semibold text-[#0f172a]">{experience}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Works in</dt>
                    <dd className={cn("text-right font-semibold", worksIn.length > 0 ? "text-[#0f172a]" : "text-[#94a3b8]")}>{worksIn.length > 0 ? worksIn.join(" · ") : "Not set yet"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Consultation</dt>
                    <dd className="font-semibold text-[#0f172a]">{consultation}</dd>
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
              <NavIcon icon="/icons/onboarding-sparkles.svg" size={20} className="shrink-0 bg-brand-900" />
              <div className="flex min-w-0 flex-col gap-1 text-[13px] leading-[1.45]">
                <p className="font-bold text-[#0f172a]">Be found nearby</p>
                <p className="text-[#334155]">
                  Customers in {regions.includes("Greater Accra") ? "Greater Accra" : "your area"} can find you in the directory and send you a quote request.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
