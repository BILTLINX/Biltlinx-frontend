"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AppShell } from "@/components/shared/AppShell";
import { ManageRail } from "@/components/shared/ManageRail";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSession } from "@/context/SessionContext";
import { useLeadBoard } from "@/hooks/useLeads";
import { useIncomingQuoteRequests, useIncomingServiceBookings } from "@/hooks/useServices";
import { getPortfolioSummary } from "@/lib/properties-api";
import { listReservations } from "@/lib/stay-api";

interface Stat {
  id: string;
  label: string;
  value: number | undefined;
  note: string;
  href: string;
}

const MODULES = [
  { id: "listings", title: "Listings", note: "Properties you have listed, their review status and how fresh they are", href: "/manage/listings", icon: "/icons/tag-01.svg", capability: null },
  { id: "enquiries", title: "Enquiries and leads", note: "Your pipeline, viewing requests and follow-ups", href: "/manage/enquiries", icon: "/icons/message-01.svg", capability: null },
  { id: "stay", title: "Stay (host)", note: "Rooms, rates, availability and reservations", href: "/manage/stay", icon: "/icons/guest-house-sm.svg", capability: "StayOperator" },
  { id: "provider", title: "Services", note: "Your provider profile, portfolio, services, bookings and quotes", href: "/manage/provider", icon: "/icons/wrench-01.svg", capability: null },
  { id: "payments", title: "Payments", note: "Invoices and receipts for what you have paid", href: "/payments", icon: "/icons/wallet-01.svg", capability: null },
  { id: "verification", title: "Verification", note: "Identity, business and credential checks", href: "/verification", icon: "/icons/checkmark-badge-01.svg", capability: null },
  { id: "teams", title: "Roles and teams", note: "Ask for a role, create a business account, invite your team", href: "/account-settings?tab=teams", icon: "/icons/user-group.svg", capability: null },
];

/** Manage (Figma node 1044:22523): the private workspace for listers, hosts and providers. */
export default function ManagePage() {
  const { user } = useSession();
  const summary = useQuery({ queryKey: ["properties", "summary"], queryFn: getPortfolioSummary, retry: false });
  const board = useLeadBoard();
  const reservations = useQuery({ queryKey: ["stay", "reservations", "hub"], queryFn: () => listReservations({ results: 1, status: "Confirmed" }), retry: false });
  const quotes = useIncomingQuoteRequests();
  const bookings = useIncomingServiceBookings();

  const stats: Stat[] = [
    { id: "listings", label: "Listings", value: summary.data?.total, note: `${summary.data?.byStatus?.PendingReview ?? 0} in review`, href: "/manage/listings" },
    { id: "viewings", label: "Viewing requests waiting", value: summary.data?.viewingRequestsWaiting, note: "Reply fast to keep them warm", href: "/manage/enquiries" },
    { id: "leads", label: "New enquiries", value: board.data?.counts?.New, note: `${board.data?.followUpsDue ?? 0} follow-ups due`, href: "/manage/enquiries" },
    { id: "reservations", label: "Stay reservations", value: reservations.data?.totalResults, note: "Confirmed", href: "/manage/stay" },
    { id: "quotes", label: "Requests to quote", value: quotes.data?.length, note: "Invited by customers", href: "/request-board" },
    { id: "bookings", label: "Service bookings", value: bookings.data?.length, note: "For your services", href: "/manage/provider" },
  ];
  const loading = summary.isPending && board.isPending;

  return (
    <AppShell activeKey="manage" contentFullWidth rightRail={<ManageRail />}>
      <PageContainer>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Manage</h1>
          <p className="text-sm leading-5 text-gray-500">Your private workspace{user ? `, ${user.username}` : ""}. Only you and people you add can see this.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {stats.map((stat) => (
            <Link key={stat.id} href={stat.href} className="flex min-w-0 flex-col items-start gap-1.5 rounded-2xl border border-gray-200 bg-white p-4 hover:border-brand-900">
              <p className="text-xs font-medium leading-[17px] text-gray-500">{stat.label}</p>
              {loading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold leading-8 text-[#0f172a]">{stat.value ?? "–"}</p>}
              <span className="text-[11px] font-medium leading-4 text-brand-900">{stat.note}</span>
            </Link>
          ))}
        </div>

        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Your modules</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {MODULES.map((module) => (
            <Link key={module.id} href={module.href} className="flex min-w-0 items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left hover:bg-gray-50">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eff5ff]">
                <NavIcon icon={module.icon} size={20} className="bg-brand-900" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold leading-5 text-[#0f172a]">{module.title}</span>
                <span className="text-xs leading-[17px] text-gray-500">{module.note}</span>
              </span>
              <NavIcon icon="/icons/chevron-right-gray.svg" size={18} className="shrink-0 bg-gray-400" />
            </Link>
          ))}
        </div>
      </PageContainer>
    </AppShell>
  );
}
