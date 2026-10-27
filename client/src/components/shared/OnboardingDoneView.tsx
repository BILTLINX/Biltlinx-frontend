import type { ReactNode } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { cn } from "@/lib/utils";

export interface DoneStep {
  id: string;
  title: string;
  note: string;
  icon: string;
  iconClass?: string;
  /** done is green, pending is amber (waiting on a check), todo is blue (something left for the person to do). */
  tone: "done" | "pending" | "todo";
  /** A status pill, or a link-style action. */
  pill?: string;
  action?: { label: string; onClick: () => void };
}

const TONE = {
  done: { tile: "bg-[#dcfce7]", icon: "bg-[#16a34a]", pill: "bg-[#dcfce7] text-[#16a34a]" },
  pending: { tile: "bg-[#fef3c7]", icon: "bg-[#b45309]", pill: "bg-[#fef3c7] text-[#b45309]" },
  todo: { tile: "bg-[#eff5ff]", icon: "bg-brand-900", pill: "bg-[#eff5ff] text-brand-900" },
};

interface OnboardingDoneViewProps {
  title: string;
  subtitle: string;
  strength: number;
  steps: DoneStep[];
  primary: { label: string; onClick: () => void };
  secondary: { label: string; onClick: () => void };
  /** The small line under the buttons, or above the card with `notePlacement="above"`. */
  note: string;
  notePlacement?: "above" | "below";
  onClose: () => void;
  /** Extra content between the heading and the card, if any. */
  children?: ReactNode;
}

/** The "you're all set" screen that ends every onboarding flow: what was done and what is left to do. */
export function OnboardingDoneView({ title, subtitle, strength, steps, primary, secondary, note, notePlacement = "below", onClose, children }: OnboardingDoneViewProps) {
  const noteLine = (
    <p className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[13px] font-medium leading-[1.45] text-[#334155]">
      <NavIcon icon="/icons/onboarding-user-switch.svg" size={18} className="shrink-0 bg-brand-900" />
      {note}
    </p>
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar onAction={onClose} />

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:py-12">
        <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-6">
          <span className="flex size-20 items-center justify-center rounded-full bg-[#dcfce7]">
            <NavIcon icon="/icons/onboarding-check-circle.svg" size={40} className="bg-[#16a34a]" />
          </span>

          <div className="flex flex-col gap-2 text-center leading-[1.45]">
            <h1 className="text-[26px] font-extrabold text-[#0f172a] sm:text-[30px]">{title}</h1>
            <p className="text-[15px] text-gray-500">{subtitle}</p>
          </div>

          {notePlacement === "above" && noteLine}

          {children}

          <section className="flex w-full flex-col rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
              <h2 className="text-base font-bold leading-[1.45] text-[#0f172a]">What happens next</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold leading-[1.45] text-[#16a34a]">Profile strength {strength}%</span>
                <div role="progressbar" aria-label="Profile strength" aria-valuemin={0} aria-valuemax={100} aria-valuenow={strength} className="h-1.5 w-[120px] overflow-hidden rounded-[3px] bg-[#e2e8f0]">
                  <div className="h-full rounded-[3px] bg-[#16a34a]" style={{ width: `${strength}%` }} />
                </div>
              </div>
            </div>
            <ul>
              {steps.map((step) => {
                const tone = TONE[step.tone];
                return (
                  <li key={step.id} className="flex items-center gap-3.5 border-t border-gray-200 py-3.5">
                    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-[10px]", tone.tile)}>
                      <NavIcon icon={step.icon} size={20} className={cn(tone.icon, step.iconClass)} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                      <span className="text-sm font-semibold text-[#0f172a]">{step.title}</span>
                      <span className="text-[13px] text-gray-500">{step.note}</span>
                    </span>
                    {step.pill && <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold leading-[1.45]", tone.pill)}>{step.pill}</span>}
                    {step.action && (
                      <button type="button" onClick={step.action.onClick} className="shrink-0 whitespace-nowrap text-[13px] font-semibold text-brand-900">
                        {step.action.label}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="flex flex-wrap items-start justify-center gap-3">
            <button type="button" onClick={primary.onClick} className="flex items-center gap-2 whitespace-nowrap rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
              {primary.label}
              <NavIcon icon="/icons/onboarding-arrow-right.svg" size={10} className="bg-white" />
            </button>
            <button type="button" onClick={secondary.onClick} className="whitespace-nowrap rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
              {secondary.label}
            </button>
          </div>

          {notePlacement === "below" && noteLine}
        </div>
      </main>
    </div>
  );
}
