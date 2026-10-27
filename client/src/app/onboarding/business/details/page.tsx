"use client";

import { useAccountPrefill, usePrefilledState } from "@/hooks/useAccountPrefill";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { comingSoonHref } from "@/lib/coming-soon";
import { BUSINESS_CATEGORIES, BUSINESS_HOURS, BUSINESS_STEPS, BUSINESS_TYPES, LOGO_MIN_SIZE, PROFILE_PHOTO_MAX_BYTES, PROFILE_PHOTO_TYPES } from "@/lib/dummy-onboarding";
import { initialsOf } from "@/lib/initials";
import { loadBusinessDraft, updateBusinessDraft } from "@/lib/onboarding-draft";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6";
const INPUT = "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900";
/** What step 1 earned when nothing was saved. */
const DEFAULT_STRENGTH = 25;

/** "Mon–Sat, 7:30 am – 5:30 pm" becomes "Mon–Sat, 7:30am–5:30pm". */
function compactHours(hours: string) {
  return hours.replace(/ (am|pm)/g, "$1").replace(" – ", "–");
}

/** The street or area before the first comma or "near", e.g. "Spintex Road". */
function placeOf(address: string) {
  return address.split(/,| near /i)[0].trim();
}

/** Loads a picked image just far enough to read its size. */
function readSize(url: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = url;
  });
}

