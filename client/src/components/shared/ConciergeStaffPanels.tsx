"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useConciergeStaffMutations } from "@/hooks/useConcierge";
import { useProviders } from "@/hooks/useServices";
import { showErrorToast } from "@/components/shared/AppToast";
import { formatDate, formatMoney } from "@/lib/format";
import { notifyError } from "@/lib/errors";
import { uploadAll } from "@/lib/upload";
import { cn } from "@/lib/utils";
import type { ConciergeRequestDto } from "@/types/api/concierge";

const FIELD = "h-10 w-full rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] text-[#0f172a] focus:border-brand-900 focus:outline-none";
const BOX = "flex flex-col gap-3 rounded-xl border border-gray-200 p-4";

export function StaffFeePanel({ request }: { request: ConciergeRequestDto }) {
  const { quote } = useConciergeStaffMutations();
  const [amount, setAmount] = useState("");
  const { fee } = request;
  const closed = request.status === "Completed" || request.status === "Cancelled";

  return (
    <div className={BOX}>
      <h3 className="text-[13px] font-semibold text-[#0f172a]">Fee · {fee.planName} ({fee.price})</h3>
      {fee.price === "GHS 0" ? (
        <p className="text-xs text-gray-500">The free consultation has no fee.</p>
      ) : (
        <>
          <p className="text-xs text-gray-500">
            Status: {fee.status}
            {fee.amount !== null && ` · ${formatMoney(fee.amount, fee.currency)} on ${formatMoney(fee.basis ?? 0, fee.currency)}`}
            {fee.paidAt && ` · paid ${formatDate(fee.paidAt)}`}
          </p>
          {fee.status !== "Paid" && !closed && (
            <div className="flex gap-2">
              <input className={FIELD} inputMode="decimal" placeholder="Project cost or rent (GHS)" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))} />
              <Button
                variant="primary"
                disabled={quote.isPending || !amount}
                onClick={() => quote.mutate({ id: request.id, amount: Number(amount) }, { onSuccess: () => setAmount("") })}
                className="h-10 w-auto shrink-0 rounded-[10px] px-4 lg:rounded-[10px]"
              >
                {fee.status === "Due" ? "Update fee" : "Send fee"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function StaffShortlistPanel({ request }: { request: ConciergeRequestDto }) {
  const { addShortlist, removeShortlist } = useConciergeStaffMutations();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"professional" | "artisan">("professional");
  const [note, setNote] = useState("");
  const providers = useProviders({ q: query.trim() || undefined, kind, city: undefined });
  const closed = request.status === "Completed" || request.status === "Cancelled";
  const chosen = new Set(request.shortlist.map((entry) => entry.providerId));

  return (
    <div className={BOX}>
      <h3 className="text-[13px] font-semibold text-[#0f172a]">Provider shortlist</h3>
      {request.shortlist.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between gap-2 text-[13px]">
          <span className="min-w-0 truncate">
            {entry.name} · {entry.kind} · {entry.city}
            {entry.credentialVerified ? " · verified" : ""}
          </span>
          {!closed && (
            <button type="button" className="shrink-0 text-xs font-medium text-[#dc2626]" onClick={() => removeShortlist.mutate({ id: request.id, entryId: entry.id })}>
              Remove
            </button>
          )}
        </div>
      ))}
      {!closed && (
        <>
          <div className="flex gap-2">
            {(["professional", "artisan"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setKind(value)}
                className={cn("rounded-full border px-3 py-1 text-[13px] font-medium", kind === value ? "border-brand-900 bg-[#eff5ff] text-brand-900" : "border-gray-200 text-[#334155]")}
              >
                {value === "professional" ? "Professionals" : "Artisans"}
              </button>
            ))}
            <input className={FIELD} placeholder="Search providers" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <input className={FIELD} placeholder="Why this provider (shown to the customer, optional)" value={note} onChange={(event) => setNote(event.target.value)} />
          <div className="flex max-h-48 flex-col gap-1 overflow-auto">
            {providers.items.slice(0, 20).map((provider) => (
              <button
                key={provider.id}
                type="button"
                disabled={chosen.has(provider.id) || addShortlist.isPending}
                onClick={() =>
                  addShortlist.mutate(
                    {
                      id: request.id,
                      provider: {
                        providerId: provider.id,
                        name: provider.displayName ?? "Provider",
                        headline: provider.headline,
                        city: provider.city,
                        kind,
                        credentialVerified: provider.credentialVerified,
                        note: note.trim() || null,
                      },
                    },
                    { onSuccess: () => setNote("") },
                  )
                }
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="min-w-0 truncate">
                  {provider.displayName} · {provider.city}
                  {provider.credentialVerified ? " · verified" : ""}
                </span>
                <span className="shrink-0 text-xs font-medium text-brand-900">{chosen.has(provider.id) ? "Added" : "Add"}</span>
              </button>
            ))}
            {!providers.isPending && providers.items.length === 0 && <p className="text-xs text-gray-500">No providers found.</p>}
          </div>
        </>
      )}
    </div>
  );
}

export function StaffUpdatesPanel({ request }: { request: ConciergeRequestDto }) {
  const { addUpdate } = useConciergeStaffMutations();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const closed = request.status === "Completed" || request.status === "Cancelled";

  async function post() {
    setUploading(true);
    try {
      const uploaded = files.length > 0 ? await uploadAll(files) : [];
      addUpdate.mutate(
        { id: request.id, text, mediaUrls: uploaded.map((media) => media.publicUrl) },
        {
          onSuccess: () => {
            setText("");
            setFiles([]);
          },
        },
      );
    } catch (error) {
      notifyError(error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={BOX}>
      <h3 className="text-[13px] font-semibold text-[#0f172a]">Progress updates</h3>
      {request.updates.map((update) => (
        <p key={update.id} className="text-[13px] text-[#334155]">
          <span className="text-xs text-gray-500">{formatDate(update.createdAt)} · </span>
          {update.text}
          {update.mediaUrls.length > 0 && <span className="text-xs text-gray-500"> · {update.mediaUrls.length} attachment(s)</span>}
        </p>
      ))}
      {!closed && (
        <>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="What happened this week?"
            className="resize-none rounded-[10px] border border-gray-200 px-3 py-2 text-[13px] focus:border-brand-900 focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="file"
              multiple
              accept="image/*,video/mp4,video/webm,video/quicktime"
              onChange={(event) => {
                const picked = Array.from(event.target.files ?? []);
                if (picked.length > 10) showErrorToast("Attach up to 10 files.");
                else setFiles(picked);
              }}
              className="text-xs"
            />
            <Button variant="primary" disabled={uploading || addUpdate.isPending || !text.trim()} onClick={post} className="h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px]">
              {uploading ? "Uploading..." : addUpdate.isPending ? "Posting..." : "Post update"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
