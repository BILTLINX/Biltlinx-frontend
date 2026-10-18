"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const CARD = "flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-4";

/** Professionals side cards (Figma node 1043:21305): what the badges mean, and a pointer to the Request Board. */
export function ProfessionalsRail() {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col gap-4">
      <section className={CARD}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">What the badges mean</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          “Credential verified · GIA” means Biltlinx checked the licence with the named body. A paid plan never adds a
          badge.
        </p>
      </section>

      <section className={CARD}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Can’t find the right person?</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Post your job on the Request Board and let professionals send you quotes.
        </p>
        <Button
          variant="primary"
          onClick={() => router.push("/request-board/new")}
          className="rounded-[10px] lg:rounded-[10px]"
        >
          Post a request
        </Button>
      </section>
    </div>
  );
}
