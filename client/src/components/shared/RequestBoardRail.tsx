"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const CARD = "flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-4";

/** Request Board side cards (Figma node 1043:22445): post-a-request prompt and a safety reminder. */
export function RequestBoardRail() {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col gap-4">
      <section className={`${CARD} gap-3`}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Post a request in 2 minutes</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Say what you need, where, and your budget. Matching providers are notified and reply with quotes in Messages.
        </p>
        <Button
          variant="primary"
          onClick={() => router.push("/request-board/new")}
          className="rounded-[10px] lg:rounded-[10px]"
        >
          Post a request
        </Button>
      </section>

      <section className={CARD}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Stay safe</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Keep payments on Biltlinx and never pay a deposit before you have an accepted quote.
        </p>
      </section>
    </div>
  );
}
