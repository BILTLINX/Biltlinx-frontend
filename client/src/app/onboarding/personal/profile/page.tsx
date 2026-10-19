"use client";

import { useSession } from "@/context/SessionContext";
import { useDisplayName } from "@/hooks/useDisplayName";
import { formatDate } from "@/lib/format";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { Switch } from "@/components/shared/SettingsParts";
import { INTRO_EXAMPLE, INTRO_MAX_LENGTH, PERSONAL_INTERESTS, PERSONAL_STEPS, PROFILE_PHOTO_MAX_BYTES, PROFILE_PHOTO_TYPES } from "@/lib/dummy-onboarding";
import { loadPersonalDraft, updatePersonalDraft } from "@/lib/onboarding-draft";
import { initialsOf } from "@/lib/initials";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6";
const INPUT = "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900";

/** Each finished part adds a fifth to the profile; phone and interests are already done by this step. */
function profileStrength({ name, photo, intro }: { name: string; photo: boolean; intro: string }) {
  const done = [true, true, name.trim().length > 0, photo, intro.trim().length > 0];
  return (done.filter(Boolean).length / done.length) * 100;
}

function ContactRow({ icon, title, note, checked, onToggle }: { icon: string; title: string; note: string; checked: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f1f5f9]">
        <NavIcon icon={icon} size={18} className="bg-[#334155]" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col leading-[1.45]">
        <p className="text-sm font-semibold text-[#0f172a]">{title}</p>
        <p className="text-xs text-gray-500">{note}</p>
      </div>
      <Switch checked={checked} label={title} onToggle={onToggle} />
    </div>
  );
}

