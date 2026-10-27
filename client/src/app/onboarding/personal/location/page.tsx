"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingProfilePreview } from "@/components/shared/OnboardingProfilePreview";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { useSession } from "@/context/SessionContext";
import { useDisplayName } from "@/hooks/useDisplayName";
import { MAX_PERSONAL_PLACES, PERSONAL_STEPS } from "@/lib/dummy-onboarding";
import { loadPersonalDraft, updatePersonalDraft } from "@/lib/onboarding-draft";

const ART = "/onboarding-personal";

/** The place name above the pin; a stand-in until the map can look an address up. */
const PIN_LABEL = "Ghana";

/** The pin and its label, drawn from the design's own pieces so it sits where the map says it does. */
function MapPin() {
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-[201px] flex -translate-x-1/2 flex-col items-center gap-px">
      <span className="rounded-lg bg-[rgba(15,15,20,0.88)] px-2.5 py-1.5 text-[11px] font-medium leading-none text-white">{PIN_LABEL}</span>
      <Image src={`${ART}/marker-arrow.svg`} alt="" width={12} height={6} />
      <span className="relative mt-1 block h-[41px] w-[27px]">
        <span className="absolute" style={{ inset: "72.07% 11.11% 2.32%" }}>
          <Image src={`${ART}/marker-base.svg`} alt="" fill className="max-w-none" />
        </span>
        <span className="absolute" style={{ inset: "0 0 14.02%" }}>
          <Image src={`${ART}/marker-body.svg`} alt="" fill className="max-w-none" />
        </span>
        <span className="absolute" style={{ inset: "0 0 14%" }}>
          <Image src={`${ART}/marker-shine.svg`} alt="" fill className="max-w-none" />
        </span>
        <span className="absolute" style={{ inset: "19.51% 29.63% 53.66%" }}>
          <Image src={`${ART}/marker-dot.svg`} alt="" fill className="max-w-none" />
        </span>
      </span>
    </div>
  );
}

/** Onboarding · Personal · 2 Location (Figma nodes 1247:47258, 1254:65947 and 1258:46798): where the person's place is. */
export default function PersonalLocationPage() {
  const router = useRouter();
  const { user } = useSession();
  const accountName = useDisplayName();
  const [address, setAddress] = useState("");
  const [places, setPlaces] = useState<string[]>([]);
  const [interestsDone, setInterestsDone] = useState(false);

  // Earlier choices live in the tab session, so they are read after mount.
  useEffect(() => {
    const draft = loadPersonalDraft();
    setInterestsDone((draft?.interests.length ?? 0) > 0);
    if (draft) setPlaces(draft.areas);
  }, []);

  /** The places with whatever is still typed in the box added to them. */
  function withTyped() {
    const typed = address.trim();
    if (!typed || places.some((place) => place.toLowerCase() === typed.toLowerCase()) || places.length >= MAX_PERSONAL_PLACES) return places;
    return [...places, typed];
  }

  function addTyped() {
    setPlaces(withTyped());
    setAddress("");
  }

  function save() {
    const all = withTyped();
    updatePersonalDraft({ areas: all, ...(all[0] ? { location: all[0] } : {}) });
  }

  const pinning = address.trim() !== "" || places.length > 0;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar actionLabel="Save and finish later" actionIcon="bookmark" onAction={() => router.push("/home")} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pb-12 pt-8 sm:px-12 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:gap-8">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <OnboardingStepper title="Personal setup" duration="About 1 minute" icon="/icons/onboarding-user.svg" steps={PERSONAL_STEPS} current={1} />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <h1 className="text-[28px] font-bold text-[#0f172a]">{pinning ? "Is the pin in the right spot?" : "Where’s your place located?"}</h1>
              <p className="text-[13px] text-[#64748a]">{pinning ? "Your address is only shared with guests after they’ve made a reservation." : "Helps us show homes and providers near you."}</p>
            </div>

            <section className="relative h-[608px] overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <Image src={`${ART}/map-ghana.png`} alt="Map of Ghana" fill priority sizes="(min-width: 1280px) 660px, 100vw" className="object-cover opacity-80" />
              <MapPin />

              <div className="absolute left-1/2 top-[47px] flex w-[570px] max-w-[calc(100%-32px)] -translate-x-1/2 flex-col gap-2.5">
                <label className="flex h-[60px] items-center gap-2 rounded-3xl border border-transparent bg-white px-3 shadow-[0_1px_20px_rgba(0,0,0,0.2)] focus-within:border-[#78a7ff]">
                  <Image src={`${ART}/search-pin.svg`} alt="" width={16} height={16} />
                  <input
                    value={address}
                    maxLength={80}
                    placeholder="Enter your address"
                    aria-label="Your address"
                    onChange={(event) => setAddress(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addTyped();
                    }}
                    className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-black placeholder:text-[#64748a] focus:outline-none"
                  />
                  {address && (
                    <button type="button" aria-label="Clear the address" onClick={() => setAddress("")} className="shrink-0">
                      <Image src={`${ART}/search-clear.svg`} alt="" width={16} height={16} />
                    </button>
                  )}
                </label>

                {places.length > 0 && (
                  <ul aria-label="Places you added" className="flex flex-wrap gap-2.5 rounded-[18px] border-b border-gray-200 bg-[#f8fafc] p-2.5">
                    {places.map((place) => (
                      <li key={place} className="flex h-8 items-center gap-2 rounded-lg border border-gray-200 bg-[#f8fafc] px-3 text-sm leading-5 text-[#0f1621]">
                        {place}
                        <button type="button" aria-label={`Remove ${place}`} onClick={() => setPlaces((current) => current.filter((item) => item !== place))}>
                          <Image src={`${ART}/chip-remove.svg`} alt="" width={16} height={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  save();
                  router.push("/onboarding/personal");
                }}
                className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50"
              >
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  save();
                  router.push("/onboarding/personal/profile");
                }}
                className="flex items-center gap-2 rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Continue
                <NavIcon icon="/icons/onboarding-arrow-right.svg" size={10} className="bg-white" />
              </button>
            </div>
          </main>

          <aside className="lg:col-start-2 xl:sticky xl:top-8 xl:col-start-3 xl:self-start">
            <OnboardingProfilePreview done={{ interests: interestsDone, location: pinning, profile: false }} name={accountName} photoUrl={user?.profilePicUrl ?? null} />
          </aside>
        </div>
      </div>
    </div>
  );
}
