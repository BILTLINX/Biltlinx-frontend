"use client";

import { useRef, useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { CREDENTIAL_FILE_MAX_BYTES, CREDENTIAL_FILE_TYPES } from "@/lib/dummy-onboarding";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  name: string;
  size: number;
}

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

interface DocumentUploadProps {
  title: string;
  hint: string;
  file: UploadedFile | null;
  onFile: (file: UploadedFile) => void;
}

/** A document slot: dashed while empty, solid with the file's name once something is chosen. Checks type and size itself. */
export function DocumentUpload({ title, hint, file, onFile }: DocumentUploadProps) {
  const input = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");

  function handlePick(picked: File | undefined) {
    if (!picked) return;
    if (!CREDENTIAL_FILE_TYPES.includes(picked.type)) {
      setError("Use a PDF, JPG or PNG file.");
      return;
    }
    if (picked.size > CREDENTIAL_FILE_MAX_BYTES) {
      setError("That file is over 10 MB. Choose a smaller one.");
      return;
    }
    setError("");
    onFile({ name: picked.name, size: picked.size });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className={cn("flex flex-wrap items-center gap-3.5 rounded-xl px-4 py-3.5 sm:flex-nowrap", file ? "border border-gray-200 bg-white" : "border border-dashed border-[#94a3b8] bg-[#f8fafc]")}>
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-[10px]", file ? "bg-[#dcfce7]" : "bg-white")}>
          <NavIcon icon={file ? "/icons/onboarding-file-verified.svg" : "/icons/onboarding-upload.svg"} size={20} className={file ? "bg-[#16a34a]" : "bg-[#334155]"} />
        </span>
        <span className="flex min-w-0 flex-1 basis-40 flex-col gap-0.5 leading-[1.45]">
          <span className="truncate text-sm font-semibold text-[#0f172a]">{file ? file.name : title}</span>
          <span className="text-xs text-gray-500">{file ? `Uploaded · ${formatSize(file.size)}` : hint}</span>
        </span>
        <input ref={input} type="file" accept={CREDENTIAL_FILE_TYPES.join(",")} aria-label={title} className="hidden" onChange={(event) => handlePick(event.target.files?.[0])} />
        {file ? (
          <button type="button" onClick={() => input.current?.click()} className="shrink-0 text-[13px] font-semibold text-brand-900">
            Replace
          </button>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="shrink-0 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
            Upload
          </button>
        )}
      </div>
      {error && <p className="text-xs text-[#dc2626]">{error}</p>}
    </div>
  );
}
