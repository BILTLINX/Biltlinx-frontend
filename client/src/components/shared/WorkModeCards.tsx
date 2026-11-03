import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingRadioDot } from "@/components/shared/OnboardingRadioDot";
import { cn } from "@/lib/utils";

export interface WorkModeOption<Id extends string> {
  id: Id;
  label: string;
  icon: string;
  /** For glyphs that are exported flipped. */
  iconClass?: string;
}

interface WorkModeCardsProps<Id extends string> {
  options: readonly WorkModeOption<Id>[];
  value: Id;
  onChange: (id: Id) => void;
}

/** Two big radio cards for how someone works, such as independently or with a team. */
export function WorkModeCards<Id extends string>({ options, value, onChange }: WorkModeCardsProps<Id>) {
  return (
    <div role="radiogroup" aria-label="How you work" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            className={cn("flex items-center gap-3.5 rounded-xl p-4 text-left", selected ? "border-[1.5px] border-brand-900 bg-[#eff5ff] p-[15.5px]" : "border border-gray-200 bg-white hover:border-gray-300")}
          >
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-[10px]", selected ? "bg-white" : "bg-[#f1f5f9]")}>
              <NavIcon icon={option.icon} size={20} className={cn(selected ? "bg-brand-900" : "bg-[#334155]", option.iconClass)} />
            </span>
            <span className="min-w-0 flex-1 text-sm font-semibold leading-[1.45] text-[#0f172a]">{option.label}</span>
            <OnboardingRadioDot selected={selected} />
          </button>
        );
      })}
    </div>
  );
}
