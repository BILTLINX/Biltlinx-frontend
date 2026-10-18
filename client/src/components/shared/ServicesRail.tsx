"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const CARD = "flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-4";

/** Services side cards (Figma node 1043:22119): the Request Board prompt and a note on how prices work. */
export function ServicesRail() {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col gap-4">
      <section className={CARD}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Need something not listed?</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Describe the job on the Request Board. Providers send quotes and you choose.
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
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">About prices</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          “From” prices are the lowest the provider offers. Your final price is the accepted quote, saved with the job.
        </p>
      </section>
    </div>
  );
}
