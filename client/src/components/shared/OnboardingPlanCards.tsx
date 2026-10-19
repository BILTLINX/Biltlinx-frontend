import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingRadioDot } from "@/components/shared/OnboardingRadioDot";
import { cn } from "@/lib/utils";

export interface OnboardingPlan {
  id: string;
  name: string;
  price: string;
  /** "/month" for priced plans; empty for custom pricing. */
  per: string;
  note: string;
  badge?: string;
  features: string[];
}

const COLUMNS: Record<number, string> = { 2: "@xl:grid-cols-2", 3: "@xl:grid-cols-3", 4: "@xl:grid-cols-4" };

interface OnboardingPlanCardsProps {
  plans: OnboardingPlan[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/** The pick-one plan cards of an onboarding flow. Columns follow the width of the space they sit in, which changes with the layout around them. */
export function OnboardingPlanCards({ plans, selectedId, onSelect }: OnboardingPlanCardsProps) {
  return (
    <div className="@container">
      <div role="radiogroup" aria-label="Plan" className={cn("grid grid-cols-1 gap-3 @md:grid-cols-2", COLUMNS[plans.length])}>
        {plans.map((plan) => {
          const selected = plan.id === selectedId;
          return (
            <button
              key={plan.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(plan.id)}
              className={cn("flex flex-col items-start gap-3 rounded-[14px] p-4 text-left", selected ? "border-2 border-brand-900 bg-[#eff5ff] p-[15px]" : "border border-gray-200 bg-white hover:border-gray-300")}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="text-base font-bold leading-[1.45] text-[#0f172a]">{plan.name}</span>
                <OnboardingRadioDot selected={selected} />
              </span>
              {plan.badge && <span className="rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-brand-900">{plan.badge}</span>}
              <span className="flex items-baseline gap-1 whitespace-nowrap leading-[1.45]">
                <span className="text-xl font-extrabold text-[#0f172a]">{plan.price}</span>
                {plan.per && <span className="text-xs font-medium text-gray-500">{plan.per}</span>}
              </span>
              <span className="text-xs leading-[1.45] text-gray-500">{plan.note}</span>
              <span className="flex w-full flex-col gap-2">
                {plan.features.map((feature) => (
                  <span key={feature} className="flex items-start gap-2 text-xs font-medium leading-[1.45] text-[#334155]">
                    <NavIcon icon="/icons/onboarding-tick.svg" size={10} className="mt-1 shrink-0 bg-[#16a34a]" />
                    {feature}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
