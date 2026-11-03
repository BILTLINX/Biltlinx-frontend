"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAccountPrefill, usePrefilledState } from "@/hooks/useAccountPrefill";
import { useDisplayName } from "@/hooks/useDisplayName";
import { showErrorToast } from "@/components/shared/AppToast";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTip } from "@/components/shared/OnboardingTip";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { PortfolioUploader, type PortfolioImage } from "@/components/shared/PortfolioUploader";
import { PublicProfileCard } from "@/components/shared/PublicProfileCard";
import { ProfessionalPreview, professionalCompletion } from "@/components/shared/ProfessionalPreview";
import { professionalSteps, PROFILE_PHOTO_MAX_BYTES, PROFILE_PHOTO_TYPES } from "@/lib/dummy-onboarding";
import { loadProfessionalDraft, updateProfessionalDraft, type ProfessionalDraft } from "@/lib/onboarding-draft";
import { notifyError } from "@/lib/errors";
import { finishProfessional } from "@/lib/onboarding-submit";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6";
const INTRO_EXAMPLE = "Licensed architect with 8 years designing homes and small apartment blocks across Accra. I handle drawings, permits and site supervision.";
const PORTFOLIO_MINIMUM = 3;
const PORTFOLIO_MAX = 12;

/** Onboarding · Professional · 4 Public profile (Figma node 1070:31928): photo, headline, intro and portfolio. */
export default function ProfessionalPublicProfilePage() {
  const accountName = useDisplayName();
  const account = useAccountPrefill();
  const router = useRouter();
  const urls = useRef<string[]>([]);
  const [draft, setDraft] = useState<ProfessionalDraft | null>(null);
  const [location, setLocation] = usePrefilledState(account.location);
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

  const independent = draft?.workMode === "independent";
  const steps = professionalSteps(independent);
  const done = { profession: true, firm: Boolean(draft?.firm || draft?.officeLocation), credentials: Boolean(draft?.registration?.hasNumber), public: portfolio.length >= PORTFOLIO_MINIMUM };

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
      const problems = await finishProfessional({ draft: { ...draft, basedIn: location.trim() }, displayName: draft.firm.trim() || accountName, headline, about, portfolio: portfolio.map((image) => image.file) });
      updateProfessionalDraft({ strength: professionalCompletion(done, independent), basedIn: location.trim() });
      problems.forEach((problem) => showErrorToast(problem));
      router.push("/onboarding/professional/done");
    } catch (failure) {
      notifyError(failure, "Your profile could not be saved.");
      setSaving(false);
    }
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
              steps={steps}
              current={steps.findIndex((step) => step.id === "public")}
              note="You can publish before your credentials are checked. Badges appear once each check passes."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <h1 className="text-[28px] font-bold text-[#0f172a]">Finish your public profile</h1>
              <p className="text-[15px] text-gray-500">This is what clients see first. You can keep editing after you publish.</p>
            </div>

            <PublicProfileCard
              photoUrl={photoUrl}
              onPhoto={handlePhoto}
              name={accountName}
              email={account.email}
              phone={account.phone}
              location={location}
              onLocation={setLocation}
              headline={headline}
              onHeadline={setHeadline}
              headlinePlaceholder="Architect · Residential and mixed-use buildings"
              about={about}
              onAbout={setAbout}
              aboutPlaceholder={INTRO_EXAMPLE}
            />

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
              <button type="button" onClick={publish} disabled={saving} className="whitespace-nowrap rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
                {saving ? "Publishing…" : "Publish profile"}
              </button>
            </div>
          </main>

          <aside className="flex flex-col gap-4 lg:col-start-2 xl:sticky xl:top-8 xl:col-start-3 xl:self-start">
            <ProfessionalPreview done={done} name={accountName} photoUrl={photoUrl} services={draft?.services ?? []} registration={draft?.registration?.hasNumber ? draft.registration.abbreviation || null : null} independent={independent} />
            <OnboardingTip icon="/onboarding-professional/search-visual.svg" title="Who can see this?">
              Everyone on Biltlinx, and search engines if you allow it in Settings.
            </OnboardingTip>
          </aside>
        </div>
      </div>
    </div>
  );
}
