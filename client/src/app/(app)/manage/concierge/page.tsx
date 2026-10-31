"use client";

import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { StaffFeePanel, StaffShortlistPanel, StaffUpdatesPanel } from "@/components/shared/ConciergeStaffPanels";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useConciergeQueue, useConciergeStaffMutations, useConciergeStaffRequest } from "@/hooks/useConcierge";
import { ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ConciergeRequestDto, ConciergeStatus, ConciergeStepInput, ConciergeStepStatus } from "@/types/api/concierge";

const FIELD = "h-10 w-full rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] text-[#0f172a] focus:border-brand-900 focus:outline-none";
const STATUSES: ConciergeStatus[] = ["New", "InProgress", "Completed", "Cancelled"];
const STEP_STATUSES: ConciergeStepStatus[] = ["Upcoming", "Current", "Done"];

function toInputs(request: ConciergeRequestDto): ConciergeStepInput[] {
  return request.steps.map((step) => ({ title: step.title, detail: step.detail, status: step.status, actionLabel: step.actionLabel, actionHref: step.actionHref }));
}

function PlanEditor({ request, requesterName }: { request: ConciergeRequestDto; requesterName: string }) {
  const { savePlan, setStatus } = useConciergeStaffMutations();
  const [steps, setSteps] = useState<ConciergeStepInput[]>(() => toInputs(request));
  const closed = request.status === "Completed" || request.status === "Cancelled";

  function update(index: number, patch: Partial<ConciergeStepInput>) {
    setSteps((current) => current.map((step, i) => (i === index ? { ...step, ...patch } : step)));
  }

  function move(index: number, by: number) {
    setSteps((current) => {
      const next = [...current];
      const target = index + by;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-bold text-[#0f172a]">{request.title}</h2>
        <p className="text-xs text-gray-500">
          {requesterName} · {request.need} · {request.location} · starts {request.startWindow.toLowerCase()}
          {request.budget ? ` · budget ${request.budget}` : ""}
        </p>
        <p className="text-xs text-gray-500">
          Contact: {request.contactChannel} · {request.contactValue} · received {formatDateTime(request.createdAt)}
        </p>
        <p className="whitespace-pre-wrap pt-1 text-[13px] leading-5 text-[#334155]">{request.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-semibold text-[#0f172a]">Status</span>
        {STATUSES.filter((status) => status !== "New").map((status) => (
          <button
            key={status}
            type="button"
            disabled={setStatus.isPending || request.status === status}
            onClick={() => setStatus.mutate({ id: request.id, status })}
            className={cn("rounded-full border px-3 py-1 text-[13px] font-medium disabled:opacity-60", request.status === status ? "border-brand-900 bg-[#eff5ff] text-brand-900" : "border-gray-200 text-[#334155]")}
          >
            {status}
          </button>
        ))}
        {request.status === "New" && <span className="text-xs text-gray-500">New · saving a plan moves it to InProgress</span>}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-[13px] font-semibold text-[#0f172a]">Action plan</h3>
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3">
            <div className="flex gap-2">
              <input className={FIELD} placeholder={`Step ${index + 1} title`} value={step.title} disabled={closed} onChange={(event) => update(index, { title: event.target.value })} />
              <select className={cn(FIELD, "w-36 shrink-0")} value={step.status} disabled={closed} onChange={(event) => update(index, { status: event.target.value as ConciergeStepStatus })}>
                {STEP_STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
            <input className={FIELD} placeholder="Detail shown to the customer" value={step.detail} disabled={closed} onChange={(event) => update(index, { detail: event.target.value })} />
            <div className="flex gap-2">
              <input className={FIELD} placeholder="Button label (optional)" value={step.actionLabel ?? ""} disabled={closed} onChange={(event) => update(index, { actionLabel: event.target.value || null })} />
              <input className={FIELD} placeholder="Button link, e.g. /request-board/new" value={step.actionHref ?? ""} disabled={closed} onChange={(event) => update(index, { actionHref: event.target.value || null })} />
            </div>
            {!closed && (
              <div className="flex gap-3 text-xs font-medium text-brand-900">
                <button type="button" onClick={() => move(index, -1)}>Move up</button>
                <button type="button" onClick={() => move(index, 1)}>Move down</button>
                <button type="button" className="text-[#dc2626]" onClick={() => setSteps((current) => current.filter((_, i) => i !== index))}>Remove</button>
              </div>
            )}
          </div>
        ))}
        {!closed && (
          <div className="flex flex-wrap gap-2.5">
            <Button variant="outline" onClick={() => setSteps((current) => [...current, { title: "", detail: "", status: "Upcoming", actionLabel: null, actionHref: null }])} className="h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px]">
              Add step
            </Button>
            <Button variant="primary" disabled={savePlan.isPending} onClick={() => savePlan.mutate({ id: request.id, steps })} className="h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px]">
              {savePlan.isPending ? "Saving..." : "Save plan"}
            </Button>
          </div>
        )}
      </div>

      <StaffFeePanel request={request} />
      <StaffShortlistPanel request={request} />
      <StaffUpdatesPanel request={request} />
    </div>
  );
}

export default function ManageConciergePage() {
  const [status, setStatus] = useState<ConciergeStatus | undefined>(undefined);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const queue = useConciergeQueue(status);
  const detail = useConciergeStaffRequest(selected);
  const denied = queue.error instanceof ApiError && (queue.error.status === 403 || queue.error.status === 404);

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Concierge requests" }]} />
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Concierge requests</h1>

        {denied ? (
          <p className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500">This page is for the Biltlinx Concierge team.</p>
        ) : (
          <div className="flex w-full flex-col gap-5 xl:flex-row xl:items-start">
            <div className="flex w-full flex-col gap-3 xl:w-[340px] xl:shrink-0">
              <div className="flex flex-wrap gap-2">
                {[undefined, ...STATUSES].map((value) => (
                  <button
                    key={value ?? "all"}
                    type="button"
                    onClick={() => setStatus(value)}
                    className={cn("rounded-full border px-3 py-1 text-[13px] font-medium", status === value ? "border-brand-900 bg-[#eff5ff] text-brand-900" : "border-gray-200 text-[#334155]")}
                  >
                    {value ?? "All"}
                  </button>
                ))}
              </div>
              {queue.isPending ? (
                <Skeleton className="h-40 w-full rounded-2xl" />
              ) : (queue.data?.items ?? []).length === 0 ? (
                <p className="text-sm text-gray-500">No requests here.</p>
              ) : (
                queue.data?.items.map(({ request, requester }) => (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => setSelected(request.id)}
                    className={cn("flex flex-col gap-0.5 rounded-xl border bg-white p-3 text-left", selected === request.id ? "border-brand-900" : "border-gray-200")}
                  >
                    <span className="truncate text-[13px] font-semibold text-[#0f172a]">{request.title}</span>
                    <span className="text-xs text-gray-500">
                      {requester} · {request.status} · {request.location}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="min-w-0 flex-1">
              {!selected ? (
                <p className="text-sm text-gray-500">Select a request to read it and build the plan.</p>
              ) : detail.isPending ? (
                <Skeleton className="h-64 w-full rounded-2xl" />
              ) : detail.data ? (
                <PlanEditor key={`${detail.data.request.id}-${detail.data.request.updatedAt}`} request={detail.data.request} requesterName={detail.data.requester} />
              ) : null}
            </div>
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
