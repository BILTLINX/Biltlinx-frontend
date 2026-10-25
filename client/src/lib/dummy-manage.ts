// Stand-ins for what the Manage (private workspace) API will return until it exists.

export const MANAGE_ROLES = ["Landlord", "Host", "Agent", "Developer", "Artisan", "Professional"] as const;

/** Roles that have their own Manage workspace; the others share the landlord overview. */
export const ROLE_HOMES: Partial<Record<(typeof MANAGE_ROLES)[number], string>> = { Artisan: "/manage/artisan", Professional: "/manage/professional" };

export interface ManageStat {
  id: string;
  label: string;
  value: string;
  pill: string;
  tone: "green" | "blue" | "amber" | "red";
}

export const MANAGE_STATS: ManageStat[] = [
  { id: "occupancy", label: "Occupancy", value: "92%", pill: "11 of 12 units let", tone: "green" },
  { id: "rent", label: "Rent collected · Oct", value: "GHS 38,500", pill: "of GHS 42,000 due", tone: "blue" },
  { id: "orders", label: "Open work orders", value: "3", pill: "1 urgent", tone: "amber" },
  { id: "documents", label: "Documents expiring", value: "2", pill: "within 30 days", tone: "red" },
];

export interface ManageModule {
  id: string;
  title: string;
  note: string;
  icon: string;
}

export const MANAGE_MODULES: ManageModule[] = [
  { id: "properties", title: "Properties & units", note: "12 units in 3 properties", icon: "/icons/building-03.svg" },
  { id: "tenancies", title: "Tenancies", note: "11 active · 1 renewal due", icon: "/icons/user-group.svg" },
  { id: "rent", title: "Rent & payments", note: "GHS 3,500 overdue", icon: "/icons/wallet-01.svg" },
  { id: "maintenance", title: "Maintenance", note: "3 open work orders", icon: "/icons/wrench-01.svg" },
  { id: "inspections", title: "Inspections", note: "Next: Unit 2B, 28 Oct", icon: "/icons/checkmark-badge-01.svg" },
  { id: "documents", title: "Documents", note: "2 expiring soon", icon: "/icons/layers-01.svg" },
  { id: "listings", title: "Listings", note: "1 live · 1 draft", icon: "/icons/tag-01.svg" },
  { id: "enquiries", title: "Enquiries & leads", note: "5 new this week", icon: "/icons/message-01.svg" },
  { id: "analytics", title: "Analytics", note: "Income, occupancy, costs", icon: "/icons/analytics-01.svg" },
];

export type PlanTier = "Pro" | "Business" | "Enterprise";

/** The plan the visitor is on; tools above it are shown locked. */
export const CURRENT_PLAN: PlanTier = "Pro";

const PLAN_ORDER: PlanTier[] = ["Pro", "Business", "Enterprise"];

export function isUnlocked(tier: PlanTier) {
  return PLAN_ORDER.indexOf(tier) <= PLAN_ORDER.indexOf(CURRENT_PLAN);
}

export interface PremiumTool {
  id: string;
  title: string;
  tier: PlanTier;
}

export const PREMIUM_TOOLS: PremiumTool[] = [
  { id: "work-orders", title: "Maintenance & Work Orders", tier: "Pro" },
  { id: "crm", title: "CRM & Lead Management", tier: "Pro" },
  { id: "messages", title: "Automated Messages", tier: "Pro" },
  { id: "relationships", title: "Tenant & Guest Relationships", tier: "Pro" },
  { id: "staff", title: "Staff Accounts & Permissions", tier: "Business" },
  { id: "reporting", title: "Advanced Reporting", tier: "Business" },
  { id: "owners", title: "Owner Performance Dashboards", tier: "Business" },
  { id: "compliance", title: "Inspections & Compliance", tier: "Business" },
  { id: "branches", title: "Multi-Branch Management", tier: "Enterprise" },
  { id: "api", title: "API Access & Webhooks", tier: "Enterprise" },
  { id: "audit", title: "Audit Logs", tier: "Business" },
  { id: "ai", title: "AI Assistant & Automation", tier: "Enterprise" },
];

export interface AttentionItem {
  id: string;
  title: string;
  note: string;
  action: string;
}

export const ATTENTION_ITEMS: AttentionItem[] = [
  { id: "rent", title: "Rent overdue · Unit 2B", note: "GHS 3,500 due 1 Oct", action: "Send reminder" },
  { id: "tap", title: "Leaking kitchen tap · Unit 1A", note: "2 quotes: GHS 280, GHS 350", action: "Compare quotes" },
  { id: "fire", title: "Fire safety certificate", note: "Expires 14 Oct · Dzorwulu block", action: "Start renewal" },
];

export interface Workspace {
  id: string;
  name: string;
  note: string;
}

export const WORKSPACES: Workspace[] = [
  { id: "personal", name: "Madeline Price", note: "Personal · Landlord" },
  { id: "org", name: "Price Property Services", note: "Organisation · Business plan" },
];

// Properties & units (Figma node 1057:28513)

export type PropertyFlag = "overdue" | "vacant" | "repair";

export interface ManageProperty {
  id: string;
  name: string;
  area: string;
  image: string;
  units: number;
  occupied: number;
  /** Monthly rent in GHS; 0 when the owner lives there. */
  rent: number;
  rentNote?: string;
  flag?: { kind: PropertyFlag; label: string };
}

export const MANAGE_PROPERTIES: ManageProperty[] = [
  { id: "adenta-a", name: "Adenta Heights · Block A", area: "Adenta, Accra", image: "/images/marketplace/property-sale.jpg", units: 12, occupied: 11, rent: 33600, flag: { kind: "overdue", label: "1 overdue" } },
  { id: "airport-flats", name: "Airport Residential Flats", area: "Airport Res., Accra", image: "/images/marketplace/development.jpg", units: 6, occupied: 5, rent: 21000, flag: { kind: "vacant", label: "1 vacant" } },
  { id: "east-legon", name: "East Legon 3-bed", area: "East Legon, Accra", image: "/images/marketplace/property-tower.jpg", units: 1, occupied: 1, rent: 6500 },
  { id: "oyarifa", name: "Oyarifa townhouse", area: "Oyarifa, Accra", image: "/images/marketplace/property-curved.jpg", units: 1, occupied: 1, rent: 3800 },
  { id: "spintex", name: "Spintex shop units", area: "Spintex, Accra", image: "/images/marketplace/rental.jpg", units: 3, occupied: 2, rent: 3500, flag: { kind: "repair", label: "Under repair" } },
  { id: "tema", name: "Tema Comm. 25 duplex", area: "Tema, Greater Accra", image: "/images/marketplace/property-sale.jpg", units: 1, occupied: 1, rent: 0, rentNote: "owner use" },
];

export type UnitStatus = "paid" | "renewal" | "overdue" | "listed" | "repair";

export interface ManageUnit {
  id: string;
  unit: string;
  tenant?: { name: string; since: string; avatar: string };
  rent: number;
  leaseEnds?: string;
  status: { kind: UnitStatus; label: string };
  action: { label: string; kind: "view" | "renew" | "remind" | "listing" };
}

export const MANAGE_UNITS: Record<string, ManageUnit[]> = {
  "adenta-a": [
    { id: "a1", unit: "A1", tenant: { name: "Kwesi Appiah", since: "Since Mar 2024", avatar: "/images/manage/tenant-kwesi.jpg" }, rent: 2800, leaseEnds: "28 Feb 2027", status: { kind: "paid", label: "Paid" }, action: { label: "View", kind: "view" } },
    { id: "a2", unit: "A2", tenant: { name: "Efua Mensah", since: "Since Jan 2025", avatar: "/images/manage/tenant-efua.jpg" }, rent: 2800, leaseEnds: "31 Dec 2026", status: { kind: "renewal", label: "Renewal due" }, action: { label: "Renew", kind: "renew" } },
    { id: "a3", unit: "A3", tenant: { name: "Yaw Darko", since: "Since Jun 2023", avatar: "/images/manage/tenant-yaw.jpg" }, rent: 3000, leaseEnds: "31 May 2027", status: { kind: "overdue", label: "Overdue 12 days" }, action: { label: "Remind", kind: "remind" } },
    { id: "a4", unit: "A4", rent: 2800, status: { kind: "listed", label: "Listed" }, action: { label: "View listing", kind: "listing" } },
  ],
  "airport-flats": [
    { id: "f1", unit: "Flat 1", tenant: { name: "Kwesi Appiah", since: "Since Aug 2024", avatar: "/images/manage/tenant-kwesi.jpg" }, rent: 3500, leaseEnds: "31 Jul 2027", status: { kind: "paid", label: "Paid" }, action: { label: "View", kind: "view" } },
    { id: "f2", unit: "Flat 2", tenant: { name: "Efua Mensah", since: "Since Feb 2025", avatar: "/images/manage/tenant-efua.jpg" }, rent: 3500, leaseEnds: "31 Jan 2027", status: { kind: "paid", label: "Paid" }, action: { label: "View", kind: "view" } },
    { id: "f3", unit: "Flat 3", rent: 3500, status: { kind: "listed", label: "Listed" }, action: { label: "View listing", kind: "listing" } },
  ],
  "east-legon": [{ id: "e1", unit: "House", tenant: { name: "Yaw Darko", since: "Since Sep 2024", avatar: "/images/manage/tenant-yaw.jpg" }, rent: 6500, leaseEnds: "31 Aug 2027", status: { kind: "paid", label: "Paid" }, action: { label: "View", kind: "view" } }],
  oyarifa: [{ id: "o1", unit: "House", tenant: { name: "Efua Mensah", since: "Since Mar 2025", avatar: "/images/manage/tenant-efua.jpg" }, rent: 3800, leaseEnds: "28 Feb 2027", status: { kind: "paid", label: "Paid" }, action: { label: "View", kind: "view" } }],
  spintex: [
    { id: "s1", unit: "Shop 1", tenant: { name: "Kwesi Appiah", since: "Since Jan 2024", avatar: "/images/manage/tenant-kwesi.jpg" }, rent: 1800, leaseEnds: "31 Dec 2026", status: { kind: "paid", label: "Paid" }, action: { label: "View", kind: "view" } },
    { id: "s2", unit: "Shop 2", tenant: { name: "Yaw Darko", since: "Since May 2024", avatar: "/images/manage/tenant-yaw.jpg" }, rent: 1700, leaseEnds: "30 Apr 2027", status: { kind: "paid", label: "Paid" }, action: { label: "View", kind: "view" } },
    { id: "s3", unit: "Shop 3", rent: 1700, status: { kind: "repair", label: "Under repair" }, action: { label: "View", kind: "view" } },
  ],
  tema: [{ id: "t1", unit: "Duplex", tenant: { name: "Madeline Price", since: "Owner", avatar: "/images/manage/tenant-efua.jpg" }, rent: 0, status: { kind: "paid", label: "Owner use" }, action: { label: "View", kind: "view" } }],
};

