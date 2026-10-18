"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { OTHER_PLANS } from "@/lib/dummy-concierge";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

/** Concierge side cards (Figma node 1044:22431): human help and the other plans in progress. */
export function ConciergeRail() {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col gap-4">
      <section className={`${CARD} gap-2.5`}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Prefer a person?</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Managed Concierge assigns a coordinator who runs the plan with you. Available as an add-on.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push(comingSoonHref("Managed Concierge"))}
          className="rounded-[10px] lg:rounded-[10px]"
        >
          Talk to a coordinator
        </Button>
      </section>

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Other plans</h2>
        {OTHER_PLANS.map((plan) => (
          <div key={plan.id} className="flex flex-col gap-0.5">
            <p className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{plan.title}</p>
            <p className="text-xs leading-[17px] text-gray-500">{plan.status}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
