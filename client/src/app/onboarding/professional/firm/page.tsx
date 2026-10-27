"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDisplayName } from "@/hooks/useDisplayName";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { ProfessionalPreview } from "@/components/shared/ProfessionalPreview";
import { PROFESSIONAL_STEPS } from "@/lib/dummy-onboarding";
import { loadProfessionalDraft, updateProfessionalDraft } from "@/lib/onboarding-draft";

const CARD = "flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6";
const INPUT = "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900";
const FIELD_INPUT = "min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none";

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 leading-[1.45]">
        <span className="text-[13px] font-medium text-[#334155]">{label}</span>
        {optional && <span className="text-xs text-[#94a3b8]">Optional</span>}
      </span>
      <span className={INPUT}>{children}</span>
    </label>
  );
}

/** Onboarding · Professional · 2 Company/Firm (Figma node 1285:126106): who they work with and where the office is. */
export default function ProfessionalFirmPage() {
  const accountName = useDisplayName();
  const router = useRouter();
  const [services, setServices] = useState<string[]>([]);
  const [firm, setFirm] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [office, setOffice] = useState("");
  const [website, setWebsite] = useState("");

  // Step 1's choices live in the tab session, so they are read after mount.
  useEffect(() => {
    const draft = loadProfessionalDraft();
    if (!draft) return;
    if (draft.workMode === "independent") {
      router.replace("/onboarding/professional/credentials");
      return;
    }
    setServices(draft.services ?? []);
    setFirm(draft.firm);
    setJobTitle(draft.jobTitle ?? "");
    setOffice(draft.officeLocation ?? "");
    setWebsite(draft.website ?? "");
  }, [router]);

  function save() {
    updateProfessionalDraft({ firm: firm.trim(), jobTitle: jobTitle.trim(), officeLocation: office.trim(), website: website.trim(), basedIn: office.trim() });
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
              steps={PROFESSIONAL_STEPS}
              current={1}
              note="You can publish before your credentials are checked. Badges appear once each check passes."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <h1 className="text-[28px] font-bold text-[#0f172a]">Firm/Company details</h1>
              <p className="text-[15px] text-gray-500">Let clients know who you work with (if applicable)</p>
            </div>

            <section className={CARD}>
              <Field label="Firm or company">
                <input value={firm} maxLength={80} placeholder="Sunrise Properties" onChange={(event) => setFirm(event.target.value)} className={FIELD_INPUT} />
                {firm.trim() && <NavIcon icon="/icons/onboarding-check-circle.svg" size={18} className="bg-[#16a34a]" />}
              </Field>
              <Field label="Job title / Position">
                <input value={jobTitle} maxLength={60} placeholder="Senior Real Estate Agent" onChange={(event) => setJobTitle(event.target.value)} className={FIELD_INPUT} />
              </Field>
              <Field label="Office location">
                <NavIcon icon="/onboarding-professional/location-pin.svg" size={18} className="bg-gray-500" />
                <input value={office} maxLength={80} placeholder="Accra (Greater Accra Regional Hub)" onChange={(event) => setOffice(event.target.value)} className={FIELD_INPUT} />
              </Field>
              <Field label="Company website (optional)" optional>
                <NavIcon icon="/icons/calendar-01.svg" size={18} className="bg-gray-500" />
                <input value={website} type="url" maxLength={120} placeholder="https://sunriseproperties.com" onChange={(event) => setWebsite(event.target.value)} className={FIELD_INPUT} />
              </Field>
            </section>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding/professional")} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => router.push("/onboarding/professional/credentials")} className="whitespace-nowrap rounded-[10px] px-5 py-3 text-sm font-semibold text-brand-900">
                  Do this later
                </button>
                <button
                  type="button"
                  onClick={() => {
                    save();
                    router.push("/onboarding/professional/credentials");
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
            <ProfessionalPreview done={{ profession: true, firm: firm.trim() !== "", credentials: false, public: false }} name={accountName} photoUrl={null} services={services} registration={null} />
          </aside>
        </div>
      </div>
    </div>
  );
}
