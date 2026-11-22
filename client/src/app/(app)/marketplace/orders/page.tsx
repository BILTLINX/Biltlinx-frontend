"use client";

import Link from "next/link";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";
import { MarketOrderCard } from "@/components/shared/MarketOrderCard";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMarketOrders } from "@/hooks/useMarketplace";
import { errorMessage } from "@/lib/errors";

export default function MyMarketOrdersPage() {
  const orders = useMarketOrders("buyer");
  const items = orders.data?.items ?? [];

  return (
    <AppShell activeKey="feed" activeChildKey="marketplace" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: "My orders" }]} />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">My orders</h1>
          <p className="text-sm leading-5 text-gray-500">Things you ordered. Once a seller accepts, pay to have it sent; your money is held until you confirm delivery.</p>
        </div>
        {orders.isPending && (
          <div className="flex flex-col gap-3">
            {[0, 1].map((n) => (
              <Skeleton key={n} className="h-[150px] rounded-2xl" />
            ))}
          </div>
        )}
        {orders.isError && <p className="text-sm text-gray-500">{errorMessage(orders.error)}</p>}
        {!orders.isPending && !orders.isError && items.length === 0 && (
          <EmptyState size="section" icon="marketplace" title="No orders yet" body="When you order materials, equipment or land, it shows up here." primary={{ label: "Browse Marketplace", href: "/marketplace" }} />
        )}
        <div className="flex flex-col gap-3">
          {items.map((order) => (
            <MarketOrderCard key={order.id} order={order} />
          ))}
        </div>
        <Link href="/manage/marketplace?tab=orders" className="self-start text-sm font-medium text-brand-900">
          Orders on my listings ›
        </Link>
      </PageContainer>
    </AppShell>
  );
}