/** Onboarding · Personal · 2 Profile (Figma node 1069:31382): optional photo, intro and how to be reached. */
export default function PersonalProfilePage() {
  const accountName = useDisplayName();
  const { user } = useSession();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(accountName);
  const [location, setLocation] = useState("");
  const [intro, setIntro] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [whatsapp, setWhatsapp] = useState(true);
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(false);
  const [lookingFor, setLookingFor] = useState("");

  // Earlier choices live in the tab session, so they are read after mount.
  useEffect(() => {
    const draft = loadPersonalDraft();
    if (!draft) return;
    setLookingFor(PERSONAL_INTERESTS.filter((interest) => draft.interests.includes(interest.id)).map((interest) => interest.short).join(" · "));
    if (draft.areas[0]) setLocation(`${draft.areas[0]}, Accra`);
  }, []);

  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
  }, [photoUrl]);

  function handlePhoto(file: File | undefined) {
    if (!file) return;
    if (!PROFILE_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Use a JPG or PNG photo.");
      return;
    }
    if (file.size > PROFILE_PHOTO_MAX_BYTES) {
      setPhotoError("That photo is over 5 MB. Choose a smaller one.");
      return;
    }
    setPhotoError("");
    setPhotoUrl(URL.createObjectURL(file));
  }

  function finish() {
    updatePersonalDraft({ displayName: name.trim(), strength });
    router.push("/onboarding/personal/done");
  }

  const strength = profileStrength({ name, photo: photoUrl !== null, intro });

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar title="Setting up your personal account" actionLabel="Save and finish later" onAction={() => router.push("/home")} />

      <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pb-12 pt-8 sm:px-12 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:gap-8">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <OnboardingStepper title="Personal setup" duration="About 1 minute" icon="/icons/onboarding-user.svg" steps={PERSONAL_STEPS} current={1} />
        </div>

        <main className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-1.5 leading-[1.45]">
            <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 2 of 2 · Optional</p>
            <h1 className="text-[28px] font-bold text-[#0f172a]">Add a photo and a short intro</h1>
            <p className="text-[15px] text-gray-500">Optional, but landlords and providers reply faster when they can see who they are talking to.</p>
          </div>

          <section className={CARD}>
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <button
                type="button"
                aria-label="Choose a profile photo"
                onClick={() => fileInput.current?.click()}
                className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-[#94a3b8] bg-[#f1f5f9]"
              >
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a local object URL, nothing for next/image to optimise
                  <img src={photoUrl} alt="Your profile photo" className="size-full object-cover" />
                ) : (
                  <NavIcon icon="/icons/onboarding-camera.svg" size={32} className="bg-[#64748b]" />
                )}
              </button>
              <div className="flex min-w-0 flex-1 flex-col items-start gap-2 leading-[1.45]">
                <p className="text-sm font-semibold text-[#0f172a]">Profile photo</p>
                <p className="text-[13px] text-gray-500">A clear photo of your face. JPG or PNG, up to 5 MB.</p>
                <input ref={fileInput} type="file" accept={PROFILE_PHOTO_TYPES.join(",")} className="hidden" aria-label="Upload profile photo" onChange={(event) => handlePhoto(event.target.files?.[0])} />
                <button type="button" onClick={() => fileInput.current?.click()} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                  <NavIcon icon="/icons/onboarding-upload.svg" size={18} className="bg-[#0f172a]" />
                  {photoUrl ? "Change photo" : "Upload photo"}
                </button>
                {photoError && <p className="text-xs text-[#dc2626]">{photoError}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Display name</span>
                <span className={INPUT}>
                  <input value={name} maxLength={60} onChange={(event) => setName(event.target.value)} className="min-w-0 flex-1 bg-transparent focus:outline-none" />
                  {name.trim() && <NavIcon icon="/icons/onboarding-check-circle.svg" size={18} className="bg-[#16a34a]" />}
                </span>
              </label>
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Location</span>
                <span className={INPUT}>
                  <NavIcon icon="/icons/location-01.svg" size={18} className="bg-gray-500" />
                  <input value={location} maxLength={60} placeholder="East Legon, Accra" onChange={(event) => setLocation(event.target.value)} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                </span>
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 leading-[1.45]">
                <span className="text-[13px] font-medium text-[#334155]">Short intro</span>
                <span className="text-xs text-[#94a3b8]">Optional</span>
              </span>
              <textarea
                value={intro}
                maxLength={INTRO_MAX_LENGTH}
                rows={3}
                placeholder={INTRO_EXAMPLE}
                onChange={(event) => setIntro(event.target.value)}
                className={cn(INPUT, "h-24 resize-none items-start placeholder:text-[#94a3b8] focus:outline-none")}
              />
              <span className="text-xs leading-[1.45] text-gray-500">
                {intro.length} / {INTRO_MAX_LENGTH} characters
              </span>
            </label>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex flex-col gap-1 leading-[1.45]">
              <h2 className="text-base font-bold text-[#0f172a]">How should we reach you?</h2>
              <p className="text-[13px] text-gray-500">Messages about viewings, bookings and quotes.</p>
            </div>
            <ContactRow icon="/icons/onboarding-phone.svg" title={`WhatsApp · ${user?.primaryContact ?? ""}`} note="Verified at sign up" checked={whatsapp} onToggle={() => setWhatsapp(!whatsapp)} />
            <ContactRow icon="/icons/onboarding-mail.svg" title="Email" note={user?.otherContact ?? user?.accounts[0]?.email ?? ""} checked={email} onToggle={() => setEmail(!email)} />
            <ContactRow icon="/icons/onboarding-flash.svg" title="Push notifications" note="On this browser" checked={push} onToggle={() => setPush(!push)} />
          </section>

          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => router.push("/onboarding/personal")} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
              <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <button type="button" onClick={finish} className="whitespace-nowrap rounded-[10px] px-5 py-3 text-sm font-semibold text-brand-900">
                Skip for now
              </button>
              <button type="button" onClick={finish} className="flex items-center gap-2 whitespace-nowrap rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                Finish setup
                <NavIcon icon="/icons/onboarding-arrow-right.svg" size={10} className="bg-white" />
              </button>
            </div>
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
                <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-[#eff5ff] text-lg font-bold text-brand-900">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- a local object URL, nothing for next/image to optimise
                    <img src={photoUrl} alt="" className="size-full object-cover" />
                  ) : (
                    initialsOf(name)
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                  <p className="truncate text-base font-bold text-[#0f172a]">{name.trim() || "Your name"}</p>
                  <p className="truncate text-[13px] text-gray-500">
                    {location.trim() ? `${location.trim()} · ` : ""}Joined {user ? formatDate(user.createdAt) : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-[#16a34a]">Phone verified</span>
                <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-gray-500">ID not verified yet</span>
              </div>
              {intro.trim() && <p className="text-[13px] leading-[1.45] text-[#334155]">{intro.trim()}</p>}
              <dl className="flex flex-col gap-2 text-[13px] leading-[1.45]">
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500">Looking for</dt>
                  <dd className="text-right font-semibold text-[#0f172a]">{lookingFor || "Not set"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500">Member of</dt>
                  <dd className="font-semibold text-[#94a3b8]">0 communities</dd>
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
