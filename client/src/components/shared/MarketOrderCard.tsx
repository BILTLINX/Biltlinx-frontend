"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/context/SessionContext";
import { useMarketOrderMutations } from "@/hooks/useMarketplace";
import { formatDateTime, formatMoney } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, unitSuffix } from "@/lib/market-listings";
import { cn } from "@/lib/utils";
import type { MarketOrder } from "@/types/api/marketplace";

type Asking = "Decline" | "Cancel" | "CancelAndRefund" | "Dispute";

const ASK_LABEL: Record<Asking, { title: string; confirm: string; placeholder: string; required: boolean }> = {
  Decline: { title: "Why are you declining?", confirm: "Decline order", placeholder: "e.g. Sold out for this week", required: false },
  Cancel: { title: "Cancel this order?", confirm: "Cancel order", placeholder: "Reason (optional)", required: false },
  CancelAndRefund: { title: "Cancel and refund the payment?", confirm: "Cancel and refund", placeholder: "Reason (optional)", required: false },
  Dispute: { title: "What went wrong?", confirm: "Report a problem", placeholder: "Describe the problem. Payment stays held until staff review it.", required: true },
};

const BUTTON = "h-10 rounded-[10px] px-4 text-sm font-medium disabled:opacity-60";

export function MarketOrderCard({ order, detail = false }: { order: MarketOrder; detail?: boolean }) {
  const { user } = useSession();
  const mutations = useMarketOrderMutations();
  const [asking, setAsking] = useState<Asking | null>(null);
  const [reason, setReason] = useState("");
  const [typedEmail, setTypedEmail] = useState<string | null>(null);
  const email = typedEmail ?? user?.accounts[0]?.email ?? "";
  const buyer = order.role === "Buyer";
  const other = buyer ? order.seller : order.buyer;
  const suffix = unitSuffix(order.unit) ?? "item";
  const busy = Object.values(mutations).some((mutation) => mutation.isPending);
  const has = (action: string) => (order.actions as string[]).includes(action);

  function ask(kind: Asking) {
    setAsking(kind);
    setReason("");
  }

  function submitAsk() {
    if (!asking) return;
    const text = reason.trim();
    if (ASK_LABEL[asking].required && !text) return;
    const done = { onSuccess: () => setAsking(null) };
    if (asking === "Decline") mutations.decline.mutate({ id: order.id, reason: text }, done);
    else if (asking === "Dispute") mutations.dispute.mutate({ id: order.id, reason: text }, done);
    else mutations.cancel.mutate({ id: order.id, reason: text }, done);
  }

  function pay() {
    mutations.pay.mutate({ id: order.id, email: email.trim() }, { onSuccess: (result) => result.authorizationUrl && window.location.assign(result.authorizationUrl) });
  }

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <Link href={`/marketplace/${order.listingId}`} className="relative block size-16 shrink-0 overflow-hidden rounded-xl bg-[#eef2ff]">
          {order.coverUrl && <Image src={order.coverUrl} alt="" fill unoptimized className="object-cover" sizes="64px" />}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            {detail ? (
              <h1 className="text-lg font-bold leading-6 text-[#0f172a]">{order.title}</h1>
            ) : (
              <Link href={`/marketplace/orders/${order.id}`} className="truncate text-[15px] font-semibold leading-[22px] text-[#0f172a] hover:underline">
                {order.title}
              </Link>
            )}
            <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", ORDER_STATUS_TONE[order.status])}>{ORDER_STATUS_LABEL[order.status]}</span>
          </div>
          <p className="text-xs text-gray-500">
            {buyer ? "Seller" : "Buyer"}: {other.name} · ordered {formatDateTime(order.createdAt)}
          </p>
          <p className="text-[13px] text-[#334155]">
            {order.quantity.toLocaleString("en-GH")} {suffix}
            {order.quantity === 1 ? "" : "s"} × {formatMoney(order.unitPrice, order.currency)}
            {order.deliveryFee > 0 ? ` + ${formatMoney(order.deliveryFee, order.currency)} delivery` : ""} ·{" "}
            <span className="font-bold text-[#0f172a]">{formatMoney(order.total, order.currency)}</span>
          </p>
        </div>
      </div>

      {(detail || order.deliverTo || order.note || order.reason) && (
        <dl className="flex flex-col gap-1.5 rounded-xl bg-[#f8fafc] px-3.5 py-3 text-[13px] leading-[19px]">
          {order.wantsDelivery && order.deliverTo && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Deliver to</dt>
              <dd className="text-right font-medium text-[#0f172a]">{order.deliverTo}</dd>
            </div>
          )}
          {order.wantsDelivery && !order.deliverTo && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Deliver to</dt>
              <dd className="text-right text-gray-500">Shared once you accept</dd>
            </div>
          )}
          {!order.wantsDelivery && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Handover</dt>
              <dd className="text-right font-medium text-[#0f172a]">Pickup</dd>
            </div>
          )}
          {order.note && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Note</dt>
              <dd className="text-right font-medium text-[#0f172a]">{order.note}</dd>
            </div>
          )}
          {order.reason && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Reason</dt>
              <dd className="text-right font-medium text-[#b45309]">{order.reason}</dd>
            </div>
          )}
          {detail && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Payment</dt>
              <dd className="text-right font-medium text-[#0f172a]">
                {order.escrow === "Held" && "Held by Biltlinx until delivery is confirmed"}
                {order.escrow === "Released" && (order.payout === "Paid" ? "Released and paid out to the seller" : "Released to the seller")}
                {order.escrow === "Refunded" && "Refunded to the buyer"}
                {order.escrow === "None" && "Not paid yet"}
              </dd>
            </div>
          )}
          {order.autoConfirmAt && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Auto-confirms</dt>
              <dd className="text-right font-medium text-[#0f172a]">{formatDateTime(order.autoConfirmAt)}</dd>
            </div>
          )}
        </dl>
      )}

      {asking ? (
        <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3">
          <p className="text-[13px] font-semibold text-[#0f172a]">{ASK_LABEL[asking].title}</p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={2}
            maxLength={300}
            aria-label={ASK_LABEL[asking].title}
            placeholder={ASK_LABEL[asking].placeholder}
            className="resize-none rounded-[10px] border border-gray-200 px-3 py-2 text-[13px] leading-5 focus:border-brand-900 focus:outline-none"
          />
          <div className="flex gap-2">
            <Button variant="primary" onClick={submitAsk} disabled={busy || (ASK_LABEL[asking].required && !reason.trim())} className={cn(BUTTON, "w-auto lg:rounded-[10px]")}>
              {ASK_LABEL[asking].confirm}
            </Button>
            <button type="button" onClick={() => setAsking(null)} className={cn(BUTTON, "border border-gray-200 text-[#334155]")}>
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {has("Pay") && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(event) => setTypedEmail(event.target.value)}
                placeholder="Email for your receipt"
                aria-label="Email for your receipt"
                className="h-10 min-w-0 flex-1 rounded-[10px] border border-gray-200 px-3 text-[13px] focus:border-brand-900 focus:outline-none"
              />
              <Button variant="primary" onClick={pay} disabled={busy || !email.includes("@")} className={cn(BUTTON, "w-auto lg:rounded-[10px]")}>
                {mutations.pay.isPending ? "Opening Paystack…" : `Pay ${formatMoney(order.total, order.currency)}`}
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {has("Accept") && (
              <Button variant="primary" onClick={() => mutations.accept.mutate(order.id)} disabled={busy} className={cn(BUTTON, "w-auto lg:rounded-[10px]")}>
                Accept order
              </Button>
            )}
            {has("Dispatch") && (
              <Button variant="primary" onClick={() => mutations.dispatch.mutate(order.id)} disabled={busy} className={cn(BUTTON, "w-auto lg:rounded-[10px]")}>
                Mark as sent
              </Button>
            )}
            {has("ConfirmDelivery") && (
              <Button variant="primary" onClick={() => mutations.confirm.mutate(order.id)} disabled={busy} className={cn(BUTTON, "w-auto lg:rounded-[10px]")}>
                Confirm delivery
              </Button>
            )}
            {(["Decline", "Cancel", "CancelAndRefund", "Dispute"] as const).filter(has).map((kind) => (
              <button key={kind} type="button" onClick={() => ask(kind)} disabled={busy} className={cn(BUTTON, "border border-gray-200 text-[#334155] hover:bg-gray-50")}>
                {kind === "CancelAndRefund" ? "Cancel and refund" : kind === "Dispute" ? "Report a problem" : kind}
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
