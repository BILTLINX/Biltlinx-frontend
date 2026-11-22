"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { useMarketOrderMutations } from "@/hooks/useMarketplace";
import { useStartConversation } from "@/hooks/useMessaging";
import { formatMoney } from "@/lib/format";
import { isCounted, stockNoun, unitPriceFor, unitSuffix } from "@/lib/market-listings";
import type { MarketListing } from "@/types/api/marketplace";

const ROUNDED = "rounded-[10px] lg:rounded-[10px]";
const AVATAR = "/icons/avatar-placeholder-user.svg";

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-3 text-[13px] leading-[19px] ${strong ? "font-bold text-[#0f172a]" : ""}`}>
      <span className={strong ? undefined : "text-gray-500"}>{label}</span>
      <span className={strong ? undefined : "font-medium text-[#0f172a]"}>{value}</span>
    </div>
  );
}

/** The order card (Figma node 1061:31191): seller, quantity, the price breakdown and ordering actions. */
export function MarketOrderPanel({ listing }: { listing: MarketListing }) {
  const router = useRouter();
  const { place } = useMarketOrderMutations();
  const startConversation = useStartConversation();
  const counted = isCounted(listing.category);
  const minimum = counted ? listing.minOrder ?? 1 : 1;
  const maximum = counted ? listing.stock ?? Number.MAX_SAFE_INTEGER : 1;
  const [quantity, setQuantity] = useState(minimum);
  const [wantsDelivery, setWantsDelivery] = useState(false);
  const [deliverTo, setDeliverTo] = useState("");
  const [note, setNote] = useState("");
  const noun = stockNoun(listing.category, listing.unit);
  const suffix = unitSuffix(listing.unit) ?? "item";

  const unitPrice = unitPriceFor(listing, quantity);
  const goods = unitPrice * quantity;
  const delivery = wantsDelivery ? listing.deliveryFee ?? 0 : 0;
  const total = goods + delivery;
  const available = listing.status === "Live" && (listing.stock === null || listing.stock > 0);
  const canOrder = available && !listing.isMine && quantity >= minimum && quantity <= maximum && (!wantsDelivery || deliverTo.trim().length >= 3);

  function order() {
    place.mutate(
      { listingId: listing.id, quantity, wantsDelivery, deliverTo: wantsDelivery ? deliverTo.trim() : null, note: note.trim() || null },
      {
        onSuccess: (created) => {
          toast.success("Order sent. The seller will reply soon.");
          router.push(`/marketplace/orders/${created.id}`);
        },
      },
    );
  }

  function message() {
    startConversation.mutate(
      { recipientAccountId: listing.seller.accountId, contextType: "Direct", contextTitle: listing.title, message: `Hi, I am interested in "${listing.title}".` },
      { onSuccess: (conversation) => router.push(`/messages?c=${conversation.id}`) },
    );
  }

  return (
    <aside className="flex w-full flex-col gap-3.5 rounded-2xl border border-gray-200 bg-white p-5 xl:sticky xl:top-0 xl:w-[380px] xl:shrink-0 xl:self-start">
      <div className="flex items-center gap-2.5">
        <span className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
          <Image src={listing.seller.avatarUrl ?? AVATAR} alt="" fill unoptimized className="object-cover" sizes="40px" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-sm font-semibold leading-5 text-[#0f172a]">{listing.seller.name}</p>
          <p className="truncate text-xs leading-[17px] text-gray-500">
            {listing.seller.completedOrders > 0 ? `${listing.seller.completedOrders} completed ${listing.seller.completedOrders === 1 ? "order" : "orders"}` : "New seller"}
          </p>
        </div>
      </div>

      {listing.isMine ? (
        <div className="flex flex-col gap-2 rounded-xl bg-[#f8fafc] p-3 text-[13px] leading-[19px] text-[#334155]">
          <p>This is your listing{listing.status === "Live" ? "." : `, currently ${listing.status === "PendingReview" ? "waiting for review" : listing.status === "Rejected" ? "not approved" : "paused"}.`}</p>
          {listing.rejectionReason && <p className="text-[#b91c1c]">Reason: {listing.rejectionReason}</p>}
          <Link href="/manage/marketplace" className="font-medium text-brand-900">
            Manage my listings
          </Link>
        </div>
      ) : (
        <>
          {counted && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">Quantity</span>
              <div className="flex items-center overflow-hidden rounded-[10px] border border-gray-200">
                <button type="button" onClick={() => setQuantity(Math.max(minimum, quantity - 1))} aria-label="Decrease quantity" className="px-3.5 py-2 text-sm font-medium leading-5 text-[#0f172a] hover:bg-gray-50">
                  −
                </button>
                <input
                  value={quantity}
                  onChange={(event) => {
                    const next = Number(event.target.value.replace(/\D/g, ""));
                    setQuantity(Math.min(maximum, next));
                  }}
                  inputMode="numeric"
                  aria-label="Quantity"
                  className="w-[72px] px-1 py-2 text-center text-sm font-semibold leading-5 text-[#0f172a] focus:outline-none"
                />
                <button type="button" onClick={() => setQuantity(Math.min(maximum, quantity + 1))} aria-label="Increase quantity" className="px-3.5 py-2 text-sm font-medium leading-5 text-[#0f172a] hover:bg-gray-50">
                  +
                </button>
              </div>
            </div>
          )}
          {counted && quantity < minimum && <p className="text-xs text-[#b45309]">Minimum order is {minimum.toLocaleString("en-GH")} {noun}.</p>}

          {counted && listing.deliveryAvailable && (
            <label className="flex items-center gap-2 text-[13px] font-medium text-[#0f172a]">
              <input type="checkbox" checked={wantsDelivery} onChange={(event) => setWantsDelivery(event.target.checked)} className="size-4 accent-[#1465e6]" />
              Deliver to me{listing.deliveryFee ? ` (${formatMoney(listing.deliveryFee, listing.currency)})` : " (free)"}
            </label>
          )}
          {wantsDelivery && (
            <label className="flex items-center gap-2 rounded-[10px] border border-gray-200 px-3.5 py-3">
              <NavIcon icon="/icons/post-options-location.svg" size={14} className="shrink-0 bg-gray-500" />
              <input value={deliverTo} onChange={(event) => setDeliverTo(event.target.value)} maxLength={200} aria-label="Deliver to" placeholder="Delivery address or area" className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-[#0f172a] focus:outline-none" />
            </label>
          )}

          <Line label={`${quantity.toLocaleString("en-GH")} ${suffix}${quantity === 1 ? "" : "s"} × ${formatMoney(unitPrice, listing.currency)}`} value={formatMoney(goods, listing.currency)} />
          {wantsDelivery && <Line label="Delivery" value={formatMoney(delivery, listing.currency)} />}
          <Line label="Biltlinx fee" value={formatMoney(0, listing.currency)} />
          <Line label="Total" value={formatMoney(total, listing.currency)} strong />

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            maxLength={500}
            aria-label="Note to the seller"
            placeholder="Note to the seller (optional)"
            className="resize-none rounded-[10px] border border-gray-200 px-3.5 py-2.5 text-sm leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none"
          />

          <Button variant="primary" onClick={order} disabled={!canOrder || place.isPending} className={`h-12 ${ROUNDED}`}>
            {!available ? "Not available" : place.isPending ? "Sending…" : "Place order"}
          </Button>
          <button
            type="button"
            onClick={message}
            disabled={startConversation.isPending}
            className="h-10 w-full rounded-[10px] bg-[#eff5ff] px-4 text-sm font-medium text-brand-900 hover:bg-[#e2edff] disabled:opacity-60"
          >
            Message seller
          </button>
          <p className="flex items-center gap-2 text-xs font-medium leading-[17px] text-[#16a34a]">
            <NavIcon icon="/icons/post-options-not-interested.svg" size={13} className="shrink-0 bg-[#16a34a]" />
            The seller accepts first, then you pay. Payment is held until you confirm delivery.
          </p>
        </>
      )}
    </aside>
  );
}
