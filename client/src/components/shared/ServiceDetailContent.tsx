"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { KeyFacts } from "@/components/shared/KeyFacts";
import { comingSoonHref } from "@/lib/coming-soon";
import type { ServiceDetail } from "@/lib/dummy-service-detail";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

interface ServiceDetailContentProps {
  detail: ServiceDetail;
  optionId: string;
  onOptionChange: (id: string) => void;
}

/** The left column of a service page (Figma node 1052:24490): headline, key facts, options, scope, process, preparation and questions. */
export function ServiceDetailContent({ detail, optionId, onOptionChange }: ServiceDetailContentProps) {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const { service } = detail;

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-medium leading-4 text-brand-900">{service.category}</span>
          <span className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">
            {service.badge}
          </span>
        </div>
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a] sm:text-[26px] sm:leading-[34px]">{service.title}</h1>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="relative block size-7 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
            <Image src={detail.providerAvatar} alt="" fill className="object-cover" sizes="28px" />
          </span>
          <span className="text-sm font-medium leading-5 text-brand-900">{detail.providerName}</span>
          <span className="text-[13px] font-medium leading-[19px] text-[#334155]">{detail.providerRating}</span>
        </div>
      </header>

      <KeyFacts facts={detail.keyFacts} />

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Choose an option</h2>
        <div role="radiogroup" aria-label="Service option" className="flex flex-col gap-3">
          {detail.options.map((option) => {
            const selected = option.id === optionId;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onOptionChange(option.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left",
                  selected ? "border-brand-900 bg-[#eff5ff]" : "border-gray-200 hover:bg-gray-50",
                )}
              >
                <span
                  className={cn(
                    "flex size-[18px] shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-brand-900" : "border-[#cbd5e1]",
                  )}
                >
                  {selected && <span className="size-2.5 rounded-full bg-brand-900" />}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium leading-5 text-[#0f172a]">{option.label}</span>
                <span className="shrink-0 whitespace-nowrap text-sm font-bold leading-5 text-[#0f172a]">
                  {option.price === null ? "Quote required" : `GHS ${option.price.toLocaleString("en-US")}`}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className={`${CARD} self-start md:self-stretch`}>
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">What’s included</h2>
          <ul className="flex flex-col gap-2.5">
            {detail.included.map((item) => (
              <li key={item} className="flex gap-2 text-[13px] leading-[19px] text-[#334155]">
                <span className="font-bold text-[#16a34a]">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className={`${CARD} self-start`}>
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Not included</h2>
          <ul className="flex flex-col gap-2.5">
            {detail.notIncluded.map((item) => (
              <li key={item} className="flex gap-2 text-[13px] leading-[19px] text-[#334155]">
                <span className="font-bold text-[#dc2626]">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">How it works</h2>
        <ol className="flex flex-col gap-3">
          {detail.process.map((step, index) => (
            <li key={step.id} className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#eff5ff] text-xs font-bold leading-[17px] text-brand-900">
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-sm font-semibold leading-5 text-[#0f172a]">{step.title}</p>
                <p className="text-xs leading-[17px] text-gray-500">{step.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">What you need to prepare</h2>
        <p className="text-sm leading-5 text-[#334155]">{detail.prepare}</p>
      </section>

      <section className={`${CARD} gap-0`}>
        <h2 className="pb-3 text-base font-bold leading-[23px] text-[#0f172a]">Questions</h2>
        {detail.faq.map((item) => {
          const open = openFaq === item.id;
          return (
            <div key={item.id} className="border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setOpenFaq(open ? null : item.id)}
                aria-expanded={open}
                className="flex w-full items-start justify-between gap-3 py-2.5 text-left"
              >
                <span className="text-sm font-medium leading-5 text-[#0f172a]">{item.question}</span>
                <span className="shrink-0 text-base leading-[23px] text-gray-500">{open ? "−" : "+"}</span>
              </button>
              {open && <p className="pb-3 text-[13px] leading-[19px] text-[#334155]">{item.answer}</p>}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => router.push(comingSoonHref("Ask a question"))}
          className="mt-3 self-start text-[13px] font-medium leading-[19px] text-brand-900"
        >
          Ask a question
        </button>
      </section>
    </div>
  );
}
