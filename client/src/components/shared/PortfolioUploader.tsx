"use client";

import { useEffect, useRef, useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { PROFILE_PHOTO_MAX_BYTES, PROFILE_PHOTO_TYPES } from "@/lib/dummy-onboarding";

export interface PortfolioImage {
  id: string;
  url: string;
  name: string;
}

interface PortfolioUploaderProps {
  images: PortfolioImage[];
  onChange: (images: PortfolioImage[]) => void;
  max: number;
  addLabel: string;
}

/** A grid of work photos with a tile to add more; each photo can be removed. Checks type and size itself. */
export function PortfolioUploader({ images, onChange, max, addLabel }: PortfolioUploaderProps) {
  const input = useRef<HTMLInputElement | null>(null);
  const urls = useRef<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const created = urls.current;
    return () => created.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const room = max - images.length;
    const accepted: PortfolioImage[] = [];
    let problem = "";
    Array.from(files).forEach((file) => {
      if (!PROFILE_PHOTO_TYPES.includes(file.type)) problem = "Use JPG or PNG images.";
      else if (file.size > PROFILE_PHOTO_MAX_BYTES) problem = "Each image must be under 5 MB.";
      else if (accepted.length < room) {
        const url = URL.createObjectURL(file);
        urls.current.push(url);
        accepted.push({ id: `${file.name}-${file.size}-${file.lastModified}-${accepted.length}`, url, name: file.name });
      }
    });
    if (!problem && files.length > room) problem = `You can add up to ${max} images.`;
    setError(problem);
    onChange([...images, ...accepted]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="relative h-[120px] overflow-hidden rounded-xl bg-[#f1f5f9]">
            {/* eslint-disable-next-line @next/next/no-img-element -- a local object URL, nothing for next/image to optimise */}
            <img src={image.url} alt={image.name} className="size-full object-cover" />
            <button
              type="button"
              aria-label={`Remove ${image.name}`}
              onClick={() => onChange(images.filter((item) => item.id !== image.id))}
              className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-white/90 hover:bg-white"
            >
              <NavIcon icon="/icons/onboarding-cancel.svg" size={10} className="bg-[#0f172a]" />
            </button>
          </div>
        ))}
        {images.length < max && (
          <>
            <input
              ref={input}
              type="file"
              multiple
              accept={PROFILE_PHOTO_TYPES.join(",")}
              aria-label={addLabel}
              className="hidden"
              onChange={(event) => {
                handleFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <button type="button" onClick={() => input.current?.click()} className="flex h-[120px] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#94a3b8] bg-[#f8fafc] text-xs font-semibold text-brand-900 hover:bg-[#f1f5f9]">
              <NavIcon icon="/icons/onboarding-plus.svg" size={16} className="bg-brand-900" />
              {addLabel}
            </button>
          </>
        )}
      </div>
      {error && <p className="text-xs text-[#dc2626]">{error}</p>}
    </div>
  );
}
