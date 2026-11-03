"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccountPrefill } from "@/hooks/useAccountPrefill";
import { useDisplayName } from "@/hooks/useDisplayName";
import { ArtisanPreview, artisanCompletion } from "@/components/shared/ArtisanPreview";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTip } from "@/components/shared/OnboardingTip";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { SearchSelect } from "@/components/shared/SearchSelect";
import { SpecificationsField } from "@/components/shared/SpecificationsField";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { WorkModeCards } from "@/components/shared/WorkModeCards";
import { ARTISAN_SERVICES, ARTISAN_STEPS, ARTISAN_WORK_MODES, EXPERIENCE_OPTIONS, GENERIC_ARTISAN_SERVICES, TRADES, WORK_REGIONS, type OfferedService } from "@/lib/dummy-onboarding";
import { loadArtisanDraft, saveArtisanDraft } from "@/lib/onboarding-draft";

const CARD = "flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6";
const LABEL = "text-[13px] font-medium leading-[1.45] text-[#334155]";
const shortName = (service: OfferedService) => service.short ?? service.label;

function toggled<T>(items: T[], item: T) {
  return items.includes(item) ? items.filter((existing) => existing !== item) : [...items, item];
}

/** Onboarding · Artisan · 1 Trade (Figma node 1071:31503): trade, specifications, and how and where they work. */
export default function ArtisanTradePage() {
  const accountName = useDisplayName();
  const account = useAccountPrefill();
  const router = useRouter();
  const [trade, setTrade] = useState("");
  const [services, setServices] = useState<OfferedService[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [workMode, setWorkMode] = useState<(typeof ARTISAN_WORK_MODES)[number]["id"]>("independent");
  const [region, setRegion] = useState<string>(WORK_REGIONS[0].label);
  const [experience, setExperience] = useState("2 years");
  const [showError, setShowError] = useState(false);

  // Coming back from a later step restores the choices kept for the tab session.
  useEffect(() => {
    const draft = loadArtisanDraft();
    if (!draft) return;
    const known = ARTISAN_SERVICES[draft.trade] ?? GENERIC_ARTISAN_SERVICES;
    const saved = draft.services ?? [];
    const own = saved.filter((name) => !known.some((service) => shortName(service) === name));
    setTrade(draft.trade);
    setServices([...known, ...own.map((label) => ({ label }))]);
    setChosen([...known.filter((service) => saved.includes(shortName(service))).map((service) => service.label), ...own]);
    setExperience(draft.experience);
    setRegion(draft.worksIn ?? WORK_REGIONS[0].label);
    setWorkMode(draft.team ? "team" : "independent");
  }, []);

  function pickTrade(next: string) {
    if (next === trade) return;
    setTrade(next);
    setServices(ARTISAN_SERVICES[next] ?? GENERIC_ARTISAN_SERVICES);
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
  const done = { trade: trade !== "" && chosen.length > 0, area: false, verification: false, profile: false };

  function handleContinue() {
    if (!trade || chosen.length === 0) {
      setShowError(true);
      return;
    }
    const existing = loadArtisanDraft();
    saveArtisanDraft({
      ...existing,
      trade,
      experience,
      basedIn: existing?.basedIn || account.location.trim(),
      team: workMode === "team" ? "a team" : "",
      worksIn: region,
      services: shortServices,
      strength: artisanCompletion(done),
    });
    router.push("/onboarding/artisan/work-area");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar actionLabel="Save and finish later" actionIcon="bookmark" onAction={() => router.push("/home")} />

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
              <h1 className="text-[28px] font-bold text-[#0f172a]">What is your trade?</h1>
              <p className="text-[15px] text-gray-500">Pick your main trade. You can add other skills on your profile later.</p>
            </div>

            <section className={CARD}>
              <h2 className="text-base font-bold leading-[1.45] text-[#0f172a]">Artisan details</h2>

              <div className="flex flex-col gap-2">
                <span className={LABEL}>Trade</span>
                <SearchSelect
                  options={TRADES}
                  value={trade}
                  onChange={pickTrade}
                  placeholder="Search trade"
                  noun="trade"
                  icon={<NavIcon icon="/icons/onboarding-wrench.svg" size={16} className="shrink-0 bg-brand-900" />}
                />
                {showError && !trade && <p className="text-xs text-[#dc2626]">Choose your trade to continue.</p>}
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

              <WorkModeCards options={ARTISAN_WORK_MODES} value={workMode} onChange={setWorkMode} />

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
            <ArtisanPreview done={done} name={accountName} photoUrl={null} services={shortServices} />
            {trade === "Electrician" && (
              <OnboardingTip icon="/icons/onboarding-info-circle.svg" title="Electrical work is safety-critical">
                We will ask for your Energy Commission wiring licence in step 3. Without it you can still take non-electrical jobs.
              </OnboardingTip>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
