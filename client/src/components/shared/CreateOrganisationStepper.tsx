import { CREATE_ORGANISATION_STEPS } from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

/** The step list beside the create-organisation form; steps before `current` (0-based) are ticked. Stays in view while the form scrolls. */
export function CreateOrganisationStepper({ current }: { current: number }) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 rounded-2xl bg-[#f8fafc] p-5 lg:sticky lg:top-6 lg:w-[300px]">
      <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Set up your organisation</h2>
      <p className="text-xs leading-[17px] text-gray-500">You stay the owner and admin. The organisation gets its own page and team.</p>
      <ol className="mt-4 flex flex-col gap-1">
        {CREATE_ORGANISATION_STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step.title} aria-current={active ? "step" : undefined} className={cn("flex items-center gap-3 rounded-[10px] p-2.5", active && "border border-gray-200 bg-white")}>
              <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold leading-[17px]", done ? "bg-[#16a34a] text-white" : active ? "bg-brand-900 text-white" : "bg-gray-200 text-gray-500")}>{done ? "✓" : index + 1}</span>
              <span className="flex min-w-0 flex-col">
                <span className={cn("text-[13px] font-semibold leading-[19px]", done || active ? "text-[#0f172a]" : "text-[#94a3b8]")}>{step.title}</span>
                <span className="text-[11px] leading-4 text-gray-500">{step.note}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
