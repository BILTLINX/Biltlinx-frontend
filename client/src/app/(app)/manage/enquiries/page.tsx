"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { LeadDialog, STAGE_LABEL } from "@/components/shared/LeadDialog";
import { ManageTabs } from "@/components/shared/ManageTabs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { useIncomingViewings, useLeadBoard, useMyEnquiries, useMyViewings, useViewingActions } from "@/hooks/useLeads";
import { errorMessage } from "@/lib/errors";
import { formatDateTime, formatRelative } from "@/lib/format";
import { LEAD_STAGES } from "@/lib/leads-api";
import type { LeadCardDto, ViewingRequestDto } from "@/types/api/schema";
import { cn } from "@/lib/utils";

type Tab = "pipeline" | "viewings" | "mine";

const TABS: { key: Tab; label: string }[] = [
  { key: "pipeline", label: "Pipeline" },
  { key: "viewings", label: "Viewing requests" },
  { key: "mine", label: "Sent by me" },
];

const OPEN_STAGES = LEAD_STAGES.filter((stage) => !stage.startsWith("Closed"));

const VIEWING_TONE: Record<string, string> = {
  Requested: "bg-[#fef3c7] text-[#b45309]",
  Confirmed: "bg-[#dcfce7] text-[#16a34a]",
  RescheduleProposed: "bg-[#eff5ff] text-brand-900",
  Declined: "bg-[#fee2e2] text-[#dc2626]",
  Cancelled: "bg-[#f1f5f9] text-[#334155]",
};

const FIELD = "h-10 rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] text-[#0f172a] focus:border-brand-900 focus:outline-none";

