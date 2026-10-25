"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { useMyProperties } from "@/hooks/useProperties";
import { notifyError } from "@/lib/errors";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  CLASSIFICATION_LABEL,
  getEvidenceUrl,
  respondToVerification,
  submitVerification,
  uploadEvidence,
  VERIFICATION_TYPES,
  type VerificationType,
} from "@/lib/verification-api";
import type { EvidenceRequest, VerificationDto } from "@/types/api/schema";
import { cn } from "@/lib/utils";

const RESUBMITTABLE = ["Rejected", "Expired", "Revoked"];
const FIELD = "h-10 rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] text-[#0f172a] focus:border-brand-900 focus:outline-none";

function EvidencePicker({ classifications, items, onChange }: { classifications: readonly string[]; items: EvidenceRequest[]; onChange: (items: EvidenceRequest[]) => void }) {
  const input = useRef<HTMLInputElement | null>(null);
  const [classification, setClassification] = useState<string>(classifications[0]);
  const upload = useMutation({
    mutationFn: (file: File) => uploadEvidence(file, classification),
    onSuccess: (item) => onChange([...items, item]),
    onError: (error) => notifyError(error, "The file could not be uploaded."),
  });

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-[#f8fafc] p-3.5">
      <p className="text-[13px] font-semibold text-[#0f172a]">Evidence</p>
      {items.map((item) => (
        <div key={item.path} className="flex items-center gap-2 text-[13px] text-[#334155]">
          <span className="min-w-0 flex-1 truncate">{item.name}</span>
          <span className="shrink-0 text-xs text-gray-500">{CLASSIFICATION_LABEL[item.classification ?? ""] ?? item.classification}</span>
          <button type="button" onClick={() => onChange(items.filter((other) => other.path !== item.path))} className="shrink-0 font-medium text-[#dc2626]">
            Remove
          </button>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <select value={classification} onChange={(event) => setClassification(event.target.value)} aria-label="Document type" className={FIELD}>
          {classifications.map((value) => (
            <option key={value} value={value}>
              {CLASSIFICATION_LABEL[value] ?? value}
            </option>
          ))}
        </select>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
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
          className="h-10 rounded-[10px] border border-gray-200 bg-white px-4 text-sm font-medium text-[#0f172a] hover:bg-gray-50 disabled:opacity-60"
        >
          {upload.isPending ? "Uploading…" : "Add file"}
        </button>
      </div>
      <p className="text-xs text-gray-500">JPEG, PNG, WebP or PDF, up to 10 MB each. Files are private and only reviewers can open them.</p>
    </div>
  );
}

interface VerificationDialogProps {
  type: VerificationType | null;
  verification: VerificationDto | null;
  onClose: () => void;
}

/** Start, follow or answer a verification case. */
export function VerificationDialog({ type, verification, onClose }: VerificationDialogProps) {
  const queryClient = useQueryClient();
  const config = VERIFICATION_TYPES.find((item) => item.type === type);
  const [evidence, setEvidence] = useState<EvidenceRequest[]>([]);
  const [declared, setDeclared] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const properties = useMyProperties({}, type === "PropertyAuthority");

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["verifications"] });
    void queryClient.invalidateQueries({ queryKey: ["action-needed"] });
    void queryClient.invalidateQueries({ queryKey: ["me"] });
  };

  const submit = useMutation({
    mutationFn: () =>
      submitVerification({
        type: type as string,
        subjectId: type === "PropertyAuthority" ? subjectId : undefined,
        title: title.trim() || undefined,
        declarationAccepted: declared,
        evidence,
      }),
    onSuccess: () => {
      refresh();
      showSuccessToast("Submitted. A reviewer will look at it soon.");
      setEvidence([]);
      setDeclared(false);
      onClose();
    },
    onError: (error) => notifyError(error, "The verification could not be submitted."),
  });

  const respond = useMutation({
    mutationFn: () => respondToVerification(verification?.id as string, { message: message.trim(), evidence }),
    onSuccess: () => {
      refresh();
      showSuccessToast("Your answer was sent.");
      setEvidence([]);
      setMessage("");
      onClose();
    },
    onError: (error) => notifyError(error),
  });

  async function openEvidence(evidenceId: string) {
    try {
      const link = await getEvidenceUrl(verification?.id as string, evidenceId);
      if (link.url) window.open(link.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      notifyError(error);
    }
  }

  if (!config) return null;
  const status = verification?.status ?? null;
  const canStart = !verification || RESUBMITTABLE.includes(status ?? "");
  const needsInfo = status === "MoreInformationRequired";
  const propertyOptions = properties.items;
  const ready = declared && evidence.length > 0 && (type !== "PropertyAuthority" || subjectId !== "");

  return (
    <CenteredDialog open onClose={onClose} labelledBy="verification-title" className="max-w-[560px]">
      <div className="flex max-h-[85vh] flex-col gap-4 overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="verification-title" className="text-lg font-bold text-[#0f172a]">
              {config.title} verification
            </h2>
            <p className="text-sm text-gray-500">{config.description}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-lg text-gray-500 hover:text-[#0f172a]">
            ✕
          </button>
        </div>

        {verification && (
          <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3.5">
            <p className="text-sm font-semibold text-[#0f172a]">
              Status: {status}
              {verification.expiresAt && status === "Verified" ? ` · valid until ${formatDate(verification.expiresAt)}` : ""}
            </p>
            {verification.reviewNote && <p className="rounded-lg bg-[#fffbeb] p-3 text-[13px] text-[#334155]">{verification.reviewNote}</p>}
            <ol className="flex flex-col gap-1.5">
              {(verification.history ?? []).map((change, index) => (
                <li key={`${change.at}-${index}`} className="text-[13px] text-[#334155]">
                  <span className="text-xs text-gray-500">{formatDateTime(change.at)}</span> · {change.to}
                  {change.note ? ` — ${change.note}` : ""}
                </li>
              ))}
            </ol>
            {(verification.evidence ?? []).map((file) => (
              <button key={file.id} type="button" onClick={() => void openEvidence(file.id)} className="self-start text-[13px] font-medium text-brand-900">
                {file.fileName} ({CLASSIFICATION_LABEL[file.classification ?? ""] ?? file.classification})
              </button>
            ))}
          </div>
        )}

        {needsInfo && (
          <>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
              placeholder="Reply to the reviewer"
              className="rounded-[10px] border border-gray-200 px-3.5 py-2.5 text-sm text-[#0f172a] focus:border-brand-900 focus:outline-none"
            />
            <EvidencePicker classifications={config.classifications} items={evidence} onChange={setEvidence} />
            <button
              type="button"
              disabled={!message.trim() || respond.isPending}
              onClick={() => respond.mutate()}
              className="h-11 rounded-[10px] bg-brand-900 text-sm font-medium text-white disabled:opacity-50"
            >
              {respond.isPending ? "Sending…" : "Send answer"}
            </button>
          </>
        )}

        {canStart && (
          <>
            {type === "PropertyAuthority" && (
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#0f172a]">
                Which property?
                <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className={FIELD}>
                  <option value="">Choose a listing</option>
                  {propertyOptions.map((property) => (
                    <option key={property.propertyId} value={property.propertyId}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#0f172a]">
              Label (optional)
              <input value={title} onChange={(event) => setTitle(event.target.value)} className={FIELD} placeholder="e.g. Ghana Card" />
            </label>
            <EvidencePicker classifications={config.classifications} items={evidence} onChange={setEvidence} />
            <label className="flex items-start gap-2.5 text-sm text-[#334155]">
              <input type="checkbox" checked={declared} onChange={(event) => setDeclared(event.target.checked)} className="mt-0.5 size-4 accent-[#1465e6]" />
              I declare that the information and documents I am sending are true and belong to me or my business.
            </label>
            <button
              type="button"
              disabled={!ready || submit.isPending}
              onClick={() => submit.mutate()}
              className={cn("h-11 rounded-[10px] bg-brand-900 text-sm font-medium text-white", (!ready || submit.isPending) && "opacity-50")}
            >
              {submit.isPending ? "Submitting…" : status ? "Submit again" : "Submit for review"}
            </button>
          </>
        )}
      </div>
    </CenteredDialog>
  );
}
