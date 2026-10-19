"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DocumentUpload, type UploadedFile } from "@/components/shared/DocumentUpload";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { DatePickerField, OptionSelectField, todayKey } from "@/components/shared/ViewingSlotPickers";
import { ARTISAN_STEPS, LICENCE_CLASSES } from "@/lib/dummy-onboarding";
import { loadArtisanDraft, updateArtisanDraft } from "@/lib/onboarding-draft";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6";
const INPUT = "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900";
const DEFAULT_TRADE = "Electrician";
/** What steps 1 and 2 earned when nothing was saved. */
const DEFAULT_STRENGTH = 50;

function CardHeading({ title, note, pill, pillTone }: { title: string; note: string; pill: string; pillTone: "amber" | "grey" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1 leading-[1.45]">
        <h2 className="text-base font-bold text-[#0f172a]">{title}</h2>
        <p className="text-[13px] text-gray-500">{note}</p>
      </div>
      <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold leading-[1.45]", pillTone === "amber" ? "bg-[#fef3c7] text-[#b45309]" : "bg-[#f1f5f9] text-gray-500")}>{pill}</span>
    </div>
  );
}

function BadgeRow({ icon, title, note }: { icon: string; title: string; note: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#eff5ff]">
        <NavIcon icon={icon} size={16} className="bg-brand-900" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-[1.45]">
        <span className="text-[13px] font-semibold text-[#0f172a]">{title}</span>
        <span className="text-xs text-gray-500">{note}</span>
      </span>
    </div>
  );
}

/** Onboarding · Artisan · 3 Verification (Figma node 1071:31921): ID, the trade's licence if it needs one, and an optional trade certificate. */
export default function ArtisanVerificationPage() {
  const router = useRouter();
  const [trade, setTrade] = useState(DEFAULT_TRADE);
  const [identity, setIdentity] = useState<UploadedFile | null>(null);
  const [licenceNumber, setLicenceNumber] = useState("");
  const [licenceClass, setLicenceClass] = useState(LICENCE_CLASSES[0]);
  const [validUntil, setValidUntil] = useState("");
  const [licenceFile, setLicenceFile] = useState<UploadedFile | null>(null);
  const [certificate, setCertificate] = useState<UploadedFile | null>(null);
  const [today] = useState(() => todayKey());
  const [baseStrength, setBaseStrength] = useState(DEFAULT_STRENGTH);

  // Step 1's trade lives in the tab session, so it is read after mount.
  useEffect(() => {
    const draft = loadArtisanDraft();
    if (!draft) return;
    setTrade(draft.trade);
    setBaseStrength(draft.strength ?? DEFAULT_STRENGTH);
  }, []);

  // Only electrical work has a licence in the designs; other trades go straight from ID to the optional certificate.
  const needsLicence = trade === "Electrician";
  const validTo = validUntil ? new Date(`${validUntil}T00:00:00`).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "";
  const licenceNote = ["Energy Commission", licenceClass ? `${licenceClass.toLowerCase()} class` : "", validTo ? `to ${validTo}` : ""].filter(Boolean).join(", ");

  function handleContinue() {
    const strength = baseStrength + (identity ? 10 : 0) + ((needsLicence ? licenceFile : certificate) ? 10 : 0);
    updateArtisanDraft({ strength, verification: { identity: identity !== null, licenceRequired: needsLicence, licence: licenceFile !== null } });
    router.push("/onboarding/artisan/portfolio-prices");
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
              current={2}
              note="Customers let you into their homes, so an ID check is needed before you can accept jobs."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 3 of 4</p>
              <h1 className="text-[28px] font-bold text-[#0f172a]">Verify your ID and licences</h1>
              <p className="text-[15px] text-gray-500">Your documents stay private. Customers only see a badge that says what we checked.</p>
            </div>

            <section className={CARD}>
              <CardHeading title="Identity" note="Gives you the “ID verified” badge" pill="Required to accept jobs" pillTone="amber" />
              <DocumentUpload title="Ghana Card, front and back" hint="Photo or PDF. We also ask for a quick selfie to match it." file={identity} onFile={setIdentity} />
            </section>

            {needsLicence && (
              <section className={CARD}>
                <CardHeading title="Electrical wiring licence" note="Energy Commission · needed for electrical jobs" pill="Required for this trade" pillTone="amber" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <label className="flex min-w-0 flex-col gap-1.5">
                    <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Licence number</span>
                    <span className={INPUT}>
                      <input value={licenceNumber} maxLength={40} placeholder="e.g. EC/EWP/2021/7781" onChange={(event) => setLicenceNumber(event.target.value)} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                      {licenceNumber.trim() && <NavIcon icon="/icons/onboarding-check-circle.svg" size={18} className="bg-[#16a34a]" />}
                    </span>
                  </label>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Class</span>
                    <OptionSelectField value={licenceClass} options={LICENCE_CLASSES} onChange={setLicenceClass} />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Valid until</span>
                    <DatePickerField value={validUntil} onChange={setValidUntil} min={today} />
                  </div>
                </div>
                <DocumentUpload title="Licence card or certificate" hint="Photo or PDF, up to 10 MB" file={licenceFile} onFile={setLicenceFile} />
              </section>
            )}

            <section className={CARD}>
              <CardHeading title="Trade certificate" note="CTVET, NVTI or a manufacturer certificate" pill="Optional" pillTone="grey" />
              <DocumentUpload title="Trade certificate" hint="Photo or PDF, up to 10 MB" file={certificate} onFile={setCertificate} />
            </section>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding/artisan/work-area")} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
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
            <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6">
              <p className="text-sm font-bold leading-[1.45] text-[#0f172a]">Your badges will read</p>
              <BadgeRow icon="/icons/onboarding-id-verified.svg" title="ID verified" note="Checked against your Ghana Card" />
              {needsLicence && <BadgeRow icon="/icons/onboarding-license.svg" title="Licensed electrician" note={licenceNote} />}
              <BadgeRow icon="/icons/onboarding-certificate.svg" title="Trade certified" note={certificate ? certificate.name : "Only if you add a trade certificate"} />
            </div>

            {needsLicence && (
              <div className="flex items-start gap-3 rounded-[14px] bg-[#eff5ff] p-4">
                <NavIcon icon="/icons/onboarding-info-circle.svg" size={20} className="shrink-0 bg-brand-900" />
                <div className="flex min-w-0 flex-col gap-1 text-[13px] leading-[1.45]">
                  <p className="font-bold text-[#0f172a]">What if my licence expires?</p>
                  <p className="text-[#334155]">We remind you 30 days before. Electrical jobs pause until a new licence is checked.</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
