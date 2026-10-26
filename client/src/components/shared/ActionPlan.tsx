"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import type { PlanStep, PlanStepStatus } from "@/lib/dummy-concierge";
import { cn } from "@/lib/utils";

const BADGE_CLASS: Record<PlanStepStatus, string> = {
  done: "bg-[#16a34a] text-white",
  current: "bg-brand-900 text-white",
  upcoming: "bg-gray-200 text-gray-500",
};

/** Concierge's step-by-step plan (Figma node 1044:22453): finished steps, the one needing you now, and what's still to come. */
export function ActionPlan({ steps }: { steps: PlanStep[] }) {
  const router = useRouter();

  return (
    <ol className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-gray-200 px-5 py-4 last:border-b-0"
        >
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold leading-[17px]",
              BADGE_CLASS[step.status],
            )}
            aria-hidden
          >
            {step.status === "done" ? "✓" : index + 1}
          </span>
          <div className={cn("flex min-w-[200px] flex-1 flex-col gap-0.5", step.status === "upcoming" && "text-gray-500")}>
            <p className={cn("text-[15px] font-semibold leading-[22px]", step.status !== "upcoming" && "text-[#0f172a]")}>
              {step.title}
            </p>
            <p className="text-xs leading-[17px] text-gray-500">{step.detail}</p>
          </div>
          {step.completedLabel && (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#dcfce7] px-2.5 py-1 text-[11px] font-medium leading-4 text-[#16a34a]">
              {step.completedLabel}
            </span>
          )}
          {step.action && (
            <Button
              variant="primary"
              onClick={() => router.push(comingSoonHref(step.action!))}
              className="h-9 w-auto shrink-0 whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]"
            >
              {step.action}
            </Button>
          )}
        </li>
      ))}
    </ol>
  );
}
