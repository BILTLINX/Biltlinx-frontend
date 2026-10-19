"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { Switch } from "@/components/shared/SettingsParts";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { ARTISAN_STEPS, ARTISAN_WHATSAPP, MATCHING_ARTISAN_REQUESTS, NEW_ARTISAN, TRADE_REQUEST_WORD, TRAVEL_DISTANCES, WEEKDAYS, WORKING_HOURS } from "@/lib/dummy-onboarding";
import { initialsOf } from "@/lib/initials";
import { loadArtisanDraft, updateArtisanDraft, type ArtisanDraft } from "@/lib/onboarding-draft";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6";
const INPUT = "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900";
/** What step 1 earned when nothing was saved. */
const STEP_ONE_STRENGTH = 30;

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

/** Weekdays in week order; three or more in a row read as a range ("Mon–Sat"). */
function summariseDays(days: string[]) {
  const picked = WEEKDAYS.filter((day) => days.includes(day));
  if (picked.length === 0) return "";
  const first = WEEKDAYS.indexOf(picked[0]);
  const last = WEEKDAYS.indexOf(picked[picked.length - 1]);
  const contiguous = last - first + 1 === picked.length;
  return contiguous && picked.length >= 3 ? `${picked[0]}–${picked[picked.length - 1]}` : picked.join(", ");
}

/** "7:00 am – 6:00 pm" becomes "7am–6pm". */
function compactHours(hours: string) {
  return hours.replace(/:00/g, "").replace(/ (am|pm)/g, "$1").replace(" – ", "–");
}

