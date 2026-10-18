"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { BILTLINX_FEE, BULK_THRESHOLD, DELIVERY_FEE, type MarketItemDetail } from "@/lib/dummy-market-detail";

const ROUNDED = "rounded-[10px] lg:rounded-[10px]";

function formatGhs(amount: number) {
  return `GHS ${amount.toLocaleString("en-US")}`;
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-3 text-[13px] leading-[19px] ${strong ? "font-bold text-[#0f172a]" : ""}`}>
      <span className={strong ? undefined : "text-gray-500"}>{label}</span>
      <span className={strong ? undefined : "font-medium text-[#0f172a]"}>{value}</span>
    </div>
  );
}

interface MarketOrderPanelProps {
  detail: MarketItemDetail;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  deliverTo: string;
}

/** The order card (Figma node 1061:31191): seller, quantity, the price breakdown and ordering actions. */
export function MarketOrderPanel({ detail, quantity, onQuantityChange, deliverTo }: MarketOrderPanelProps) {
  const router = useRouter();
  const { seller, unit } = detail;
  const unitPrice = quantity >= BULK_THRESHOLD ? detail.bulkPrice : detail.unitPrice;
  const subtotal = unitPrice * quantity;
  const total = subtotal + DELIVERY_FEE + BILTLINX_FEE;
  const area = deliverTo.split(",")[0].trim() || "your address";
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <aside className="flex w-full flex-col gap-3.5 rounded-2xl border border-gray-200 bg-white p-5 xl:sticky xl:top-0 xl:w-[380px] xl:shrink-0 xl:self-start">
      <div className="flex items-center gap-2.5">
        <span className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
          <Image src={seller.avatar} alt="" fill className="object-cover" sizes="40px" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-sm font-semibold leading-5 text-[#0f172a]">{seller.name}</p>
          <p className="truncate text-xs leading-[17px] text-gray-500">{seller.stats}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">Quantity</span>
        <div className="flex items-center overflow-hidden rounded-[10px] border border-gray-200">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
            className="px-3.5 py-2 text-sm font-medium leading-5 text-[#0f172a] hover:bg-gray-50"
          >
            −
          </button>
          <span className="min-w-[88px] px-3 py-2 text-center text-sm font-semibold leading-5 text-[#0f172a]">
            {quantity} {unit}
            {quantity === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            aria-label="Increase quantity"
            className="px-3.5 py-2 text-sm font-medium leading-5 text-[#0f172a] hover:bg-gray-50"
          >
            +
          </button>
        </div>
      </div>

      <Line label={`${quantity} ${unit}${quantity === 1 ? "" : "s"} × ${formatGhs(unitPrice)}`} value={formatGhs(subtotal)} />
      <Line label={`Delivery to ${area}`} value={formatGhs(DELIVERY_FEE)} />
      <Line label="Biltlinx fee" value={formatGhs(BILTLINX_FEE)} />
      <Line label="Total" value={formatGhs(total)} strong />

      <Button variant="primary" onClick={comingSoon("Order now")} className={`h-12 ${ROUNDED}`}>
        Order now
      </Button>
      <Button variant="outline" onClick={comingSoon("Bulk quote")} className={`h-11 ${ROUNDED}`}>
        Ask for a bulk quote
      </Button>
      <button
        type="button"
        onClick={() => router.push("/messages")}
        className="h-10 w-full rounded-[10px] bg-[#eff5ff] px-4 text-sm font-medium text-brand-900 hover:bg-[#e2edff]"
      >
        Message seller
      </button>
      <p className="flex items-center gap-2 text-xs font-medium leading-[17px] text-[#16a34a]">
        <NavIcon icon="/icons/post-options-not-interested.svg" size={13} className="shrink-0 bg-[#16a34a]" />
        Payment held until delivery is confirmed
      </p>
    </aside>
  );
}
