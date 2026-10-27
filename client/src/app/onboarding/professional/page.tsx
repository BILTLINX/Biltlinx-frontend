"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDisplayName } from "@/hooks/useDisplayName";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingRadioDot } from "@/components/shared/OnboardingRadioDot";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTip } from "@/components/shared/OnboardingTip";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { ProfessionalPreview } from "@/components/shared/ProfessionalPreview";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { EXPERIENCE_OPTIONS, GENERIC_SERVICES, professionalSteps, PROFESSIONS, SERVICES_BY_PROFESSION, WORK_MODES, WORK_REGIONS, type OfferedService } from "@/lib/dummy-onboarding";
import { loadProfessionalDraft, saveProfessionalDraft } from "@/lib/onboarding-draft";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6";
const LABEL = "text-[13px] font-medium leading-[1.45] text-[#334155]";

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

/** The search box that picks one profession from the list as you type. */
function ProfessionSearch({ value, onChange }: { value: string; onChange: (profession: string) => void }) {
  const root = useRef<HTMLDivElement | null>(null);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const matches = PROFESSIONS.filter((option) => option.toLowerCase().includes(text.trim().toLowerCase()));

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div ref={root} className="relative">
      <div className={cn("flex h-12 items-center gap-2 rounded-2xl border bg-white px-3 py-2.5", open ? "border-brand-900" : "border-gray-200")}>
        <Image src="/onboarding-professional/search.svg" alt="" width={16} height={16} className="shrink-0" />
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls="profession-options"
          aria-label="Profession"
          value={open ? text : value}
          placeholder="Search profession"
          onFocus={() => {
            setText("");
            setOpen(true);
          }}
          onChange={(event) => {
            setText(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-[#0f172a] placeholder:text-[#53575a] focus:outline-none"
        />
      </div>
      {open && (
        <ul id="profession-options" role="listbox" className="absolute inset-x-0 top-[calc(100%+4px)] z-20 flex flex-col rounded-2xl border border-gray-200 bg-white p-1 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)]">
          {matches.length === 0 && <li className="px-3 py-2.5 text-sm text-gray-500">No profession matches “{text.trim()}”.</li>}
          {matches.map((option) => (
            <li key={option} role="option" aria-selected={option === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={cn("w-full rounded-xl px-3 py-2.5 text-left text-sm", option === value ? "bg-[#eff5ff] font-semibold text-brand-900" : "font-medium text-[#334155] hover:bg-gray-50")}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function toggled<T>(items: T[], item: T) {
  return items.includes(item) ? items.filter((existing) => existing !== item) : [...items, item];
}

const shortName = (service: OfferedService) => service.short ?? service.label;

/** Onboarding · Professional · 1 Profession (Figma node 1070:31323): profession, specifications, and how and where they work. */
export default function ProfessionalProfessionPage() {
  const accountName = useDisplayName();
  const router = useRouter();
  const [profession, setProfession] = useState("");
  const [services, setServices] = useState<OfferedService[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [newService, setNewService] = useState<string | null>(null);
  const [workMode, setWorkMode] = useState<(typeof WORK_MODES)[number]["id"]>("firm");
  const [region, setRegion] = useState<string>(WORK_REGIONS[0].label);
  const [experience, setExperience] = useState("2 years");
  const [showError, setShowError] = useState(false);

  // Coming back from a later step restores the choices kept for the tab session.
  useEffect(() => {
    const draft = loadProfessionalDraft();
    if (!draft) return;
    const known = SERVICES_BY_PROFESSION[draft.profession] ?? GENERIC_SERVICES;
    const saved = draft.services ?? [];
    const own = saved.filter((name) => !known.some((service) => shortName(service) === name));
    setProfession(draft.profession);
    setServices([...known, ...own.map((label) => ({ label }))]);
    setChosen([...known.filter((service) => saved.includes(shortName(service))).map((service) => service.label), ...own]);
    setExperience(draft.experience);
    setRegion(WORK_REGIONS.find((item) => item.short === draft.worksIn?.[0])?.label ?? WORK_REGIONS[0].label);
    setWorkMode(draft.firm ? "firm" : (draft.workMode ?? "firm"));
  }, []);

  function pickProfession(next: string) {
    if (next === profession) return;
    setProfession(next);
    setServices(SERVICES_BY_PROFESSION[next] ?? GENERIC_SERVICES);
    setChosen([]);
    setShowError(false);
  }

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

  const shortServices = services.filter((service) => chosen.includes(service.label)).map(shortName);

  function handleContinue() {
    if (!profession || chosen.length === 0) {
      setShowError(true);
      return;
    }
    const existing = loadProfessionalDraft();
    saveProfessionalDraft({
      ...existing,
      profession,
      experience,
      basedIn: existing?.basedIn ?? "",
      firm: workMode === "firm" ? (existing?.firm ?? "") : "",
      workMode,
      services: shortServices,
      worksIn: [WORK_REGIONS.find((item) => item.label === region)?.short ?? region],
    });
    router.push(workMode === "independent" ? "/onboarding/professional/credentials" : "/onboarding/professional/firm");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar actionLabel="Save and finish later" actionIcon="bookmark" onAction={() => router.push("/home")} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pb-12 pt-8 sm:px-12 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:gap-8">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <OnboardingStepper
              title="Professional setup"
              duration="About 4 minutes"
              icon="/icons/briefcase-01.svg"
              steps={professionalSteps(workMode === "independent")}
              current={0}
              note="You can publish before your credentials are checked. Badges appear once each check passes."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <h1 className="text-[28px] font-bold text-[#0f172a]">What kind of professional are you?</h1>
              <p className="text-[15px] text-gray-500">This decides which credentials we ask for and where people find you.</p>
            </div>

            <section className={CARD}>
              <h2 className="text-base font-bold leading-[1.45] text-[#0f172a]">Professional details</h2>

              <div className="flex flex-col gap-2">
                <span className={LABEL}>Profession</span>
                <ProfessionSearch value={profession} onChange={pickProfession} />
                {showError && !profession && <p className="text-xs text-[#dc2626]">Choose your profession to continue.</p>}
              </div>

              <div className="flex flex-col gap-2">
                <p className={LABEL}>Specifications (pick at least one)</p>
                <div role="group" aria-label="Specifications" className="flex flex-wrap gap-2">
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
                {showError && chosen.length === 0 && <p className="text-xs text-[#dc2626]">Pick at least one specification to continue.</p>}
              </div>
            </section>

            <section className={CARD}>
              <h2 className="text-base font-bold leading-[1.45] text-[#0f172a]">Experience</h2>

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
                      className={cn("flex items-center gap-3.5 rounded-xl p-4 text-left", selected ? "border-[1.5px] border-brand-900 bg-[#eff5ff] p-[15.5px]" : "border border-gray-200 bg-white hover:border-gray-300")}
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className={LABEL}>Where you take work</span>
                  <OptionSelectField value={region} options={WORK_REGIONS.map((item) => item.label)} onChange={setRegion} maxPanelHeight={240} hideScrollbar />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className={LABEL}>Years of experience</span>
                  <OptionSelectField value={experience} options={EXPERIENCE_OPTIONS} onChange={setExperience} maxPanelHeight={240} hideScrollbar />
                </div>
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
            <ProfessionalPreview done={{ profession: profession !== "" && chosen.length > 0, firm: false, credentials: false, public: false }} name={accountName} photoUrl={null} services={shortServices} registration={null} independent={workMode === "independent"} />
            <OnboardingTip icon="/icons/onboarding-info-circle.svg" title="Have more than one profession?">
              Pick your main one now. You can add a second profession from your profile later.
            </OnboardingTip>
          </aside>
        </div>
      </div>
    </div>
  );
}
