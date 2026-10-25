"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/** Marketplace side cards (Figma nodes 1040:20770, 1040:20791): where to list, and how badges work. */
export function MarketplaceRail() {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Sell, rent or host on Biltlinx</h2>
        <p className="text-[13px] leading-[19px] text-gray-500">Buyers see the price first, so set a real asking price. Pick what you are listing:</p>
        <Button variant="primary" onClick={() => router.push("/manage/listings/new")} className="rounded-[10px] lg:rounded-[10px]">
          List a property
        </Button>
        <Button variant="outline" onClick={() => router.push("/manage/stay/new")} className="rounded-[10px] lg:rounded-[10px]">
          List a stay
        </Button>
        <Button variant="outline" onClick={() => router.push("/manage/provider")} className="rounded-[10px] lg:rounded-[10px]">
          Offer a service
        </Button>
      </section>

      <section className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">How badges work</h2>
        <p className="text-xs leading-[17px] text-gray-500">Each badge says what was checked, such as a verified lister or a verified credential. Paid placement is never a verification.</p>
      </section>
    </div>
  );
}