/** Manage · Enquiries & leads (Figma node 1059:29837): the lead pipeline, viewing requests and what you have sent as a seeker. */
export default function ManageEnquiriesPage() {
  const [tab, setTab] = useState<Tab>("pipeline");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [showClosed, setShowClosed] = useState(false);
  const board = useLeadBoard();

  const counts = board.data?.counts ?? {};
  const open = OPEN_STAGES.reduce((sum, stage) => sum + (counts[stage] ?? 0), 0);
  const kpis = [
    { id: "new", label: "New", value: counts.New ?? 0, icon: "/icons/message-01.svg" },
    { id: "open", label: "Open leads", value: open, icon: "/icons/user-group.svg" },
    { id: "followups", label: "Follow-ups due", value: board.data?.followUpsDue ?? 0, icon: "/icons/timer-01.svg" },
    { id: "won", label: "Won", value: counts.ClosedWon ?? 0, icon: "/icons/analytics-01.svg" },
  ];
  const columns = showClosed ? (["ClosedWon", "ClosedLost", "ClosedSpam"] as const) : OPEN_STAGES;

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Enquiries & leads" }]} />

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Enquiries &amp; leads</h1>
          <p className="text-sm leading-5 text-gray-500">Every enquiry from your listings in one pipeline. Reply fast to win more.</p>
        </div>

        <ManageTabs active="enquiries" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.id} className="flex min-w-0 flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-4">
              <p className="flex items-center gap-2 text-[13px] font-medium leading-[19px] text-gray-500">
                <NavIcon icon={kpi.icon} size={16} className="shrink-0 bg-gray-500" />
                {kpi.label}
              </p>
              {board.isPending ? <Skeleton className="h-7 w-12" /> : <p className="text-[22px] font-bold leading-[30px] text-[#0f172a]">{kpi.value}</p>}
            </div>
          ))}
        </div>

        <div role="tablist" aria-label="Section" className="flex flex-wrap items-center gap-2.5">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={item.key === tab}
              onClick={() => setTab(item.key)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-[13px] font-medium leading-[19px]",
                item.key === tab ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
              )}
            >
              {item.label}
            </button>
          ))}
          {tab === "pipeline" && (
            <button
              type="button"
              onClick={() => setShowClosed((v) => !v)}
              aria-pressed={showClosed}
              className="ml-auto rounded-full border border-gray-200 px-3.5 py-2 text-[13px] font-medium text-[#334155] hover:bg-gray-50"
            >
              {showClosed ? "Show open leads" : "Show closed leads"}
            </button>
          )}
        </div>

        {tab === "pipeline" && (
          <>
            {board.isError && <p className="text-sm text-[#dc2626]">{errorMessage(board.error)}</p>}
            <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-3.5 pb-2">
                {columns.map((stage) => {
                  const items: LeadCardDto[] = board.data?.columns?.[stage] ?? [];
                  return (
                    <section key={stage} aria-label={STAGE_LABEL[stage]} className="flex w-[260px] shrink-0 flex-col gap-2.5 self-stretch rounded-2xl bg-[#f8fafc] p-3">
                      <h2 className="flex items-center justify-between text-[13px] font-bold text-[#0f172a]">
                        {STAGE_LABEL[stage]}
                        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500">{counts[stage] ?? items.length}</span>
                      </h2>
                      {board.isPending && <Skeleton className="h-20 w-full" />}
                      {items.map((lead) => (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => setLeadId(lead.id)}
                          className="flex flex-col items-start gap-1 rounded-xl border border-gray-200 bg-white p-3 text-left hover:border-brand-900"
                        >
                          <span className="text-[13px] font-semibold text-[#0f172a]">{lead.prospect.username}</span>
                          <span className="line-clamp-1 text-xs text-gray-500">{lead.listingName}</span>
                          <span className="flex w-full items-center justify-between gap-2 text-[11px] text-gray-500">
                            {formatRelative(lead.createdAt)}
                            {lead.followUpDue && <span className="rounded-full bg-[#fee2e2] px-2 py-0.5 font-medium text-[#dc2626]">Follow up</span>}
                          </span>
                        </button>
                      ))}
                      {!board.isPending && items.length === 0 && <p className="px-1 text-xs text-gray-500">Nothing here.</p>}
                    </section>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {tab === "viewings" && <IncomingViewings />}
        {tab === "mine" && <SentByMe />}
      </PageContainer>

      <LeadDialog leadId={leadId} onClose={() => setLeadId(null)} />
    </AppShell>
  );
}

function IncomingViewings() {
  const viewings = useIncomingViewings();
  const actions = useViewingActions();
  const [proposing, setProposing] = useState<string | null>(null);
  const [at, setAt] = useState("");

  if (viewings.isPending) return <Skeleton className="h-24 w-full" />;
  if (viewings.isError) return <p className="text-sm text-[#dc2626]">{errorMessage(viewings.error)}</p>;
  if ((viewings.data?.length ?? 0) === 0) return <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">No viewing requests yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      {viewings.data?.map((viewing) => (
        <article key={viewing.id} className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="min-w-0 flex-1 truncate text-sm font-bold text-[#0f172a]">
              {viewing.requesterName} · {viewing.listingName}
            </p>
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", VIEWING_TONE[viewing.status ?? ""])}>{viewing.status}</span>
          </div>
          <p className="text-[13px] text-[#334155]">
            Preferred {formatDateTime(viewing.preferredAt)}
            {viewing.alternativeAt ? ` · or ${formatDateTime(viewing.alternativeAt)}` : ""}
          </p>
          {viewing.scheduledAt && <p className="text-[13px] font-medium text-[#16a34a]">Scheduled for {formatDateTime(viewing.scheduledAt)}</p>}
          {viewing.message && <p className="rounded-lg bg-[#f8fafc] p-3 text-[13px] text-[#334155]">{viewing.message}</p>}
          {viewing.status === "Requested" && (
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => actions.confirm.mutate({ id: viewing.id })} className="h-9 rounded-[10px] bg-brand-900 px-4 text-[13px] font-medium text-white">
                Confirm preferred time
              </button>
              {viewing.alternativeAt && (
                <button type="button" onClick={() => actions.confirm.mutate({ id: viewing.id, useAlternative: true })} className="h-9 rounded-[10px] border border-gray-200 px-4 text-[13px] font-medium text-[#0f172a]">
                  Confirm alternative
                </button>
              )}
              <button type="button" onClick={() => setProposing(proposing === viewing.id ? null : viewing.id)} className="h-9 rounded-[10px] border border-gray-200 px-4 text-[13px] font-medium text-[#0f172a]">
                Suggest another time
              </button>
              <button type="button" onClick={() => actions.decline.mutate({ id: viewing.id })} className="h-9 rounded-[10px] px-3 text-[13px] font-medium text-[#dc2626]">
                Decline
              </button>
            </div>
          )}
          {proposing === viewing.id && (
            <div className="flex flex-wrap gap-2">
              <input type="datetime-local" value={at} onChange={(event) => setAt(event.target.value)} aria-label="New time" className={FIELD} />
              <button
                type="button"
                disabled={!at}
                onClick={() => actions.propose.mutate({ id: viewing.id, at: new Date(at).toISOString() }, { onSuccess: () => setProposing(null) })}
                className="h-10 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white disabled:opacity-50"
              >
                Send
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function SentByMe() {
  const enquiries = useMyEnquiries();
  const viewings = useMyViewings();
  const actions = useViewingActions();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-[#0f172a]">My enquiries</h2>
        {enquiries.isPending && <Skeleton className="h-20 w-full" />}
        {enquiries.data?.items?.length === 0 && <p className="text-sm text-gray-500">You have not sent any enquiries.</p>}
        {enquiries.data?.items?.map((enquiry) => (
          <article key={enquiry.id} className="flex flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-4">
            <Link href={`/properties/${enquiry.listingId}`} className="text-sm font-bold text-[#0f172a] hover:text-brand-900">
              {enquiry.listingName}
            </Link>
            <p className="text-xs text-gray-500">
              {enquiry.status} · sent {formatRelative(enquiry.createdAt)} ago
            </p>
            {enquiry.message && <p className="line-clamp-2 text-[13px] text-[#334155]">{enquiry.message}</p>}
            {(enquiry.timeline ?? []).slice(-3).map((entry, index) => (
              <p key={`${entry.at}-${index}`} className="text-xs text-gray-500">
                {formatDateTime(entry.at)} · {entry.text}
              </p>
            ))}
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-[#0f172a]">My viewings</h2>
        {viewings.isPending && <Skeleton className="h-20 w-full" />}
        {viewings.data?.length === 0 && <p className="text-sm text-gray-500">You have not requested any viewings.</p>}
        {viewings.data?.map((viewing: ViewingRequestDto) => (
          <article key={viewing.id} className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Link href={`/properties/${viewing.listingId}`} className="min-w-0 flex-1 truncate text-sm font-bold text-[#0f172a] hover:text-brand-900">
                {viewing.listingName}
              </Link>
              <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium", VIEWING_TONE[viewing.status ?? ""])}>{viewing.status}</span>
            </div>
            <p className="text-[13px] text-[#334155]">
              {viewing.scheduledAt ? `Scheduled for ${formatDateTime(viewing.scheduledAt)}` : `Preferred ${formatDateTime(viewing.preferredAt)}`}
            </p>
            {viewing.status === "RescheduleProposed" && viewing.proposedAt && (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] text-[#334155]">The owner suggested {formatDateTime(viewing.proposedAt)}.</p>
                <button type="button" onClick={() => actions.accept.mutate(viewing.id)} className="h-9 rounded-[10px] bg-brand-900 px-4 text-[13px] font-medium text-white">
                  Accept
                </button>
              </div>
            )}
            {(viewing.status === "Requested" || viewing.status === "Confirmed" || viewing.status === "RescheduleProposed") && (
              <button type="button" onClick={() => actions.cancel.mutate(viewing.id)} className="self-start text-[13px] font-medium text-[#dc2626]">
                {viewing.status === "RescheduleProposed" ? "Turn down" : "Cancel request"}
              </button>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
