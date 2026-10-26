"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { SelectField } from "@/components/shared/SelectField";
import { useLead, useLeadActions } from "@/hooks/useLeads";
import { useStartConversation } from "@/hooks/useMessaging";
import { errorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney, formatPricePeriod } from "@/lib/format";
import { LEAD_STAGES, type LeadStageName } from "@/lib/leads-api";
import { cn } from "@/lib/utils";

export const STAGE_LABEL: Record<string, string> = {
  New: "New",
  Contacted: "Contacted",
  Qualified: "Qualified",
  ViewingRequested: "Viewing requested",
  ViewingScheduled: "Viewing scheduled",
  Viewed: "Viewed",
  Negotiating: "Negotiating",
  DecisionPending: "Decision pending",
  ClosedWon: "Won",
  ClosedLost: "Lost",
  ClosedSpam: "Spam",
};

const FIELD = "h-10 rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] text-[#0f172a] focus:border-brand-900 focus:outline-none";

export function LeadDialog({ leadId, onClose }: { leadId: string | null; onClose: () => void }) {
  const router = useRouter();
  const lead = useLead(leadId);
  const actions = useLeadActions(leadId);
  const message = useStartConversation();
  const [note, setNote] = useState("");
  const [followAt, setFollowAt] = useState("");
  const [followNote, setFollowNote] = useState("");
  const [closeReason, setCloseReason] = useState("");

  const data = lead.data;
  const closed = data?.stage?.startsWith("Closed") ?? false;

  return (
    <CenteredDialog open={leadId !== null} onClose={onClose} labelledBy="lead-title" className="max-w-[620px]">
      <div className="flex max-h-[85vh] flex-col gap-4 overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="lead-title" className="truncate text-lg font-bold text-[#0f172a]">
              {data?.prospect.username ?? "Enquiry"}
            </h2>
            <p className="truncate text-sm text-gray-500">{data?.listingName}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-lg text-gray-500 hover:text-[#0f172a]">
            ✕
          </button>
        </div>

        {lead.isPending && <p className="text-sm text-gray-500">Loading…</p>}
        {lead.isError && <p className="text-sm text-[#dc2626]">{errorMessage(lead.error)}</p>}

        {data && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-medium text-brand-900">{STAGE_LABEL[data.stage ?? ""] ?? data.stage}</span>
              <span className="text-xs text-gray-500">
                Price when they enquired: {formatMoney(data.priceAtEnquiry.price, data.priceAtEnquiry.currency ?? "GHS")} {formatPricePeriod(data.priceAtEnquiry.period)}
              </span>
            </div>

            {data.message && <p className="whitespace-pre-line rounded-xl bg-[#f8fafc] p-3.5 text-sm leading-5 text-[#334155]">{data.message}</p>}

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
              {data.qualification.budgetMax !== null && (
                <div>
                  <dt className="text-xs text-gray-500">Budget</dt>
                  <dd className="font-medium text-[#0f172a]">{formatMoney(data.qualification.budgetMax, data.qualification.currency ?? "GHS")}</dd>
                </div>
              )}
              {data.qualification.moveInDate && (
                <div>
                  <dt className="text-xs text-gray-500">Move in</dt>
                  <dd className="font-medium text-[#0f172a]">{data.qualification.moveInDate}</dd>
                </div>
              )}
              {data.qualification.financing && (
                <div>
                  <dt className="text-xs text-gray-500">Paying by</dt>
                  <dd className="font-medium text-[#0f172a]">{data.qualification.financing}</dd>
                </div>
              )}
            </dl>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={message.isPending}
                onClick={() =>
                  message.mutate(
                    { recipientAccountId: data.prospect.accountId, contextType: "Property", contextId: data.listingId, contextTitle: data.listingName ?? undefined },
                    { onSuccess: (conversation) => router.push(`/messages?c=${conversation.id}`) },
                  )
                }
                className="h-10 rounded-[10px] bg-[#eff5ff] px-4 text-sm font-medium text-brand-900 hover:bg-[#e2edff] disabled:opacity-60"
              >
                Message {data.prospect.username}
              </button>
              {closed ? (
                <button type="button" onClick={() => actions.reopen.mutate()} className="h-10 rounded-[10px] border border-gray-200 px-4 text-sm font-medium text-[#0f172a] hover:bg-gray-50">
                  Reopen
                </button>
              ) : (
                <SelectField
                  value={data.stage ?? ""}
                  onChange={(stage) => actions.move.mutate({ stage: stage as LeadStageName })}
                  aria-label="Move to stage"
                  options={LEAD_STAGES.filter((stage) => !stage.startsWith("Closed")).map((stage) => ({ value: stage, label: STAGE_LABEL[stage] }))}
                />
              )}
            </div>

            {!closed && (
              <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3.5">
                <p className="text-[13px] font-semibold text-[#0f172a]">Close this lead</p>
                <input value={closeReason} onChange={(event) => setCloseReason(event.target.value)} placeholder="Reason (optional)" className={FIELD} />
                <div className="flex flex-wrap gap-2">
                  {(["ClosedWon", "ClosedLost", "ClosedSpam"] as const).map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => actions.move.mutate({ stage, reason: closeReason.trim() || undefined }, { onSuccess: onClose })}
                      className={cn("rounded-full border px-3.5 py-1.5 text-[13px] font-medium", stage === "ClosedWon" ? "border-[#16a34a] text-[#16a34a]" : "border-gray-200 text-[#334155]")}
                    >
                      {STAGE_LABEL[stage]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!closed && (
              <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3.5">
                <p className="text-[13px] font-semibold text-[#0f172a]">Next follow-up</p>
                {data.nextActionAt && (
                  <p className="text-xs text-gray-500">
                    Due {formatDateTime(data.nextActionAt)}
                    {data.nextActionNote ? ` · ${data.nextActionNote}` : ""}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <input type="datetime-local" value={followAt} onChange={(event) => setFollowAt(event.target.value)} aria-label="Follow-up time" className={FIELD} />
                  <input value={followNote} onChange={(event) => setFollowNote(event.target.value)} placeholder="Note" className={cn(FIELD, "min-w-0 flex-1")} />
                  <button
                    type="button"
                    disabled={!followAt}
                    onClick={() => actions.nextAction.mutate({ at: new Date(followAt).toISOString(), note: followNote.trim() || undefined })}
                    className="h-10 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white disabled:opacity-50"
                  >
                    Set
                  </button>
                </div>
                <div className="flex gap-2 text-[13px]">
                  {[1, 3, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => actions.nextAction.mutate({ snoozeUntil: new Date(Date.now() + days * 86_400_000).toISOString() })}
                      className="rounded-full border border-gray-200 px-3 py-1 font-medium text-[#334155] hover:bg-gray-50"
                    >
                      Snooze {days}d
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-semibold text-[#0f172a]">Private notes</p>
              {(data.notes ?? []).map((item) => (
                <p key={item.id} className="rounded-lg bg-[#fffbeb] px-3 py-2 text-[13px] text-[#334155]">
                  {item.text} <span className="text-xs text-gray-500">· {formatDateTime(item.at)}</span>
                </p>
              ))}
              <div className="flex gap-2">
                <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a note only your team can see" className={cn(FIELD, "min-w-0 flex-1")} />
                <button
                  type="button"
                  disabled={!note.trim()}
                  onClick={() => actions.note.mutate(note.trim(), { onSuccess: () => setNote("") })}
                  className="h-10 rounded-[10px] border border-gray-200 px-4 text-sm font-medium text-[#0f172a] disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-[13px] font-semibold text-[#0f172a]">Timeline</p>
              {(data.timeline ?? []).map((entry, index) => (
                <p key={`${entry.at}-${index}`} className="text-[13px] text-[#334155]">
                  <span className="text-xs text-gray-500">{formatDateTime(entry.at)}</span> · {entry.text}
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </CenteredDialog>
  );
}
