"use client";

import { useRef, useState } from "react";
import { FormField } from "@/components/shared/ModalFormParts";
import { SelectField } from "@/components/shared/SelectField";
import { showErrorToast } from "@/components/shared/AppToast";
import { evidenceFileError, type PendingDocument } from "@/lib/verification-api";

interface ListingDocumentsFieldProps {
  label: string;
  hint: string;
  options: { value: string; label: string }[];
  documents: PendingDocument[];
  onChange: (documents: PendingDocument[]) => void;
}

/** Pick proof for a listing (ownership, licence, certificate). Files are held until the listing exists, then sent for review. */
export function ListingDocumentsField({ label, hint, options, documents, onChange }: ListingDocumentsFieldProps) {
  const input = useRef<HTMLInputElement | null>(null);
  const [classification, setClassification] = useState(options[0]?.value ?? "Other");

  function add(files: FileList | null) {
    const accepted: PendingDocument[] = [];
    for (const file of Array.from(files ?? [])) {
      const problem = evidenceFileError(file);
      if (problem) showErrorToast(problem);
      else accepted.push({ id: `${file.name}-${file.size}-${file.lastModified}`, file, classification });
    }
    if (accepted.length > 0) onChange([...documents, ...accepted.filter((item) => !documents.some((existing) => existing.id === item.id))]);
  }

  return (
    <FormField label={label}>
      <input
        ref={input}
        type="file"
        multiple
        accept="application/pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          add(event.target.files);
          event.target.value = "";
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        {options.length > 1 && <SelectField value={classification} onChange={setClassification} aria-label="Document type" options={options} className="h-10 w-48 rounded-[10px]" />}
        <button type="button" onClick={() => input.current?.click()} className="h-10 rounded-[10px] border border-dashed border-[#cbd5e1] px-4 text-[13px] font-medium text-[#334155] hover:bg-gray-50">
          + Upload document
        </button>
        {documents.map((document) => (
          <span key={document.id} className="flex h-8 max-w-[220px] items-center gap-1.5 rounded-full bg-[#eff5ff] pl-3 pr-1.5 text-xs font-medium text-brand-900">
            <span className="truncate">{document.file.name}</span>
            <button type="button" aria-label={`Remove ${document.file.name}`} onClick={() => onChange(documents.filter((item) => item.id !== document.id))} className="flex size-5 shrink-0 items-center justify-center rounded-full hover:bg-white">
              ×
            </button>
          </span>
        ))}
      </div>
      <span className="text-xs leading-[17px] text-gray-500">{hint}</span>
    </FormField>
  );
}
