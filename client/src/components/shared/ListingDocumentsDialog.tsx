"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { ApiError } from "@/lib/api";
import { notifyError } from "@/lib/errors";
import { attachDocument, getDocumentUrl, getPropertyDocuments, removeDocument, requestDocumentUpload } from "@/lib/properties-api";
import { cn } from "@/lib/utils";

const KINDS = [
  { value: "FloorPlan", label: "Floor plan", isPublic: true },
  { value: "SitePlan", label: "Site plan", isPublic: true },
  { value: "Brochure", label: "Brochure", isPublic: true },
  { value: "TitleDeed", label: "Title deed", isPublic: false },
  { value: "SurveyPlan", label: "Survey plan", isPublic: false },
  { value: "Other", label: "Other", isPublic: false },
] as const;

const ACCEPT = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

function putFile(url: string, file: File) {
  return fetch(url, { method: "PUT", headers: { "Content-Type": file.type }, body: file }).then((response) => {
    if (!response.ok) throw new ApiError("The upload failed. Please try again.", response.status);
  });
}

export function ListingDocumentsDialog({ propertyId, title, onClose }: { propertyId: string | null; title: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const input = useRef<HTMLInputElement | null>(null);
  const [kind, setKind] = useState<(typeof KINDS)[number]["value"]>("TitleDeed");
  const open = propertyId !== null;

  const documents = useQuery({
    queryKey: ["properties", "documents", propertyId],
    queryFn: () => getPropertyDocuments(propertyId as string),
    enabled: open,
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      if (!ACCEPT.includes(file.type)) throw new ApiError("Use a PDF, JPEG, PNG or WebP file.", 400);
      if (file.size > MAX_BYTES) throw new ApiError("Documents must be 10 MB or smaller.", 400);
      const ticket = await requestDocumentUpload(propertyId as string, { kind, contentType: file.type, sizeBytes: file.size });
      await putFile(ticket.uploadUrl as string, file);
      await attachDocument(propertyId as string, { kind, path: ticket.path, contentType: file.type, name: file.name });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["properties", "documents", propertyId] });
      showSuccessToast("Document added");
    },
    onError: (error) => notifyError(error, "The document could not be uploaded."),
  });

  const remove = useMutation({
    mutationFn: (documentId: string) => removeDocument(propertyId as string, documentId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["properties", "documents", propertyId] }),
    onError: (error) => notifyError(error),
  });

  async function view(documentId: string, url: string | null) {
    try {
      const link = url ? { url } : await getDocumentUrl(propertyId as string, documentId);
      if (link.url) window.open(link.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      notifyError(error);
    }
  }

  const selected = KINDS.find((item) => item.value === kind) ?? KINDS[0];

  return (
    <CenteredDialog open={open} onClose={onClose} labelledBy="listing-docs-title" className="max-w-[520px]">
      <div className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="listing-docs-title" className="text-lg font-bold text-[#0f172a]">
            Documents
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-lg text-gray-500 hover:text-[#0f172a]">
            ✕
          </button>
        </div>
        <p className="truncate text-sm text-gray-500">{title}</p>

        {documents.isPending && <p className="text-sm text-gray-500">Loading…</p>}
        {(documents.data ?? []).map((document) => (
          <div key={document.id} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-semibold text-[#0f172a]">{document.fileName ?? document.kind}</span>
              <span className="text-xs text-gray-500">
                {document.kind} · {document.isPublic ? "Public" : "Private"}
              </span>
            </div>
            <button type="button" onClick={() => void view(document.id, document.url)} className="text-[13px] font-medium text-brand-900">
              View
            </button>
            <button type="button" onClick={() => remove.mutate(document.id)} className="text-[13px] font-medium text-[#dc2626]">
              Remove
            </button>
          </div>
        ))}
        {documents.data?.length === 0 && <p className="text-sm text-gray-500">No documents yet.</p>}

        <div className="flex flex-col gap-2 rounded-xl bg-[#f8fafc] p-3.5">
          <p className="text-[13px] font-semibold text-[#0f172a]">Add a document</p>
          <div role="radiogroup" aria-label="Document type" className="flex flex-wrap gap-2">
            {KINDS.map((item) => (
              <button
                key={item.value}
                type="button"
                role="radio"
                aria-checked={kind === item.value}
                onClick={() => setKind(item.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[12px] font-medium",
                  kind === item.value ? "border-brand-900 bg-[#eff5ff] text-brand-900" : "border-gray-200 bg-white text-[#334155]",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {selected.isPublic ? "Visible to everyone who views the listing." : "Private. Only you, your team and Biltlinx reviewers can see it."}
          </p>
          <input
            ref={input}
            type="file"
            accept={ACCEPT.join(",")}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) upload.mutate(file);
            }}
          />
          <button
            type="button"
            disabled={upload.isPending}
            onClick={() => input.current?.click()}
            className="h-10 self-start rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white hover:bg-brand-900/90 disabled:opacity-60"
          >
            {upload.isPending ? "Uploading…" : "Choose file"}
          </button>
        </div>
      </div>
    </CenteredDialog>
  );
}