export const MANAGE_TABS = [
  { key: "overview", label: "Overview", href: "/manage" },
  { key: "properties", label: "Properties & units", href: "/manage/properties" },
  { key: "tenancies", label: "Tenancies", href: "/manage/tenancies" },
  { key: "rent", label: "Rent & payments", href: "/manage/rent" },
  { key: "maintenance", label: "Maintenance", href: "/manage/maintenance" },
  { key: "inspections", label: "Inspections", href: "/manage/inspections" },
  { key: "documents", label: "Documents", href: "/manage/documents" },
  { key: "listings", label: "Listings", href: "/manage/listings" },
  { key: "enquiries", label: "Enquiries & leads", href: "/manage/enquiries" },
  { key: "analytics", label: "Analytics", href: "/manage/analytics" },
] as const;

export const PROPERTY_FILTERS = ["All", "Occupied", "Vacant", "Under repair"] as const;
export type PropertyFilterKey = (typeof PROPERTY_FILTERS)[number];

export function matchesPropertyFilter(property: ManageProperty, filter: PropertyFilterKey) {
  if (filter === "Occupied") return property.occupied === property.units;
  if (filter === "Vacant") return property.occupied < property.units;
  if (filter === "Under repair") return property.flag?.kind === "repair";
  return true;
}

// Tenancies (Figma node 1057:28936)

export type TenancyKind = "active" | "renewal" | "ending" | "signing";

export interface Tenancy {
  id: string;
  tenant: string;
  avatar: string;
  /** The line under the name: a masked phone, a verification note or the signing state. */
  note?: string;
  unit: string;
  rent: number;
  term: string;
  deposit: number;
  status: { kind: TenancyKind; label: string };
}

export const TENANCIES: Tenancy[] = [
  { id: "t1", tenant: "Efua Mensah", avatar: "/images/manage/tenant-efua.jpg", note: "+233 24 *** 4471", unit: "Adenta Heights · A2", rent: 2800, term: "Jan 2025 – Dec 2026", deposit: 5600, status: { kind: "renewal", label: "Renewal due" } },
  { id: "t2", tenant: "Yaw Darko", avatar: "/images/manage/tenant-yaw.jpg", note: "ID verified ✓", unit: "Adenta Heights · A3", rent: 3000, term: "Jun 2023 – May 2027", deposit: 6000, status: { kind: "active", label: "Active" } },
  { id: "t3", tenant: "Kwesi Appiah", avatar: "/images/manage/tenant-kwesi.jpg", note: "ID verified ✓", unit: "Adenta Heights · A1", rent: 2800, term: "Mar 2024 – Feb 2027", deposit: 5600, status: { kind: "active", label: "Active" } },
  { id: "t4", tenant: "Nana Ama Serwaa", avatar: "/images/manage/tenant-nana.jpg", note: "ID verified ✓", unit: "Airport Res. · Flat 3", rent: 4200, term: "Nov 2024 – Oct 2026", deposit: 8400, status: { kind: "ending", label: "Ends in 13 days" } },
  { id: "t5", tenant: "Daniel Kumi", avatar: "/images/manage/tenant-daniel.jpg", unit: "East Legon 3-bed", rent: 6500, term: "Sep 2025 – Aug 2027", deposit: 13000, status: { kind: "active", label: "Active" } },
  { id: "t6", tenant: "Akosua Frimpong", avatar: "/images/manage/tenant-akosua.jpg", note: "Signing", unit: "Airport Res. · Flat 5", rent: 3500, term: "Starts 1 Nov 2026", deposit: 7000, status: { kind: "signing", label: "Awaiting signature" } },
];

export const TENANCY_FILTERS = [
  { key: "active", label: "Active", count: 21 },
  { key: "renewal", label: "Renewal due", count: 4 },
  { key: "ending", label: "Ending", count: 1 },
  { key: "past", label: "Past", count: 37 },
] as const;

export type TenancyFilterKey = (typeof TENANCY_FILTERS)[number]["key"];

export function matchesTenancyFilter(tenancy: Tenancy, filter: TenancyFilterKey) {
  if (filter === "active") return true;
  if (filter === "past") return false;
  return tenancy.status.kind === filter;
}

export const MOVE_OUT_CHECKLIST = [
  { id: "notice", label: "Notice received", done: true },
  { id: "inspection", label: "Exit inspection booked · 30 Oct", done: true },
  { id: "meters", label: "Meter readings", done: false },
  { id: "deposit", label: "Deposit settlement", done: false },
  { id: "relist", label: "Relist the unit", done: false },
];

// Rent & payments (Figma node 1057:29330)

export const RENT_KPIS = [
  { id: "collected", label: "Collected in Oct", icon: "/icons/wallet-01.svg", value: "GHS 62,200", note: "91% of expected", tone: "text-[#16a34a]" },
  { id: "overdue", label: "Overdue", icon: "/icons/notification-03.svg", value: "GHS 6,200", note: "2 tenants", tone: "text-[#dc2626]" },
  { id: "due", label: "Due next 7 days", icon: "/icons/calendar-03.svg", value: "GHS 9,800", note: "4 payments", tone: "text-gray-500" },
  { id: "payout", label: "Next payout", icon: "/icons/analytics-01.svg", value: "GHS 58,300", note: "Fri 24 Oct · MTN MoMo", tone: "text-gray-500" },
];

/** Expected and collected rent per month, in thousands of GHS. */
export const COLLECTION_CHART = [
  { month: "May", expected: 60, collected: 58 },
  { month: "Jun", expected: 62, collected: 62 },
  { month: "Jul", expected: 64, collected: 60 },
  { month: "Aug", expected: 66, collected: 66 },
  { month: "Sep", expected: 68, collected: 63 },
  { month: "Oct", expected: 68, collected: 62 },
];

export const OVERDUE_TENANTS = [
  { id: "yaw", name: "Yaw Darko", note: "Adenta A3 · 12 days late", amount: 3000, avatar: "/images/manage/overdue-yaw.png" },
  { id: "kofi", name: "Kofi Boateng", note: "Spintex shop 2 · 5 days late", amount: 3200, avatar: "/images/manage/overdue-kofi.png" },
];

export type PaymentKind = "received" | "overdue" | "payout";

export interface Payment {
  id: string;
  date: string;
  /** Absent for a payout to the landlord. */
  tenant?: { name: string; avatar: string };
  label?: string;
  unit: string;
  method: string;
  amount: number;
  status: { kind: PaymentKind; label: string };
}

export const PAYMENTS: Payment[] = [
  { id: "p1", date: "21 Oct 2026", tenant: { name: "Daniel Kumi", avatar: "/images/manage/tenant-daniel.jpg" }, unit: "East Legon 3-bed", method: "Bank transfer", amount: 6500, status: { kind: "received", label: "Received" } },
  { id: "p2", date: "20 Oct 2026", tenant: { name: "Efua Mensah", avatar: "/images/manage/tenant-efua.jpg" }, unit: "Adenta Heights · A2", method: "MTN MoMo", amount: 2800, status: { kind: "received", label: "Received" } },
  { id: "p3", date: "17 Oct 2026", label: "Payout to you", unit: "All properties", method: "MTN MoMo ··· 0192", amount: 54100, status: { kind: "payout", label: "Paid out" } },
  { id: "p4", date: "10 Oct 2026", tenant: { name: "Yaw Darko", avatar: "/images/manage/tenant-yaw.jpg" }, unit: "Adenta Heights · A3", method: "—", amount: 3000, status: { kind: "overdue", label: "Overdue" } },
  { id: "p5", date: "05 Oct 2026", tenant: { name: "Kwesi Appiah", avatar: "/images/manage/tenant-kwesi.jpg" }, unit: "Adenta Heights · A1", method: "Card", amount: 2800, status: { kind: "received", label: "Received" } },
];

export const PAYMENT_FILTERS = ["All", "Received", "Overdue", "Payouts"] as const;
export type PaymentFilterKey = (typeof PAYMENT_FILTERS)[number];

export function matchesPaymentFilter(payment: Payment, filter: PaymentFilterKey) {
  if (filter === "All") return true;
  if (filter === "Payouts") return payment.status.kind === "payout";
  return payment.status.kind === filter.toLowerCase();
}

// Maintenance (Figma node 1058:29006)

