"use client";

import Link from "next/link";
import { use, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { MarketItemContent } from "@/components/shared/MarketItemContent";
import { MarketOrderPanel } from "@/components/shared/MarketOrderPanel";
import { PageContainer } from "@/components/shared/PageContainer";
import { getMarketItemDetail } from "@/lib/dummy-market-detail";

export default function MarketItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const detail = getMarketItemDetail(id);
  const [quantity, setQuantity] = useState(detail?.defaultQuantity ?? 1);
  const [deliverTo, setDeliverTo] = useState(detail?.defaultDeliverTo ?? "");

  return (
    <AppShell activeKey="feed" activeChildKey="marketplace" contentFullWidth>
      <PageContainer>
        {detail ? (
          <>
            <Breadcrumbs crumbs={detail.breadcrumbs} />
            <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
              <MarketItemContent detail={detail} deliverTo={deliverTo} onDeliverToChange={setDeliverTo} />
              <MarketOrderPanel detail={detail} quantity={quantity} onQuantityChange={setQuantity} deliverTo={deliverTo} />
            </div>
          </>
        ) : (
          <>
            <Link href="/marketplace" className="self-start text-sm font-medium text-brand-900">
              ‹ Back to marketplace
            </Link>
            <p className="text-sm text-gray-500">This item is no longer available.</p>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