/** Onboarding · Artisan · 2 Work area (Figma node 1071:31702): where and when they work and what they charge to turn up. */
export default function ArtisanWorkAreaPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<ArtisanDraft | null>(null);
  const [base, setBase] = useState(NEW_ARTISAN.basedIn);
  const [travel, setTravel] = useState(TRAVEL_DISTANCES[1]);
  const [days, setDays] = useState(WEEKDAYS.slice(0, 6));
  const [hours, setHours] = useState(WORKING_HOURS[1]);
  const [fee, setFee] = useState("100");
  const [emergency, setEmergency] = useState(true);
  const [whatsapp, setWhatsapp] = useState(true);

  // Step 1's choices live in the tab session, so they are read after mount.
  useEffect(() => {
    const saved = loadArtisanDraft();
    if (!saved) return;
    setDraft(saved);
    if (saved.basedIn) setBase(saved.basedIn);
  }, []);

  const trade = draft?.trade ?? "Electrician";
  const experience = draft?.experience ?? "11 years";
  const place = base.split(",")[0].trim();
  const strength = (draft?.strength ?? STEP_ONE_STRENGTH) + (travel && days.length > 0 && hours ? 10 : 0) + (fee !== "" ? 10 : 0);
  const dayLabel = summariseDays(days);
  const travelLabel = travel === TRAVEL_DISTANCES[3] ? travel : `${travel}${place ? ` from ${place}` : ""}`;
  const feeLabel = fee === "" ? "Not set yet" : Number(fee) === 0 ? "No call-out fee" : `GHS ${Number(fee).toLocaleString("en-GB")}`;
  const requestWord = TRADE_REQUEST_WORD[trade] ?? trade.toLowerCase();

  function handleContinue() {
    updateArtisanDraft({ strength, workArea: { tags: [dayLabel, compactHours(hours), emergency ? "Emergency call-outs" : ""].filter(Boolean), travel: travelLabel, callOutFee: feeLabel, jobAlerts: whatsapp } });
    router.push("/onboarding/artisan/verification");
  }

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
              current={1}
              note="Customers let you into their homes, so an ID check is needed before you can accept jobs."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 2 of 4</p>
              <h1 className="text-[28px] font-bold text-[#0f172a]">Where and when do you work?</h1>
              <p className="text-[15px] text-gray-500">We only send you job requests that match your area and hours.</p>
            </div>

            <section className={CARD}>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Your base</span>
                <span className={INPUT}>
                  <NavIcon icon="/icons/location-01.svg" size={18} className="bg-gray-500" />
                  <input value={base} maxLength={60} placeholder="Madina, Accra" onChange={(event) => setBase(event.target.value)} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                </span>
              </label>

              <div className="flex flex-col gap-2">
                <p className="text-[13px] font-medium leading-[1.45] text-[#334155]">How far will you travel?</p>
                <div role="radiogroup" aria-label="How far will you travel?" className="flex flex-wrap gap-2">
                  {TRAVEL_DISTANCES.map((distance) => (
                    <Chip key={distance} label={distance} selected={distance === travel} onClick={() => setTravel(distance)} />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-[13px] font-medium leading-[1.45] text-[#334155]">Working days</p>
                <div role="group" aria-label="Working days" className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <Chip key={day} label={day} selected={days.includes(day)} onClick={() => setDays((current) => (current.includes(day) ? current.filter((existing) => existing !== day) : [...current, day]))} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Working hours</span>
                  <OptionSelectField value={hours} options={WORKING_HOURS} onChange={setHours} />
                </div>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Call-out fee</span>
                  <span className={INPUT}>
                    <span className="text-sm font-medium text-gray-500">GHS</span>
                    <input value={fee} inputMode="numeric" maxLength={6} placeholder="0" onChange={(event) => setFee(event.target.value.replace(/\D/g, ""))} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                  </span>
                  <span className="text-xs leading-[1.45] text-gray-500">Shown before a customer books. Put 0 if you do not charge one.</span>
                </label>
              </div>
            </section>

            <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6">
              <ToggleRow icon="/icons/onboarding-flash.svg" title="Accept emergency call-outs" note="Urgent jobs outside your hours, for example a power fault at night" checked={emergency} onToggle={() => setEmergency(!emergency)} />
              <ToggleRow icon="/icons/onboarding-phone.svg" title="Job alerts on WhatsApp" note={ARTISAN_WHATSAPP} checked={whatsapp} onToggle={() => setWhatsapp(!whatsapp)} />
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
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs font-semibold leading-[1.45] text-gray-500">Preview · how others see you</p>
                <NavIcon icon="/icons/onboarding-preview-eye.svg" size={16} className="bg-gray-500" />
              </div>
              <div className="h-16 bg-gradient-to-r from-[#0a1f44] to-brand-900" />
              <div className="flex flex-col gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-full border-[3px] border-white bg-[#eff5ff] text-lg font-bold text-brand-900">{initialsOf(NEW_ARTISAN.name)}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                    <p className="truncate text-base font-bold text-[#0f172a]">{NEW_ARTISAN.name}</p>
                    <p className="truncate text-[13px] text-gray-500">{[trade, base.trim()].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-gray-500">Not verified yet</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[dayLabel, compactHours(hours), emergency ? "Emergency call-outs" : ""].filter(Boolean).map((tag) => (
                    <span key={tag} className="rounded-lg bg-[#f1f5f9] px-2 py-1 text-xs font-medium leading-[1.45] text-[#334155]">
                      {tag}
                    </span>
                  ))}
                </div>
                <dl className="flex flex-col gap-2 text-[13px] leading-[1.45]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Experience</dt>
                    <dd className="text-right font-semibold text-[#0f172a]">{[experience, draft?.team].filter(Boolean).join(" · ")}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Travels up to</dt>
                    <dd className="text-right font-semibold text-[#0f172a]">{travelLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Call-out fee</dt>
                    <dd className={cn("font-semibold", fee === "" ? "text-[#94a3b8]" : "text-[#0f172a]")}>{feeLabel}</dd>
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
                <p className="font-bold text-[#0f172a]">Demand near you</p>
                <p className="text-[#334155]">
                  {MATCHING_ARTISAN_REQUESTS} open {requestWord} requests {travel === TRAVEL_DISTANCES[3] ? "in Greater Accra" : `within ${travel}${place ? ` of ${place}` : ""}`} on the Request Board right now.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