export const MAINTENANCE_KPIS = [
  { id: "open", label: "Open requests", icon: "/icons/wrench-01.svg", value: "7", note: "2 urgent", tone: "text-[#dc2626]" },
  { id: "fix", label: "Avg. time to fix", icon: "/icons/clock-01.svg", value: "2.4 days", note: "−0.6 days vs Sep", tone: "text-[#16a34a]" },
  { id: "spend", label: "Spend this month", icon: "/icons/wallet-01.svg", value: "GHS 4,850", note: "Budget GHS 6,000", tone: "text-gray-500" },
  { id: "done", label: "Completed in Oct", icon: "/icons/checkmark-badge-01.svg", value: "18" },
];

export type WorkOrderStage = "new" | "assigned" | "progress" | "done";
export type WorkOrderPriority = "Urgent" | "High" | "Medium" | "Low";

export type WorkOrder = {
  id: string;
  stage: WorkOrderStage;
  /** Shown instead of a priority pill once the job is paid. */
  pill?: { label: string; kind: "paid" };
  priority: WorkOrderPriority;
  title: string;
  place: string;
  artisan?: { note: string; avatar: string };
};

export const WORK_ORDER_STAGES: { key: WorkOrderStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "assigned", label: "Assigned" },
  { key: "progress", label: "In progress" },
  { key: "done", label: "Done" },
];

export const WORK_ORDERS: WorkOrder[] = [
  { id: "WO-1182", stage: "new", priority: "Urgent", title: "Burst pipe under kitchen sink", place: "Adenta A3 · reported by Yaw Darko" },
  { id: "WO-1183", stage: "new", priority: "High", title: "Gate motor not closing", place: "Airport Res. · common area" },
  { id: "WO-1176", stage: "assigned", priority: "Medium", title: "Re-wire bedroom sockets", place: "East Legon 3-bed", artisan: { note: "Kwabena · Electrician · quote GHS 650", avatar: "/images/manage/art-kwabena.png" } },
  { id: "WO-1178", stage: "assigned", priority: "Medium", title: "AC not cooling · Flat 2", place: "Airport Res.", artisan: { note: "CoolAir GH · visit Thu 10am", avatar: "/images/manage/art-coolair.png" } },
  { id: "WO-1169", stage: "progress", priority: "Low", title: "Repaint shop 2 frontage", place: "Spintex shop units", artisan: { note: "Mensah Painters · 60% done", avatar: "/images/manage/art-mensah.png" } },
  { id: "WO-1171", stage: "progress", priority: "High", title: "Replace water heater", place: "Adenta A1", artisan: { note: "Kojo Plumbing · parts ordered", avatar: "/images/manage/art-kojo-plumbing.png" } },
  { id: "WO-1160", stage: "done", priority: "Medium", pill: { label: "Paid GHS 1,200", kind: "paid" }, title: "Fix leaking roof", place: "Oyarifa townhouse", artisan: { note: "Rated 5 ★ by you", avatar: "/images/manage/art-rated.png" } },
];

export const MAINTENANCE_FILTERS = ["All properties", "Urgent", "Assigned to me"] as const;
export type MaintenanceFilterKey = (typeof MAINTENANCE_FILTERS)[number];

export function matchesMaintenanceFilter(order: WorkOrder, filter: MaintenanceFilterKey) {
  if (filter === "Urgent") return order.priority === "Urgent";
  if (filter === "Assigned to me") return Boolean(order.artisan);
  return true;
}

export const FEATURED_WORK_ORDER = {
  id: "WO-1182",
  title: "Burst pipe under kitchen sink",
  report: "“Water is leaking from the pipe under the sink since this morning. I’ve shut the main valve.” · Yaw Darko, 21 Oct, 7:42 am",
  photos: ["/images/manage/wo-photo-1.png", "/images/manage/wo-photo-2.png"],
  suggested: [
    { id: "kojo", name: "Kojo Plumbing", meta: "ID ✓ · 4.8 ★ · 2 km", price: "From GHS 250", avatar: "/images/manage/sug-kojo.png" },
    { id: "adom", name: "Adom Pipe Works", meta: "ID ✓ · Credential ✓ · 4.7 ★", price: "From GHS 300", avatar: "/images/manage/sug-adom.png" },
  ],
};

// Inspections (Figma node 1058:29335)

export const INSPECTION_KPIS = [
  { id: "scheduled", label: "Scheduled", icon: "/icons/calendar-03.svg", value: "5", note: "Next: Thu 23 Oct", tone: "text-gray-500" },
  { id: "overdue", label: "Overdue routine", icon: "/icons/notification-03.svg", value: "2", note: "Last done over 6 months ago", tone: "text-[#dc2626]" },
  { id: "signed", label: "Signed this year", icon: "/icons/checkmark-badge-01.svg", value: "31" },
  { id: "issues", label: "Issues found", icon: "/icons/layers-01.svg", value: "9", note: "4 turned into work orders", tone: "text-gray-500" },
];

export type InspectionKind = "scheduled" | "overdue" | "signature" | "signed";

export type Inspection = {
  id: string;
  when: string;
  unit: string;
  type: "Move-in" | "Move-out" | "Routine";
  inspector: { name: string; avatar?: string };
  status: { kind: InspectionKind; label: string };
};

export const INSPECTIONS: Inspection[] = [
  { id: "i1", when: "Thu 23 Oct", unit: "Airport Res. · Flat 3", type: "Move-out", inspector: { name: "You" }, status: { kind: "scheduled", label: "Scheduled" } },
  { id: "i2", when: "Sat 25 Oct", unit: "Airport Res. · Flat 5", type: "Move-in", inspector: { name: "Akosua F. + you" }, status: { kind: "scheduled", label: "Scheduled" } },
  { id: "i3", when: "Overdue", unit: "Adenta Heights · A1", type: "Routine", inspector: { name: "Not assigned" }, status: { kind: "overdue", label: "Overdue" } },
  { id: "i4", when: "14 Oct", unit: "East Legon 3-bed", type: "Routine", inspector: { name: "Ama B.", avatar: "/images/manage/inspector-ama.png" }, status: { kind: "signature", label: "Needs tenant signature" } },
  { id: "i5", when: "02 Oct", unit: "Spintex shop 2", type: "Routine", inspector: { name: "You" }, status: { kind: "signed", label: "Signed" } },
];

export const INSPECTION_FILTERS = ["Upcoming", "Needs signature", "Completed"] as const;
export type InspectionFilterKey = (typeof INSPECTION_FILTERS)[number];

export function matchesInspectionFilter(inspection: Inspection, filter: InspectionFilterKey) {
  // The design's default "Upcoming" view lists every inspection, soonest first; the other chips narrow it.
  if (filter === "Needs signature") return inspection.status.kind === "signature";
  if (filter === "Completed") return inspection.status.kind === "signed";
  return true;
}

export type RoomCondition = "Good" | "Fair" | "Needs repair";

export const INSPECTION_REPORT = {
  title: "Report · East Legon 3-bed",
  meta: "Routine · 14 Oct 2026 · 9 rooms",
  rooms: [
    { name: "Living room", condition: "Good" },
    { name: "Kitchen", note: "Cabinet hinge loose", condition: "Fair" },
    { name: "Master bedroom", condition: "Good" },
    { name: "Bathroom 2", note: "Cracked tile by shower", condition: "Needs repair" },
    { name: "Compound", condition: "Good" },
  ] as { name: string; note?: string; condition: RoomCondition }[],
  photos: ["/images/manage/wo-photo-1.png", "/images/manage/report-photo-2.png", "/images/manage/wo-photo-2.png"],
};

// Documents (Figma node 1058:29691)

export const DOCUMENT_KPIS = [
  { id: "total", label: "Documents", icon: "/icons/layers-01.svg", value: "142", note: "2.1 GB of 10 GB", tone: "text-gray-500" },
  { id: "signature", label: "Awaiting signature", icon: "/icons/message-lock-02.svg", value: "3" },
  { id: "expiring", label: "Expiring in 60 days", icon: "/icons/notification-03.svg", value: "2", note: "Fire certificate, insurance", tone: "text-[#dc2626]" },
  { id: "checked", label: "Checked by Biltlinx", icon: "/icons/checkmark-badge-01.svg", value: "6", note: "Title and permits", tone: "text-gray-500" },
];

export type DocumentFolderKey = "all" | "titles" | "tenancy" | "receipts" | "permits" | "inspections" | "insurance" | "shared";

/** Counts are the whole library, not just the sample rows below. */
export const DOCUMENT_FOLDERS: { key: DocumentFolderKey; label: string; count: number }[] = [
  { key: "all", label: "All documents", count: 142 },
  { key: "titles", label: "Titles & land", count: 8 },
  { key: "tenancy", label: "Tenancy agreements", count: 27 },
  { key: "receipts", label: "Receipts & invoices", count: 64 },
  { key: "permits", label: "Permits & certificates", count: 11 },
  { key: "inspections", label: "Inspection reports", count: 22 },
  { key: "insurance", label: "Insurance", count: 4 },
  { key: "shared", label: "Shared with me", count: 6 },
];

export type DocumentKind = "checked" | "awaiting" | "draft" | "expiring" | "sent";

export type ManageDocument = {
  id: string;
  name: string;
  detail: string;
  folder: Exclude<DocumentFolderKey, "all">;
  property: string;
  updated: string;
  status: { kind: DocumentKind; label: string };
};

