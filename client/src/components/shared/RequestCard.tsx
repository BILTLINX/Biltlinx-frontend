import Image from "next/image";
import Link from "next/link";
import { NavIcon } from "@/components/shared/NavIcon";
import { formatDate, formatRelative } from "@/lib/format";
import { QUOTE_REQUEST_TONE } from "@/lib/services-labels";
import { cn } from "@/lib/utils";
import type { QuoteRequestDto } from "@/types/api/schema";

const PILL = "rounded-full px-2.5 py-1 text-xs font-medium leading-4";
const FACT = "flex items-center gap-1.5 text-xs leading-[17px] text-[#64748a]";
const ACTION = "flex h-10 items-center justify-center rounded-[10px] px-4 text-sm font-medium leading-5";

/** One request on the board (Figma node 1043:22444): category and timing pills, quote count, title, place and budget, who posted it, and the actions. */
export function RequestCard({ request, mine }: { request: QuoteRequestDto; mine: boolean }) {
  const href = `/request-board/${request.id}`;
  const quotes = `${request.quoteCount} ${request.quoteCount === 1 ? "quote" : "quotes"}`;
  const status = request.status && request.status !== "Open" ? request.status : null;
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {request.category && <span className={cn(PILL, "bg-[#eff5ff] text-brand-900")}>{request.category}</span>}
          {request.preferredStart && <span className={cn(PILL, "bg-[#f1f5f9] text-[#334155]")}>Start {formatDate(request.preferredStart)}</span>}
          {request.requiresInspection && <span className={cn(PILL, "bg-[#fef3c7] text-[#b45309]")}>Site inspection first</span>}
          {status && <span className={cn(PILL, QUOTE_REQUEST_TONE[status])}>{status}</span>}
        </div>
        <p className="shrink-0 text-[13px] font-medium leading-[19px] text-[#64748a]">{quotes}</p>
      </div>

      <h2 className="text-[17px] font-bold leading-[25px] text-[#0f172a]">{request.title}</h2>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {request.city && (
          <p className={FACT}>
            <NavIcon icon="/icons/location-01.svg" size={14} className="shrink-0 bg-[#64748a]" />
            {request.city}
          </p>
        )}
        {request.budget !== null && (
          <p className={FACT}>
            <NavIcon icon="/icons/wallet-01.svg" size={14} className="shrink-0 bg-[#64748a]" />
            Budget {request.currency} {request.budget.toLocaleString("en-GH")}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative size-7 shrink-0 overflow-hidden rounded-full bg-gray-100">
            <Image src={request.requester.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt="" fill className="object-cover" sizes="28px" />
          </span>
          <p className="min-w-0 truncate text-xs leading-[17px] text-[#64748a]">
            {mine ? "Posted by you" : `Posted by ${request.requester.username ?? "a member"}`} · {formatRelative(request.createdAt)} ago
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={href} className={cn(ACTION, "border border-[#e2e8f0] bg-white text-[#0f172a] hover:bg-gray-50")}>
            View details
          </Link>
          {!mine && request.status === "Open" && (
            <Link href={href} className={cn(ACTION, "bg-brand-900 text-white hover:opacity-90")}>
              Send quote
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
