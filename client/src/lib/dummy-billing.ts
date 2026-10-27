export const CURRENT_BILLING_PLAN = {
  name: "Pro",
  status: "Active",
  price: "GHS 149 / month · renews 1 Nov 2026",
  includes: "Includes Maintenance & Work Orders, CRM, Automated Messages and Tenant Relationships.",
};

export const PLAN_USAGE = [
  { id: "listings", label: "Active listings", value: "8 of 25", percent: 32, tone: "bg-brand-900" },
  { id: "seats", label: "Team seats", value: "1 of 1", percent: 100, tone: "bg-[#b45309]" },
  { id: "storage", label: "Storage", value: "2.1 of 10 GB", percent: 21, tone: "bg-brand-900" },
];

export interface PaymentMethod {
  id: string;
  title: string;
  note: string;
  isDefault?: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "momo", title: "MTN Mobile Money · 024 *** 8595", note: "Default for subscriptions", isDefault: true },
  { id: "visa", title: "Visa ending 4421", note: "Expires 08/28" },
];

export type ReceiptStatus = "Paid" | "Refunded";

export const RECEIPTS: { id: string; date: string; description: string; amount: string; status: ReceiptStatus }[] = [
  { id: "r1", date: "1 Oct 2026", description: "Pro plan · monthly", amount: "GHS 149.00", status: "Paid" },
  { id: "r2", date: "15 Oct 2026", description: "Boundary survey · Kwame Mensah", amount: "GHS 900.00", status: "Paid" },
  { id: "r3", date: "12 Oct 2026", description: "Featured listing boost · 7 days", amount: "GHS 60.00", status: "Refunded" },
  { id: "r4", date: "1 Sep 2026", description: "Pro plan · monthly", amount: "GHS 149.00", status: "Paid" },
];

export const BILLING_DETAILS = [
  { id: "billed", label: "Billed to", value: "Madeline Price · Greater Accra, Ghana" },
  { id: "tin", label: "TIN (optional)", value: "Add a tax number for business receipts" },
];
