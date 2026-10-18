"use client";

import { ArtisanTabs } from "@/components/shared/ManageTabs";
import { PaymentsView } from "@/components/shared/PaymentsView";
import { ARTISAN_AVAILABLE_PAYOUT, ARTISAN_INVOICES, ARTISAN_PAYMENT_KPIS, ARTISAN_PAYOUT_PLAN } from "@/lib/dummy-manage";

/** Manage · Artisan · Payments (Figma node 1082:33698). */
export default function ArtisanPaymentsPage() {
  return <PaymentsView role="Artisan" tabs={<ArtisanTabs active="payments" />} available={ARTISAN_AVAILABLE_PAYOUT} kpis={ARTISAN_PAYMENT_KPIS} payoutPlan={ARTISAN_PAYOUT_PLAN} invoices={ARTISAN_INVOICES} />;
}
