"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { RSVP_OPTIONS, type EventDetail, type RsvpOption } from "@/lib/dummy-communities";
import { cn } from "@/lib/utils";
import { DetailAside } from "@/components/shared/DetailAside";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5";
const ROUNDED = "rounded-[10px] lg:rounded-[10px]";

/** The right column of an event page (Figma node 1087:37750): RSVP, the host and who is going. */
export function EventRsvpPanel({ detail }: { detail: EventDetail }) {
  const router = useRouter();
  const [answer, setAnswer] = useState<RsvpOption>("Going");

  return (
    <DetailAside className="xl:w-[360px]">
      <section className={CARD}>
        <h2 className="text-[15px] font-bold leading-[22px] text-[#0f172a]">
          Free · {detail.spotsLeft} of {detail.capacity} spots left
        </h2>
        <div role="radiogroup" aria-label="Are you going?" className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">Are you going?</p>
          <div className="flex flex-wrap gap-2">
            {RSVP_OPTIONS.map((option) => {
              const selected = option === answer;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setAnswer(option)}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-[13px] font-medium leading-[19px]",
                    selected ? "border-brand-900 bg-[#eff5ff] text-brand-900" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
        <Button variant="primary" onClick={() => toast.success(`RSVP saved: ${answer}`)} className={`h-12 ${ROUNDED}`}>
          Confirm RSVP
        </Button>
        <Button variant="outline" onClick={() => router.push(comingSoonHref("Add to calendar"))} className={`h-10 ${ROUNDED}`}>
          Add to calendar
        </Button>
        <p className="text-xs leading-[17px] text-gray-500">We’ll remind you the day before. You can cancel any time.</p>
      </section>

      <section className={`${CARD} gap-2.5`}>
        <div className="flex items-center gap-2.5">
          <span className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
            <Image src={detail.host.avatar} alt="" fill className="object-cover" sizes="40px" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate text-sm font-semibold leading-5 text-[#0f172a]">{detail.host.name}</p>
            <p className="text-xs leading-[17px] text-gray-500">Host</p>
          </div>
        </div>
        <span className="self-start rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">
          Business verified ✓
        </span>
      </section>

      <section className={`${CARD} gap-2`}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">{detail.going.total} going</h2>
        <div className="flex">
          {detail.going.avatars.map((avatar, index) => (
            <span
              key={avatar}
              className={cn("relative block size-8 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]", index < detail.going.avatars.length - 1 && "-mr-2")}
            >
              <Image src={avatar} alt="" fill className="object-cover" sizes="32px" />
            </span>
          ))}
        </div>
      </section>
    </DetailAside>
  );
}
