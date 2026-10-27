"use client";

import { useSession } from "@/context/SessionContext";
import { useDisplayName } from "@/hooks/useDisplayName";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingProfilePreview } from "@/components/shared/OnboardingProfilePreview";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { Switch } from "@/components/shared/SettingsParts";
import { INTRO_EXAMPLE, INTRO_MAX_LENGTH, PERSONAL_STEPS, PROFILE_PHOTO_MAX_BYTES, PROFILE_PHOTO_TYPES } from "@/lib/dummy-onboarding";
import { loadPersonalDraft, updatePersonalDraft } from "@/lib/onboarding-draft";
import { forgetFiles, recallFile, rememberFile } from "@/lib/onboarding-files";
import { updateProfile } from "@/lib/account-api";
import { notifyError } from "@/lib/errors";
import { uploadMedia } from "@/lib/upload";
import { cn } from "@/lib/utils";

const PHOTO_SLOT = "personal:photo";
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
  const { user, refresh } = useSession();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [typedName, setName] = useState("");
  // The name given at signup is fixed here; it can be changed later in account settings.
  const name = accountName || typedName;
  const [location, setLocation] = useState(user?.location ?? "");
  const [intro, setIntro] = useState(user?.bio ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [whatsapp, setWhatsapp] = useState(true);
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(false);
  const [interestsDone, setInterestsDone] = useState(false);
  const [placeDone, setPlaceDone] = useState(false);

  // Earlier choices live in the tab session, so they are read after mount.
  useEffect(() => {
    const draft = loadPersonalDraft();
    if (!draft) return;
    setInterestsDone(draft.interests.length > 0);
    setPlaceDone(draft.areas.length > 0 || Boolean(draft.location));
    if (draft.displayName) setName(draft.displayName);
    if (draft.location !== undefined) setLocation(draft.location);
    else if (draft.areas[0] && !user?.location) setLocation(`${draft.areas[0]}, Accra`);
    if (draft.intro !== undefined) setIntro(draft.intro);
    if (draft.contact) {
      setWhatsapp(draft.contact.whatsapp);
      setEmail(draft.contact.email);
      setPush(draft.contact.push);
    }
    const saved = recallFile(PHOTO_SLOT);
    if (saved) setPhotoUrl(URL.createObjectURL(saved));
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
    rememberFile(PHOTO_SLOT, file);
    setPhotoUrl(URL.createObjectURL(file));
  }

  function saveProfile() {
    updatePersonalDraft({ displayName: name.trim(), strength, location, intro, contact: { whatsapp, email, push } });
  }

  async function persist(destination: string) {
    saveProfile();
    setSaving(true);
    try {
      const file = recallFile(PHOTO_SLOT);
      const uploaded = file ? await uploadMedia(file, { allowVideo: false }) : null;
      await updateProfile({ displayName: name.trim(), bio: intro, location, ...(uploaded ? { photoPath: uploaded.path } : {}) });
      if (file) forgetFiles(PHOTO_SLOT);
      await refresh();
      router.push(destination);
    } catch (error) {
      notifyError(error, "Your profile could not be saved. Please try again.");
      setSaving(false);
    }
  }

  function finish() {
    void persist("/onboarding/personal/done");
  }

  function back() {
    saveProfile();
    router.push("/onboarding/personal/location");
  }

  const shownPhoto = photoUrl ?? user?.profilePicUrl ?? null;
  const strength = profileStrength({ name, photo: shownPhoto !== null, intro });

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar actionLabel="Save and finish later" actionIcon="bookmark" onAction={() => void persist("/home")} />

      <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pb-12 pt-8 sm:px-12 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:gap-8">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <OnboardingStepper title="Personal setup" duration="About 1 minute" icon="/icons/onboarding-user.svg" steps={PERSONAL_STEPS} current={2} />
        </div>

        <main className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-1.5 leading-[1.45]">
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
                {shownPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a local object URL, nothing for next/image to optimise
                  <img src={shownPhoto} alt="Your profile photo" className="size-full object-cover" />
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
                  {shownPhoto ? "Change photo" : "Upload photo"}
                </button>
                {photoError && <p className="text-xs text-[#dc2626]">{photoError}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Display name</span>
                <span className={INPUT}>
                  <input value={name} maxLength={60} onChange={(event) => setName(event.target.value)} disabled={Boolean(accountName)} className="min-w-0 flex-1 bg-transparent focus:outline-none disabled:cursor-not-allowed disabled:text-gray-500" />
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
            <button type="button" onClick={back} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
              <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <button type="button" disabled={saving} onClick={finish} className="flex items-center gap-2 whitespace-nowrap rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                {saving ? "Saving…" : "Finish setup"}
                <NavIcon icon="/icons/onboarding-arrow-right.svg" size={10} className="bg-white" />
              </button>
            </div>
          </div>
        </main>

        <aside className="lg:col-start-2 xl:sticky xl:top-8 xl:col-start-3 xl:self-start">
          <OnboardingProfilePreview
            done={{ interests: interestsDone, location: placeDone || location.trim() !== "", profile: name.trim() !== "" && (shownPhoto !== null || intro.trim() !== "") }}
            name={name}
            photoUrl={shownPhoto}
          />
        </aside>
      </div>
      </div>
    </div>
  );
}
