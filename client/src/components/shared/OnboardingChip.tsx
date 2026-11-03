import { NavIcon } from "@/components/shared/NavIcon";
import { cn } from "@/lib/utils";

/** A pill that toggles on and off in a setup step, with a tick when chosen. */
export function OnboardingChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] leading-[1.45]",
        selected ? "border-brand-900 bg-[#eff5ff] font-semibold text-brand-900" : "border-gray-200 bg-white font-medium text-[#334155] hover:border-gray-300",
      )}
    >
      {selected && <NavIcon icon="/icons/onboarding-tick.svg" size={10} className="bg-brand-900" />}
      {label}
    </button>
  );
}
