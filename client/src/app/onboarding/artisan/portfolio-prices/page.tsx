"use client";

import { useDisplayName } from "@/hooks/useDisplayName";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { showErrorToast } from "@/components/shared/AppToast";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { PortfolioUploader, type PortfolioImage } from "@/components/shared/PortfolioUploader";
import { ARTISAN_STEPS, PRICE_EXAMPLES } from "@/lib/dummy-onboarding";
import { notifyError } from "@/lib/errors";
import { finishArtisan } from "@/lib/onboarding-submit";
import { initialsOf } from "@/lib/initials";
import { loadArtisanDraft, updateArtisanDraft, type ArtisanDraft } from "@/lib/onboarding-draft";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6";
const INPUT = "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900";
const PHOTO_MAX = 12;
const MAX_PRICED_SERVICES = 10;
/** What steps 1 to 3 earned when nothing was saved. */
const DEFAULT_STRENGTH = 70;

interface PricedService {
  id: number;
  name: string;
  from: string;
}

/** Onboarding · Artisan · 4 Portfolio and prices (Figma node 1071:32122): photos of past work and starting prices. */
export default function ArtisanPortfolioPricesPage() {
  const accountName = useDisplayName();
  const router = useRouter();
  const [draft, setDraft] = useState<ArtisanDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState("");
  const [photos, setPhotos] = useState<PortfolioImage[]>([]);
  const [services, setServices] = useState<PricedService[]>([1, 2, 3].map((id) => ({ id, name: "", from: "" })));

  // Earlier steps' choices live in the tab session, so they are read after mount.
  useEffect(() => setDraft(loadArtisanDraft()), []);

  const trade = draft?.trade ?? "Electrician";
  const examples = PRICE_EXAMPLES[trade] ?? PRICE_EXAMPLES.default;
  const priced = services.filter((service) => service.name.trim() && service.from !== "");
  const strength = Math.min(100, (draft?.strength ?? DEFAULT_STRENGTH) + (photos.length > 0 ? 10 : 0) + (priced.length > 0 ? 10 : 0));
  const verification = draft?.verification;

  function update(id: number, changes: Partial<PricedService>) {
    setServices((current) => current.map((service) => (service.id === id ? { ...service, ...changes } : service)));
  }

  function addService() {
    setServices((current) => (current.length >= MAX_PRICED_SERVICES ? current : [...current, { id: Math.max(0, ...current.map((service) => service.id)) + 1, name: "", from: "" }]));
  }

  async function publish() {
    if (!draft) {
      setFailure("Start from the first step so we know your trade.");
      return;
    }
    setSaving(true);
    try {
      const problems = await finishArtisan({ draft, displayName: accountName, portfolio: photos.map((photo) => photo.file), services: priced.map((service) => service.name.trim()) });
      updateArtisanDraft({ strength });
      problems.forEach((problem) => showErrorToast(problem));
      router.push("/onboarding/artisan/done");
    } catch (error) {
      notifyError(error, "Your profile could not be saved.");
      setSaving(false);
    }
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
              current={3}
              note="Customers let you into their homes, so an ID check is needed before you can accept jobs."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 4 of 4</p>
              <h1 className="text-[28px] font-bold text-[#0f172a]">Show your work and starting prices</h1>
              <p className="text-[15px] text-gray-500">Photos of real jobs get far more requests than an empty profile.</p>
            </div>

            <section className={CARD}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1 leading-[1.45]">
                  <h2 className="text-base font-bold text-[#0f172a]">Photos of your work</h2>
                  <p className="text-[13px] text-gray-500">Before and after photos work best</p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold leading-[1.45]", photos.length > 0 ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#f1f5f9] text-gray-500")}>
                  {photos.length > 0 ? `${photos.length} added` : "None yet"}
                </span>
              </div>
              <PortfolioUploader images={photos} onChange={setPhotos} max={PHOTO_MAX} addLabel="Add photo" />
            </section>

            <section className={cn(CARD, "gap-3")}>
              <div className="flex flex-col gap-1 leading-[1.45]">
                <h2 className="text-base font-bold text-[#0f172a]">Starting prices</h2>
                <p className="text-[13px] text-gray-500">Customers see “from” prices. You still send a final quote.</p>
              </div>
              {services.map((service, index) => (
                <div key={service.id} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Service</span>
                    <span className={INPUT}>
                      <input value={service.name} maxLength={60} placeholder={examples[index % examples.length]} onChange={(event) => update(service.id, { name: event.target.value })} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                    </span>
                  </label>
                  <label className="flex flex-col gap-1.5 sm:w-[180px]">
                    <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">From</span>
                    <span className={INPUT}>
                      <span className="text-sm font-medium text-gray-500">GHS</span>
                      <input value={service.from} inputMode="numeric" maxLength={7} placeholder="0" onChange={(event) => update(service.id, { from: event.target.value.replace(/\D/g, "") })} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                    </span>
                  </label>
                </div>
              ))}
              {services.length < MAX_PRICED_SERVICES && (
                <button type="button" onClick={addService} className="w-fit text-[13px] font-semibold leading-[1.45] text-brand-900">
                  + Add another service
                </button>
              )}
            </section>

            {failure && <p className="text-xs text-[#dc2626]">{failure}</p>}
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding/artisan/verification")} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Back
              </button>
              <button type="button" onClick={publish} disabled={saving} className="whitespace-nowrap disabled:opacity-60 rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                {saving ? "Publishing…" : "Publish profile"}
              </button>
            </div>
          </main>

          <aside className="lg:col-start-2 xl:sticky xl:top-8 xl:col-start-3 xl:self-start">
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
                    <p className="truncate text-[13px] text-gray-500">{[trade, draft?.basedIn].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold leading-[1.45]", verification?.identity ? "bg-[#fef3c7] text-[#b45309]" : "bg-[#f1f5f9] text-gray-500")}>{verification?.identity ? "ID in review" : "Not verified yet"}</span>
                  {verification?.licenceRequired && (
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold leading-[1.45]", verification.licence ? "bg-[#fef3c7] text-[#b45309]" : "bg-[#f1f5f9] text-gray-500")}>{verification.licence ? "Licence in review" : "Licence not uploaded"}</span>
                  )}
                </div>
                {draft?.workArea && draft.workArea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {draft.workArea.tags.map((tag) => (
                      <span key={tag} className="rounded-lg bg-[#f1f5f9] px-2 py-1 text-xs font-medium leading-[1.45] text-[#334155]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <dl className="flex flex-col gap-2 text-[13px] leading-[1.45]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Experience</dt>
                    <dd className="text-right font-semibold text-[#0f172a]">{[draft?.experience ?? "11 years", draft?.team].filter(Boolean).join(" · ")}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Travels up to</dt>
                    <dd className="text-right font-semibold text-[#0f172a]">{draft?.workArea?.travel ?? "Not set yet"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Call-out fee</dt>
                    <dd className="font-semibold text-[#0f172a]">{draft?.workArea?.callOutFee ?? "Not set yet"}</dd>
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
          </aside>
        </div>
      </div>
    </div>
  );
}
