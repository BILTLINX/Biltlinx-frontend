"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDisplayName } from "@/hooks/useDisplayName";
import type { UploadedFile } from "@/components/shared/DocumentUpload";
import { ArtisanPreview, artisanCompletion } from "@/components/shared/ArtisanPreview";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTip } from "@/components/shared/OnboardingTip";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { DatePickerField, OptionSelectField, todayKey } from "@/components/shared/ViewingSlotPickers";
import { ARTISAN_STEPS, LICENCE_CLASSES } from "@/lib/dummy-onboarding";
import { loadArtisanDraft, updateArtisanDraft, type ArtisanDraft } from "@/lib/onboarding-draft";

const CARD = "flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6";
const INPUT = "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900";
const LABEL = "text-[13px] font-medium leading-[1.45] text-[#334155]";
const DEFAULT_TRADE = "Electrician";

/** Onboarding · Artisan · 3 Certificates (Figma nodes 1071:31921 and 1301:245080): ID, the trade licence and any certificates. */
export default function ArtisanVerificationPage() {
  const accountName = useDisplayName();
  const router = useRouter();
  const [draft, setDraft] = useState<ArtisanDraft | null>(null);
  const [identity, setIdentity] = useState<UploadedFile | null>(null);
  const [licenceNumber, setLicenceNumber] = useState("");
  const [licenceClass, setLicenceClass] = useState(LICENCE_CLASSES[0]);
  const [validUntil, setValidUntil] = useState("");
  const [licenceFile, setLicenceFile] = useState<UploadedFile | null>(null);
  const [certificate, setCertificate] = useState<UploadedFile | null>(null);
  const [today] = useState(() => todayKey());

  // Step 1's choices live in the tab session, so they are read after mount.
  useEffect(() => setDraft(loadArtisanDraft()), []);

  const trade = draft?.trade ?? DEFAULT_TRADE;
  const electrical = trade === "Electrician";
  const done = { trade: true, area: Boolean(draft?.workArea), verification: identity !== null, profile: false };

  function saveCertificates() {
    updateArtisanDraft({ strength: artisanCompletion(done), verification: { identity: identity !== null, licenceRequired: electrical, licence: licenceFile !== null } });
  }

  function goNext() {
    router.push("/onboarding/artisan/public-profile");
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
              current={2}
              note="Customers let you into their homes, so an ID check is needed before you can accept jobs."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <h1 className="text-[28px] font-bold text-[#0f172a]">Add your credentials</h1>
              <p className="text-[15px] text-gray-500">Each badge on Biltlinx says exactly what was checked. Your documents stay private and are only used for the check.</p>
            </div>

            <section className={CARD}>
              <div className="flex min-w-0 flex-col gap-1 leading-[1.45]">
                <h2 className="text-base font-bold text-[#0f172a]">Identity</h2>
                <p className="text-[13px] text-gray-500">Gives you the “ID verified” badge</p>
              </div>
              <FileDropzone title="Ghana Card, front and back" dropLabel="Ghana Card, front and back" hint="Photo or PDF, up to 10 MB. We also ask for a quick selfie to match it." file={identity} onFile={setIdentity} slot="artisan:identity" />
            </section>

            <section className={CARD}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1 leading-[1.45]">
                  <h2 className="text-base font-bold text-[#0f172a]">Artisan licence</h2>
                  <p className="text-[13px] text-gray-500">Gives you the “Licensed {trade.toLowerCase()}” badge</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-brand-900">{electrical ? "Required for electrical jobs" : "Recommended"}</span>
              </div>

              <label className="flex min-w-0 flex-col gap-1.5">
                <span className={LABEL}>Licence number</span>
                <span className={INPUT}>
                  <input value={licenceNumber} maxLength={40} placeholder="e.g. EC/EWP/2021/7781" onChange={(event) => setLicenceNumber(event.target.value)} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                  {licenceNumber.trim() && <NavIcon icon="/icons/onboarding-check-circle.svg" size={18} className="bg-[#16a34a]" />}
                </span>
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className={LABEL}>Valid until</span>
                  <DatePickerField value={validUntil} onChange={setValidUntil} min={today} />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className={LABEL}>Class</span>
                  <OptionSelectField value={licenceClass} options={LICENCE_CLASSES} onChange={setLicenceClass} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className={LABEL}>Upload artisan licence and certificate(s)</span>
                <FileDropzone title="Artisan licence" dropLabel="artisan licence" hint="Photo or PDF, up to 10 MB" file={licenceFile} onFile={setLicenceFile} slot="artisan:licence" />
                {licenceFile && <FileDropzone title="Trade certificate" dropLabel="trade certificate, if you have one" hint="Optional. CTVET, NVTI or a manufacturer certificate. Photo or PDF, up to 10 MB" file={certificate} onFile={setCertificate} slot="artisan:certificate" />}
              </div>
            </section>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding/artisan/work-area")} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <button type="button" onClick={goNext} className="whitespace-nowrap rounded-[10px] px-5 py-3 text-sm font-semibold text-brand-900">
                  Do this later
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveCertificates();
                    goNext();
                  }}
                  className="flex items-center gap-2 rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  Continue
                  <NavIcon icon="/icons/onboarding-arrow-right.svg" size={10} className="bg-white" />
                </button>
              </div>
            </div>
          </main>

          <aside className="flex flex-col gap-4 lg:col-start-2 xl:sticky xl:top-8 xl:col-start-3 xl:self-start">
            <ArtisanPreview done={done} name={accountName} photoUrl={null} services={draft?.services ?? []} />
            <OnboardingTip icon="/icons/onboarding-info-circle.svg" title="What if my licence expires?">
              We remind you 30 days before. {electrical ? "Electrical jobs" : "Jobs that need a licence"} pause until a new licence is checked.
            </OnboardingTip>
          </aside>
        </div>
      </div>
    </div>
  );
}
