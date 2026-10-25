"use client";

import { useDisplayName } from "@/hooks/useDisplayName";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DocumentUpload, type UploadedFile } from "@/components/shared/DocumentUpload";
import { showErrorToast } from "@/components/shared/AppToast";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { BUSINESS_STEPS, OWNER_ROLES } from "@/lib/dummy-onboarding";
import { initialsOf } from "@/lib/initials";
import { loadBusinessDraft, updateBusinessDraft, type BusinessDraft } from "@/lib/onboarding-draft";
import { notifyError } from "@/lib/errors";
import { finishBusiness } from "@/lib/onboarding-submit";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6";
const INPUT = "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900";
/** What steps 1 to 3 earned when nothing was saved. */
const DEFAULT_STRENGTH = 70;

function CardHeading({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex flex-col gap-1 leading-[1.45]">
      <h2 className="text-base font-bold text-[#0f172a]">{title}</h2>
      <p className="text-[13px] text-gray-500">{note}</p>
    </div>
  );
}

/** Onboarding · Business · 4 Verification (Figma node 1073:32316): the business's registration and the owner's ID. */
export default function BusinessVerificationPage() {
  const accountName = useDisplayName();
  const router = useRouter();
  const [draft, setDraft] = useState<BusinessDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [registration, setRegistration] = useState("");
  const [tin, setTin] = useState("");
  const [certificate, setCertificate] = useState<UploadedFile | null>(null);
  const [role, setRole] = useState(OWNER_ROLES[0]);
  const [ownerId, setOwnerId] = useState<UploadedFile | null>(null);

  // Earlier steps' choices live in the tab session, so they are read after mount.
  useEffect(() => setDraft(loadBusinessDraft()), []);

  const details = draft?.details;
  const businessName = details?.name ?? "Your business";
  const registrationEntered = registration.trim().length > 0;
  const strength = Math.min(100, (draft?.strength ?? DEFAULT_STRENGTH) + (registrationEntered ? 5 : 0) + (certificate ? 5 : 0) + (ownerId ? 5 : 0));
  const pending = registrationEntered || certificate !== null || ownerId !== null;
  const tags = [...(draft?.sell?.categories ?? []), draft?.sell?.delivery ?? ""].filter(Boolean);
  const products = draft?.sell?.products ?? 0;

  async function handleContinue() {
    if (!draft) return;
    setSaving(true);
    try {
      updateBusinessDraft({ strength, verification: { registration: registrationEntered, certificate: certificate !== null, ownerId: ownerId !== null } });
      const problems = await finishBusiness(draft, [registration.trim() && `Reg ${registration.trim()}`, tin.trim() && `TIN ${tin.trim()}`, role].filter(Boolean).join(", "));
      problems.forEach((problem) => showErrorToast(problem));
      router.push("/onboarding/business/done");
    } catch (error) {
      notifyError(error, "Your business could not be set up.");
      setSaving(false);
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar title="Setting up your business" actionLabel="Save and finish later" onAction={() => router.push("/home")} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pb-12 pt-8 sm:px-12 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:gap-8">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <OnboardingStepper
              title="Business setup"
              duration="About 3 minutes"
              icon="/icons/onboarding-building.svg"
              iconClass="-scale-y-100"
              steps={BUSINESS_STEPS}
              current={2}
              note="Your personal account stays separate. You manage the business from Manage once it is set up."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 3 of 3</p>
              <h1 className="text-[28px] font-bold text-[#0f172a]">Verify your business</h1>
              <p className="text-[15px] text-gray-500">Gives you the “Business verified” badge. It confirms the business is registered, not every product or staff member.</p>
            </div>

            <section className={CARD}>
              <CardHeading title="Business registration" note="Office of the Registrar of Companies (ORC)" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Registration number</span>
                  <span className={INPUT}>
                    <input value={registration} maxLength={30} placeholder="e.g. BN 4471209" onChange={(event) => setRegistration(event.target.value)} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                    {registrationEntered && <NavIcon icon="/icons/onboarding-check-circle.svg" size={18} className="bg-[#16a34a]" />}
                  </span>
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 leading-[1.45]">
                    <span className="text-[13px] font-medium text-[#334155]">TIN</span>
                    <span className="text-xs text-[#94a3b8]">Optional</span>
                  </span>
                  <span className={INPUT}>
                    <input value={tin} maxLength={14} placeholder="e.g. C0004471209" onChange={(event) => setTin(event.target.value.toUpperCase())} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                  </span>
                </label>
              </div>
              <DocumentUpload title="Business registration certificate" hint="PDF, JPG or PNG, up to 10 MB." file={certificate} onFile={setCertificate} slot="business:certificate" />
            </section>

            <section className={CARD}>
              <CardHeading title="You, as the owner or representative" note="We check that the person setting this up can act for the business" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Your name</span>
                  <span className="rounded-[10px] border border-gray-200 bg-[#f1f5f9] px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a]" aria-readonly="true">
                    {accountName}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Your role</span>
                  <OptionSelectField value={role} options={OWNER_ROLES} onChange={setRole} />
                </div>
              </div>
              <DocumentUpload title="Your Ghana Card, front and back" hint="Photo or PDF. We also ask for a quick selfie." file={ownerId} onFile={setOwnerId} slot="business:owner" />
            </section>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding/business/details")} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <button type="button" disabled={saving} onClick={handleContinue} className="whitespace-nowrap rounded-[10px] px-5 py-3 text-sm font-semibold text-brand-900">
                  Do this later
                </button>
                <button type="button" disabled={saving} onClick={handleContinue} className="flex items-center gap-2 rounded-[10px] bg-brand-900 disabled:opacity-60 px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                  {saving ? "Sending…" : "Send for review"}
                  <NavIcon icon="/icons/onboarding-arrow-right.svg" size={10} className="bg-white" />
                </button>
              </div>
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
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-xl border-[3px] border-white bg-[#eff5ff] text-lg font-bold text-brand-900">{initialsOf(businessName)}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                    <p className="truncate text-base font-bold text-[#0f172a]">{businessName}</p>
                    <p className="truncate text-[13px] text-gray-500">
                      {details?.category ?? "Building materials"} · {details?.place ?? "your area"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold leading-[1.45]", pending ? "bg-[#fef3c7] text-[#b45309]" : "bg-[#f1f5f9] text-gray-500")}>{pending ? "Business verification pending" : "Not verified yet"}</span>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span key={tag} className="rounded-lg bg-[#f1f5f9] px-2 py-1 text-xs font-medium leading-[1.45] text-[#334155]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <dl className="flex flex-col gap-2 text-[13px] leading-[1.45]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Open</dt>
                    <dd className="text-right font-semibold text-[#0f172a]">{details?.hours ?? "Mon–Sat, 7:30am–5:30pm"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Products</dt>
                    <dd className={cn("font-semibold", products > 0 ? "text-[#0f172a]" : "text-[#94a3b8]")}>{products > 0 ? `${products} listed` : "None yet"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Plan</dt>
                    <dd className="font-semibold text-[#0f172a]">Free</dd>
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
              <NavIcon icon="/icons/onboarding-user-shield.svg" size={20} className="shrink-0 bg-brand-900" />
              <div className="flex min-w-0 flex-col gap-1 text-[13px] leading-[1.45]">
                <p className="font-bold text-[#0f172a]">Paid plans never buy a badge</p>
                <p className="text-[#334155]">Pro and Featured change visibility only. Verification is always a separate check.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
