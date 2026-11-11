"use client";

import Image from "next/image";
import { useState } from "react";
import { KeyFacts } from "@/components/shared/KeyFacts";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { formatMoney, formatRelative } from "@/lib/format";
import type { ProjectDetailView } from "@/lib/project-mapper";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

const MILESTONE_PILL: Record<string, string> = {
  done: "bg-[#dcfce7] text-[#16a34a]",
  "in-progress": "bg-[#eff5ff] text-brand-900",
  upcoming: "bg-[#f1f5f9] text-[#334155]",
};

interface ProjectDetailContentProps {
  detail: ProjectDetailView;
  onReserve: (unitId: string) => void;
}

/** The left column of a project page (Figma node 1060:30691): headline, key facts, construction progress, unit types and the payment plan. */
export function ProjectDetailContent({ detail, onReserve }: ProjectDetailContentProps) {
  const { project } = detail;
  const [planUnitId, setPlanUnitId] = useState<string | null>(null);
  const activeUnits = detail.unitTypes.filter((unit) => unit.isActive);
  const planUnit = activeUnits.find((unit) => unit.id === planUnitId) ?? activeUnits[0];

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
          {project.status !== "Published" && (
            <span className="rounded-full bg-[#fef3c7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#b45309]">{project.status}</span>
          )}
        </div>
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a] sm:text-[26px] sm:leading-[34px]">{project.name}</h1>
        <p className="flex items-start gap-1.5 text-[13px] leading-[19px] text-gray-500">
          <NavIcon icon="/icons/post-options-location.svg" size={13} className="mt-[3px] shrink-0 bg-gray-500" />
          <span>
            {project.area} · by {detail.developer.name}
          </span>
        </p>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[28px] font-bold leading-9 text-[#0f172a]">{project.priceFrom}</span>
          <span className="text-[13px] font-medium leading-[19px] text-gray-500">{project.summary}</span>
        </p>
      </header>

      <KeyFacts facts={detail.keyFacts} />

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">About this project</h2>
        <p className="whitespace-pre-line text-sm leading-6 text-[#334155]">{detail.description}</p>
        {detail.address && <p className="text-xs leading-[17px] text-gray-500">{detail.address}</p>}
      </section>

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Construction progress · {project.progress}%</h2>
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
        {detail.milestones.length === 0 && <p className="text-[13px] leading-[19px] text-gray-500">The developer has not added milestones yet.</p>}
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

      {detail.updates.length > 0 && (
        <section className={CARD}>
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Site updates</h2>
          {detail.updates.map((update) => (
            <div key={update.id} className="flex gap-3">
              {update.photoUrl && (
                <span className="relative block h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-[#eef2ff]">
                  <Image src={update.photoUrl} alt="" fill className="object-cover" sizes="80px" />
                </span>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-sm leading-5 text-[#0f172a]">{update.note}</p>
                <p className="text-xs leading-[17px] text-gray-500">{formatRelative(update.createdAt)}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Unit types &amp; prices</h2>
        {activeUnits.length === 0 && <p className="text-[13px] leading-[19px] text-gray-500">No unit types are on sale yet.</p>}
        {activeUnits.map((unit) => (
          <div key={unit.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-gray-200 p-3.5">
            <NavIcon icon="/icons/bed-sm.svg" size={17} className="shrink-0 bg-brand-900" />
            <div className="flex min-w-[140px] flex-1 flex-col gap-0.5">
              <p className="text-sm font-semibold leading-5 text-[#0f172a]">{unit.name}</p>
              <p className="text-xs leading-[17px] text-gray-500">{unit.summary}</p>
            </div>
            <p className="shrink-0 whitespace-nowrap text-[15px] font-bold leading-[22px] text-[#0f172a]">{formatMoney(unit.price, unit.currency)}</p>
            {!detail.isOwner && (
              <Button
                variant="outline"
                onClick={() => onReserve(unit.id)}
                disabled={unit.available === 0}
                className="h-9 w-auto shrink-0 rounded-[10px] px-4 lg:rounded-[10px]"
              >
                {unit.available === 0 ? "Sold out" : "Reserve"}
              </Button>
            )}
          </div>
        ))}
      </section>

      {planUnit && (
        <section className={CARD}>
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">{planUnit.paymentPlan.title}</h2>
          {activeUnits.length > 1 && (
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Unit type">
              {activeUnits.map((unit) => (
                <button
                  key={unit.id}
                  type="button"
                  role="radio"
                  aria-checked={unit.id === planUnit.id}
                  onClick={() => setPlanUnitId(unit.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    unit.id === planUnit.id ? "border-brand-900 bg-[#eff5ff] text-brand-900" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                  )}
                >
                  {unit.name}
                </button>
              ))}
            </div>
          )}
          <PlanLines unit={planUnit} />
          <p className="text-xs leading-[17px] text-gray-500">{detail.paymentNote}</p>
        </section>
      )}
    </div>
  );
}

export function PlanLines({ unit }: { unit: ProjectDetailView["unitTypes"][number] }) {
  const plan = unit.paymentPlan;
  const lines = [
    { label: `Deposit to reserve (${plan.depositPercent}%)`, amount: formatMoney(plan.deposit, unit.currency) },
    ...(plan.installments > 0
      ? [{ label: `During construction · ${plan.installments} monthly payments`, amount: `${formatMoney(plan.installmentAmount, unit.currency)} / month` }]
      : []),
    ...(plan.handoverPercent > 0 ? [{ label: `On handover (${plan.handoverPercent}%)`, amount: formatMoney(plan.handover, unit.currency) }] : []),
  ];

  return (
    <>
      {lines.map((line) => (
        <div key={line.label} className="flex items-start justify-between gap-3 text-[13px] leading-[19px]">
          <span className="text-[#334155]">{line.label}</span>
          <span className="shrink-0 whitespace-nowrap font-medium text-[#0f172a]">{line.amount}</span>
        </div>
      ))}
    </>
  );
}
