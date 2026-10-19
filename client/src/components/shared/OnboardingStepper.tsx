import { NavIcon } from "@/components/shared/NavIcon";
import { cn } from "@/lib/utils";

export interface OnboardingStep {
  id: string;
  title: string;
  note: string;
}

interface OnboardingStepperProps {
  title: string;
  duration: string;
  icon: string;
  /** Extra classes for the icon, for glyphs that are exported flipped. */
  iconClass?: string;
  steps: OnboardingStep[];
  /** Index of the step the user is on; earlier steps count as done. */
  current: number;
  /** Small print under the steps. */
  note?: string;
}

/** The left card of a setup flow: which flow it is, how far along, and the steps. */
export function OnboardingStepper({ title, duration, icon, iconClass, steps, current, note = "Everything here can be changed later in Settings." }: OnboardingStepperProps) {
  return (
    <aside className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#eff5ff]">
          <NavIcon icon={icon} size={18} className={cn("bg-brand-900", iconClass)} />
        </span>
        <div className="flex min-w-0 flex-col leading-[1.45]">
          <p className="text-[15px] font-bold text-[#0f172a]">{title}</p>
          <p className="text-xs text-gray-500">{duration}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={current} className="h-1.5 overflow-hidden rounded-[3px] bg-[#e2e8f0]">
          <div className="h-full rounded-[3px] bg-brand-900 transition-all" style={{ width: `${(current / steps.length) * 100}%`, minWidth: 6 }} />
        </div>
        <p className="text-xs font-medium leading-[1.45] text-gray-500">
          {current} of {steps.length} steps done
        </p>
      </div>

      <ol className="flex flex-col gap-1">
        {steps.map((step, index) => {
          const active = index === current;
          const done = index < current;
          return (
            <li key={step.id} aria-current={active ? "step" : undefined} className={cn("flex items-start gap-3 rounded-[10px] p-2.5", active && "bg-[#eff5ff]")}>
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold leading-[1.45]",
                  active && "bg-brand-900 text-white",
                  done && "bg-[#16a34a]",
                  !active && !done && "border-[1.5px] border-gray-200 bg-white text-gray-500",
                )}
              >
                {done ? <NavIcon icon="/icons/onboarding-tick.svg" size={10} className="bg-white" /> : index + 1}
              </span>
              <span className="flex min-w-0 flex-col leading-[1.45]">
                <span className={cn("text-sm", active || done ? "font-semibold text-[#0f172a]" : "font-medium text-gray-500")}>{step.title}</span>
                <span className="text-xs text-gray-500">{step.note}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <p className="text-xs leading-[1.45] text-gray-500">{note}</p>
    </aside>
  );
}

