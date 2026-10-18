"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { KeyFacts } from "@/components/shared/KeyFacts";
import { comingSoonHref } from "@/lib/coming-soon";
import type { RequestDetail } from "@/lib/dummy-requests";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5";

/** The left column of a request page (Figma node 1061:30786): the request itself and the providers' questions. */
export function RequestDetailContent({ detail }: { detail: RequestDetail }) {
  const router = useRouter();
  const { request } = detail;

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
      <section className={`${CARD} sm:p-6`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-medium leading-4 text-brand-900">{request.category}</span>
          <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-xs font-medium leading-4 text-[#16a34a]">
            Open · {request.quotes} {request.quotes === 1 ? "quote" : "quotes"} so far
          </span>
          <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-medium leading-4 text-[#334155]">Verified providers only</span>
        </div>
        <h1 className="text-xl font-bold leading-7 text-[#0f172a] sm:text-2xl sm:leading-8">{request.title}</h1>
        <div className="flex items-center gap-2.5">
          <span className="relative block size-8 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
            <Image src={request.posterAvatar} alt="" fill className="object-cover" sizes="32px" />
          </span>
          <p className="text-[13px] font-medium leading-[19px] text-[#334155]">
            {request.poster} · ID verified ✓ · posted {request.postedAgo}
          </p>
        </div>
        <p className="text-sm leading-5 text-[#334155]">{detail.description}</p>
        <div className="flex flex-wrap gap-2">
          {detail.photos.map((photo) => (
            <span key={photo} className="relative block h-[110px] w-[calc(50%-4px)] overflow-hidden rounded-[10px] bg-[#eef2ff] sm:w-40">
              <Image src={photo} alt="" fill className="object-cover" sizes="160px" />
            </span>
          ))}
        </div>
        <KeyFacts
          facts={[
            { value: request.budget.replace("Budget ", ""), label: "Budget" },
            { value: request.location, label: "Location" },
            { value: request.timing, label: "Needed" },
            { value: detail.materials, label: "Materials" },
          ]}
        />
      </section>

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Questions from providers</h2>
        {detail.questions.map((item) => (
          <div key={item.id} className="flex flex-col gap-1 rounded-xl bg-[#f8fafc] p-3 text-[13px] leading-[19px]">
            <p className="font-semibold text-[#0f172a]">Q: {item.question}</p>
            <p className="text-[#334155]">A: {item.answer}</p>
          </div>
        ))}
        <button
          type="button"
          onClick={() => router.push(comingSoonHref("Ask a question"))}
          className="self-start text-[13px] font-medium leading-[19px] text-brand-900"
        >
          Ask a question
        </button>
      </section>
    </div>
  );
}
