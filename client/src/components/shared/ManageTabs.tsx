import Link from "next/link";
import { cn } from "@/lib/utils";

export const MANAGE_TABS = [
  { key: "overview", label: "Overview", href: "/manage" },
  { key: "listings", label: "Listings", href: "/manage/listings" },
  { key: "enquiries", label: "Enquiries & leads", href: "/manage/enquiries" },
  { key: "stay", label: "Stay", href: "/manage/stay" },
  { key: "provider", label: "Services", href: "/manage/provider" },
] as const;

/** A row of module tabs under a Manage page's title. */
export function ManageTabs({ active }: { active: (typeof MANAGE_TABS)[number]["key"] }) {
  return (
    <div role="tablist" aria-label="Manage sections" className="no-scrollbar flex overflow-x-auto border-b border-gray-200">
      {MANAGE_TABS.map((tab) => {
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
