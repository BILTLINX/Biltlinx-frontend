"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDisplayName } from "@/hooks/useDisplayName";
import type { UploadedFile } from "@/components/shared/DocumentUpload";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTip } from "@/components/shared/OnboardingTip";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { ProfessionalPreview, professionalCompletion } from "@/components/shared/ProfessionalPreview";
import { DatePickerField, OptionSelectField, todayKey } from "@/components/shared/ViewingSlotPickers";
import { MEMBERSHIP_BODIES, professionalSteps, REGISTRATION_BODIES, type BodyOption } from "@/lib/dummy-onboarding";
import { loadProfessionalDraft, updateProfessionalDraft, type ProfessionalDraft } from "@/lib/onboarding-draft";

const CARD = "flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6";
const INPUT = "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900";
const DEFAULT_PROFESSION = "Architect";

/** Where a credential's issuer is picked from a list when one is known, and typed in when it is not. */
function BodyField({ label, optional, options, value, onChange, placeholder }: { label: string; optional?: boolean; options: BodyOption[]; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="flex items-center gap-1.5 leading-[1.45]">
        <span className="text-[13px] font-medium text-[#334155]">{label}</span>
        {optional && <span className="text-xs text-[#94a3b8]">Optional</span>}
      </span>
      {options.length > 0 ? (
        <OptionSelectField value={value} options={options.map((option) => option.label)} onChange={onChange} placeholder={placeholder} />
      ) : (
        <span className={INPUT}>
          <input value={value} maxLength={80} aria-label={label} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
        </span>
      )}
    </div>
  );
}

/** Onboarding · Professional · 3 Credentials (Figma node 1070:31731): registration and identity documents, and the badges they earn. */
export default function ProfessionalCredentialsPage() {
  const accountName = useDisplayName();
  const router = useRouter();
  const [draft, setDraft] = useState<ProfessionalDraft | null>(null);
  const [body, setBody] = useState("");
  const [number, setNumber] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [membership, setMembership] = useState("");
  const [certificate, setCertificate] = useState<UploadedFile | null>(null);
  const [identity, setIdentity] = useState<UploadedFile | null>(null);
  const [today] = useState(() => todayKey());

  const profession = draft?.profession ?? DEFAULT_PROFESSION;
  const independent = draft?.workMode === "independent";
  const steps = professionalSteps(independent);

  // Earlier steps' choices live in the tab session, so they are read after mount.
  useEffect(() => {
    const saved = loadProfessionalDraft();
    setDraft(saved);
    setNumber(saved?.registration?.number ?? "");
  }, []);

  useEffect(() => {
    const known = REGISTRATION_BODIES[profession] ?? [];
    setBody(known.length === 1 ? known[0].label : "");
    setMembership("");
  }, [profession]);

  const bodies = REGISTRATION_BODIES[profession] ?? [];
  const memberships = MEMBERSHIP_BODIES[profession] ?? [];
  // With a single known regulator there is nothing to choose, so it is preselected; the badge names fall back to it too.
  const bodyAbbreviation = bodies.find((option) => option.label === body)?.abbreviation ?? (body.trim() || bodies[0]?.abbreviation) ?? "";
  const done = { profession: true, firm: Boolean(draft?.firm || draft?.officeLocation), credentials: number.trim() !== "", public: false };

  function saveCredentials() {
    updateProfessionalDraft({
      strength: professionalCompletion(done, independent),
      registration: { abbreviation: bodyAbbreviation, hasNumber: number.trim().length > 0, body: body.trim() || bodyAbbreviation, number: number.trim() },
    });
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
              current={steps.findIndex((step) => step.id === "credentials")}
              note="You can publish before your credentials are checked. Badges appear once each check passes."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <h1 className="text-[28px] font-bold text-[#0f172a]">Add your credentials</h1>
              <p className="text-[15px] text-gray-500">Each badge on Biltlinx says exactly what was checked. Your documents stay private and are only used for the check.</p>
            </div>

            <section className={CARD}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1 leading-[1.45]">
                  <h2 className="text-base font-bold text-[#0f172a]">Professional registration</h2>
                  <p className="text-[13px] text-gray-500">Gives you the “{bodyAbbreviation || "Registered"} registered” badge</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-brand-900">Recommended</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <BodyField label="Registration body" options={bodies} value={body} onChange={setBody} placeholder="Choose your registration body" />
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Registration number</span>
                  <span className={INPUT}>
                    <input value={number} maxLength={40} placeholder="e.g. ARC/2017/0412" onChange={(event) => setNumber(event.target.value)} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                    {number.trim() && <NavIcon icon="/icons/onboarding-check-circle.svg" size={18} className="bg-[#16a34a]" />}
                  </span>
                </label>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Valid until</span>
                  <DatePickerField value={validUntil} onChange={setValidUntil} min={today} />
                </div>
                <BodyField label="Professional body membership" optional options={memberships} value={membership} onChange={setMembership} placeholder="Choose a membership" />
              </div>

              <FileDropzone title="Professional certificate" dropLabel="professional certificate" hint="PDF, JPG or PNG, up to 10 MB" file={certificate} onFile={setCertificate} slot="professional:certificate" />
            </section>

            <section className={CARD}>
              <div className="flex min-w-0 flex-col gap-1 leading-[1.45]">
                <h2 className="text-base font-bold text-[#0f172a]">Identity</h2>
                <p className="text-[13px] text-gray-500">Gives you the “ID verified” badge</p>
              </div>
              <FileDropzone title="Ghana Card, front and back" dropLabel="Ghana Card, front and back" hint="Photo or PDF, up to 10 MB. We also ask for a quick selfie to match it." file={identity} onFile={setIdentity} slot="professional:identity" />
            </section>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push(independent ? "/onboarding/professional" : "/onboarding/professional/firm")} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => router.push("/onboarding/professional/public-profile")} className="whitespace-nowrap rounded-[10px] px-5 py-3 text-sm font-semibold text-brand-900">
                  Do this later
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveCredentials();
                    router.push("/onboarding/professional/public-profile");
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
            <ProfessionalPreview done={done} name={accountName} photoUrl={null} services={draft?.services ?? []} registration={number.trim() ? bodyAbbreviation || null : null} independent={independent} />
            <OnboardingTip icon="/icons/onboarding-user-shield.svg" title="Paid plans never buy a badge">
              Pro and Featured change visibility only. Verification is always a separate check.
            </OnboardingTip>
          </aside>
        </div>
      </div>
    </div>
  );
}