export const MANAGE_DOCUMENTS: ManageDocument[] = [
  { id: "d1", name: "Land title certificate.pdf", detail: "Titles & land · 2.4 MB", folder: "titles", property: "East Legon 3-bed", updated: "10 Oct", status: { kind: "checked", label: "Checked by Biltlinx ✓" } },
  { id: "d2", name: "Tenancy agreement · Akosua F.pdf", detail: "Tenancy · 6 pages", folder: "tenancy", property: "Airport Res. · Flat 5", updated: "20 Oct", status: { kind: "awaiting", label: "Awaiting tenant signature" } },
  { id: "d3", name: "Renewal offer · Efua M.pdf", detail: "Tenancy · draft", folder: "tenancy", property: "Adenta Heights · A2", updated: "21 Oct", status: { kind: "draft", label: "Draft" } },
  { id: "d4", name: "Fire safety certificate.pdf", detail: "Permits · GNFS", folder: "permits", property: "Adenta Heights", updated: "Mar 2026", status: { kind: "expiring", label: "Expires 30 Nov" } },
  { id: "d5", name: "Building permit · Block A.pdf", detail: "Permits · Assembly", folder: "permits", property: "Adenta Heights", updated: "Jan 2024", status: { kind: "checked", label: "Checked by Biltlinx ✓" } },
  { id: "d6", name: "Rent receipt · Oct · Daniel K.pdf", detail: "Receipts · auto-generated", folder: "receipts", property: "East Legon 3-bed", updated: "21 Oct", status: { kind: "sent", label: "Sent to tenant" } },
];

export const DOCUMENT_FILTERS = ["All", "Needs action", "Expiring"] as const;
export type DocumentFilterKey = (typeof DOCUMENT_FILTERS)[number];

export function matchesDocumentFilter(document: ManageDocument, filter: DocumentFilterKey) {
  if (filter === "Needs action") return document.status.kind === "awaiting" || document.status.kind === "draft";
  if (filter === "Expiring") return document.status.kind === "expiring";
  return true;
}

// Listings (Figma node 1059:29461)

export const LISTING_KPIS = [
  { id: "active", label: "Active listings", icon: "/icons/house-03.svg", value: "9", note: "Pro plan: 25 max", tone: "text-gray-500" },
  { id: "views", label: "Views (30 days)", icon: "/icons/analytics-01.svg", value: "4,812", note: "+18%", tone: "text-[#16a34a]" },
  { id: "saves", label: "Saves", icon: "/icons/favourite.svg", value: "312" },
  { id: "enquiries", label: "Enquiries", icon: "/icons/message-01.svg", value: "57", note: "11 unanswered", tone: "text-[#dc2626]" },
];

export type ListingStage = "active" | "draft" | "paused" | "closed";
export type ListingCheckKind = "checked" | "pending" | "none";

export type ManageListing = {
  id: string;
  title: string;
  detail: string;
  image: string;
  price: string;
  views?: number;
  enquiries?: number;
  check: { kind: ListingCheckKind; label: string };
  stage: ListingStage;
  /** Status pill label; promoted listings read "Boosted" while still active. */
  status: { label: string; tone: "boosted" | "active" | "muted" };
  action: string;
};

export const MANAGE_LISTINGS: ManageListing[] = [
  { id: "l1", title: "4-bed detached house with BQ", detail: "For sale · East Legon Hills", image: "/images/manage/listing-house.png", price: "GHS 1,850,000", views: 2140, enquiries: 23, check: { kind: "checked", label: "Title checked ✓" }, stage: "active", status: { label: "Boosted", tone: "boosted" }, action: "Edit" },
  { id: "l2", title: "Adenta Heights · A4", detail: "To let · 2-bed", image: "/images/manage/listing-adenta.png", price: "GHS 2,800 / month", views: 810, enquiries: 14, check: { kind: "checked", label: "Authority checked ✓" }, stage: "active", status: { label: "Active", tone: "active" }, action: "Edit" },
  { id: "l3", title: "Airport Res. · Flat 3", detail: "To let from 1 Nov", image: "/images/manage/report-photo-2.png", price: "GHS 4,200 / month", views: 655, enquiries: 9, check: { kind: "checked", label: "Authority checked ✓" }, stage: "active", status: { label: "Active", tone: "active" }, action: "Edit" },
  { id: "l4", title: "Oyarifa townhouse · short stay", detail: "Stay · sleeps 6", image: "/images/manage/listing-stay.png", price: "GHS 650 / night", views: 1002, enquiries: 8, check: { kind: "none", label: "Not checked" }, stage: "active", status: { label: "Active", tone: "active" }, action: "Edit" },
  { id: "l5", title: "Spintex shop 2", detail: "To let · commercial", image: "/images/manage/listing-shop.png", price: "GHS 3,200 / month", views: 205, enquiries: 3, check: { kind: "pending", label: "Pending check" }, stage: "paused", status: { label: "Paused", tone: "muted" }, action: "Resume" },
  { id: "l6", title: "Plot · Prampram 100×70", detail: "For sale · land · draft", image: "/images/manage/wo-photo-2.png", price: "GHS 120,000", check: { kind: "pending", label: "Add documents" }, stage: "draft", status: { label: "Draft", tone: "muted" }, action: "Finish" },
];

/** Counts are the whole account, not just the sample rows above. */
export const LISTING_FILTERS: { key: ListingStage; label: string; count: number }[] = [
  { key: "active", label: "Active", count: 9 },
  { key: "draft", label: "Drafts", count: 2 },
  { key: "paused", label: "Paused", count: 1 },
  { key: "closed", label: "Sold / let", count: 14 },
];

// Enquiries & leads (Figma node 1059:29837)

export const LEAD_KPIS = [
  { id: "new", label: "New this week", icon: "/icons/message-01.svg", value: "19", note: "11 unanswered", tone: "text-[#dc2626]" },
  { id: "viewings", label: "Viewings booked", icon: "/icons/calendar-03.svg", value: "7" },
  { id: "conversion", label: "Conversion", icon: "/icons/analytics-01.svg", value: "12%", note: "Enquiry → deal", tone: "text-[#16a34a]" },
  { id: "reply", label: "Avg. reply time", icon: "/icons/notification-03.svg", value: "1h 40m", note: "Top agents: under 1h", tone: "text-gray-500" },
];

export type LeadStage = "new" | "contacted" | "viewing" | "offer" | "won";
export type LeadSource = "Listings" | "Feed posts" | "Profile";

export type Lead = {
  id: string;
  name: string;
  avatar: string;
  stage: LeadStage;
  source: LeadSource;
  subject: string;
  note: string;
  time: string;
  /** Blue dot: the lead hasn't been answered yet. */
  unread?: boolean;
};

export const LEAD_STAGES: { key: LeadStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "viewing", label: "Viewing booked" },
  { key: "offer", label: "Offer / application" },
  { key: "won", label: "Won" },
];

export const LEADS: Lead[] = [
  { id: "kofi", name: "Kofi Mensah", avatar: "/images/manage/lead-kofi.png", stage: "new", source: "Feed posts", subject: "4-bed East Legon Hills", note: "“Is the price negotiable?”", time: "5m ago", unread: true },
  { id: "esi", name: "Esi Owusu", avatar: "/images/manage/lead-esi.png", stage: "new", source: "Listings", subject: "Adenta A4", note: "“Can I view on Saturday?”", time: "1h ago", unread: true },
  { id: "abena", name: "Abena Owusu", avatar: "/images/manage/lead-abena.png", stage: "contacted", source: "Listings", subject: "4-bed East Legon Hills", note: "Sent documents list", time: "Yesterday" },
  { id: "joseph", name: "Joseph Tetteh", avatar: "/images/manage/lead-joseph.png", stage: "contacted", source: "Profile", subject: "Airport Flat 3", note: "Called · wants Nov move-in", time: "2d" },
  { id: "kwame", name: "Kwame Asare", avatar: "/images/manage/lead-kwame.png", stage: "viewing", source: "Listings", subject: "4-bed East Legon Hills", note: "Sat 24 Oct · 10:00", time: "Confirmed" },
  { id: "ama", name: "Ama Darko", avatar: "/images/manage/lead-ama.png", stage: "viewing", source: "Feed posts", subject: "Adenta A4", note: "Sun 25 Oct · 2:00", time: "Confirmed" },
  { id: "nana", name: "Nana Yeboah", avatar: "/images/manage/lead-nana.png", stage: "offer", source: "Listings", subject: "4-bed East Legon Hills", note: "Offer GHS 1,720,000", time: "Counter?" },
  { id: "akosua", name: "Akosua Frimpong", avatar: "/images/manage/lead-akosua.png", stage: "won", source: "Listings", subject: "Airport Flat 5", note: "Signed · GHS 3,500 / mo", time: "20 Oct" },
];

export const LEAD_SOURCES = ["All sources", "Listings", "Feed posts", "Profile"] as const;
export type LeadSourceFilter = (typeof LEAD_SOURCES)[number];

export const FEATURED_LEAD = {
  leadId: "kofi",
  title: "Kofi Mensah · 4-bed detached house with BQ",
  messages: [
    { id: "m1", from: "lead", text: "Hello, is the price negotiable? I can pay in two instalments." },
    { id: "m2", from: "you", text: "Hi Kofi, yes, the owner is open to serious offers. Would you like to view it this weekend?" },
  ],
  quickReplies: ["Share viewing slots", "Send documents list", "Ask for budget"],
  details: [
    { label: "Source", value: "Feed post · 21 Oct" },
    { label: "Budget", value: "GHS 1.6m – 1.8m" },
    { label: "Buying", value: "Within 3 months" },
    { label: "Verification", value: "ID verified ✓", tone: "text-[#16a34a]" },
  ],
};

// Analytics (Figma node 1059:30190)

export const ANALYTICS_RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "This year"] as const;

export const ANALYTICS_KPIS = [
  { id: "income", label: "Income", icon: "/icons/wallet-01.svg", value: "GHS 74,900", note: "+6% vs last month", tone: "text-[#16a34a]" },
  { id: "views", label: "Listing views", icon: "/icons/analytics-01.svg", value: "4,812", note: "+18%", tone: "text-[#16a34a]" },
  { id: "enquiries", label: "Enquiries", icon: "/icons/message-01.svg", value: "57", note: "−4%", tone: "text-[#dc2626]" },
  { id: "occupancy", label: "Occupancy", icon: "/icons/house-03.svg", value: "88%", note: "21 of 24 units", tone: "text-gray-500" },
];

