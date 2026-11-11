"use client";

import { useState } from "react";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { FormField } from "@/components/shared/ModalFormParts";
import { DateTimeField } from "@/components/shared/ViewingSlotPickers";
import { useRequestVisit } from "@/hooks/useProjects";

interface ProjectVisitModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

/** "Book a site visit" dialog: one preferred day and time and an optional note to the developer. */
export function ProjectVisitModal({ open, onClose, projectId, projectName }: ProjectVisitModalProps) {
  const [when, setWhen] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | undefined>();
  const visit = useRequestVisit(projectId);

  function close() {
    setError(undefined);
    onClose();
  }

  function submit() {
    const date = when.includes("T") ? new Date(when) : null;
    if (!date || Number.isNaN(date.getTime())) {
      setError("Choose a day and a time");
      return;
    }
    if (date.getTime() < Date.now() + 2 * 60 * 60 * 1000) {
      setError("Choose a time at least two hours from now");
      return;
    }
    setError(undefined);
    visit.mutate(
      { preferredAt: date.toISOString(), message: message.trim() || undefined },
      {
        onSuccess: () => {
          setWhen("");
          setMessage("");
          onClose();
        },
      },
    );
  }

  return (
    <CenteredDialog open={open} onClose={close} labelledBy="project-visit-title" className="max-w-[520px]">
      <div className="flex flex-col gap-0.5 border-b border-gray-200 px-5 pb-3 pt-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="project-visit-title" className="text-lg font-bold leading-7 text-[#0f172a] sm:text-xl">
            Book a site visit
          </h2>
          <button type="button" onClick={close} aria-label="Close" className="-mr-1 shrink-0 p-1 text-lg leading-[26px] text-gray-500 hover:text-[#0f172a]">
            ✕
          </button>
        </div>
        <p className="text-[13px] leading-[19px] text-gray-500">{projectName}. The developer confirms a time or suggests another.</p>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6">
        <FormField label="Preferred day and time" error={error}>
          <DateTimeField value={when} onChange={setWhen} />
        </FormField>
        <FormField label="Message to the developer (optional)">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Anything the developer should know before your visit"
            className="resize-none rounded-[10px] border border-gray-200 px-3.5 py-2.5 text-sm leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none"
          />
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-2.5 border-t border-gray-200 bg-[#f8fafc] px-5 py-3 sm:px-6">
        <button type="button" onClick={close} className="h-10 rounded-[10px] border border-gray-200 bg-white px-[18px] text-sm font-medium text-[#0f172a] hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={visit.isPending}
          className="h-10 whitespace-nowrap rounded-[10px] bg-brand-900 px-[18px] text-sm font-medium text-white hover:bg-brand-900/90 disabled:opacity-60"
        >
          {visit.isPending ? "Sending…" : "Send request"}
        </button>
      </div>
    </CenteredDialog>
  );
}
