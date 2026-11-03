"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDisplayName } from "@/hooks/useDisplayName";
import { useSession } from "@/context/SessionContext";
import { ArtisanPreview, artisanCompletion } from "@/components/shared/ArtisanPreview";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTip } from "@/components/shared/OnboardingTip";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { Switch } from "@/components/shared/SettingsParts";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { ARTISAN_STEPS, CLOCK_OPTIONS, TRADE_REQUEST_WORD, TRAVEL_DISTANCES, WORK_DAY_OPTIONS } from "@/lib/dummy-onboarding";
import { loadArtisanDraft, updateArtisanDraft, type ArtisanDraft } from "@/lib/onboarding-draft";

const CARD = "flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6";
const LABEL = "text-[13px] font-medium leading-[1.45] text-[#334155]";
const INPUT = "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900";
const TIME_WIDTH = "w-full sm:w-[148px]";

interface WorkingRange {
  id: number;
  days: string;
  from: string;
  to: string;
}

const FIRST_RANGE: WorkingRange = { id: 1, days: WORK_DAY_OPTIONS[0], from: "7:00 am", to: "6:00 pm" };

function ToggleRow({ icon, title, note, checked, onToggle }: { icon: string; title: string; note: string; checked: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f1f5f9]">
        <NavIcon icon={icon} size={18} className="bg-[#334155]" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col leading-[1.45]">
        <p className="text-sm font-semibold text-[#0f172a]">{title}</p>
        <p className="text-xs text-gray-500">{note}</p>
      </div>
      <Switch checked={checked} label={title} onToggle={onToggle} />
    </div>
  );
}

const endsAfterStart = (range: WorkingRange) => CLOCK_OPTIONS.indexOf(range.to) > CLOCK_OPTIONS.indexOf(range.from);

