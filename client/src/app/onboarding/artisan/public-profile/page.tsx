"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAccountPrefill, usePrefilledState } from "@/hooks/useAccountPrefill";
import { useDisplayName } from "@/hooks/useDisplayName";
import { showErrorToast } from "@/components/shared/AppToast";
import { ArtisanPreview, artisanCompletion } from "@/components/shared/ArtisanPreview";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTip } from "@/components/shared/OnboardingTip";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { PortfolioUploader, type PortfolioImage } from "@/components/shared/PortfolioUploader";
import { PublicProfileCard } from "@/components/shared/PublicProfileCard";
import { ARTISAN_STEPS, PROFILE_PHOTO_MAX_BYTES, PROFILE_PHOTO_TYPES } from "@/lib/dummy-onboarding";
import { notifyError } from "@/lib/errors";
import { loadArtisanDraft, updateArtisanDraft, type ArtisanDraft } from "@/lib/onboarding-draft";
import { finishArtisan } from "@/lib/onboarding-submit";

const PORTFOLIO_MAX = 12;
const DEFAULT_TRADE = "Electrician";

/** Onboarding · Artisan · 4 Public profile (Figma node 1071:32122): photo, headline, intro and photos of past work. */
export default function ArtisanPublicProfilePage() {
  const accountName = useDisplayName();
  const account = useAccountPrefill();
  const router = useRouter();
  const photoUrls = useRef<string[]>([]);
  const [draft, setDraft] = useState<ArtisanDraft | null>(null);
  const [location, setLocation] = usePrefilledState(account.location);
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Earlier steps' choices live in the tab session, so they are read after mount.
  useEffect(() => {
    const saved = loadArtisanDraft();
    if (!saved) return;
    setDraft(saved);
    setHeadline(saved.trade);
  }, []);

  useEffect(() => {
    const created = photoUrls.current;
    return () => created.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function handlePhoto(file: File | undefined) {
    if (!file) return;
    const problem = !PROFILE_PHOTO_TYPES.includes(file.type) ? "Use a JPG or PNG photo." : file.size > PROFILE_PHOTO_MAX_BYTES ? "That photo is over 5 MB. Choose a smaller one." : "";
    setError(problem);
    if (problem) return;
    const url = URL.createObjectURL(file);
    photoUrls.current.push(url);
    setPhoto({ file, url });
  }

  const trade = draft?.trade ?? DEFAULT_TRADE;
  const done = { trade: true, area: Boolean(draft?.workArea), verification: Boolean(draft?.verification?.identity), profile: portfolio.length > 0 };

  async function publish() {
    if (!draft) {
      setError("Start from the first step so we know your trade.");
      return;
    }
    setSaving(true);
    try {
      const problems = await finishArtisan({
        draft: { ...draft, basedIn: location.trim() },
        displayName: accountName,
        headline,
        about,
        photo: photo?.file ?? null,
        portfolio: portfolio.map((image) => image.file),
        services: draft.services ?? [],
      });
      updateArtisanDraft({ strength: artisanCompletion(done), basedIn: location.trim() });
      problems.forEach((problem) => showErrorToast(problem));
      router.push("/onboarding/artisan/done");
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
              <h1 className="text-[28px] font-bold text-[#0f172a]">Show your work and starting prices</h1>
              <p className="text-[15px] text-gray-500">Photos of real jobs get far more requests than an empty profile.</p>
            </div>

            <PublicProfileCard
              photoUrl={photo?.url ?? null}
              onPhoto={handlePhoto}
              name={accountName}
              email={account.email}
              phone={account.phone}
              location={location}
              onLocation={setLocation}
              headline={headline}
              onHeadline={setHeadline}
              headlinePlaceholder={`${trade} · Homes and small commercial buildings`}
              about={about}
              onAbout={setAbout}
              aboutPlaceholder={`${trade} with 8 years of experience across Accra. I handle installations, repairs and call-outs, and I quote before I start.`}
            />

            <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex min-w-0 flex-col gap-1 leading-[1.45]">
                <h2 className="text-base font-bold text-[#0f172a]">Photos of your work</h2>
                <p className="text-[13px] text-gray-500">Before and after photos work best</p>
              </div>
              <PortfolioUploader images={portfolio} onChange={setPortfolio} max={PORTFOLIO_MAX} addLabel="Add photo" />
              {error && <p className="text-xs text-[#dc2626]">{error}</p>}
            </section>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding/artisan/verification")} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Back
              </button>
              <button type="button" onClick={publish} disabled={saving} className="whitespace-nowrap rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
                {saving ? "Publishing…" : "Publish profile"}
              </button>
            </div>
          </main>

          <aside className="flex flex-col gap-4 lg:col-start-2 xl:sticky xl:top-8 xl:col-start-3 xl:self-start">
            <ArtisanPreview done={done} name={accountName} photoUrl={photo?.url ?? null} services={draft?.services ?? []} />
            <OnboardingTip icon="/icons/onboarding-info-circle.svg" title="Who can see this?">
              Everyone on Biltlinx, and search engines if you allow it in Settings.
            </OnboardingTip>
          </aside>
        </div>
      </div>
    </div>
  );
}