/** Relative bar heights in pixels for the 200px chart; the last month is the current one. */
export const INCOME_BY_MONTH = [
  { month: "Nov", height: 60 },
  { month: "Dec", height: 75 },
  { month: "Jan", height: 90 },
  { month: "Feb", height: 85 },
  { month: "Mar", height: 100 },
  { month: "Apr", height: 105 },
  { month: "May", height: 115 },
  { month: "Jun", height: 130 },
  { month: "Jul", height: 120 },
  { month: "Aug", height: 145 },
  { month: "Sep", height: 150 },
  { month: "Oct", height: 175 },
];

export const ENQUIRY_SOURCES = [
  { label: "Properties search", percent: 42, color: "bg-brand-900" },
  { label: "Feed posts", percent: 28, color: "bg-[#498cf8]" },
  { label: "Your profile", percent: 14, color: "bg-[#93c5fd]" },
  { label: "Marketplace", percent: 10, color: "bg-[#bfdbfe]" },
  { label: "Concierge", percent: 6, color: "bg-[#dbeafe]" },
];

export const TOP_LISTINGS = [
  { id: "t1", title: "4-bed detached house with BQ", image: "/images/manage/listing-house.png", views: 2140, saves: 128, enquiries: 23, viewings: 6, rate: "1.1%" },
  { id: "t2", title: "Oyarifa townhouse · short stay", image: "/images/manage/listing-stay.png", views: 1002, saves: 74, enquiries: 8, viewings: 0, rate: "0.8%" },
  { id: "t3", title: "Adenta Heights · A4", image: "/images/manage/listing-adenta.png", views: 810, saves: 52, enquiries: 14, viewings: 4, rate: "1.7%" },
  { id: "t4", title: "Airport Res. · Flat 3", image: "/images/manage/report-photo-2.png", views: 655, saves: 40, enquiries: 9, viewings: 2, rate: "1.4%" },
];

// Manage as an artisan (Figma node 1081:32631)

export const ARTISAN_TABS = [
  { key: "overview", label: "Overview", href: "/manage/artisan" },
  { key: "jobs", label: "Jobs", href: "/manage/artisan/jobs" },
  { key: "quotes", label: "Quotes", href: "/manage/artisan/quotes" },
  { key: "schedule", label: "Schedule", href: "/manage/artisan/schedule" },
  { key: "workOrders", label: "Work orders", href: "/manage/artisan/work-orders" },
  { key: "payments", label: "Payments", href: "/manage/artisan/payments" },
  { key: "services", label: "Services & portfolio", href: "/manage/artisan/services" },
] as const;

export const ARTISAN_PROFILE = { name: "Kwabena Asante", trade: "Electrician" };

export const ARTISAN_KPIS = [
  { id: "jobs", label: "Active jobs", icon: "/icons/briefcase-01.svg", value: "5", note: "2 today", tone: "text-gray-500" },
  { id: "quotes", label: "Quotes waiting", icon: "/icons/tag-01.svg", value: "3", note: "GHS 4,250 in total", tone: "text-gray-500" },
  { id: "earned", label: "Earned in Oct", icon: "/icons/wallet-01.svg", value: "GHS 7,860", note: "+14% vs Sep", tone: "text-[#16a34a]" },
  { id: "rating", label: "Rating", icon: "/icons/star.svg", value: "4.8 ★", note: "From 124 reviews", tone: "text-gray-500" },
];

export type VisitKind = "progress" | "confirmed" | "quote";

export const ARTISAN_TODAY = {
  heading: "Today · Tue 21 Oct",
  visits: [
    { id: "v1", time: "8:00 am", title: "Re-wire bedroom sockets", place: "East Legon · Daniel Kumi", status: { kind: "progress" as VisitKind, label: "In progress" } },
    { id: "v2", time: "1:30 pm", title: "Install ceiling fans × 3", place: "Adenta · Efua Mensah", status: { kind: "confirmed" as VisitKind, label: "Confirmed" } },
    { id: "v3", time: "4:00 pm", title: "Site visit · new quote", place: "Spintex · Kofi Boateng", status: { kind: "quote" as VisitKind, label: "Quote visit" } },
  ],
};

export const ARTISAN_NEW_REQUESTS = [
  { id: "r1", title: "Fix faulty DB board", detail: "Madina · GHS 400 – 700 · 2h ago" },
  { id: "r2", title: "Wire new 2-bed apartment", detail: "Oyarifa · GHS 6,000+ · 5h ago" },
];

export const ARTISAN_TOOLS = [
  { id: "jobs", title: "Jobs", note: "5 active", blurb: "Track every job from booked to paid", icon: "/icons/briefcase-01.svg", href: "/manage/artisan/jobs" },
  { id: "quotes", title: "Quotes", note: "3 waiting", blurb: "Send, follow up and win quotes", icon: "/icons/tag-01.svg", href: "/manage/artisan/quotes" },
  { id: "schedule", title: "Schedule", note: "4 this week", blurb: "Your week, visits and travel", icon: "/icons/calendar-03.svg", href: "/manage/artisan/schedule" },
  { id: "workOrders", title: "Work orders", note: "2 new", blurb: "Jobs sent by landlords and managers", icon: "/icons/wrench-01.svg", href: "/manage/artisan/work-orders" },
  { id: "payments", title: "Payments", note: "GHS 1,250 due", blurb: "Invoices, payouts and receipts", icon: "/icons/wallet-01.svg", href: "/manage/artisan/payments" },
  { id: "services", title: "Services & portfolio", note: "6 services", blurb: "What you offer, prices and past work", icon: "/icons/layers-01.svg", href: "/manage/artisan/services" },
];

// Artisan jobs (Figma node 1081:32983)

export type JobStage = "booked" | "progress" | "awaiting" | "paid";

export const JOB_STAGES: { key: JobStage; label: string }[] = [
  { key: "booked", label: "Booked" },
  { key: "progress", label: "In progress" },
  { key: "awaiting", label: "Awaiting payment" },
  { key: "paid", label: "Paid" },
];

export interface ArtisanJob {
  id: string;
  stage: JobStage;
  title: string;
  client: string;
  when: string;
  amount: number;
  thisWeek?: boolean;
  overdue?: boolean;
}

export const ARTISAN_JOBS: ArtisanJob[] = [
  { id: "J-2209", stage: "booked", title: "Install ceiling fans × 3", client: "Efua Mensah · Adenta", when: "Tue 1:30 pm", amount: 450, thisWeek: true },
  { id: "J-2210", stage: "booked", title: "Outdoor security lights", client: "Joseph Tetteh · Tema", when: "Fri 10:00 am", amount: 780, thisWeek: true },
  { id: "J-2207", stage: "progress", title: "Re-wire bedroom sockets", client: "Daniel Kumi · East Legon", when: "Started today", amount: 650, thisWeek: true },
  { id: "J-2203", stage: "awaiting", title: "Replace DB board", client: "Akua M. · Madina", when: "Done 18 Oct", amount: 1250, thisWeek: true, overdue: true },
  { id: "J-2198", stage: "paid", title: "Fault finding · shop 2", client: "Kofi Boateng · Spintex", when: "Paid 15 Oct", amount: 300 },
  { id: "J-2195", stage: "paid", title: "Install inverter", client: "Nana Yeboah · Airport", when: "Paid 12 Oct", amount: 2100 },
];

/** Counts are the whole account, not just the sample cards. */
export const JOB_FILTERS = [
  { key: "all", label: "All 11" },
  { key: "week", label: "This week" },
  { key: "overdue", label: "Overdue" },
] as const;
export type JobFilterKey = (typeof JOB_FILTERS)[number]["key"];

export function matchesJobFilter(job: ArtisanJob, filter: JobFilterKey) {
  if (filter === "week") return Boolean(job.thisWeek);
  if (filter === "overdue") return Boolean(job.overdue);
  return true;
}

export const FEATURED_JOB = {
  id: "J-2207",
  title: "Re-wire bedroom sockets",
  details: [
    { label: "Client", value: "Daniel Kumi · ID verified ✓" },
    { label: "Address", value: "East Legon, Accra · shared after booking" },
    { label: "Agreed price", value: "GHS 650 · 50% paid upfront" },
    { label: "Materials", value: "Client supplies sockets; you supply cable" },
  ],
  steps: [
    { id: "arrived", label: "Arrived on site", done: true },
    { id: "before", label: "Before photos", done: true },
    { id: "work", label: "Work done", done: false },
    { id: "after", label: "After photos", done: false },
    { id: "signoff", label: "Client signs off", done: false },
  ],
};

// Artisan quotes (Figma node 1081:33273)

export const QUOTE_KPIS = [
  { id: "sent", label: "Sent this month", icon: "/icons/tag-01.svg", value: "14" },
  { id: "win", label: "Win rate", icon: "/icons/checkmark-badge-01.svg", value: "43%", note: "+6% vs Sep", tone: "text-[#16a34a]" },
  { id: "waiting", label: "Waiting on client", icon: "/icons/clock-01.svg", value: "3", note: "GHS 4,250", tone: "text-gray-500" },
  { id: "expiring", label: "Expiring soon", icon: "/icons/notification-03.svg", value: "1", note: "Tomorrow", tone: "text-[#dc2626]" },
];

export type QuoteKind = "viewed" | "waiting" | "accepted" | "expiring" | "declined";

export interface ArtisanQuote {
  id: string;
  title: string;
  detail: string;
  client: { name: string; avatar: string };
  amount: number;
  sent: string;
  status: { kind: QuoteKind; label: string };
  action: "Follow up" | "Edit" | "Open job" | "Extend" | "View";
}

