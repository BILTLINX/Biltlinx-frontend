import Link from "next/link";
import { ARTISAN_TABS, PROFESSIONAL_TABS } from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

/** Property, tenancy, rent and the other mock workspaces sit beside the live Listings, Enquiries, Stay and Services. */
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
  { key: "stay", label: "Stay", href: "/manage/stay" },
  { key: "provider", label: "Services", href: "/manage/provider" },
] as const;

interface Tab {
  key: string;
  label: string;
  href: string;
}

/** A row of module tabs under a Manage page's title. */
function TabRow({ tabs, active }: { tabs: readonly Tab[]; active: string }) {
  return (
    <div role="tablist" aria-label="Manage sections" className="no-scrollbar flex overflow-x-auto border-b border-gray-200">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        const className = cn(
          "-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] leading-[19px]",
          isActive ? "border-brand-900 font-semibold text-brand-900" : "border-transparent font-medium text-gray-500 hover:text-[#0f172a]",
        );
        return isActive ? (
          <span key={tab.key} role="tab" aria-selected className={className}>
            {tab.label}
          </span>
        ) : (
          <Link key={tab.key} role="tab" aria-selected={false} href={tab.href} className={className}>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

/** The module tabs of the landlord workspace. */
export function ManageTabs({ active }: { active: (typeof MANAGE_TABS)[number]["key"] }) {
  return <TabRow tabs={MANAGE_TABS} active={active} />;
}

/** The module tabs of the artisan workspace. */
export function ArtisanTabs({ active }: { active: (typeof ARTISAN_TABS)[number]["key"] }) {
  return <TabRow tabs={ARTISAN_TABS} active={active} />;
}

/** The module tabs of the professional workspace. */
export function ProfessionalTabs({ active }: { active: (typeof PROFESSIONAL_TABS)[number]["key"] }) {
  return <TabRow tabs={PROFESSIONAL_TABS} active={active} />;
}
