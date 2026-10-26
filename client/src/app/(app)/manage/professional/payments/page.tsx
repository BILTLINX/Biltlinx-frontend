"use client";

import { ProfessionalTabs } from "@/components/shared/ManageTabs";
import { PaymentsView } from "@/components/shared/PaymentsView";
import { PROFESSIONAL_AVAILABLE_PAYOUT, PROFESSIONAL_INVOICES, PROFESSIONAL_PAYMENT_KPIS, PROFESSIONAL_PAYOUT_PLAN } from "@/lib/dummy-manage";

/** Manage · Professional · Payments (Figma node 1083:35099). */
export default function ProfessionalPaymentsPage() {
  return (
    <PaymentsView
      role="Professional"
      tabs={<ProfessionalTabs active="payments" />}
      available={PROFESSIONAL_AVAILABLE_PAYOUT}
      kpis={PROFESSIONAL_PAYMENT_KPIS}
      payoutPlan={PROFESSIONAL_PAYOUT_PLAN}
      invoices={PROFESSIONAL_INVOICES}
    />
  );
}

