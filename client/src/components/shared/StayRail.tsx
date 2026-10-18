"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const CARD = "flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-4";
const ROUNDED_BUTTON = "rounded-[10px] lg:rounded-[10px]";

/** Stay side cards (Figma node 1042:21054): long-stay pointer to rentals, and the host call to action. */
export function StayRail() {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col gap-4">
      <section className={CARD}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Staying longer than a month?</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Monthly rentals are under Properties → Rent. Stay is for nightly bookings only.
        </p>
        <Button variant="outline" onClick={() => router.push("/properties")} className={ROUNDED_BUTTON}>
          Browse rentals
        </Button>
      </section>

      <section className={CARD}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Host on Biltlinx</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          List your apartment or hotel rooms, manage your calendar and get paid through Biltlinx.
        </p>
        <Button variant="primary" onClick={() => router.push("/manage/stay/new")} className={ROUNDED_BUTTON}>
          List your stay
        </Button>
      </section>
    </div>
  );
}
