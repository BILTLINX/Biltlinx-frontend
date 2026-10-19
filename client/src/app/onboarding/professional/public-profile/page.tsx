"use client";

import { useDisplayName } from "@/hooks/useDisplayName";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { showErrorToast } from "@/components/shared/AppToast";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { PortfolioUploader, type PortfolioImage } from "@/components/shared/PortfolioUploader";
import { PROFESSIONAL_STEPS, PROFILE_PHOTO_MAX_BYTES, PROFILE_PHOTO_TYPES } from "@/lib/dummy-onboarding";
import { loadProfessionalDraft, updateProfessionalDraft, type ProfessionalDraft } from "@/lib/onboarding-draft";
import { notifyError } from "@/lib/errors";
import { finishProfessional } from "@/lib/onboarding-submit";
import { initialsOf } from "@/lib/initials";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6";
const INPUT = "rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none";
const ABOUT_EXAMPLE = "Licensed architect with 8 years designing homes and small apartment blocks across Accra. I handle drawings, permits and site supervision.";
const PORTFOLIO_MINIMUM = 3;
const PORTFOLIO_MAX = 12;
/** What steps 1 to 3 earned when nothing was saved. */
const DEFAULT_STRENGTH = 70;

/** Onboarding · Professional · 4 Public profile (Figma node 1070:31928): photo, headline, about and portfolio. */
export default function ProfessionalPublicProfilePage() {
  const accountName = useDisplayName();
  const router = useRouter();
  const photoInput = useRef<HTMLInputElement | null>(null);
  const urls = useRef<string[]>([]);
  const [draft, setDraft] = useState<ProfessionalDraft | null>(null);
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Earlier steps' choices live in the tab session, so they are read after mount.
  useEffect(() => {
    const saved = loadProfessionalDraft();
    if (!saved) return;
    setDraft(saved);
    setHeadline(saved.profession);
  }, []);

  useEffect(() => {
    const created = urls.current;
    return () => created.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function previewUrl(file: File) {
    const url = URL.createObjectURL(file);
    urls.current.push(url);
    return url;
  }

  /** Returns a message when the file cannot be used as a picture. */
  function problemWith(file: File) {
    if (!PROFILE_PHOTO_TYPES.includes(file.type)) return "Use JPG or PNG images.";
    if (file.size > PROFILE_PHOTO_MAX_BYTES) return "Each image must be under 5 MB.";
    return "";
  }

  function handlePhoto(file: File | undefined) {
    if (!file) return;
    const problem = problemWith(file);
    setError(problem);
    if (!problem) setPhotoUrl(previewUrl(file));
  }

  async function publish() {
    if (portfolio.length < PORTFOLIO_MINIMUM) {
      setError(`Add at least ${PORTFOLIO_MINIMUM} images of your work to publish.`);
      return;
    }
    if (!draft) {
      setError("Start from the first step so we know your profession.");
      return;
    }
    setSaving(true);
    try {
      const problems = await finishProfessional({ draft, displayName: draft.firm.trim() || accountName, headline, about, portfolio: portfolio.map((image) => image.file) });
      updateProfessionalDraft({ strength });
      problems.forEach((problem) => showErrorToast(problem));
      router.push("/onboarding/professional/done");
    } catch (failure) {
      notifyError(failure, "Your profile could not be saved.");
      setSaving(false);
    }
  }

  const profession = draft?.profession ?? "Architect";
  const firm = draft?.firm ?? "";
  const strength = Math.min(100, (draft?.strength ?? DEFAULT_STRENGTH) + (photoUrl ? 10 : 0) + (about.trim() ? 10 : 0) + (portfolio.length >= PORTFOLIO_MINIMUM ? 10 : 0));
  const registrationNote = draft?.registration?.hasNumber ? `${draft.registration.abbreviation || "Registration"} registration in review` : null;
  const worksIn = draft?.worksIn ?? ["Greater Accra", "Remote"];

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
              current={3}
              note="You can publish before your credentials are checked. Badges appear once each check passes."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 4 of 4</p>
              <h1 className="text-[28px] font-bold text-[#0f172a]">Finish your public profile</h1>
              <p className="text-[15px] text-gray-500">This is what clients see first. You can keep editing after you publish.</p>
            </div>

            <section className={CARD}>
              <div className="flex items-center gap-4">
                <span className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eff5ff] text-[22px] font-bold text-brand-900">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- a local object URL, nothing for next/image to optimise
                    <img src={photoUrl} alt="Your profile photo" className="size-full object-cover" />
                  ) : (
                    initialsOf(accountName)
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 leading-[1.45]">
                  <p className="text-sm font-semibold text-[#0f172a]">Profile photo</p>
                  <p className="text-[13px] text-gray-500">{photoUrl ? "Photo added. A headshot works best." : "A headshot works best. JPG or PNG, up to 5 MB."}</p>
                </div>
                <input ref={photoInput} type="file" accept={PROFILE_PHOTO_TYPES.join(",")} aria-label="Upload profile photo" className="hidden" onChange={(event) => handlePhoto(event.target.files?.[0])} />
                <button type="button" onClick={() => photoInput.current?.click()} className="shrink-0 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                  {photoUrl ? "Change" : "Upload"}
                </button>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Headline</span>
                <input value={headline} maxLength={80} placeholder="Architect · Residential and mixed-use buildings" onChange={(event) => setHeadline(event.target.value)} className={INPUT} />
                <span className="text-xs leading-[1.45] text-gray-500">Shown under your name everywhere on Biltlinx</span>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">About</span>
                <textarea value={about} maxLength={400} rows={3} placeholder={ABOUT_EXAMPLE} onChange={(event) => setAbout(event.target.value)} className={cn(INPUT, "h-[88px] resize-none")} />
              </label>
            </section>

            <section className={CARD}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1 leading-[1.45]">
                  <h2 className="text-base font-bold text-[#0f172a]">Portfolio</h2>
                  <p className="text-[13px] text-gray-500">Add at least {PORTFOLIO_MINIMUM} images of finished or ongoing work</p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold leading-[1.45]", portfolio.length >= PORTFOLIO_MINIMUM ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fef3c7] text-[#b45309]")}>
                  {Math.min(portfolio.length, PORTFOLIO_MINIMUM)} of {PORTFOLIO_MINIMUM} added
                </span>
              </div>
              <PortfolioUploader images={portfolio} onChange={setPortfolio} max={PORTFOLIO_MAX} addLabel="Add work" />
              {error && <p className="text-xs text-[#dc2626]">{error}</p>}
            </section>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding/professional/credentials")} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Back
              </button>
              <button type="button" onClick={publish} disabled={saving} className="whitespace-nowrap disabled:opacity-60 rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                {saving ? "Publishing…" : "Publish profile"}
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
                  <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-[#eff5ff] text-lg font-bold text-brand-900">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- a local object URL, nothing for next/image to optimise
                      <img src={photoUrl} alt="" className="size-full object-cover" />
                    ) : (
                      initialsOf(accountName)
                    )}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                    <p className="truncate text-base font-bold text-[#0f172a]">{accountName}</p>
                    <p className="truncate text-[13px] text-gray-500">{[profession, firm].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                {headline.trim() && <p className="text-[13px] font-medium leading-[1.45] text-[#334155]">{headline.trim()}</p>}
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-[#16a34a]">Phone verified</span>
                  {registrationNote ? (
                    <span className="rounded-full bg-[#fef3c7] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-[#b45309]">{registrationNote}</span>
                  ) : (
                    <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-gray-500">Not verified yet</span>
                  )}
                </div>
                {draft?.services && draft.services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {draft.services.map((service) => (
                      <span key={service} className="rounded-lg bg-[#f1f5f9] px-2 py-1 text-xs font-medium leading-[1.45] text-[#334155]">
                        {service}
                      </span>
                    ))}
                  </div>
                )}
                <dl className="flex flex-col gap-2 text-[13px] leading-[1.45]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Experience</dt>
                    <dd className="text-right font-semibold text-[#0f172a]">{draft?.experience ?? "8 years"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Works in</dt>
                    <dd className="text-right font-semibold text-[#0f172a]">{worksIn.join(" · ")}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Consultation</dt>
                    <dd className="font-semibold text-[#0f172a]">{draft?.consultation ?? "Free"}</dd>
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
              <NavIcon icon="/icons/onboarding-preview-eye.svg" size={20} className="shrink-0 bg-brand-900" />
              <div className="flex min-w-0 flex-col gap-1 text-[13px] leading-[1.45]">
                <p className="font-bold text-[#0f172a]">Who can see this?</p>
                <p className="text-[#334155]">Everyone on Biltlinx, and search engines if you allow it in Settings.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
