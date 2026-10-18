"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { CONSULTATION_PRICE, SERVICE_FEE_RATE, type ServiceDetail } from "@/lib/dummy-service-detail";
import { DetailAside } from "@/components/shared/DetailAside";
import { RequestQuoteModal, quoteServiceFromDetail } from "@/components/shared/RequestQuoteModal";

const ROUNDED = "rounded-[10px] lg:rounded-[10px]";

function ghs(amount: number) {
  return `GHS ${amount.toLocaleString("en-US")}`;
}

/** The right column of a service page (Figma node 1052:24491): the chosen option's price, booking actions and similar providers. */
export function ServiceActionPanel({ detail, optionId }: { detail: ServiceDetail; optionId: string }) {
  const router = useRouter();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const option = detail.options.find((candidate) => candidate.id === optionId) ?? detail.options[0];
  const price = option.price;
  const fee = price === null ? 0 : Math.round(price * SERVICE_FEE_RATE);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <DetailAside className="xl:w-[360px]">
      <section className="flex flex-col gap-3.5 rounded-2xl border border-gray-200 bg-white p-5">
        <p className="text-2xl font-bold leading-8 text-[#0f172a]">{price === null ? "Quote required" : ghs(price)}</p>
        <p className="text-xs leading-[17px] text-gray-500">
          {option.label} · {price === null ? "price agreed in your quote" : "fixed price"}
        </p>
        {price !== null && (
          <div className="flex flex-col gap-1.5 rounded-xl bg-gray-50 p-3 text-[13px] leading-[19px]">
            <div className="flex justify-between gap-3">
              <span className="text-[#334155]">Drawings &amp; permit pack</span>
              <span className="whitespace-nowrap font-medium text-[#0f172a]">{ghs(price)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[#334155]">Biltlinx service fee</span>
              <span className="whitespace-nowrap font-medium text-[#0f172a]">{ghs(fee)}</span>
            </div>
            <div className="flex justify-between gap-3 font-bold">
              <span className="text-[#334155]">Total</span>
              <span className="whitespace-nowrap text-[#0f172a]">{ghs(price + fee)}</span>
            </div>
          </div>
        )}
        <Button variant="primary" onClick={() => setQuoteOpen(true)} className={`h-12 ${ROUNDED}`}>
          Request quote
        </Button>
        <Button variant="outline" onClick={comingSoon("Book consultation")} className={`h-11 ${ROUNDED}`}>
          Book consultation · {ghs(CONSULTATION_PRICE)}
        </Button>
        <p className="text-xs leading-[17px] text-gray-500">
          You won’t be charged until you accept a quote. Payments are held by Biltlinx until the work is delivered.
        </p>
      </section>

      <section className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Compare with similar providers</h2>
        {detail.similar.map((provider) => (
          <div key={provider.id} className="flex items-center gap-2.5">
            <span className="relative block size-8 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
              <Image src={provider.avatar} alt="" fill className="object-cover" sizes="32px" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-[13px] font-semibold leading-[19px] text-[#0f172a]">{provider.name}</p>
              <p className="text-xs leading-[17px] text-gray-500">{provider.from}</p>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={comingSoon("Compare providers")}
          className="h-9 w-full rounded-[10px] bg-[#eff5ff] px-4 text-sm font-medium text-brand-900 hover:bg-[#e2edff]"
        >
          Compare providers
        </button>
      </section>
      {quoteOpen && <RequestQuoteModal open onClose={() => setQuoteOpen(false)} service={quoteServiceFromDetail(detail, optionId)} />}
    </DetailAside>
  );
}