export const ARTISAN_QUOTES: ArtisanQuote[] = [
  { id: "Q-1189", title: "Wire new 2-bed apartment", detail: "Q-1189 · from Request Board", client: { name: "Esi Owusu", avatar: "/images/manage/quote-esi.png" }, amount: 6400, sent: "20 Oct", status: { kind: "viewed", label: "Viewed · waiting" }, action: "Follow up" },
  { id: "Q-1188", title: "Fix faulty DB board", detail: "Q-1188", client: { name: "Yaw Darko", avatar: "/images/manage/quote-yaw.png" }, amount: 650, sent: "19 Oct", status: { kind: "waiting", label: "Waiting" }, action: "Edit" },
  { id: "Q-1185", title: "Install ceiling fans × 3", detail: "Q-1185", client: { name: "Efua Mensah", avatar: "/images/manage/quote-efua.png" }, amount: 450, sent: "16 Oct", status: { kind: "accepted", label: "Accepted → job" }, action: "Open job" },
  { id: "Q-1182", title: "Solar inverter install", detail: "Q-1182 · expires tomorrow", client: { name: "Kwame Asare", avatar: "/images/manage/quote-kwame.png" }, amount: 3150, sent: "14 Oct", status: { kind: "expiring", label: "Expiring" }, action: "Extend" },
  { id: "Q-1179", title: "Rewire shop 4", detail: "Q-1179", client: { name: "Kofi Boateng", avatar: "/images/manage/quote-kofi.png" }, amount: 2200, sent: "10 Oct", status: { kind: "declined", label: "Declined · price" }, action: "View" },
];

export const QUOTE_FILTERS = ["All", "Waiting", "Accepted", "Declined", "Drafts"] as const;
export type QuoteFilterKey = (typeof QUOTE_FILTERS)[number];

export function matchesQuoteFilter(quote: ArtisanQuote, filter: QuoteFilterKey) {
  const kind = quote.status.kind;
  if (filter === "Waiting") return kind === "viewed" || kind === "waiting" || kind === "expiring";
  if (filter === "Accepted") return kind === "accepted";
  if (filter === "Declined") return kind === "declined";
  if (filter === "Drafts") return false;
  return true;
}

// Artisan schedule (Figma node 1082:33095)

export type ScheduleKind = "job" | "booking" | "quote" | "blocked";

export interface ScheduleEvent {
  id: string;
  /** 0 = Monday of the sample week. */
  day: number;
  /** Hour of the day in 24h time, e.g. 13.5 for 1:30 pm. */
  start: number;
  hours: number;
  title: string;
  place?: string;
  kind: ScheduleKind;
}

/** The sample week; "today" in the mock data is Tuesday 21 Oct 2026. */
export const SCHEDULE_WEEK_START = new Date(2026, 9, 20);
export const SCHEDULE_TODAY = new Date(2026, 9, 21);
export const SCHEDULE_FIRST_HOUR = 8;
export const SCHEDULE_LAST_HOUR = 20;

export const SCHEDULE_EVENTS: ScheduleEvent[] = [
  { id: "e1", day: 1, start: 8, hours: 2, title: "Re-wire sockets", place: "East Legon", kind: "job" },
  { id: "e2", day: 1, start: 13.5, hours: 1.5, title: "Ceiling fans", place: "Adenta", kind: "booking" },
  { id: "e3", day: 1, start: 16, hours: 1, title: "Quote visit", place: "Spintex", kind: "quote" },
  { id: "e4", day: 2, start: 9, hours: 3, title: "Re-wire sockets", place: "East Legon", kind: "job" },
  { id: "e5", day: 3, start: 10, hours: 2, title: "DB board check", place: "Madina", kind: "booking" },
  { id: "e6", day: 4, start: 9, hours: 2.5, title: "Security lights", place: "Tema", kind: "booking" },
  { id: "e7", day: 5, start: 8, hours: 2, title: "Blocked · personal", kind: "blocked" },
];

export const SCHEDULE_LEGEND: { kind: ScheduleKind; label: string }[] = [
  { kind: "job", label: "Job" },
  { kind: "booking", label: "Confirmed booking" },
  { kind: "quote", label: "Quote visit" },
  { kind: "blocked", label: "Blocked" },
];

// Artisan work orders (Figma node 1082:33388)

export const ARTISAN_WORK_ORDER_KPIS = [
  { id: "new", label: "New", icon: "/icons/wrench-01.svg", value: "2", note: "Respond within 24h", tone: "text-[#dc2626]" },
  { id: "accepted", label: "Accepted", icon: "/icons/briefcase-01.svg", value: "4" },
  { id: "done", label: "Completed in Oct", icon: "/icons/checkmark-badge-01.svg", value: "9" },
  { id: "paid", label: "Paid through Biltlinx", icon: "/icons/wallet-01.svg", value: "GHS 3,950" },
];

export type OrderStatus = "new" | "progress" | "paid" | "declined";
export type OrderPriority = "Urgent" | "High" | "Medium" | "Low";

export interface ArtisanWorkOrder {
  id: string;
  title: string;
  detail: string;
  from: { name: string; role: string; avatar: string };
  property: string;
  priority: OrderPriority;
  status: OrderStatus;
}

export const ARTISAN_WORK_ORDERS: ArtisanWorkOrder[] = [
  { id: "WO-1182", title: "Burst pipe check · electrics", detail: "WO-1182 · photos attached", from: { name: "Madeline Price", role: "Landlord", avatar: "/images/manage/client-madeline.png" }, property: "Adenta Heights · A3", priority: "Urgent", status: "new" },
  { id: "WO-1175", title: "Re-wire bedroom sockets", detail: "WO-1175", from: { name: "Madeline Price", role: "Landlord", avatar: "/images/manage/client-madeline.png" }, property: "East Legon 3-bed", priority: "Medium", status: "progress" },
  { id: "WO-1169", title: "Replace outdoor lights", detail: "WO-1169", from: { name: "Prime Homes GH", role: "Property manager", avatar: "/images/manage/client-prime.png" }, property: "Tema Comm. 25", priority: "Low", status: "new" },
  { id: "WO-1150", title: "Fault finding · shop 2", detail: "WO-1150", from: { name: "Madeline Price", role: "Landlord", avatar: "/images/manage/client-madeline.png" }, property: "Spintex shop units", priority: "High", status: "paid" },
];

export const FEATURED_WORK_ORDER_REQUEST = {
  id: "WO-1182",
  from: "Madeline Price",
  message: "“Water leak under the kitchen sink reached a socket. Please check the circuit is safe before the plumber starts.” · Due today",
  photos: ["/images/manage/wo-photo-1.png", "/images/manage/wo-photo-2.png"],
  callOut: "GHS 250",
};

// Artisan payments (Figma node 1082:33698)

export const ARTISAN_AVAILABLE_PAYOUT = 2340;

export const ARTISAN_PAYMENT_KPIS = [
  { id: "held", label: "Held for jobs in progress", icon: "/icons/message-lock-02.svg", value: "GHS 1,100", note: "Released on sign-off", tone: "text-gray-500" },
  { id: "unpaid", label: "Unpaid invoices", icon: "/icons/notification-03.svg", value: "GHS 1,250", note: "1 overdue", tone: "text-[#dc2626]" },
  { id: "year", label: "Earned this year", icon: "/icons/analytics-01.svg", value: "GHS 64,200" },
];

export const ARTISAN_PAYOUT_PLAN = { next: "Fri 24 Oct", account: "MTN MoMo ··· 4471", schedule: "payouts every Friday" };

export type InvoiceKind = "overdue" | "held" | "payout" | "paid";

export interface ArtisanInvoice {
  id: string;
  /** Payout rows have no client avatar. */
  client: { name: string; avatar?: string };
  job: string;
  amount: number;
  due: string;
  status: { kind: InvoiceKind; label: string };
}

export const ARTISAN_INVOICES: ArtisanInvoice[] = [
  { id: "INV-0412", client: { name: "Akua M.", avatar: "/images/manage/quote-efua.png" }, job: "Replace DB board", amount: 1250, due: "18 Oct", status: { kind: "overdue", label: "Overdue 3 days" } },
  { id: "INV-0411", client: { name: "Daniel Kumi", avatar: "/images/manage/quote-kofi.png" }, job: "Re-wire sockets · 50%", amount: 325, due: "Paid", status: { kind: "held", label: "Held" } },
  { id: "PAYOUT", client: { name: "Payout to MTN MoMo" }, job: "4 jobs", amount: 2780, due: "17 Oct", status: { kind: "payout", label: "Paid out" } },
  { id: "INV-0409", client: { name: "Kofi Boateng", avatar: "/images/manage/quote-kwame.png" }, job: "Fault finding · shop 2", amount: 300, due: "15 Oct", status: { kind: "paid", label: "Paid" } },
];

export const INVOICE_FILTERS = ["All", "Unpaid", "Paid", "Payouts"] as const;
export type InvoiceFilterKey = (typeof INVOICE_FILTERS)[number];

export function matchesInvoiceFilter(invoice: ArtisanInvoice, filter: InvoiceFilterKey) {
  const kind = invoice.status.kind;
  if (filter === "Unpaid") return kind === "overdue";
  if (filter === "Paid") return kind === "paid" || kind === "held";
  if (filter === "Payouts") return kind === "payout";
  return true;
}

// Artisan services & portfolio (Figma node 1082:34009)

export interface ArtisanService {
  id: string;
  title: string;
  /** Pricing basis and views, shown under the title; "Paused" is added when the service is switched off. */
  detail: string;
  price: string;
  active: boolean;
}

