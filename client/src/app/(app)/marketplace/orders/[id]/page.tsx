"use client";

import Link from "next/link";
import { use } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { MarketOrderCard } from "@/components/shared/MarketOrderCard";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMarketOrder } from "@/hooks/useMarketplace";
import { errorKind } from "@/lib/errors";

export default function MarketOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const order = useMarketOrder(id);

  return (
    <AppShell activeKey="feed" activeChildKey="marketplace" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: "My orders", href: "/marketplace/orders" }, { label: order.data?.title ?? "Order" }]} />
        {order.isPending && <Skeleton className="h-[260px] w-full rounded-2xl" />}
        {order.data && <MarketOrderCard order={order.data} detail />}
        {order.isError && (
          <>
            <Link href="/marketplace/orders" className="self-start text-sm font-medium text-brand-900">
              ‹ Back to my orders
            </Link>
            <p className="text-sm text-gray-500">{errorKind(order.error) === "notFound" ? "We could not find that order." : "We could not load this order. Please try again."}</p>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
