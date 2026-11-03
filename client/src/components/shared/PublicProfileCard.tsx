"use client";

import { useRef } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { INTRO_MAX_LENGTH, PROFILE_PHOTO_TYPES } from "@/lib/dummy-onboarding";
import { cn } from "@/lib/utils";

const INPUT = "rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none";
const LOCKED = "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-[#f2f2f2] px-3.5 py-[13px] text-sm leading-[1.45] text-[#86888a]";

/** A detail given at signup: shown here for reference, and changed in account settings. */
function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">{label}</span>
      <span className={LOCKED}>
        <span className="min-w-0 flex-1 truncate">{value}</span>
        <NavIcon icon="/icons/onboarding-check-circle.svg" size={18} className="shrink-0 bg-[#16a34a]" />
      </span>
    </div>
  );
}

interface PublicProfileCardProps {
  photoUrl: string | null;
  onPhoto: (file: File | undefined) => void;
  name: string;
  email: string;
  phone: string;
  location: string;
  onLocation: (value: string) => void;
  headline: string;
  onHeadline: (value: string) => void;
  headlinePlaceholder: string;
  about: string;
  onAbout: (value: string) => void;
  aboutPlaceholder: string;
}

/** The last setup step's main card: photo, the details given at signup, location, headline and short intro. */
export function PublicProfileCard({ photoUrl, onPhoto, name, email, phone, location, onLocation, headline, onHeadline, headlinePlaceholder, about, onAbout, aboutPlaceholder }: PublicProfileCardProps) {
  const photoInput = useRef<HTMLInputElement | null>(null);

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-5">
        <span className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-gray-200 bg-gray-50">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- a local object URL, nothing for next/image to optimise
            <img src={photoUrl} alt="Your profile photo" className="size-full object-cover" />
          ) : (
            <NavIcon icon="/icons/onboarding-camera.svg" size={32} className="bg-brand-900" />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2 leading-[1.45]">
          <p className="text-sm font-semibold text-[#0f172a]">Profile photo</p>
          <p className="text-[13px] text-gray-500">A clear photo of your face. JPG or PNG, up to 5 MB.</p>
          <input
            ref={photoInput}
            type="file"
            accept={PROFILE_PHOTO_TYPES.join(",")}
            aria-label="Upload profile photo"
            className="hidden"
            onChange={(event) => {
              onPhoto(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <button type="button" onClick={() => photoInput.current?.click()} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
            <NavIcon icon="/icons/onboarding-upload.svg" size={18} className="bg-[#0f172a]" />
            {photoUrl ? "Change photo" : "Upload photo"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
          <LockedField label="Full Name" value={name} />
          <LockedField label="Email" value={email} />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
          <LockedField label="Phone Number" value={phone} />
          <label className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Location</span>
            <span className="flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900">
              <NavIcon icon="/icons/location-01.svg" size={18} className="bg-gray-500" />
              <input value={location} maxLength={80} placeholder="East Legon, Accra" onChange={(event) => onLocation(event.target.value)} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
            </span>
          </label>
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Headline</span>
        <input value={headline} maxLength={80} placeholder={headlinePlaceholder} onChange={(event) => onHeadline(event.target.value)} className={INPUT} />
        <span className="text-xs leading-[1.45] text-gray-500">Shown under your name everywhere on Biltlinx</span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 leading-[1.45]">
          <span className="text-[13px] font-medium text-[#334155]">Short intro</span>
          <span className="text-xs text-[#94a3b8]">Optional</span>
        </span>
        <textarea value={about} maxLength={INTRO_MAX_LENGTH} rows={3} placeholder={aboutPlaceholder} onChange={(event) => onAbout(event.target.value)} className={cn(INPUT, "h-[88px] resize-none")} />
        <span className="text-xs leading-[1.45] text-gray-500">
          {about.length} / {INTRO_MAX_LENGTH} characters
        </span>
      </label>
    </section>
  );
}
