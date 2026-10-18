"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const CARD = "flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-4";

const HIRING_STEPS = [
  "Describe the job and add photos",
  "Compare quotes in Messages",
  "Accept a quote to create the job",
  "Pay through Biltlinx when it’s done",
  "Leave a review",
];

/** Artisans side cards (Figma node 1043:21711): how hiring works and the multi-trade Request Board prompt. */
export function ArtisansRail() {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col gap-4">
      <section className={CARD}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">How hiring works</h2>
        <ol className="flex flex-col gap-2.5">
          {HIRING_STEPS.map((step, index) => (
            <li key={step} className="text-xs font-medium leading-[17px] text-[#334155]">
              {index + 1}. {step}
            </li>
          ))}
        </ol>
      </section>

      <section className={CARD}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Have a job for several trades?</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Post it once on the Request Board and get quotes from artisans nearby.
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
