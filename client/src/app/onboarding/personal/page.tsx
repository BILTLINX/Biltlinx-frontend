"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { InterestIllustration } from "@/components/shared/InterestIllustration";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { PERSONAL_INTERESTS, PERSONAL_STEPS } from "@/lib/dummy-onboarding";
import { loadPersonalDraft, updatePersonalDraft } from "@/lib/onboarding-draft";
import { cn } from "@/lib/utils";

function toggled<T>(items: T[], item: T) {
  return items.includes(item) ? items.filter((existing) => existing !== item) : [...items, item];
}

/** Onboarding · Personal · 1 Interests (Figma node 1246:46361): what the person is looking for. */
export default function PersonalInterestsPage() {
  const router = useRouter();
  const [interests, setInterests] = useState(["rent"]);

  // A choice made earlier lives in the tab session, so coming back to this step is read after mount.
  useEffect(() => {
    const saved = loadPersonalDraft()?.interests.filter((id) => PERSONAL_INTERESTS.some((interest) => interest.id === id));
    if (saved && saved.length > 0) setInterests(saved);
  }, []);

  function handleContinue() {
    updatePersonalDraft({ interests });
    router.push("/onboarding/personal/location");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar actionLabel="Save and finish later" actionIcon="bookmark" onAction={() => router.push("/home")} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pb-12 pt-8 sm:px-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <OnboardingStepper title="Personal setup" duration="About 1 minute" icon="/icons/onboarding-user.svg" steps={PERSONAL_STEPS} current={0} />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <h1 className="text-[28px] font-bold text-[#0f172a]">What are you looking for?</h1>
              <p className="text-[15px] text-[#64748a]">We use this to fill your Home feed and suggest people to follow. Pick as many as you like.</p>
            </div>

            <section className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-base font-bold leading-[1.45] text-[#0f172a]">I want to</h2>
              <div role="group" aria-label="I want to" className="grid grid-cols-2 gap-3">
                {PERSONAL_INTERESTS.map((interest) => {
                  const selected = interests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setInterests((current) => toggled(current, interest.id))}
                      className={cn(
                        "flex h-[207px] flex-col items-center justify-center gap-4 rounded-3xl border p-3.5",
                        selected ? "border-brand-900 bg-[#eff5ff]" : "border-gray-200 bg-white hover:border-gray-300",
                      )}
                    >
                      <span className={cn("flex w-full justify-end", !selected && "opacity-0")}>
                        <NavIcon icon="/icons/onboarding-check-circle.svg" size={18} className="bg-brand-900" />
                      </span>
                      <InterestIllustration id={interest.id} />
                      <span className="text-sm font-semibold leading-[1.45] text-[#0f172a]">{interest.label}</span>
                    </button>
                  );
                })}
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
        </div>
      </div>
    </div>
  );
}
