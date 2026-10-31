import Link from "next/link";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ConciergeStepDto, ConciergeStepStatus } from "@/types/api/concierge";

const BADGE_CLASS: Record<ConciergeStepStatus, string> = {
  Done: "bg-[#16a34a] text-white",
  Current: "bg-brand-900 text-white",
  Upcoming: "bg-gray-200 text-gray-500",
};

export function ActionPlan({ steps }: { steps: ConciergeStepDto[] }) {
  return (
    <ol className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {steps.map((step, index) => (
        <li key={step.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-gray-200 px-5 py-4 last:border-b-0">
          <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold leading-[17px]", BADGE_CLASS[step.status])} aria-hidden>
            {step.status === "Done" ? "✓" : index + 1}
          </span>
          <div className={cn("flex min-w-[200px] flex-1 flex-col gap-0.5", step.status === "Upcoming" && "text-gray-500")}>
            <p className={cn("text-[15px] font-semibold leading-[22px]", step.status !== "Upcoming" && "text-[#0f172a]")}>{step.title}</p>
            {step.detail && <p className="text-xs leading-[17px] text-gray-500">{step.detail}</p>}
          </div>
          {step.status === "Done" && step.completedAt && (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#dcfce7] px-2.5 py-1 text-[11px] font-medium leading-4 text-[#16a34a]">
              Completed {formatDate(step.completedAt)}
            </span>
          )}
          {step.status !== "Done" && step.actionHref && (
            <Link href={step.actionHref} className="flex h-9 shrink-0 items-center whitespace-nowrap rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white hover:bg-brand-900/90">
              {step.actionLabel ?? "Open"}
            </Link>
          )}
        </li>
      ))}
    </ol>
  );
}
