import { cn } from "@/lib/utils";

/** The round indicator on the right of a pick-one card in the onboarding flows. */
export function OnboardingRadioDot({ selected }: { selected: boolean }) {
  return <span aria-hidden className={cn("size-5 shrink-0 rounded-[10px] bg-white", selected ? "border-[6px] border-brand-900" : "border-[1.5px] border-gray-200")} />;
}
