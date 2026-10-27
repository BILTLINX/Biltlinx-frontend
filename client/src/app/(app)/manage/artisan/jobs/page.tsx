"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { ArtisanRoleBar } from "@/components/shared/ArtisanRoleBar";
import { ArtisanTabs } from "@/components/shared/ManageTabs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { ARTISAN_JOBS, FEATURED_JOB, JOB_FILTERS, JOB_STAGES, matchesJobFilter, type JobFilterKey, type JobStage } from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";
import { useSearchTerm } from "@/context/SearchContext";

const ghs = (amount: number) => `GHS ${amount.toLocaleString("en-US")}`;

/** Manage · Artisan · Jobs (Figma node 1081:32983): every job from booked to paid, as a board you can drag along. */
export default function ArtisanJobsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<JobFilterKey>("all");
  const [stages, setStages] = useState<Record<string, JobStage>>(() => Object.fromEntries(ARTISAN_JOBS.map((job) => [job.id, job.stage])));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<JobStage | null>(null);
  const [steps, setSteps] = useState(() => Object.fromEntries(FEATURED_JOB.steps.map((step) => [step.id, step.done])));
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const needle = useSearchTerm();
  const jobs = useMemo(() => {
    return ARTISAN_JOBS.filter((job) => matchesJobFilter(job, filter) && (!needle || `${job.title} ${job.client}`.toLowerCase().includes(needle)));
  }, [needle, filter]);

  function move(jobId: string, stage: JobStage) {
    setStages((current) => (current[jobId] === stage ? current : { ...current, [jobId]: stage }));
  }

  function drop(stage: JobStage) {
    if (draggingId) move(draggingId, stage);
    setDraggingId(null);
    setOverStage(null);
  }

  const featuredStage = stages[FEATURED_JOB.id];

  function markDone() {
    move(FEATURED_JOB.id, "awaiting");
    showSuccessToast("Invoice sent to Daniel Kumi");
  }

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <ArtisanRoleBar page="Jobs" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Jobs</h1>
            <p className="text-sm leading-5 text-gray-500">Every job from booked to paid. Drag a card to move it along.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Export jobs")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Export
            </Button>
            <Button variant="primary" onClick={comingSoon("Add job")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + Add job
            </Button>
          </div>
        </div>

        <ArtisanTabs active="jobs" />

        <div className="flex flex-wrap items-center gap-2.5">
          <div role="tablist" aria-label="Show" className="flex flex-wrap gap-2.5">
            {JOB_FILTERS.map((option) => {
              const active = option.key === filter;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(option.key)}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-[13px] font-medium leading-[19px]",
                    active ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={comingSoon("Filters")}
            className="ml-auto flex h-10 items-center gap-1.5 rounded-[10px] border border-gray-200 bg-white px-3.5 text-[13px] font-medium leading-[19px] text-[#334155] hover:bg-gray-50"
          >
            <NavIcon icon="/icons/list-bullet.svg" size={16} className="bg-[#334155]" />
            Filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {JOB_STAGES.map((stage) => {
            const items = jobs.filter((job) => stages[job.id] === stage.key);
            return (
              <section
                key={stage.key}
                aria-label={stage.label}
                onDragOver={(event) => {
                  if (!draggingId) return;
                  event.preventDefault();
                  setOverStage(stage.key);
                }}
                onDragLeave={() => setOverStage((current) => (current === stage.key ? null : current))}
                onDrop={(event) => {
                  event.preventDefault();
                  drop(stage.key);
                }}
                className={cn("flex min-w-0 flex-col gap-2.5 self-stretch rounded-2xl p-3 transition-colors", overStage === stage.key ? "bg-[#eff5ff]" : "bg-[#f8fafc]")}
              >
                <div className="flex items-center gap-2">
                  <h2 className="whitespace-nowrap text-sm font-bold leading-5 text-[#0f172a]">{stage.label}</h2>
                  <span className="rounded-full bg-[#f1f5f9] px-2.5 py-[3px] text-[11px] font-medium leading-4 text-[#334155]">{items.length}</span>
                </div>
                {items.map((job) => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", job.id);
                      setDraggingId(job.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setOverStage(null);
                    }}
                    className={cn("flex cursor-grab flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-3.5 active:cursor-grabbing", draggingId === job.id && "opacity-50")}
                  >
                    <p className="text-sm font-semibold leading-5 text-[#0f172a]">{job.title}</p>
                    <p className="text-xs leading-[17px] text-gray-500">{job.client}</p>
                    <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                      <span className="text-xs font-medium leading-[17px] text-[#334155]">{job.when}</span>
                      <span className="text-[13px] font-bold leading-[19px] text-[#0f172a]">{ghs(job.amount)}</span>
                    </div>
                    {stages[job.id] === "awaiting" && (
                      <button
                        type="button"
                        onClick={() => showSuccessToast(`Reminder sent to ${job.client.split(" · ")[0]}`)}
                        className="h-[34px] rounded-[10px] bg-[#eff5ff] px-4 text-sm font-medium text-brand-900 hover:bg-[#e2edff]"
                      >
                        Send reminder
                      </button>
                    )}
                  </div>
                ))}
              </section>
            );
          })}
        </div>

        <section className="flex flex-col gap-3.5 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="min-w-0 text-base font-bold leading-[23px] text-[#0f172a]">
              Job {FEATURED_JOB.id} · {FEATURED_JOB.title}
            </h2>
            <button type="button" onClick={comingSoon("Job details")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
              Open full view ›
            </button>
          </div>
          <div className="flex flex-col gap-5 lg:flex-row">
            <dl className="flex min-w-0 flex-1 flex-col gap-2.5 text-[13px] leading-[19px]">
              {FEATURED_JOB.details.map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-4">
                  <dt className="shrink-0 text-gray-500">{row.label}</dt>
                  <dd className="min-w-0 text-right font-semibold text-[#0f172a]">{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex w-full shrink-0 flex-col gap-2 rounded-xl bg-[#f8fafc] p-4 lg:w-[360px]">
              <p className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">Job steps</p>
              {FEATURED_JOB.steps.map((step) => {
                const done = steps[step.id];
                return (
                  <button
                    key={step.id}
                    type="button"
                    role="checkbox"
                    aria-checked={done}
                    onClick={() => setSteps((current) => ({ ...current, [step.id]: !current[step.id] }))}
                    className="flex items-center gap-2.5 text-left"
                  >
                    <span
                      className={cn(
                        "flex size-[18px] shrink-0 items-center justify-center rounded text-[11px] font-bold leading-3",
                        done ? "bg-[#16a34a] text-white" : "border border-[#cbd5e1] text-transparent",
                      )}
                    >
                      ✓
                    </span>
                    <span className={cn("text-[13px] leading-[19px]", done ? "text-gray-500" : "font-medium text-[#0f172a]")}>{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={comingSoon("Messages")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Message client
            </Button>
            <Button variant="primary" onClick={markDone} disabled={featuredStage !== "progress"} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Mark as done &amp; invoice
            </Button>
          </div>
        </section>
      </PageContainer>
    </AppShell>
  );
}