export const ARTISAN_SERVICES: ArtisanService[] = [
  { id: "s1", title: "House wiring (new build)", detail: "per 2-bed · materials quoted · 1,204 views", price: "From GHS 4,500", active: true },
  { id: "s2", title: "Socket & switch repairs", detail: "call-out, includes 30 min · 2,980 views", price: "GHS 150", active: true },
  { id: "s3", title: "Ceiling fan installation", detail: "per fan · 640 views", price: "GHS 150", active: true },
  { id: "s4", title: "Inverter & solar install", detail: "labour only · 410 views", price: "From GHS 1,800", active: true },
  { id: "s5", title: "DB board replacement", detail: "per board · 322 views", price: "From GHS 900", active: true },
  { id: "s6", title: "Emergency call-out (night)", detail: "after 8 pm", price: "GHS 300", active: false },
];

export const ARTISAN_PORTFOLIO = {
  total: 18,
  projects: [
    { id: "p1", title: "Full re-wire · East Legon", detail: "4-bed · Aug 2026", image: "/images/manage/wo-photo-1.png" },
    { id: "p2", title: "New build wiring · Oyarifa", detail: "3-bed · Jun 2026", image: "/images/manage/listing-house.png" },
    { id: "p3", title: "Solar + inverter · Airport", detail: "5 kVA · May 2026", image: "/images/manage/listing-adenta.png" },
    { id: "p4", title: "Shop fit-out · Spintex", detail: "3 units · Mar 2026", image: "/images/manage/wo-photo-2.png" },
  ],
};

export const ARTISAN_CREDENTIALS = [
  { id: "c1", label: "ID verified ✓", verified: true },
  { id: "c2", label: "Energy Commission licence · Class 2 ✓", verified: true },
  { id: "c3", label: "Trade test certificate · pending check", verified: false },
];

// Manage as a professional (Figma node 1083:33644)

export const PROFESSIONAL_TABS = [
  { key: "overview", label: "Overview", href: "/manage/professional" },
  { key: "clients", label: "Clients", href: "/manage/professional/clients" },
  { key: "leads", label: "Leads", href: "/manage/professional/leads" },
  { key: "quotes", label: "Quotes", href: "/manage/professional/quotes" },
  { key: "appointments", label: "Appointments", href: "/manage/professional/appointments" },
  { key: "payments", label: "Payments", href: "/manage/professional/payments" },
  { key: "services", label: "Services & portfolio", href: "/manage/professional/services" },
] as const;

export const PROFESSIONAL_PROFILE = { name: "Ama Boatengmaa", trade: "Architect" };

export const PROFESSIONAL_KPIS = [
  { id: "clients", label: "Active clients", icon: "/icons/user-group.svg", value: "8", note: "3 projects in design", tone: "text-gray-500" },
  { id: "appointments", label: "Appointments this week", icon: "/icons/calendar-03.svg", value: "6", note: "2 site visits", tone: "text-gray-500" },
  { id: "quotes", label: "Quotes waiting", icon: "/icons/tag-01.svg", value: "2", note: "GHS 5,700", tone: "text-gray-500" },
  { id: "fees", label: "Fees in Oct", icon: "/icons/wallet-01.svg", value: "GHS 18,450", note: "+9% vs Sep", tone: "text-[#16a34a]" },
];

export type AppointmentKind = "video" | "site" | "paid";

export const PROFESSIONAL_APPOINTMENTS = [
  { id: "a1", when: "Today 11:00", title: "Design review · video call", who: "Andy Ansong · Legon Courtyard House", tag: { kind: "video" as AppointmentKind, label: "Video" }, action: "Join" },
  { id: "a2", when: "Today 3:00", title: "Site visit · 1 hr", who: "Abena Owusu · Adenta", tag: { kind: "site" as AppointmentKind, label: "Site visit" }, action: "Details" },
  { id: "a3", when: "Wed 10:00", title: "First consultation", who: "Kofi Mensah · new lead", tag: { kind: "paid" as AppointmentKind, label: "Paid · GHS 250" }, action: "Details" },
];

export const PROFESSIONAL_PIPELINE = [
  { label: "New enquiries", count: 4 },
  { label: "Consultation booked", count: 2 },
  { label: "Quote sent", count: 2 },
  { label: "Won this month", count: 3 },
];

export const PROFESSIONAL_PROFILE_STRENGTH = { percent: 85, hint: "Add 2 more portfolio projects to reach 100%." };

export const PROFESSIONAL_TOOLS = [
  { id: "clients", title: "Clients", note: "8 active", blurb: "Projects, files and notes per client", icon: "/icons/user-group.svg", href: "/manage/professional/clients" },
  { id: "leads", title: "Leads", note: "4 new", blurb: "Enquiries from your profile and posts", icon: "/icons/message-01.svg", href: "/manage/professional/leads" },
  { id: "quotes", title: "Quotes", note: "2 waiting", blurb: "Fee proposals and their status", icon: "/icons/tag-01.svg", href: "/manage/professional/quotes" },
  { id: "appointments", title: "Appointments", note: "6 this week", blurb: "Consultations, reviews and site visits", icon: "/icons/calendar-03.svg", href: "/manage/professional/appointments" },
  { id: "payments", title: "Payments", note: "GHS 3,000 due", blurb: "Invoices, deposits and payouts", icon: "/icons/wallet-01.svg", href: "/manage/professional/payments" },
  { id: "services", title: "Services & portfolio", note: "5 services", blurb: "What you offer and past projects", icon: "/icons/layers-01.svg", href: "/manage/professional/services" },
];

// Professional clients (Figma node 1083:34004)

export type ClientStageKind = "design" | "permit" | "build" | "concept" | "accepted";
export type MilestoneState = "done" | "waiting" | "todo";

export interface ProfessionalClient {
  id: string;
  name: string;
  since: string;
  avatar: string;
  project: string;
  stage: { kind: ClientStageKind; label: string };
  balance: number;
  /** Only the sample client the design opens has a full project panel. */
  panel?: {
    subtitle: string;
    avatar: string;
    milestones: { label: string; state: MilestoneState; note?: string }[];
    files: string[];
    invoiced: number;
    paid: number;
  };
}

export const PROFESSIONAL_CLIENTS: ProfessionalClient[] = [
  { id: "andy", name: "Andy Ansong", since: "Since Mar 2026", avatar: "/images/manage/client-andy.png", project: "Legon Courtyard House", stage: { kind: "design", label: "Design · rev 2" }, balance: 0 },
  {
    id: "abena",
    name: "Abena Owusu",
    since: "Since Jun 2026",
    avatar: "/images/manage/quote-efua.png",
    project: "Adenta renovation",
    stage: { kind: "permit", label: "Permit submitted" },
    balance: 1200,
    panel: {
      subtitle: "Adenta renovation · ID verified ✓",
      avatar: "/images/manage/client-abena-lg.png",
      milestones: [
        { label: "Brief & measured survey", state: "done", note: "Done" },
        { label: "Concept design", state: "done", note: "Done" },
        { label: "Permit drawings", state: "done", note: "Done" },
        { label: "Permit approval", state: "waiting", note: "Waiting on Assembly" },
        { label: "Site supervision", state: "todo", note: "Not started" },
      ],
      files: ["Permit drawings rev 3.pdf", "Site survey.pdf", "Contract signed.pdf"],
      invoiced: 6000,
      paid: 4800,
    },
  },
  { id: "horizon", name: "Horizon Developments", since: "Organisation", avatar: "/images/manage/client-prime.png", project: "Adenta Heights Ph 2", stage: { kind: "build", label: "Construction" }, balance: 0 },
  { id: "kwame", name: "Kwame Asare", since: "Since Sep 2026", avatar: "/images/manage/quote-kwame.png", project: "Trasacco villa", stage: { kind: "concept", label: "Concept" }, balance: 1800 },
  { id: "esi", name: "Esi Owusu", since: "Since Oct 2026", avatar: "/images/manage/client-prime.png", project: "Oyarifa 3-bed", stage: { kind: "accepted", label: "Quote accepted" }, balance: 0 },
];

/** Counts are the whole practice, not just the sample rows. */
export const CLIENT_FILTERS = [
  { key: "active", label: "Active 8" },
  { key: "past", label: "Past 31" },
] as const;
export type ClientFilterKey = (typeof CLIENT_FILTERS)[number]["key"];

// Professional leads (Figma node 1083:34315)

export const PROFESSIONAL_LEAD_KPIS = [
  { id: "new", label: "New this week", icon: "/icons/message-01.svg", value: "4", note: "2 unanswered", tone: "text-[#dc2626]" },
  { id: "booked", label: "Consultations booked", icon: "/icons/calendar-03.svg", value: "2" },
  { id: "win", label: "Win rate", icon: "/icons/analytics-01.svg", value: "38%" },
  { id: "reply", label: "Avg. reply", icon: "/icons/clock-01.svg", value: "52 min", note: "Top 10% of architects", tone: "text-[#16a34a]" },
];

export type ProfessionalLeadStage = "new" | "booked" | "quoted" | "won";

export const PROFESSIONAL_LEAD_STAGES: { key: ProfessionalLeadStage; label: string }[] = [
  { key: "new", label: "New" },
  { key: "booked", label: "Consultation booked" },
  { key: "quoted", label: "Quote sent" },
  { key: "won", label: "Won" },
];

