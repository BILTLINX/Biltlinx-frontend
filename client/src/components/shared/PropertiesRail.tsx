"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";

const CARD = "flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-4";
const ROUNDED_BUTTON = "rounded-[10px] lg:rounded-[10px]";

/** Properties side cards (Figma node 1042:20565): map preview, search alerts and Concierge. */
export function PropertiesRail() {
  const router = useRouter();
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <div className="flex w-full flex-col gap-4">
      <section className={`${CARD} gap-3`}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Map view</h2>
        <div className="relative h-[180px] w-full overflow-hidden rounded-xl">
          <Image src="/images/properties-map.jpg" alt="Map of listings" fill className="object-cover" sizes="320px" />
        </div>
        <p className="text-xs leading-[17px] text-gray-500">
          Exact addresses of private homes are shown after the owner accepts your viewing request.
        </p>
        <Button variant="outline" onClick={comingSoon("Map view")} className={ROUNDED_BUTTON}>
          Open map
        </Button>
      </section>

      <section className={CARD}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Get alerts for this search</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          We will tell you about new homes and price drops that match “4+ bed houses in East Legon”.
        </p>
        <button
          type="button"
          onClick={comingSoon("Search alerts")}
          className="h-10 w-full rounded-[10px] bg-[#eff5ff] px-4 text-sm font-medium text-brand-900 hover:bg-[#e2edff]"
        >
          Turn on alerts
        </button>
      </section>

      <section className={CARD}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Not sure where to start?</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Tell Concierge your budget and area. It builds a shortlist and books viewings, and you confirm every step.
        </p>
        <Button variant="primary" onClick={comingSoon("Concierge")} className={ROUNDED_BUTTON}>
          Ask Concierge
        </Button>
      </section>
    </div>
  );
}