/** Onboarding · Business · 2 Business details (Figma node 1073:31885): the public page's name, contacts and location. */
export default function BusinessDetailsPage() {
  const router = useRouter();
  const logoInput = useRef<HTMLInputElement | null>(null);
  const logoUrl = useRef<string | null>(null);
  const [typeId, setTypeId] = useState("supplies");
  const [typeCategory, setTypeCategory] = useState(BUSINESS_TYPES[1].category);
  const [baseStrength, setBaseStrength] = useState(DEFAULT_STRENGTH);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoError, setLogoError] = useState("");
  const [name, setName] = useState("Your business");
  const [category, setCategory] = useState(BUSINESS_TYPES[1].category);
  const account = useAccountPrefill();
  const [phone, setPhone] = usePrefilledState(account.phone);
  const [email, setEmail] = usePrefilledState(account.email);
  const [address, setAddress] = usePrefilledState(account.location);
  const [gps, setGps] = useState("");
  const [hours, setHours] = useState(BUSINESS_HOURS[1]);
  const [error, setError] = useState("");

  // Step 1's choice lives in the tab session, so it is read after mount.
  useEffect(() => {
    const draft = loadBusinessDraft();
    if (!draft) return;
    const type = BUSINESS_TYPES.find((option) => option.id === draft.typeId);
    setTypeId(draft.typeId);
    if (type) {
      setTypeCategory(type.category);
      setCategory(BUSINESS_CATEGORIES.includes(type.category) ? type.category : "Other");
    }
    setBaseStrength(draft.strength ?? DEFAULT_STRENGTH);
  }, []);

  useEffect(
    () => () => {
      if (logoUrl.current) URL.revokeObjectURL(logoUrl.current);
    },
    [],
  );

  async function handleLogo(file: File | undefined) {
    if (!file) return;
    if (!PROFILE_PHOTO_TYPES.includes(file.type)) return setLogoError("Use a JPG or PNG image.");
    if (file.size > PROFILE_PHOTO_MAX_BYTES) return setLogoError("That image is over 5 MB. Choose a smaller one.");
    const url = URL.createObjectURL(file);
    try {
      const { width, height } = await readSize(url);
      if (width < LOGO_MIN_SIZE || height < LOGO_MIN_SIZE) {
        URL.revokeObjectURL(url);
        return setLogoError(`The image is ${width} × ${height} px. Use one at least ${LOGO_MIN_SIZE} × ${LOGO_MIN_SIZE} px.`);
      }
    } catch {
      URL.revokeObjectURL(url);
      return setLogoError("We could not read that image. Try another one.");
    }
    if (logoUrl.current) URL.revokeObjectURL(logoUrl.current);
    logoUrl.current = url;
    setLogoError("");
    setLogo(url);
  }

  const place = placeOf(address) || "your area";
  const strength = Math.min(100, baseStrength + (name.trim() && category ? 10 : 0) + (phone.trim() || email.trim() ? 5 : 0) + (address.trim() ? 10 : 0));

  function handleContinue() {
    if (!name.trim()) {
      setError("Enter your business name to continue.");
      return;
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("That email address does not look right.");
      return;
    }
    updateBusinessDraft({ strength, details: { name: name.trim(), category, place, hours: compactHours(hours) } });
    router.push("/onboarding/business/verification");
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
              current={1}
              note="Your personal account stays separate. You manage the business from Manage once it is set up."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 2 of 3</p>
              <h1 className="text-[28px] font-bold text-[#0f172a]">Tell customers about your business</h1>
              <p className="text-[15px] text-gray-500">This is your public business page. Use the name customers know you by.</p>
            </div>

            <section className={CARD}>
              <div className="flex items-center gap-4">
                <span className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#eff5ff] text-[22px] font-bold text-brand-900">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- a local object URL, nothing for next/image to optimise
                    <img src={logo} alt="Your business logo" className="size-full object-cover" />
                  ) : (
                    initialsOf(name)
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 leading-[1.45]">
                  <p className="text-sm font-semibold text-[#0f172a]">Business logo</p>
                  <p className="text-[13px] text-gray-500">Square image, at least {LOGO_MIN_SIZE} × {LOGO_MIN_SIZE} px.</p>
                  {logoError && <p className="text-xs text-[#dc2626]">{logoError}</p>}
                </div>
                <input ref={logoInput} type="file" accept={PROFILE_PHOTO_TYPES.join(",")} aria-label="Upload business logo" className="hidden" onChange={(event) => { handleLogo(event.target.files?.[0]); event.target.value = ""; }} />
                <button type="button" onClick={() => logoInput.current?.click()} className="shrink-0 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                  {logo ? "Change" : "Upload"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Business name</span>
                  <span className={INPUT}>
                    <input value={name} maxLength={80} aria-invalid={error.startsWith("Enter")} onChange={(event) => { setName(event.target.value); setError(""); }} className="min-w-0 flex-1 bg-transparent focus:outline-none" />
                    {name.trim() && <NavIcon icon="/icons/onboarding-check-circle.svg" size={18} className="bg-[#16a34a]" />}
                  </span>
                </label>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Category</span>
                  <OptionSelectField value={category} options={BUSINESS_CATEGORIES} onChange={setCategory} />
                </div>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Business phone</span>
                  <span className={INPUT}>
                    <NavIcon icon="/icons/onboarding-phone.svg" size={18} className="bg-gray-500" />
                    <input value={phone} type="tel" maxLength={20} placeholder="+233 30 296 1144" onChange={(event) => setPhone(event.target.value)} disabled={Boolean(account.phone)} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none disabled:cursor-not-allowed disabled:text-gray-500" />
                  </span>
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Business email</span>
                  <span className={INPUT}>
                    <NavIcon icon="/icons/onboarding-mail.svg" size={18} className="bg-gray-500" />
                    <input value={email} type="email" maxLength={80} placeholder="sales@adomsupplies.com.gh" onChange={(event) => { setEmail(event.target.value); setError(""); }} disabled={Boolean(account.email)} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none disabled:cursor-not-allowed disabled:text-gray-500" />
                  </span>
                </label>
              </div>
            </section>

            <section className={CARD}>
              <h2 className="text-base font-bold leading-[1.45] text-[#0f172a]">Where customers find you</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Address</span>
                  <span className={cn(INPUT, "items-start")}>
                    <NavIcon icon="/icons/location-01.svg" size={18} className="mt-0.5 bg-gray-500" />
                    <input value={address} maxLength={120} placeholder="Spintex Road, near Coca-Cola roundabout" onChange={(event) => setAddress(event.target.value)} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                  </span>
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 leading-[1.45]">
                    <span className="text-[13px] font-medium text-[#334155]">GhanaPost GPS</span>
                    <span className="text-xs text-[#94a3b8]">Optional</span>
                  </span>
                  <span className={INPUT}>
                    <input value={gps} maxLength={14} placeholder="GA-145-2231" onChange={(event) => setGps(event.target.value.toUpperCase())} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                  </span>
                </label>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Opening hours</span>
                <OptionSelectField value={hours} options={BUSINESS_HOURS} onChange={setHours} icon="/icons/onboarding-clock.svg" />
              </div>
            </section>

            {error && <p className="text-sm text-[#dc2626]">{error}</p>}

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding/business")} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Back
              </button>
              <button type="button" onClick={handleContinue} className="flex items-center gap-2 rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                Continue
                <NavIcon icon="/icons/onboarding-arrow-right.svg" size={10} className="bg-white" />
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
                  <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border-[3px] border-white bg-[#eff5ff] text-lg font-bold text-brand-900">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- a local object URL, nothing for next/image to optimise
                      <img src={logo} alt="" className="size-full object-cover" />
                    ) : (
                      initialsOf(name)
                    )}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                    <p className="truncate text-base font-bold text-[#0f172a]">{name.trim() || "Your business"}</p>
                    <p className="truncate text-[13px] text-gray-500">
                      {category} · {place}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-gray-500">Not verified yet</span>
                </div>
                <dl className="flex flex-col gap-2 text-[13px] leading-[1.45]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Open</dt>
                    <dd className="text-right font-semibold text-[#0f172a]">{compactHours(hours)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">{BUSINESS_TYPES.find((type) => type.category === typeCategory)?.offers ?? "Products"}</dt>
                    <dd className="font-semibold text-[#94a3b8]">None yet</dd>
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
          </aside>
        </div>
      </div>
    </div>
  );
}
