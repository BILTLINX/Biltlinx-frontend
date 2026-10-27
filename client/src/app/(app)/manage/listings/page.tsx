"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AnchoredPanel } from "@/components/shared/AnchoredPanel";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ListingActionDialog } from "@/components/shared/ListingActionDialog";
import { ListingDocumentsDialog } from "@/components/shared/ListingDocumentsDialog";
import { ManageTabs } from "@/components/shared/ManageTabs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMyProperties } from "@/hooks/useProperties";
import { errorMessage, notifyError } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { confirmAvailability, deleteDraft, getPortfolioSummary, listDrafts, type ListingAction } from "@/lib/properties-api";
import { FALLBACK_PROPERTY_IMAGE, propertyKind, propertyPrice, propertyPriceUnit } from "@/lib/property-mapper";
import type { PropertyDto } from "@/types/api/schema";
import { cn } from "@/lib/utils";
import { useDebouncedSearch } from "@/context/SearchContext";

type Filter = "all" | "Approved" | "PendingReview" | "Paused" | "Rejected" | "drafts";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Approved", label: "Live" },
  { key: "PendingReview", label: "In review" },
  { key: "Paused", label: "Paused" },
  { key: "Rejected", label: "Rejected" },
  { key: "drafts", label: "Drafts" },
];

const STATUS_TONE: Record<string, string> = {
  Approved: "bg-[#dcfce7] text-[#16a34a]",
  PendingReview: "bg-[#fef3c7] text-[#b45309]",
  Paused: "bg-[#f1f5f9] text-[#334155]",
  Rejected: "bg-[#fee2e2] text-[#dc2626]",
};

const STATUS_LABEL: Record<string, string> = { Approved: "Live", PendingReview: "In review", Paused: "Paused", Rejected: "Rejected" };

type RowAction = Exclude<ListingAction, "delete">;

function rowActions(property: PropertyDto): { label: string; action: RowAction }[] {
  const actions: { label: string; action: RowAction }[] = [];
  if (property.status === "Paused") actions.push({ label: "Resume", action: "resume" });
  else if (property.status === "Approved") actions.push({ label: "Pause", action: "pause" });
  if (property.availability === "Available") actions.push({ label: property.listingType === "Rent" ? "Mark as rented" : "Mark as sold", action: "close" });
  actions.push({ label: "Archive", action: "archive" });
  return actions;
}

function RowMenu({ open, onToggle, onClose, items }: { open: boolean; onToggle: () => void; onClose: () => void; items: { label: string; run: () => void }[] }) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  return (
    <>
      <button ref={triggerRef} type="button" aria-label="More actions" aria-expanded={open} onClick={onToggle} className="px-1 text-lg leading-none text-gray-500">
        ⋯
      </button>
      <AnchoredPanel open={open} onClose={onClose} triggerRef={triggerRef} estimatedHeight={items.length * 36 + 40} minWidth={176}>
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              item.run();
              onClose();
            }}
            className="h-9 rounded-lg px-3 text-left text-[13px] text-[#334155] hover:bg-gray-50"
          >
            {item.label}
          </button>
        ))}
      </AnchoredPanel>
    </>
  );
}

