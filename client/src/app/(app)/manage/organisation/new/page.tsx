"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { CreateOrganisationStepper } from "@/components/shared/CreateOrganisationStepper";
import { ChoiceChip, FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { useSession } from "@/context/SessionContext";
import { checkOrganizationSlug } from "@/lib/account-api";
import { ORGANISATION_DOCUMENT_SLOTS, ORGANISATION_KINDS, ORGANISATION_ROLES } from "@/lib/organisation-flow";
import { initialsOf } from "@/lib/initials";
import { forgetFiles, recallFile, rememberFile } from "@/lib/onboarding-files";
import { loadOpenOrganisationDraft, saveOrganisationDraft } from "@/lib/organisation-draft";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-[18px] rounded-2xl border border-gray-200 bg-white p-5 sm:p-6";
const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function slugOf(name: string) {
  return name
    .toLowerCase()
    .replace(/\b(ltd|limited|llc|inc|plc)\b\.?/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Create organisation · step 1 (Figma node 1084:34644): who the organisation is. Reached from every "Set up organisation" button. */
export default function CreateOrganisationPage() {
  const router = useRouter();
  const logoInput = useRef<HTMLInputElement | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoError, setLogoError] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState(ORGANISATION_KINDS[0]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [headOffice, setHeadOffice] = useState("");
  const [about, setAbout] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [debouncedSlug, setDebouncedSlug] = useState("");
  const { user } = useSession();
  const ownerName = user?.username ?? "";
  const canCreate = user?.capabilities.some((item) => item.status === "Approved" && ORGANISATION_ROLES.includes(item.capability)) ?? false;

  // Earlier choices live in the tab session and the logo in memory, so both are read after mount.
  useEffect(() => {
    const draft = loadOpenOrganisationDraft();
    if (!draft) {
      forgetFiles("organisation:");
      return;
    }
    setName(draft.name);
    setKind(draft.kind ?? ORGANISATION_KINDS[0]);
    setEmail(draft.email ?? "");
    setPhone(draft.phone ?? "");
    setHeadOffice(draft.headOffice ?? "");
    setAbout(draft.about ?? "");
    const saved = recallFile(ORGANISATION_DOCUMENT_SLOTS.logo);
    if (saved) setLogo(URL.createObjectURL(saved));
  }, []);

  // The preview URL is revoked when it is replaced or the page closes.
  useEffect(() => () => { if (logo) URL.revokeObjectURL(logo); }, [logo]);

  const slug = slugOf(name);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSlug(slug), 400);
    return () => clearTimeout(timer);
  }, [slug]);

  const availability = useQuery({
    queryKey: ["organisation-slug", debouncedSlug],
    queryFn: () => checkOrganizationSlug(debouncedSlug),
    enabled: debouncedSlug.length > 0,
    staleTime: 30_000,
  });
  const slugChecked = Boolean(slug) && debouncedSlug === slug && availability.data !== undefined;
  const slugTaken = slugChecked && availability.data?.available === false;

  function pickLogo(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_LOGO_BYTES) {
      setLogoError("Use a PNG or JPG image under 5 MB.");
      return;
    }
    setLogoError("");
    rememberFile(ORGANISATION_DOCUMENT_SLOTS.logo, file);
    setLogo(URL.createObjectURL(file));
  }

  function handleContinue() {
    const trimmedName = name.trim();
    const nameMissing = !trimmedName || !slug;
    const emailInvalid = !EMAIL_PATTERN.test(email.trim());
    const phoneMissing = phone.replace(/\D/g, "").length < 7;
    setNameError(nameMissing ? "Enter your organisation's name to continue." : slugTaken ? "That page address is already taken. Try a different name." : "");
    setEmailError(emailInvalid ? "Enter a valid business email." : "");
    setPhoneError(phoneMissing ? "Enter a phone number." : "");
    if (nameMissing || slugTaken || emailInvalid || phoneMissing) return;
    saveOrganisationDraft({
      ...loadOpenOrganisationDraft(),
      name: trimmedName, slug, kind, email: email.trim(), phone: phone.trim(), headOffice: headOffice.trim(), about: about.trim(),
    });
    router.push("/manage/organisation/new/verification");
  }

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Create organisation" }]} />

        <div className="flex w-full flex-col items-start gap-6 lg:flex-row lg:gap-8">
          <CreateOrganisationStepper current={0} />

          <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold leading-[17px] text-brand-900">Step 1 of 4</p>
              <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Organisation details</h1>
            </div>

            {user && !canCreate && (
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-[#eff5ff] p-3.5 text-[13px] font-medium leading-[19px] text-brand-900">
                You need an approved Agent, Developer, Property manager or Stay operator role to create an organisation.
                <Link href="/onboarding/organization" className="font-semibold underline">
                  Request a role
                </Link>
              </p>
            )}

            <section className={CARD}>
              <div className="flex items-center gap-4">
                <span className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#bfdbfe] bg-[#eff5ff] text-[22px] font-bold text-brand-900">
                  {/* A blob URL from the person's own device, so next/image has nothing to optimise. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {logo ? <img src={logo} alt="Organisation logo" className="size-full object-cover" /> : name.trim() ? initialsOf(name) : <NavIcon icon="/icons/onboarding-image-add.svg" size={24} className="bg-brand-900" />}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">Logo</span>
                  <span className="text-xs leading-[17px] text-gray-500">Square, at least 400 × 400 px</span>
                  <input ref={logoInput} type="file" accept="image/*" className="hidden" onChange={(event) => { pickLogo(event.target.files?.[0]); event.target.value = ""; }} />
                  <button type="button" onClick={() => logoInput.current?.click()} className="self-start text-[13px] font-medium leading-[19px] text-brand-900">
                    {logo ? "Change logo" : "Upload logo"}
                  </button>
                  {logoError && <span className="text-xs leading-[17px] text-[#dc2626]">{logoError}</span>}
                </div>
              </div>

              <FormField label="Organisation name" error={nameError}>
                <label className={cn(FIELD_BOX, nameError ? "border-[#dc2626]" : "border-gray-200")}>
                  <input value={name} maxLength={80} placeholder="e.g. Kasapa Properties Ltd" onChange={(event) => { setName(event.target.value); setNameError(""); }} className={FIELD_INPUT} />
                </label>
              </FormField>

              <FormField label="Public page address">
                <label className={cn(FIELD_BOX, "border-gray-200")}>
                  <span className="shrink-0 text-[13px] text-gray-500 sm:text-sm">biltlinx.com/</span>
                  <input value={slug} readOnly aria-label="Public page address" placeholder="your-organisation" className={FIELD_INPUT} />
                </label>
                {slugChecked && (
                  <span className={cn("text-xs font-medium leading-[17px]", slugTaken ? "text-[#dc2626]" : "text-gray-500")}>{slugTaken ? "Taken. Try a different name." : "✓ Available"}</span>
                )}
              </FormField>

              <FormField label="What kind of organisation?">
                <div role="radiogroup" aria-label="Kind of organisation" className="flex flex-wrap gap-2">
                  {ORGANISATION_KINDS.map((option) => (
                    <ChoiceChip key={option} role="radio" label={option} selected={option === kind} onClick={() => setKind(option)} />
                  ))}
                </div>
              </FormField>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Business email" error={emailError}>
                  <label className={cn(FIELD_BOX, emailError ? "border-[#dc2626]" : "border-gray-200")}>
                    <input type="email" value={email} maxLength={80} placeholder="hello@yourcompany.com" onChange={(event) => { setEmail(event.target.value); setEmailError(""); }} className={FIELD_INPUT} />
                  </label>
                </FormField>
                <FormField label="Phone" error={phoneError}>
                  <label className={cn(FIELD_BOX, phoneError ? "border-[#dc2626]" : "border-gray-200")}>
                    <input type="tel" value={phone} maxLength={20} placeholder="+233 30 000 0000" onChange={(event) => { setPhone(event.target.value.replace(/[^\d+ ]/g, "")); setPhoneError(""); }} className={FIELD_INPUT} />
                  </label>
                </FormField>
              </div>

              <FormField label="Head office">
                <label className={cn(FIELD_BOX, "border-gray-200")}>
                  <NavIcon icon="/icons/location-01.svg" size={16} className="shrink-0 bg-gray-500" />
                  <input value={headOffice} maxLength={120} placeholder="Street, area and town" onChange={(event) => setHeadOffice(event.target.value)} className={FIELD_INPUT} />
                </label>
              </FormField>

              <FormField label="About">
                <textarea value={about} maxLength={300} placeholder="What the organisation does and where" onChange={(event) => setAbout(event.target.value)} className="h-[72px] resize-none rounded-[10px] border border-gray-200 bg-white px-3.5 py-3 text-sm leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none" />
              </FormField>

              <div className="flex items-center gap-3 rounded-xl bg-[#f8fafc] p-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eff5ff] text-xs font-bold text-brand-900">{initialsOf(ownerName)}</span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">You&rsquo;ll be the Owner</span>
                  <span className="text-xs leading-[17px] text-gray-500">{ownerName} stays a personal account and becomes Owner / Super Admin of this organisation.</span>
                </span>
              </div>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2.5">
              <p className="flex-1 text-xs leading-[17px] text-gray-500">You can change these details later in Organisation settings.</p>
              <div className="flex gap-2.5">
                <button type="button" onClick={() => router.push("/manage")} className="h-11 rounded-[10px] border border-gray-200 bg-white px-4 text-sm font-medium text-[#0f172a] hover:bg-gray-50">
                  Cancel
                </button>
                <button type="button" onClick={handleContinue} disabled={!canCreate} className="h-11 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}

