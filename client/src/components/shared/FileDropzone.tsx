"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { UploadedFile } from "@/components/shared/DocumentUpload";
import { NavIcon } from "@/components/shared/NavIcon";
import { CREDENTIAL_FILE_MAX_BYTES, CREDENTIAL_FILE_TYPES } from "@/lib/dummy-onboarding";
import { forgetFiles, rememberFile } from "@/lib/onboarding-files";
import { cn } from "@/lib/utils";

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

interface FileDropzoneProps {
  /** The name shown once a file is chosen, such as "Ghana Card, front and back". */
  title: string;
  /** What to drag in, finishing the sentence "Drag and drop your …". */
  dropLabel: string;
  hint: string;
  file: UploadedFile | null;
  onFile: (file: UploadedFile | null) => void;
  slot: string;
}

/** A drag-and-drop document slot (Figma nodes 1291:242374 and 1291:242397): a dashed drop area while empty, a file row with a remove button once chosen. */
export function FileDropzone({ title, dropLabel, hint, file, onFile, slot }: FileDropzoneProps) {
  const input = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

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
    rememberFile(slot, picked);
    onFile({ name: picked.name, size: picked.size });
  }

  function handleRemove() {
    forgetFiles(slot);
    onFile(null);
  }

  return (
    <div className="flex flex-col gap-1 font-inter text-xs leading-4">
      <input ref={input} type="file" accept={CREDENTIAL_FILE_TYPES.join(",")} aria-label={title} className="hidden" onChange={(event) => handlePick(event.target.files?.[0])} />

      {file ? (
        <div className="flex gap-2 rounded-2xl border border-gray-200 bg-[#f8fafc] p-3">
          <Image src="/onboarding-professional/document-pdf.svg" alt="" width={32} height={32} className="shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate font-semibold text-[#0f1621]">{title}</p>
            <p className="text-[#64748a]">
              Uploaded · {file.name} · {formatSize(file.size)}
            </p>
          </div>
          <button type="button" onClick={handleRemove} aria-label={`Remove ${title}`} className="flex size-4 shrink-0 items-center justify-center">
            <Image src="/onboarding-professional/close.svg" alt="" width={16} height={16} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            handlePick(event.dataTransfer.files[0]);
          }}
          className={cn("flex min-h-24 items-center rounded-3xl border border-dashed bg-white p-[26px]", dragging ? "border-brand-900 bg-[#eff5ff]" : "border-[#cbd5e0]")}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" onClick={() => input.current?.click()} className="flex h-6 items-center gap-1.5 rounded-[40px] bg-[#19161d] px-2 py-1 font-normal text-white hover:opacity-90">
              Choose files
              <NavIcon icon="/onboarding-professional/upload-arrow.svg" size={14} className="bg-white" />
            </button>
            <span className="text-[#86888a]">or</span>
            <span className="text-[#19161d]">Drag and drop your {dropLabel}.</span>
          </div>
        </div>
      )}

      {!file && <p className="text-[#53575a]">{hint}</p>}
      {error && <p className="text-[#dc2626]">{error}</p>}
    </div>
  );
}