/** Onboarding · Artisan · 2 Work area (Figma nodes 1071:31702 and 1303:46715): the call-out fee, how far they travel and when they work. */
export default function ArtisanWorkAreaPage() {
  const accountName = useDisplayName();
  const accountContact = useSession().user?.primaryContact ?? "";
  const router = useRouter();
  const [draft, setDraft] = useState<ArtisanDraft | null>(null);
  const [fee, setFee] = useState("100");
  const [travel, setTravel] = useState(TRAVEL_DISTANCES[0]);
  const [ranges, setRanges] = useState<WorkingRange[]>([FIRST_RANGE]);
  const [emergency, setEmergency] = useState(true);
  const [whatsapp, setWhatsapp] = useState(true);
  const [showError, setShowError] = useState(false);

  // Step 1's choices live in the tab session, so they are read after mount.
  useEffect(() => setDraft(loadArtisanDraft()), []);

  const trade = draft?.trade ?? "Electrician";
  const place = draft?.basedIn.split(",")[0].trim() ?? "";
  const requestWord = TRADE_REQUEST_WORD[trade] ?? trade.toLowerCase();
  const feeLabel = fee === "" ? "Not set yet" : Number(fee) === 0 ? "No call-out fee" : `GHS ${Number(fee).toLocaleString("en-GB")}`;
  const done = { trade: true, area: fee !== "" && ranges.length > 0, verification: false, profile: false };

  function updateRange(id: number, changes: Partial<WorkingRange>) {
    setRanges((current) => current.map((range) => (range.id === id ? { ...range, ...changes } : range)));
    setShowError(false);
  }

  function addRange() {
    setRanges((current) => [...current, { id: Math.max(0, ...current.map((range) => range.id)) + 1, days: WORK_DAY_OPTIONS[0], from: "8:00 am", to: "5:00 pm" }]);
  }

  function handleContinue() {
    if (fee === "" || !ranges.every(endsAfterStart)) {
      setShowError(true);
      return;
    }
    updateArtisanDraft({
      strength: artisanCompletion(done),
      workArea: { tags: [...ranges.map((range) => `${range.days} ${range.from} – ${range.to}`), emergency ? "Emergency call-outs" : ""].filter(Boolean), travel, callOutFee: feeLabel, jobAlerts: whatsapp },
    });
    router.push("/onboarding/artisan/verification");
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
              current={1}
              note="Customers let you into their homes, so an ID check is needed before you can accept jobs."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <h1 className="text-[28px] font-bold text-[#0f172a]">Work area and hours</h1>
              <p className="text-[15px] text-gray-500">We only send you job requests that match your area and hours.</p>
            </div>

            <section className={CARD}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className={LABEL}>Call-out fee</span>
                  <span className={INPUT}>
                    <span className="text-sm font-medium text-gray-500">GHS</span>
                    <input value={fee} inputMode="numeric" maxLength={6} placeholder="0" onChange={(event) => setFee(event.target.value.replace(/\D/g, ""))} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                  </span>
                  <span className="text-xs leading-[1.45] text-gray-500">Shown before a customer books. Put 0 if you do not charge one.</span>
                  {showError && fee === "" && <span className="text-xs text-[#dc2626]">Enter a fee, or 0 if you do not charge one.</span>}
                </label>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className={LABEL}>How far will you travel?</span>
                  <OptionSelectField value={travel} options={TRAVEL_DISTANCES} onChange={setTravel} />
                  <span className="text-xs leading-[1.45] text-gray-500">Customers farther away will not see you in their results.</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className={LABEL}>Working hours</span>
                <p className="text-xs leading-[1.45] text-gray-500">Add one or more time ranges. Split shifts and different days are fine.</p>
                <div className="flex flex-col gap-2">
                  {ranges.map((range) => (
                    <div key={range.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <OptionSelectField value={range.days} options={WORK_DAY_OPTIONS} onChange={(days) => updateRange(range.id, { days })} icon="/icons/calendar-03.svg" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={TIME_WIDTH}>
                          <OptionSelectField value={range.from} options={CLOCK_OPTIONS} onChange={(from) => updateRange(range.id, { from })} icon="/icons/clock-01.svg" minPanelWidth={180} maxPanelHeight={260} hideScrollbar />
                        </div>
                        <span className="text-[13px] font-medium text-gray-500">to</span>
                        <div className={TIME_WIDTH}>
                          <OptionSelectField value={range.to} options={CLOCK_OPTIONS} onChange={(to) => updateRange(range.id, { to })} icon="/icons/clock-01.svg" minPanelWidth={180} maxPanelHeight={260} hideScrollbar />
                        </div>
                        {ranges.length > 1 && (
                          <button
                            type="button"
                            aria-label="Remove time range"
                            onClick={() => setRanges((current) => current.filter((item) => item.id !== range.id))}
                            className="flex size-5 shrink-0 items-center justify-center rounded-[10px] border border-gray-200 hover:bg-gray-50"
                          >
                            <NavIcon icon="/icons/onboarding-cancel.svg" size={8} className="bg-gray-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {showError && !ranges.every(endsAfterStart) && <p className="text-xs text-[#dc2626]">Each range must end after it starts.</p>}
                <button type="button" onClick={addRange} className="flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-900">
                  <NavIcon icon="/icons/onboarding-plus.svg" size={14} className="bg-brand-900" />
                  Add working time
                </button>
              </div>
            </section>

            <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6">
              <ToggleRow icon="/icons/onboarding-flash.svg" title="Accept emergency call-outs" note="Urgent jobs outside your hours, for example a power fault at night" checked={emergency} onToggle={() => setEmergency(!emergency)} />
              <ToggleRow icon="/icons/onboarding-phone.svg" title="Job alerts on WhatsApp" note={accountContact} checked={whatsapp} onToggle={() => setWhatsapp(!whatsapp)} />
            </section>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding/artisan")} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
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
            <ArtisanPreview done={done} name={accountName} photoUrl={null} services={draft?.services ?? []} />
            <OnboardingTip icon="/icons/onboarding-sparkles.svg" title="Demand near you">
              Customers who need {requestWord} work {travel === TRAVEL_DISTANCES[3] ? "in Greater Accra" : `within ${travel}${place ? ` of ${place}` : ""}`} can find you in the directory and send you a quote request.
            </OnboardingTip>
          </aside>
        </div>
      </div>
    </div>
  );
}
