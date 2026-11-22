"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { CreateMarketplaceListingModal } from "@/components/shared/CreateMarketplaceListingModal";
import { MarketOrderCard } from "@/components/shared/MarketOrderCard";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMarketListingMutations, useMarketOrders, useMyMarketListings, useStaffMarketListings } from "@/hooks/useMarketplace";
import { errorMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/format";
import { getMarketListing } from "@/lib/marketplace-api";
import { LISTING_STATUS_LABEL, unitSuffix } from "@/lib/market-listings";
import { cn } from "@/lib/utils";
import type { MarketListing, MarketListingStatus, MyMarketListing } from "@/types/api/marketplace";

type Tab = "listings" | "orders";

const STATUS_TONE: Record<MarketListingStatus, string> = {
  Live: "bg-[#dcfce7] text-[#16a34a]",
  PendingReview: "bg-[#fef3c7] text-[#b45309]",
  Rejected: "bg-[#fee2e2] text-[#b91c1c]",
  Paused: "bg-[#f1f5f9] text-[#334155]",
  Removed: "bg-[#f1f5f9] text-[#334155]",
};

function ListingRow({ item, onEdit }: { item: MyMarketListing; onEdit: () => void }) {
  const { pause, resume, remove } = useMarketListingMutations();
  const { offer } = item;
  const suffix = unitSuffix(offer.unit);
  const busy = pause.isPending || resume.isPending || remove.isPending;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center">
      <Link href={offer.detailRoute} className="relative block h-[84px] w-full shrink-0 overflow-hidden rounded-xl bg-[#eef2ff] sm:w-[120px]">
        {offer.coverUrl && <Image src={offer.coverUrl} alt="" fill unoptimized className="object-cover" sizes="120px" />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-bold text-[#0f172a]">{offer.title}</p>
          <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium", STATUS_TONE[item.status])}>{LISTING_STATUS_LABEL[item.status]}</span>
        </div>
        <p className="text-[13px] text-[#334155]">
          {formatMoney(offer.price, offer.currency)}
          {suffix ? ` / ${suffix}` : ""} · {offer.location}
          {offer.stock !== null && offer.category !== "Land" ? ` · ${offer.stock.toLocaleString("en-GH")} in stock` : ""}
        </p>
        {item.rejectionReason && <p className="text-xs text-[#b91c1c]">Not approved: {item.rejectionReason}. Edit the listing and it goes back for review.</p>}
        {item.status === "PendingReview" && <p className="text-xs text-gray-500">Waiting for review. Buyers cannot see it yet.</p>}
      </div>
      <div className="flex shrink-0 flex-wrap gap-3 text-[13px] font-medium">
        <button type="button" onClick={onEdit} className="text-brand-900">
          Edit
        </button>
        {item.status === "Live" && (
          <button type="button" disabled={busy} onClick={() => pause.mutate(offer.id, { onSuccess: () => showSuccessToast("Listing paused") })} className="text-[#b45309] disabled:opacity-60">
            Pause
          </button>
        )}
        {item.status === "Paused" && (
          <button type="button" disabled={busy} onClick={() => resume.mutate(offer.id, { onSuccess: () => showSuccessToast("Listing is live again") })} className="text-[#16a34a] disabled:opacity-60">
            Resume
          </button>
        )}
        <button type="button" disabled={busy} onClick={() => remove.mutate(offer.id, { onSuccess: () => showSuccessToast("Listing removed") })} className="text-[#dc2626] disabled:opacity-60">
          Remove
        </button>
      </div>
    </article>
  );
}

function Listings() {
  const listings = useMyMarketListings();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<MarketListing | undefined>(undefined);
  const items = listings.data?.items ?? [];

  async function edit(id: string) {
    setEditing(await getMarketListing(id));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Materials, equipment and land you sell. New and changed listings are reviewed before they show to buyers.</p>
        <Button variant="primary" onClick={() => setCreating(true)} className="h-10 w-auto shrink-0 rounded-[10px] px-4 text-sm font-medium lg:rounded-[10px]">
          New listing
        </Button>
      </div>
      {listings.isPending && <Skeleton className="h-24 w-full rounded-2xl" />}
      {listings.isError && <p className="text-sm text-[#dc2626]">{errorMessage(listings.error)}</p>}
      {!listings.isPending && !listings.isError && items.length === 0 && (
        <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">You have not listed anything yet.</p>
      )}
      {items.map((item) => (
        <ListingRow key={item.offer.id} item={item} onEdit={() => void edit(item.offer.id)} />
      ))}
      <CreateMarketplaceListingModal open={creating} onClose={() => setCreating(false)} />
      <CreateMarketplaceListingModal open={editing !== undefined} listing={editing} onClose={() => setEditing(undefined)} />
    </div>
  );
}

function Orders() {
  const orders = useMarketOrders("seller");
  const items = orders.data?.items ?? [];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-500">Orders on your listings. Accept an order so the buyer can pay; the money is held until they confirm delivery.</p>
      {orders.isPending && <Skeleton className="h-32 w-full rounded-2xl" />}
      {orders.isError && <p className="text-sm text-[#dc2626]">{errorMessage(orders.error)}</p>}
      {!orders.isPending && !orders.isError && items.length === 0 && <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">No orders yet.</p>}
      {items.map((order) => (
        <MarketOrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

function Workspace() {
  const router = useRouter();
  const tab: Tab = useSearchParams().get("tab") === "orders" ? "orders" : "listings";
  const staff = useStaffMarketListings(undefined);
  const isStaff = staff.isSuccess;

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Marketplace" }]} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Marketplace</h1>
          {isStaff && (
            <Link href="/manage/marketplace/review" className="text-sm font-medium text-brand-900">
              Review queue ({staff.data.totalResults}) ›
            </Link>
          )}
        </div>
        <div role="tablist" aria-label="Marketplace" className="flex gap-2">
          {(["listings", "orders"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={value === tab}
              onClick={() => router.replace(value === "listings" ? "/manage/marketplace" : "/manage/marketplace?tab=orders")}
              className={cn("rounded-full border px-4 py-2 text-[13px] font-medium", value === tab ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-200 bg-white text-[#334155]")}
            >
              {value === "listings" ? "My listings" : "Orders to fulfil"}
            </button>
          ))}
        </div>
        {tab === "listings" ? <Listings /> : <Orders />}
      </PageContainer>
    </AppShell>
  );
}

export default function ManageMarketplacePage() {
  return (
    <Suspense>
      <Workspace />
    </Suspense>
  );
}
