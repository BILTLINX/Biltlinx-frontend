"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStaffMarketListings, useStaffMarketMutations, useStaffMarketOrders } from "@/hooks/useMarketplace";
import { errorKind, errorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney } from "@/lib/format";
import { CATEGORY_PILL, unitSuffix } from "@/lib/market-listings";
import { cn } from "@/lib/utils";
import type { MarketStaffOrder, StaffMarketListing } from "@/types/api/marketplace";

type Tab = "listings" | "disputes" | "payouts";

const FIELD = "h-10 w-full rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] text-[#0f172a] focus:border-brand-900 focus:outline-none";
const GHOST = "h-10 rounded-[10px] border border-gray-200 px-4 text-sm font-medium text-[#334155] hover:bg-gray-50 disabled:opacity-60";

function ListingReview({ item }: { item: StaffMarketListing }) {
  const { approve, reject } = useStaffMarketMutations();
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const { offer } = item;
  const suffix = unitSuffix(offer.unit);
  const busy = approve.isPending || reject.isPending;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative h-[110px] w-full shrink-0 overflow-hidden rounded-xl bg-[#eef2ff] sm:w-[160px]">
          {offer.coverUrl && <Image src={offer.coverUrl} alt="" fill unoptimized className="object-cover" sizes="160px" />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-sm font-bold text-[#0f172a]">{offer.title}</p>
          <p className="text-xs text-gray-500">
            {CATEGORY_PILL[offer.category]} · {item.seller} · {offer.location} · {formatDateTime(offer.createdAt)}
          </p>
          <p className="text-[13px] font-medium text-[#0f172a]">
            {formatMoney(offer.price, offer.currency)}
            {suffix ? ` / ${suffix}` : ""}
            {offer.stock !== null && offer.category !== "Land" ? ` · ${offer.stock.toLocaleString("en-GH")} in stock` : ""}
            {offer.deliveryAvailable ? " · delivers" : ""}
          </p>
          <p className="whitespace-pre-wrap text-[13px] leading-5 text-[#334155]">{item.description}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {item.photos.map((photo) => (
              <a key={photo} href={photo} target="_blank" rel="noreferrer" className="relative block size-12 overflow-hidden rounded-lg bg-[#eef2ff]">
                <Image src={photo} alt="" fill unoptimized className="object-cover" sizes="48px" />
              </a>
            ))}
          </div>
        </div>
      </div>
      {item.status === "PendingReview" &&
        (rejecting ? (
          <div className="flex flex-col gap-2">
            <input className={FIELD} value={reason} maxLength={300} placeholder="Reason the seller will see" onChange={(event) => setReason(event.target.value)} />
            <div className="flex gap-2">
              <Button variant="primary" disabled={busy || !reason.trim()} onClick={() => reject.mutate({ id: offer.id, reason: reason.trim() })} className="h-10 w-auto rounded-[10px] px-4 text-sm font-medium lg:rounded-[10px]">
                Reject listing
              </Button>
              <button type="button" onClick={() => setRejecting(false)} className={GHOST}>
                Back
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="primary" disabled={busy} onClick={() => approve.mutate(offer.id)} className="h-10 w-auto rounded-[10px] px-4 text-sm font-medium lg:rounded-[10px]">
              Approve
            </Button>
            <button type="button" disabled={busy} onClick={() => setRejecting(true)} className={GHOST}>
              Reject
            </button>
          </div>
        ))}
    </article>
  );
}

function OrderRow({ item, mode }: { item: MarketStaffOrder; mode: "disputes" | "payouts" }) {
  const { resolve, payout } = useStaffMarketMutations();
  const [note, setNote] = useState("");
  const { order } = item;
  const busy = resolve.isPending || payout.isPending;

  return (
    <article className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4">
      <p className="text-sm font-bold text-[#0f172a]">{order.title}</p>
      <p className="text-xs text-gray-500">
        Buyer {order.buyer.name} · Seller {order.seller.name} · ordered {formatDateTime(order.createdAt)}
      </p>
      <p className="text-[13px] text-[#334155]">
        {order.quantity.toLocaleString("en-GH")} × {formatMoney(order.unitPrice, order.currency)} · total {formatMoney(order.total, order.currency)} · seller receives{" "}
        <span className="font-bold text-[#0f172a]">{formatMoney(item.sellerReceives, order.currency)}</span>
      </p>
      {mode === "disputes" && order.reason && <p className="rounded-lg bg-[#fef3c7] p-2.5 text-xs text-[#b45309]">Buyer says: {order.reason}</p>}
      <input className={FIELD} value={note} maxLength={300} placeholder={mode === "disputes" ? "Note (used as the refund reason)" : "Transfer reference"} onChange={(event) => setNote(event.target.value)} />
      <div className="flex flex-wrap gap-2">
        {mode === "disputes" ? (
          <>
            <Button variant="primary" disabled={busy} onClick={() => resolve.mutate({ id: order.id, outcome: "Release", note })} className="h-10 w-auto rounded-[10px] px-4 text-sm font-medium lg:rounded-[10px]">
              Release to seller
            </Button>
            <button type="button" disabled={busy} onClick={() => resolve.mutate({ id: order.id, outcome: "Refund", note })} className={GHOST}>
              Refund buyer
            </button>
          </>
        ) : (
          <Button variant="primary" disabled={busy || !note.trim()} onClick={() => payout.mutate({ id: order.id, note })} className="h-10 w-auto rounded-[10px] px-4 text-sm font-medium lg:rounded-[10px]">
            Mark seller as paid
          </Button>
        )}
      </div>
    </article>
  );
}

function Queue({ tab }: { tab: Tab }) {
  const listings = useStaffMarketListings(undefined, tab === "listings");
  const orders = useStaffMarketOrders(tab === "payouts" ? "payouts" : "disputes", tab !== "listings");
  const active = tab === "listings" ? listings : orders;
  const items = (tab === "listings" ? listings.data?.items : orders.data?.items) ?? [];

  return (
    <div className="flex flex-col gap-3">
      {active.isPending && <Skeleton className="h-28 w-full rounded-2xl" />}
      {active.isError && (
        <p className="text-sm text-[#dc2626]">{errorKind(active.error) === "forbidden" ? "You do not have access to the marketplace review tools." : errorMessage(active.error)}</p>
      )}
      {active.isSuccess && items.length === 0 && <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Nothing waiting.</p>}
      {tab === "listings" && listings.data?.items.map((item) => <ListingReview key={item.offer.id} item={item} />)}
      {tab !== "listings" && orders.data?.items.map((item) => <OrderRow key={item.order.id} item={item} mode={tab} />)}
    </div>
  );
}

export default function MarketplaceReviewPage() {
  const [tab, setTab] = useState<Tab>("listings");
  const labels: Record<Tab, string> = { listings: "Listings to review", disputes: "Disputes", payouts: "Seller payouts due" };

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Marketplace", href: "/manage/marketplace" }, { label: "Review" }]} />
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Marketplace review</h1>
        <div role="tablist" aria-label="Review queue" className="flex flex-wrap gap-2">
          {(Object.keys(labels) as Tab[]).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={value === tab}
              onClick={() => setTab(value)}
              className={cn("rounded-full border px-4 py-2 text-[13px] font-medium", value === tab ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-200 bg-white text-[#334155]")}
            >
              {labels[value]}
            </button>
          ))}
        </div>
        <Queue tab={tab} />
        <Link href="/manage/marketplace" className="self-start text-sm font-medium text-brand-900">
          ‹ Back to my marketplace
        </Link>
      </PageContainer>
    </AppShell>
  );
}
