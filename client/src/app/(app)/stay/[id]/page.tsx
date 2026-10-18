"use client";

import Link from "next/link";
import { use, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { PropertyGallery } from "@/components/shared/PropertyGallery";
import { StayBookingPanel } from "@/components/shared/StayBookingPanel";
import { StayDetailContent } from "@/components/shared/StayDetailContent";
import { getStayDetail } from "@/lib/dummy-stay-detail";
import { selectDay, type Selection } from "@/lib/stay-booking";

export default function StayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const detail = getStayDetail(id);
  // Starts on the dates shown in the design: Sat 24 to Mon 26 Oct.
  const [selection, setSelection] = useState<Selection>({ checkIn: 24, checkOut: 26 });
  const [guests, setGuests] = useState("2 adults");

  return (
    <AppShell activeKey="property" activeChildKey="stay" contentFullWidth>
      <PageContainer>
        {detail ? (
          <>
            <Breadcrumbs crumbs={detail.breadcrumbs} />
            <PropertyGallery gallery={detail.gallery} title={detail.listing.title} />
            <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
              <StayDetailContent
                detail={detail}
                selection={selection}
                onSelectDay={(day) => setSelection((current) => selectDay(current, day))}
              />
              <StayBookingPanel
                stayId={id}
                nightlyRate={Number(detail.listing.price.replace(/\D/g, ""))}
                selection={selection}
                guests={guests}
                onGuestsChange={setGuests}
              />
            </div>
          </>
        ) : (
          <>
            <Link href="/stay" className="self-start text-sm font-medium text-brand-900">
              ‹ Back to stays
            </Link>
            <p className="text-sm text-gray-500">This stay is no longer available.</p>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
