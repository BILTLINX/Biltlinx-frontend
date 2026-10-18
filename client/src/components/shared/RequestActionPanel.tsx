"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { RequestDetail } from "@/lib/dummy-requests";
import { DetailAside } from "@/components/shared/DetailAside";
import { SendQuoteModal } from "@/components/shared/SendQuoteModal";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5";
const ROUNDED = "rounded-[10px] lg:rounded-[10px]";

/** The right column of a request page (Figma node 1061:30787): budget and quote actions, plus similar requests nearby. */
export function RequestActionPanel({ detail }: { detail: RequestDetail }) {
  const [saved, setSaved] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { request } = detail;

  return (
    <DetailAside className="xl:w-[360px]">
      <section className={CARD}>
        <p className="text-[22px] font-bold leading-[30px] text-[#0f172a]">{request.budget.replace("Budget ", "")}</p>
        <p className="text-xs leading-[17px] text-gray-500">
          Customer budget · {request.quotes} {request.quotes === 1 ? "quote" : "quotes"} so far
        </p>
        <Button variant="primary" onClick={() => setQuoteOpen(true)} className={`h-12 ${ROUNDED}`}>
          Send quote
        </Button>
        <Button variant="outline" onClick={() => setSaved((v) => !v)} aria-pressed={saved} className={`h-11 ${ROUNDED}`}>
          {saved ? "Saved" : "Save request"}
        </Button>
        <p className="text-xs leading-[17px] text-gray-500">Quotes are unlimited on your Pro plan.</p>
      </section>

      <section className={`${CARD} gap-2.5`}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Similar requests nearby</h2>
        {detail.similar.map((item) => (
          <Link key={item.id} href={`/request-board/${item.id}`} className="flex flex-col gap-0.5 py-2">
            <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a] hover:text-brand-900">{item.title}</span>
            <span className="text-xs leading-[17px] text-gray-500">
              {item.location.split(",")[0]} · {item.budget.replace("Budget ", "")}
            </span>
          </Link>
        ))}
      </section>
      {quoteOpen && <SendQuoteModal open onClose={() => setQuoteOpen(false)} request={{ poster: request.poster, title: request.title }} />}
    </DetailAside>
  );
}
