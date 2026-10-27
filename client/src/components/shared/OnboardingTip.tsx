import type { ReactNode } from "react";
import { NavIcon } from "@/components/shared/NavIcon";

/** The blue note under a setup flow's preview card. */
export function OnboardingTip({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-[14px] bg-[#eff5ff] p-4">
      <NavIcon icon={icon} size={20} className="shrink-0 bg-brand-900" />
      <div className="flex min-w-0 flex-col gap-1 text-[13px] leading-[1.45]">
        <p className="font-bold text-[#0f172a]">{title}</p>
        <p className="text-[#334155]">{children}</p>
      </div>
    </div>
  );
}