/** Manage · Listings (Figma node 1059:29461): the lister's portfolio with status, freshness and impact-checked actions. */
export default function ManageListingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const search = useDebouncedSearch();
  const [filter, setFilter] = useState<Filter>("all");
  const [action, setAction] = useState<{ property: PropertyDto; action: RowAction } | null>(null);
  const [documentsFor, setDocumentsFor] = useState<PropertyDto | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const summary = useQuery({ queryKey: ["properties", "summary"], queryFn: getPortfolioSummary });
  const listings = useMyProperties({ q: search || undefined, status: filter === "all" || filter === "drafts" ? undefined : filter }, filter !== "drafts");
  const drafts = useQuery({ queryKey: ["drafts"], queryFn: listDrafts, enabled: filter === "drafts" || filter === "all" });

  const confirm = useMutation({
    mutationFn: (id: string) => confirmAvailability(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["properties"] });
      void queryClient.invalidateQueries({ queryKey: ["action-needed"] });
      showSuccessToast("Marked as still available");
    },
    onError: (error) => notifyError(error),
  });

  const discard = useMutation({
    mutationFn: (id: string) => deleteDraft(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["drafts"] }),
    onError: (error) => notifyError(error),
  });

  const byStatus = summary.data?.byStatus ?? {};
  const kpis = [
    { id: "total", label: "Listings", value: summary.data?.total, icon: "/icons/house-03.svg" },
    { id: "review", label: "In review", value: byStatus.PendingReview ?? 0, icon: "/icons/timer-01.svg" },
    { id: "viewings", label: "Viewing requests waiting", value: summary.data?.viewingRequestsWaiting, icon: "/icons/calendar-03.svg" },
    { id: "stale", label: "Need confirming", value: (summary.data?.stale ?? 0) + (summary.data?.hiddenByReports ?? 0), icon: "/icons/message-01.svg" },
  ];

  const showDrafts = filter === "drafts" || filter === "all";

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Listings" }]} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Listings</h1>
            <p className="text-sm leading-5 text-gray-500">Everything you have listed, with its review status and how fresh it is.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="primary" onClick={() => router.push("/manage/listings/new")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + Create listing
            </Button>
          </div>
        </div>

        <ManageTabs active="listings" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.id} className="flex min-w-0 flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-4">
              <p className="flex items-center gap-2 text-[13px] font-medium leading-[19px] text-gray-500">
                <NavIcon icon={kpi.icon} size={16} className="shrink-0 bg-gray-500" />
                {kpi.label}
              </p>
              {summary.isPending ? <Skeleton className="h-7 w-12" /> : <p className="text-[22px] font-bold leading-[30px] text-[#0f172a]">{kpi.value ?? 0}</p>}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div role="tablist" aria-label="Show" className="flex flex-wrap gap-2.5">
            {FILTERS.map((option) => (
              <button
                key={option.key}
                type="button"
                role="tab"
                aria-selected={option.key === filter}
                onClick={() => setFilter(option.key)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-[13px] font-medium leading-[19px]",
                  option.key === filter ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {showDrafts && (drafts.data?.length ?? 0) > 0 && (
          <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-gray-300 bg-white p-4">
            <p className="text-sm font-bold text-[#0f172a]">Unfinished drafts</p>
            {drafts.data?.map((draft) => (
              <div key={draft.id} className="flex items-center gap-3 text-[13px] text-[#334155]">
                <span className="min-w-0 flex-1 truncate font-medium">{draft.name || "Untitled draft"}</span>
                <span className="shrink-0 text-xs text-gray-500">Saved {formatDate(draft.updatedAt)}</span>
                <Link href={`/manage/listings/new?draft=${draft.id}`} className="shrink-0 font-medium text-brand-900">
                  Continue
                </Link>
                <button type="button" onClick={() => discard.mutate(draft.id)} className="shrink-0 font-medium text-[#dc2626]">
                  Discard
                </button>
              </div>
            ))}
          </div>
        )}

        {filter !== "drafts" && (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-[#f8fafc]">
                <tr className="text-[11px] font-bold leading-4 text-gray-500">
                  {["LISTING", "PRICE", "STATUS", "AVAILABILITY", "LAST CONFIRMED"].map((heading) => (
                    <th key={heading} scope="col" className="px-4 py-2.5 font-bold">
                      {heading}
                    </th>
                  ))}
                  <th scope="col" aria-label="Actions" className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {listings.isPending && (
                  <tr>
                    <td colSpan={6} className="p-4">
                      <Skeleton className="h-12 w-full" />
                    </td>
                  </tr>
                )}
                {listings.items.map((property) => (
                  <tr key={property.id} className="border-t border-gray-200 text-[13px] leading-[19px] text-[#334155]">
                    <td className="px-4 py-3">
                      <Link href={`/properties/${property.id}`} className="flex items-center gap-2.5">
                        <span className="relative block h-[38px] w-12 shrink-0 overflow-hidden rounded-lg bg-[#eef2ff]">
                          <Image src={property.media?.[0]?.url ?? FALLBACK_PROPERTY_IMAGE} alt="" fill className="object-cover" sizes="48px" />
                        </span>
                        <span className="flex flex-col whitespace-nowrap">
                          <span className="font-semibold text-[#0f172a]">{property.name}</span>
                          <span className="text-xs leading-[17px] text-gray-500">
                            {propertyKind(property)} · {property.city}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {propertyPrice(property)}
                      {propertyPriceUnit(property) ? ` / ${propertyPriceUnit(property)}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", STATUS_TONE[property.status ?? ""] ?? STATUS_TONE.Paused)}>
                        {STATUS_LABEL[property.status ?? ""] ?? property.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {property.availability}
                      {property.isStale && <span className="ml-2 rounded-full bg-[#fef3c7] px-2 py-[2px] text-[10px] font-medium text-[#b45309]">Confirm</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(property.lastConfirmedAt)}</td>
                    <td className="relative px-4 py-3">
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        <Link href={`/manage/listings/new?edit=${property.id}`} className="text-[13px] font-medium text-brand-900">
                          Edit
                        </Link>
                        <button type="button" onClick={() => confirm.mutate(property.id)} className="text-[13px] font-medium text-brand-900">
                          Still available
                        </button>
                        <RowMenu
                          open={menuFor === property.id}
                          onToggle={() => setMenuFor(menuFor === property.id ? null : property.id)}
                          onClose={() => setMenuFor(null)}
                          items={[{ label: "Documents", run: () => setDocumentsFor(property) }, ...rowActions(property).map((item) => ({ label: item.label, run: () => setAction({ property, action: item.action }) }))]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {!listings.isPending && listings.items.length === 0 && (
                  <tr className="border-t border-gray-200">
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      {listings.isError ? errorMessage(listings.error) : "No listings match."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {filter !== "drafts" && listings.hasNextPage && (
          <button type="button" disabled={listings.isFetchingNextPage} onClick={() => void listings.fetchNextPage()} className="self-center text-[13px] font-medium text-brand-900">
            {listings.isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        )}
      </PageContainer>

      <ListingActionDialog property={action?.property ?? null} action={action?.action ?? null} onClose={() => setAction(null)} />
      <ListingDocumentsDialog propertyId={documentsFor?.id ?? null} title={documentsFor?.name ?? ""} onClose={() => setDocumentsFor(null)} />
    </AppShell>
  );
}
