"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useConciergeMutations } from "@/hooks/useConcierge";
import { useSession } from "@/context/SessionContext";
import { formatDate, formatMoney } from "@/lib/format";
import type { ConciergeRequestDto } from "@/types/api/concierge";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5";
const VIDEO = /\.(mp4|webm|mov)(\?|$)/i;

export function ConciergeFeeCard({ request }: { request: ConciergeRequestDto }) {
  const { fee } = request;
  const { user } = useSession();
  const { payFee } = useConciergeMutations();
  const [typed, setTyped] = useState<string | null>(null);
  const email = typed ?? user?.accounts[0]?.email ?? "";
  const closed = request.status === "Completed" || request.status === "Cancelled";

  function pay() {
    payFee.mutate(
      { id: request.id, email: email.trim() },
      { onSuccess: (result) => result.authorizationUrl && window.location.assign(result.authorizationUrl) },
    );
  }

  return (
    <section className={CARD}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[15px] font-bold leading-[22px] text-[#0f172a]">{fee.planName}</h2>
          <p className="text-xs leading-[17px] text-gray-500">{fee.price}</p>
        </div>
        {fee.status === "Paid" && <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-[11px] font-medium text-[#16a34a]">Fee paid{fee.paidAt ? ` ${formatDate(fee.paidAt)}` : ""}</span>}
      </div>

      {fee.status === "None" && (
        <p className="text-[13px] leading-[19px] text-gray-500">
          {fee.price === "GHS 0" ? "No fee for the consultation." : "Concierge will confirm your project cost or rent, then your fee appears here to pay."}
        </p>
      )}

      {fee.status === "Due" && fee.amount !== null && (
        <>
          <p className="text-[13px] leading-[19px] text-[#334155]">
            Fee on {formatMoney(fee.basis ?? 0, fee.currency)}: <span className="font-bold text-[#0f172a]">{formatMoney(fee.amount, fee.currency)}</span>
          </p>
          {!closed && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(event) => setTyped(event.target.value)}
                placeholder="Email for your receipt"
                aria-label="Email for your receipt"
                className="h-10 min-w-0 flex-1 rounded-[10px] border border-gray-200 px-3 text-[13px] focus:border-brand-900 focus:outline-none"
              />
              <button
                type="button"
                disabled={payFee.isPending || !email.trim()}
                onClick={pay}
                className="h-10 shrink-0 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white disabled:opacity-60"
              >
                {payFee.isPending ? "Opening Paystack..." : `Pay ${formatMoney(fee.amount, fee.currency)}`}
              </button>
            </div>
          )}
        </>
      )}

      {fee.status === "Paid" && fee.amount !== null && <p className="text-[13px] text-[#334155]">{formatMoney(fee.amount, fee.currency)} received. Thank you.</p>}
    </section>
  );
}

export function ConciergeShortlist({ request }: { request: ConciergeRequestDto }) {
  if (request.shortlist.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Providers shortlisted for you</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {request.shortlist.map((provider) => (
          <Link
            key={provider.id}
            href={`/${provider.kind === "artisan" ? "artisans" : "professionals"}/${provider.providerId}`}
            className="flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-semibold text-[#0f172a]">{provider.name}</span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${provider.credentialVerified ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#f1f5f9] text-[#475569]"}`}
              >
                {provider.credentialVerified ? "Credentials verified" : "Not yet verified"}
              </span>
            </span>
            <span className="text-xs text-gray-500">
              {provider.city}
              {provider.headline ? ` · ${provider.headline}` : ""}
            </span>
            {provider.note && <span className="text-xs leading-[17px] text-[#334155]">{provider.note}</span>}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ConciergeUpdates({ request }: { request: ConciergeRequestDto }) {
  if (request.updates.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Progress updates</h2>
      {request.updates.map((update) => (
        <article key={update.id} className={CARD}>
          <p className="text-xs text-gray-500">{formatDate(update.createdAt)}</p>
          <p className="whitespace-pre-wrap text-sm leading-5 text-[#0f172a]">{update.text}</p>
          {update.mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {update.mediaUrls.map((url) =>
                VIDEO.test(url) ? (
                  <video key={url} src={url} controls className="aspect-video w-full rounded-lg bg-black object-cover" />
                ) : (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="relative block aspect-video overflow-hidden rounded-lg bg-gray-100">
                    <Image src={url} alt="" fill unoptimized className="object-cover" sizes="200px" />
                  </a>
                ),
              )}
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