export const PROFESSIONAL_LEADS = [
  { id: "kofi", stage: "new" as ProfessionalLeadStage, name: "Kofi Mensah", avatar: "/images/manage/lead-kofi.png", subject: "4-bed house · East Legon", note: "“Can you do drawings and permit?”" },
  { id: "yaw", stage: "new" as ProfessionalLeadStage, name: "Yaw Osei", avatar: "/images/manage/lead-ama.png", subject: "Shop front · Osu", note: "“Need a quick concept”" },
  { id: "kwesi", stage: "booked" as ProfessionalLeadStage, name: "Kwesi Appiah", avatar: "/images/manage/lead-kwame.png", subject: "Extension · Adenta", note: "Wed 10:00 · site visit" },
  { id: "daniel", stage: "quoted" as ProfessionalLeadStage, name: "Daniel Kumi", avatar: "/images/manage/lead-joseph.png", subject: "Duplex · Tema", note: "GHS 4,200 · sent 18 Oct" },
  { id: "nana", stage: "quoted" as ProfessionalLeadStage, name: "Nana Ama", avatar: "/images/manage/lead-esi.png", subject: "Interior · Cantonments", note: "GHS 1,500 · viewed" },
  { id: "esi", stage: "won" as ProfessionalLeadStage, name: "Esi Owusu", avatar: "/images/manage/lead-esi.png", subject: "Oyarifa 3-bed", note: "Accepted · GHS 1,545" },
];

// Professional quotes (Figma node 1083:34576)

export const PROFESSIONAL_QUOTE_KPIS = [
  { id: "sent", label: "Sent this month", icon: "/icons/tag-01.svg", value: "9" },
  { id: "win", label: "Win rate", icon: "/icons/checkmark-badge-01.svg", value: "38%" },
  { id: "waiting", label: "Waiting on client", icon: "/icons/clock-01.svg", value: "2", note: "GHS 5,700", tone: "text-gray-500" },
  { id: "expiring", label: "Expiring soon", icon: "/icons/notification-03.svg", value: "0" },
];

export interface ProfessionalQuote {
  id: string;
  title: string;
  detail: string;
  client: { name: string; avatar: string };
  fee: number;
  sent: string;
  status: { kind: Exclude<QuoteKind, "expiring">; label: string };
  action: "Follow up" | "Edit" | "Open client" | "View";
}

export const PROFESSIONAL_QUOTES: ProfessionalQuote[] = [
  { id: "FP-0331", title: "Duplex drawings & permit", detail: "FP-0331 · 3 milestones", client: { name: "Daniel Kumi", avatar: "/images/manage/quote-kofi.png" }, fee: 4200, sent: "18 Oct", status: { kind: "viewed", label: "Viewed · waiting" }, action: "Follow up" },
  { id: "FP-0330", title: "Interior concept", detail: "FP-0330", client: { name: "Nana Ama", avatar: "/images/manage/client-prime.png" }, fee: 1500, sent: "17 Oct", status: { kind: "waiting", label: "Waiting" }, action: "Edit" },
  { id: "FP-0329", title: "Drawings & permit pack", detail: "FP-0329", client: { name: "Esi Owusu", avatar: "/images/manage/client-prime.png" }, fee: 1545, sent: "15 Oct", status: { kind: "accepted", label: "Accepted → client" }, action: "Open client" },
  { id: "FP-0325", title: "Commercial fit-out", detail: "FP-0325", client: { name: "Prime Homes GH", avatar: "/images/manage/quote-yaw.png" }, fee: 9800, sent: "02 Oct", status: { kind: "declined", label: "Declined · timing" }, action: "View" },
];

// Professional appointments (Figma node 1083:34861)

export type AppointmentTone = "video" | "person" | "paid" | "office";

export interface ProfessionalAppointment {
  id: string;
  time: string;
  title: string;
  who: string;
  tag: { tone: AppointmentTone; label: string };
  action: "Join" | "Directions" | "Details";
}

export const PROFESSIONAL_APPOINTMENT_DAYS: { label: string; appointments: ProfessionalAppointment[] }[] = [
  {
    label: "Today · Tue 21 Oct",
    appointments: [
      { id: "p1", time: "11:00 – 11:30", title: "Design review", who: "Andy Ansong · Legon Courtyard House", tag: { tone: "video", label: "Video call" }, action: "Join" },
      { id: "p2", time: "15:00 – 16:00", title: "Site visit", who: "Abena Owusu · Adenta", tag: { tone: "person", label: "In person · Adenta" }, action: "Directions" },
    ],
  },
  {
    label: "Wed 22 Oct",
    appointments: [{ id: "p3", time: "10:00 – 11:00", title: "First consultation", who: "Kofi Mensah · 4-bed East Legon", tag: { tone: "paid", label: "Site visit · paid GHS 450" }, action: "Details" }],
  },
  {
    label: "Fri 24 Oct",
    appointments: [{ id: "p4", time: "14:00 – 14:30", title: "Permit follow-up", who: "Ga East Assembly", tag: { tone: "office", label: "Office" }, action: "Details" }],
  },
];

export const BOOKABLE_SERVICES = [
  { id: "b1", title: "Video call · 30 min", price: "GHS 250", on: true },
  { id: "b2", title: "Site visit · 1 hr", price: "GHS 450", on: true },
  { id: "b3", title: "Office visit · 1 hr", price: "GHS 350", on: true },
  { id: "b4", title: "Free intro call · 15 min", price: "Free", on: false },
];

export const BOOKING_RULES = [
  { label: "Booking window", value: "Up to 4 weeks ahead" },
  { label: "Cancellation", value: "Free up to 24 hrs before" },
];

// Professional payments (Figma node 1083:35099)

export const PROFESSIONAL_AVAILABLE_PAYOUT = 2340;

export const PROFESSIONAL_PAYMENT_KPIS = [
  { id: "held", label: "Held for milestones in progress", icon: "/icons/message-lock-02.svg", value: "GHS 1,100", note: "Released on sign-off", tone: "text-gray-500" },
  { id: "unpaid", label: "Unpaid invoices", icon: "/icons/notification-03.svg", value: "GHS 1,200", note: "1 overdue", tone: "text-[#dc2626]" },
  { id: "year", label: "Earned this year", icon: "/icons/analytics-01.svg", value: "GHS 64,200" },
];

export const PROFESSIONAL_PAYOUT_PLAN = { next: "Fri 24 Oct", account: "GCB Bank ··· 2210", schedule: "payouts every Friday" };

export const PROFESSIONAL_INVOICES: ArtisanInvoice[] = [
  { id: "INV-0412", client: { name: "Abena Owusu", avatar: "/images/manage/quote-efua.png" }, job: "Permit approval milestone", amount: 1200, due: "18 Oct", status: { kind: "overdue", label: "Overdue 3 days" } },
  { id: "INV-0411", client: { name: "Kwame Asare", avatar: "/images/manage/quote-kofi.png" }, job: "Concept design · deposit", amount: 1800, due: "Paid", status: { kind: "held", label: "Held" } },
  { id: "PAYOUT", client: { name: "Payout to MTN MoMo" }, job: "5 milestones", amount: 2780, due: "17 Oct", status: { kind: "payout", label: "Paid out" } },
  { id: "INV-0409", client: { name: "Horizon Developments", avatar: "/images/manage/quote-kwame.png" }, job: "Construction drawings", amount: 3000, due: "15 Oct", status: { kind: "paid", label: "Paid" } },
];

// Professional services & portfolio (Figma node 1083:35425)

export const PROFESSIONAL_SERVICES: ArtisanService[] = [
  { id: "ps1", title: "Architectural drawings & permit pack", detail: "per drawing set · 3 weeks · 1,204 views", price: "From GHS 1,500", active: true },
  { id: "ps2", title: "Site visit & design consultation", detail: "per 1-hour visit · 2,980 views", price: "GHS 450", active: true },
  { id: "ps3", title: "Renovation design", detail: "per room · 640 views", price: "GHS 450", active: true },
  { id: "ps4", title: "Interior concept", detail: "per space · 410 views", price: "From GHS 1,500", active: true },
  { id: "ps5", title: "Construction supervision", detail: "paid monthly · 322 views", price: "5% of build cost", active: true },
  { id: "ps6", title: "3D visualisation only", detail: "images only", price: "GHS 600", active: false },
];

export const PROFESSIONAL_PORTFOLIO = {
  total: 18,
  projects: [
    { id: "pp1", title: "Legon Courtyard House", detail: "4-bed · Aug 2026", image: "/images/manage/wo-photo-1.png" },
    { id: "pp2", title: "Oyarifa 3-bed", detail: "3-bed · Jun 2026", image: "/images/manage/listing-house.png" },
    { id: "pp3", title: "Adenta Heights units", detail: "5 kVA · May 2026", image: "/images/manage/listing-adenta.png" },
    { id: "pp4", title: "Trasacco villa", detail: "3 units · Mar 2026", image: "/images/manage/wo-photo-2.png" },
  ],
};

export const PROFESSIONAL_CREDENTIALS = [
  { id: "pc1", label: "ID verified ✓", verified: true },
  { id: "pc2", label: "Energy Commission licence · Class 2 ✓", verified: true },
  { id: "pc3", label: "ARC licence · pending check", verified: false },
];

/** Where every "set up an organisation" button goes. */
export const CREATE_ORGANISATION_HREF = "/manage/organisation/new";

export const CREATE_ORGANISATION_STEPS = [
  { title: "Organisation details", note: "Name, type and contact" },
  { title: "Verification", note: "Prove the business is real" },
  { title: "Structure", note: "Branches and locations (optional)" },
  { title: "Plan & confirm", note: "Business plan, review and create" },
];

export const ORGANISATION_KINDS = ["Real estate agency", "Property manager", "Developer", "Contractor", "Professional firm", "Supplier", "Hotel / Stay"];

export const ORGANISATION_PLAN = {
  name: "Biltlinx Business",
  badge: "Required for organisations",
  features: "Operate & Scale · 5 team seats included · roles & permissions · branches · shared pipeline · audit logs",
  monthly: "GHS 599",
  annual: "GHS 5,990",
  trialDays: 14,
};

export const ORGANISATION_PAY_METHODS = ["Mobile Money", "Card", "Bank transfer"];
