"use client";

import Link from "next/link";
import { use, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSession } from "@/context/SessionContext";
import { useQuoteRequest, useServicesMutations } from "@/hooks/useServices";
import { errorMessage } from "@/lib/errors";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { INSPECTION_TONE, QUOTE_REQUEST_TONE, QUOTE_TONE } from "@/lib/services-labels";
import type { InspectionDto, QuoteDto, QuoteRequestDto } from "@/types/api/schema";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5";
const FIELD = "h-10 min-w-0 rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] text-[#0f172a] focus:border-brand-900 focus:outline-none";

function QuoteCard({ quote, request, isRequester }: { quote: QuoteDto; request: QuoteRequestDto; isRequester: boolean }) {
  const { quoteAction } = useServicesMutations();
  const open = request.status === "Open" || (request.status === "Accepted" && quote.isChangeOrder);
  const actionable = quote.status === "Submitted" && !quote.expired;
  const currency = quote.currency ?? "GHS";
  return (
    <article className={cn("flex flex-col gap-2 rounded-xl border p-4", quote.status === "Accepted" ? "border-[#16a34a] bg-[#f0fdf4]" : "border-gray-200")}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 text-sm font-bold text-[#0f172a]">
          {quote.providerName}
          {quote.isChangeOrder ? " · change order" : ""}
          {quote.version > 1 ? ` · revision ${quote.version}` : ""}
        </p>
        {quote.credentialVerified && <span className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium text-[#16a34a]">Credential ✓</span>}
        {quote.expired && <span className="rounded-full bg-[#fee2e2] px-2 py-[3px] text-[11px] font-medium text-[#dc2626]">Expired</span>}
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", QUOTE_TONE[quote.status ?? ""])}>{quote.status}</span>
      </div>
      <p className="text-[22px] font-bold leading-7 text-[#0f172a]">{formatMoney(quote.total, currency)}</p>
      <dl className="grid gap-x-6 gap-y-1 text-[13px] sm:grid-cols-3">
        <div>
          <dt className="text-xs text-gray-500">Labour</dt>
          <dd className="font-medium">{formatMoney(quote.labour, currency)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Materials</dt>
          <dd className="font-medium">{formatMoney(quote.materials, currency)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Fees</dt>
          <dd className="font-medium">{formatMoney(quote.fees, currency)}</dd>
        </div>
        {quote.durationDays !== null && (
          <div>
            <dt className="text-xs text-gray-500">Takes</dt>
            <dd className="font-medium">{quote.durationDays} days</dd>
          </div>
        )}
        {quote.depositPercent !== null && (
          <div>
            <dt className="text-xs text-gray-500">Deposit</dt>
            <dd className="font-medium">{quote.depositPercent}%</dd>
          </div>
        )}
        {quote.validUntil && (
          <div>
            <dt className="text-xs text-gray-500">Valid until</dt>
            <dd className="font-medium">{formatDate(quote.validUntil)}</dd>
          </div>
        )}
      </dl>
      {quote.exclusions && <p className="text-xs text-gray-500">Not included: {quote.exclusions}</p>}
      {quote.notes && <p className="text-[13px] text-[#334155]">{quote.notes}</p>}
      {isRequester && open && actionable && (
        <div className="flex gap-3">
          <button type="button" onClick={() => quoteAction.mutate({ id: quote.id, action: "accept" }, { onSuccess: () => showSuccessToast("Quote accepted") })} className="h-9 rounded-[10px] bg-brand-900 px-4 text-[13px] font-medium text-white">
            Accept quote
          </button>
          <button type="button" onClick={() => quoteAction.mutate({ id: quote.id, action: "reject" })} className="h-9 rounded-[10px] border border-gray-200 px-4 text-[13px] font-medium text-[#334155]">
            Reject
          </button>
        </div>
      )}
      {!isRequester && quote.status === "Submitted" && (
        <button type="button" onClick={() => quoteAction.mutate({ id: quote.id, action: "withdraw" })} className="self-start text-[13px] font-medium text-[#dc2626]">
          Withdraw quote
        </button>
      )}
    </article>
  );
}

function InspectionRow({ inspection, isRequester }: { inspection: InspectionDto; isRequester: boolean }) {
  const { inspectionAction } = useServicesMutations();
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-gray-200 p-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 text-sm font-semibold text-[#0f172a]">
          {inspection.providerName} · {formatDateTime(inspection.proposedAt)}
        </p>
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", INSPECTION_TONE[inspection.status ?? ""])}>{inspection.status}</span>
      </div>
      <p className="text-xs text-gray-500">
        {inspection.fee ? `Visit fee ${formatMoney(inspection.fee, inspection.currency ?? "GHS")}` : "No visit fee"}
        {inspection.notes ? ` · ${inspection.notes}` : ""}
      </p>
      <div className="flex gap-3 text-[13px] font-medium">
        {isRequester && inspection.status === "Proposed" && (
          <>
            <button type="button" onClick={() => inspectionAction.mutate({ id: inspection.id, action: "confirm" })} className="text-brand-900">
              Confirm time
            </button>
            <button type="button" onClick={() => inspectionAction.mutate({ id: inspection.id, action: "decline" })} className="text-[#b45309]">
              Decline
            </button>
          </>
        )}
        {!isRequester && inspection.status === "Confirmed" && (
          <button type="button" onClick={() => inspectionAction.mutate({ id: inspection.id, action: "complete" })} className="text-brand-900">
            Mark visit done
          </button>
        )}
        {(inspection.status === "Proposed" || inspection.status === "Confirmed") && (
          <button type="button" onClick={() => inspectionAction.mutate({ id: inspection.id, action: "cancel" })} className="text-[#dc2626]">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function ProviderTools({ request }: { request: QuoteRequestDto }) {
  const { sendQuote, proposeInspection } = useServicesMutations();
  const [labour, setLabour] = useState("");
  const [materials, setMaterials] = useState("");
  const [fees, setFees] = useState("");
  const [days, setDays] = useState("");
  const [deposit, setDeposit] = useState("");
  const [valid, setValid] = useState("14");
  const [exclusions, setExclusions] = useState("");
  const [notes, setNotes] = useState("");
  const [at, setAt] = useState("");
  const [fee, setFee] = useState("");
  const accepted = request.status === "Accepted";
  const inspectionNeeded = request.requiresInspection && !(request.inspections ?? []).some((item) => item.status === "Completed");
  const number = (value: string) => (value.trim() === "" ? null : Number(value.replace(/,/g, "")));

  return (
    <section className={CARD}>
      <h2 className="text-base font-bold text-[#0f172a]">{accepted ? "Send a change order" : "Your quote"}</h2>
      {inspectionNeeded && (
        <div className="flex flex-col gap-2 rounded-xl bg-[#fef3c7] p-3.5">
          <p className="text-[13px] font-medium text-[#b45309]">This job needs a site visit before you can quote.</p>
          <div className="flex flex-wrap gap-2">
            <input type="datetime-local" value={at} onChange={(event) => setAt(event.target.value)} aria-label="Visit time" className={FIELD} />
            <input value={fee} onChange={(event) => setFee(event.target.value)} placeholder="Visit fee (GHS)" inputMode="numeric" className={cn(FIELD, "w-36")} />
            <button
              type="button"
              disabled={!at || proposeInspection.isPending}
              onClick={() => proposeInspection.mutate({ requestId: request.id, at: new Date(at).toISOString(), fee: number(fee) ?? undefined }, { onSuccess: () => showSuccessToast("Visit proposed") })}
              className="h-10 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white disabled:opacity-50"
            >
              Propose visit
            </button>
          </div>
        </div>
      )}
      {!inspectionNeeded && (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <input value={labour} onChange={(event) => setLabour(event.target.value)} placeholder="Labour (GHS)" inputMode="decimal" className={FIELD} />
            <input value={materials} onChange={(event) => setMaterials(event.target.value)} placeholder="Materials (GHS)" inputMode="decimal" className={FIELD} />
            <input value={fees} onChange={(event) => setFees(event.target.value)} placeholder="Fees (GHS)" inputMode="decimal" className={FIELD} />
            <input value={days} onChange={(event) => setDays(event.target.value)} placeholder="Days to finish" inputMode="numeric" className={FIELD} />
            <input value={deposit} onChange={(event) => setDeposit(event.target.value)} placeholder="Deposit %" inputMode="numeric" className={FIELD} />
            <input value={valid} onChange={(event) => setValid(event.target.value)} placeholder="Valid for (days)" inputMode="numeric" className={FIELD} />
          </div>
          <input value={exclusions} onChange={(event) => setExclusions(event.target.value)} placeholder="What is not included" className={FIELD} />
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Notes for the customer" className="rounded-[10px] border border-gray-200 px-3.5 py-2.5 text-[13px] focus:border-brand-900 focus:outline-none" />
          <button
            type="button"
            disabled={(number(labour) ?? 0) + (number(materials) ?? 0) + (number(fees) ?? 0) <= 0 || sendQuote.isPending}
            onClick={() =>
              sendQuote.mutate(
                {
                  requestId: request.id,
                  body: {
                    labour: number(labour) ?? 0,
                    materials: number(materials) ?? 0,
                    fees: number(fees) ?? 0,
                    durationDays: number(days),
                    depositPercent: number(deposit),
                    validDays: number(valid) ?? 14,
                    exclusions: exclusions.trim() || null,
                    notes: notes.trim() || null,
                    isChangeOrder: accepted,
                  },
                },
                { onSuccess: () => showSuccessToast("Quote sent. A new quote replaces your earlier one.") },
              )
            }
            className="h-11 w-fit rounded-[10px] bg-brand-900 px-5 text-sm font-medium text-white disabled:opacity-50"
          >
            {sendQuote.isPending ? "Sending…" : "Send quote"}
          </button>
        </>
      )}
    </section>
  );
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useSession();
  const request = useQuoteRequest(id);
  const { cancelRequest } = useServicesMutations();
  const data = request.data;
  const isRequester = data?.requester.accountId === user?.id;

  return (
    <AppShell activeKey="services" activeChildKey="request-board" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Requests", href: "/request-board" }, { label: data?.title ?? "Request" }]} />
        {request.isPending && <Skeleton className="h-64 w-full rounded-2xl" />}
        {request.isError && (
          <>
            <Link href="/request-board" className="self-start text-sm font-medium text-brand-900">
              ‹ Back to requests
            </Link>
            <p className="text-sm text-[#dc2626]">{errorMessage(request.error)}</p>
          </>
        )}
        {data && (
          <div className="flex w-full max-w-[860px] flex-col gap-5">
            <section className={CARD}>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="min-w-0 flex-1 text-xl font-bold text-[#0f172a]">{data.title}</h1>
                <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", QUOTE_REQUEST_TONE[data.status ?? ""])}>{data.status}</span>
              </div>
              <p className="whitespace-pre-line text-sm leading-5 text-[#334155]">{data.description}</p>
              <p className="flex flex-wrap gap-x-4 text-xs text-gray-500">
                <span>{data.category}</span>
                <span>{data.city}</span>
                {data.budget !== null && <span>Budget {formatMoney(data.budget, data.currency ?? "GHS")}</span>}
                {data.preferredStart && <span>Start {formatDate(data.preferredStart)}</span>}
                {!isRequester && <span>Requested by {data.requester.username}</span>}
              </p>
              {data.requiresInspection && <p className="rounded-lg bg-[#fef3c7] p-2.5 text-xs text-[#b45309]">Providers must visit the site before they can quote this job.</p>}
              {isRequester && data.status === "Open" && (
                <button type="button" onClick={() => cancelRequest.mutate(data.id, { onSuccess: () => showSuccessToast("Request cancelled") })} className="self-start text-[13px] font-medium text-[#dc2626]">
                  Cancel this request
                </button>
              )}
            </section>

            {(data.inspections ?? []).length > 0 && (
              <section className={CARD}>
                <h2 className="text-base font-bold text-[#0f172a]">Site visits</h2>
                {data.inspections?.map((inspection) => (
                  <InspectionRow key={inspection.id} inspection={inspection} isRequester={isRequester} />
                ))}
              </section>
            )}

            <section className={CARD}>
              <h2 className="text-base font-bold text-[#0f172a]">{isRequester ? `Quotes (${data.quoteCount})` : "Your quotes"}</h2>
              {(data.quotes ?? []).length === 0 && <p className="text-[13px] text-gray-500">{isRequester ? "No quotes yet. We will let you know when one arrives." : "You have not sent a quote yet."}</p>}
              {data.quotes?.map((quote) => (
                <QuoteCard key={quote.id} quote={quote} request={data} isRequester={isRequester} />
              ))}
              {isRequester && (data.quotes ?? []).length > 1 && <p className="text-xs text-gray-500">Cheapest first. Accepting one closes the others.</p>}
            </section>

            {!isRequester && (data.status === "Open" || data.status === "Accepted") && <ProviderTools request={data} />}
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
