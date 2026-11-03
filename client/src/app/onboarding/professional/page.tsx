"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDisplayName } from "@/hooks/useDisplayName";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTip } from "@/components/shared/OnboardingTip";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { ProfessionalPreview } from "@/components/shared/ProfessionalPreview";
import { SearchSelect } from "@/components/shared/SearchSelect";
import { SpecificationsField } from "@/components/shared/SpecificationsField";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { WorkModeCards } from "@/components/shared/WorkModeCards";
import { EXPERIENCE_OPTIONS, GENERIC_SERVICES, professionalSteps, PROFESSIONS, SERVICES_BY_PROFESSION, WORK_MODES, WORK_REGIONS, type OfferedService } from "@/lib/dummy-onboarding";
import { loadProfessionalDraft, saveProfessionalDraft } from "@/lib/onboarding-draft";

const CARD = "flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6";
const LABEL = "text-[13px] font-medium leading-[1.45] text-[#334155]";

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

  function addService(name: string) {
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
                <SearchSelect options={PROFESSIONS} value={profession} onChange={pickProfession} placeholder="Search profession" noun="profession" icon={<Image src="/onboarding-professional/search.svg" alt="" width={16} height={16} className="shrink-0" />} />
                {showError && !profession && <p className="text-xs text-[#dc2626]">Choose your profession to continue.</p>}
              </div>

              <SpecificationsField
                services={services}
                chosen={chosen}
                onToggle={(label) => {
                  setChosen((current) => toggled(current, label));
                  setShowError(false);
                }}
                onAdd={addService}
                error={showError && chosen.length === 0 ? "Pick at least one specification to continue." : undefined}
              />
            </section>

            <section className={CARD}>
              <h2 className="text-base font-bold leading-[1.45] text-[#0f172a]">Experience</h2>

              <WorkModeCards options={WORK_MODES} value={workMode} onChange={setWorkMode} />

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
