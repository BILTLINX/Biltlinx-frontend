"use client";

import Link from "next/link";
import { use } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { MarketItemContent } from "@/components/shared/MarketItemContent";
import { MarketOrderPanel } from "@/components/shared/MarketOrderPanel";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMarketListing } from "@/hooks/useMarketplace";
import { errorKind } from "@/lib/errors";

export default function MarketItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const listing = useMarketListing(id);

  return (
    <AppShell activeKey="feed" activeChildKey="marketplace" contentFullWidth>
      <PageContainer>
        {listing.isPending && <Skeleton className="h-[420px] w-full rounded-2xl" />}
        {listing.data && (
          <>
            <Breadcrumbs crumbs={[{ label: "Marketplace", href: "/marketplace" }, { label: listing.data.category, href: "/marketplace" }, { label: listing.data.title }]} />
            <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
              <MarketItemContent listing={listing.data} />
              <MarketOrderPanel key={listing.data.id} listing={listing.data} />
            </div>
          </>
        )}
        {listing.isError && (
          <>
            <Link href="/marketplace" className="self-start text-sm font-medium text-brand-900">
              ‹ Back to marketplace
            </Link>
            <p className="text-sm text-gray-500">
              {errorKind(listing.error) === "notFound" ? "This item is no longer available." : "We could not load this item. Please try again."}
            </p>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
