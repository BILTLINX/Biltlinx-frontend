"use client";

import { useRouter } from "next/navigation";
import { KeyFacts } from "@/components/shared/KeyFacts";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import type { MilestoneStatus, ProjectDetail } from "@/lib/dummy-project-detail";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

const MILESTONE_PILL: Record<MilestoneStatus, string> = {
  done: "bg-[#dcfce7] text-[#16a34a]",
  "in-progress": "bg-[#eff5ff] text-brand-900",
  upcoming: "bg-[#f1f5f9] text-[#334155]",
};

/** The left column of a project page (Figma node 1060:30691): headline, key facts, construction progress, unit types and the payment plan. */
export function ProjectDetailContent({ detail }: { detail: ProjectDetail }) {
  const router = useRouter();
  const { project } = detail;
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-medium leading-4 text-brand-900">
            {detail.stageLabel}
          </span>
          {detail.badges.map((badge) => (
            <span key={badge} className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">
              {badge}
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a] sm:text-[26px] sm:leading-[34px]">{project.name}</h1>
        <p className="flex items-start gap-1.5 text-[13px] leading-[19px] text-gray-500">
          <NavIcon icon="/icons/post-options-location.svg" size={13} className="mt-[3px] shrink-0 bg-gray-500" />
          <span>
            {project.area} · by {detail.developer.name} Ltd
          </span>
        </p>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[28px] font-bold leading-9 text-[#0f172a]">{project.priceFrom}</span>
          <span className="text-[13px] font-medium leading-[19px] text-gray-500">{detail.paymentNote}</span>
        </p>
      </header>

      <KeyFacts facts={detail.keyFacts} />

      <section className={CARD}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Construction progress · {project.progress}%</h2>
          <button type="button" onClick={comingSoon("Project updates")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
            All updates ›
          </button>
        </div>
        <div
          role="progressbar"
          aria-label="Construction progress"
          aria-valuenow={project.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2.5 w-full overflow-hidden rounded-md bg-gray-200"
        >
          <div className="h-full bg-brand-900" style={{ width: `${project.progress}%` }} />
        </div>
        {detail.milestones.map((milestone) => (
          <div key={milestone.id} className="flex items-center gap-3">
            <p className="min-w-0 flex-1 text-sm font-medium leading-5 text-[#0f172a]">{milestone.title}</p>
            <span
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium leading-4",
                MILESTONE_PILL[milestone.status],
              )}
            >
              {milestone.label}
            </span>
          </div>
        ))}
      </section>

      <section className={CARD}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Unit types &amp; prices</h2>
          <button type="button" onClick={comingSoon("Floor plans")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
            Floor plans ›
          </button>
        </div>
        {detail.unitTypes.map((unit) => (
          <div key={unit.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-gray-200 p-3.5">
            <NavIcon icon="/icons/bed-sm.svg" size={17} className="shrink-0 bg-brand-900" />
            <div className="flex min-w-[140px] flex-1 flex-col gap-0.5">
              <p className="text-sm font-semibold leading-5 text-[#0f172a]">{unit.name}</p>
              <p className="text-xs leading-[17px] text-gray-500">{unit.summary}</p>
            </div>
            <p className="shrink-0 whitespace-nowrap text-[15px] font-bold leading-[22px] text-[#0f172a]">{unit.price}</p>
            <Button
              variant="outline"
              onClick={comingSoon("Reserve a unit")}
              className="h-9 w-auto shrink-0 rounded-[10px] px-4 lg:rounded-[10px]"
            >
              Reserve
            </Button>
          </div>
        ))}
      </section>

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">{detail.paymentPlan.title}</h2>
        {detail.paymentPlan.lines.map((line) => (
          <div key={line.label} className="flex items-start justify-between gap-3 text-[13px] leading-[19px]">
            <span className="text-[#334155]">{line.label}</span>
            <span className="shrink-0 whitespace-nowrap font-medium text-[#0f172a]">{line.amount}</span>
          </div>
        ))}
        <p className="text-xs leading-[17px] text-gray-500">{detail.paymentPlan.note}</p>
      </section>
    </div>
  );
}
