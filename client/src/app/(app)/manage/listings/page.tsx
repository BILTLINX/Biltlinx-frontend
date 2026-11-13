"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AnchoredPanel } from "@/components/shared/AnchoredPanel";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { CreateListingModal, type ListingTarget } from "@/components/shared/CreateListingModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListingActionDialog } from "@/components/shared/ListingActionDialog";
import { ListingDocumentsDialog } from "@/components/shared/ListingDocumentsDialog";
import { ManageTabs } from "@/components/shared/ManageTabs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PostPropertyModal } from "@/components/shared/PostPropertyModal";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMyProperties } from "@/hooks/useProperties";
import { SERVICES_KEY, useMyOfferings } from "@/hooks/useServices";
import { STAY_KEY } from "@/hooks/useStay";
import { errorMessage, notifyError } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { propertyRow, serviceRow, stayRow, type ListingRow } from "@/lib/listing-rows";
import { ASSUME_APPROVED, LISTING_KIND_LABEL, LISTING_STATUS_LABEL, LISTING_STATUS_TONE, propertyListingStatus, type ListingKind, type ListingStatus } from "@/lib/listing-status";
import { confirmAvailability, deleteDraft, getPortfolioSummary, listDrafts, type ListingAction } from "@/lib/properties-api";
import { offeringAction } from "@/lib/services-api";
import { listOperatorProperties, pauseOperatorProperty, publishOperatorProperty } from "@/lib/stay-api";
import type { PropertyDto } from "@/types/api/schema";
import { cn } from "@/lib/utils";
import { useDebouncedSearch } from "@/context/SearchContext";

type Filter = Exclude<ListingStatus, "Draft"> | "all" | "drafts";
type KindFilter = ListingKind | "all";

const ALL_FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Approved", label: LISTING_STATUS_LABEL.Approved },
  { key: "Rejected", label: LISTING_STATUS_LABEL.Rejected },
  { key: "Paused", label: LISTING_STATUS_LABEL.Paused },
  { key: "drafts", label: "Drafts" },
];

const FILTERS = ALL_FILTERS.filter((item) => !(ASSUME_APPROVED && item.key === "Pending"));

const KIND_FILTERS: { key: KindFilter; label: string }[] = [
  { key: "all", label: "All types" },
  { key: "property", label: "Properties" },
  { key: "stay", label: "Stays" },
  { key: "service", label: "Services" },
];

/** The API's name for each status chip, for the property query. */
const PROPERTY_STATUS: Partial<Record<Filter, string>> = { Approved: "Approved", Pending: "PendingReview", Rejected: "Rejected", Paused: "Paused" };

const matchesStatus = (row: ListingRow, filter: Filter) => filter === "all" || row.status === (filter === "drafts" ? "Draft" : filter);

type RowAction = Exclude<ListingAction, "delete">;

function rowActions(property: PropertyDto): { label: string; action: RowAction }[] {
  const actions: { label: string; action: RowAction }[] = [];
  if (property.status === "Paused") actions.push({ label: "Resume", action: "resume" });
  else if (propertyListingStatus(property.status) === "Approved") actions.push({ label: "Pause", action: "pause" });
  if (property.availability === "Available") actions.push({ label: property.listingType === "Rent" ? "Mark as rented" : "Mark as sold", action: "close" });
  actions.push({ label: "Archive", action: "archive" });
  return actions;
}

function RowMenu({ open, onToggle, onClose, items }: { open: boolean; onToggle: () => void; onClose: () => void; items: { label: string; run: () => void }[] }) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  return (
    <>
      <button ref={triggerRef} type="button" aria-label="More actions" aria-expanded={open} onClick={onToggle} className="flex size-8 items-center justify-center rounded-lg text-lg leading-none text-gray-500 hover:bg-gray-100">
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

/** The dialog a `?create=` link opens on, so links from elsewhere in the app can start a listing: `property`, `stay`, `service`, or anything else for the choice. */
function targetFromParams(params: URLSearchParams): ListingTarget | null | undefined {
  const create = params.get("create");
  if (!create) return undefined;
  if (create === "property") return { kind: "property", draftId: params.get("draft") ?? undefined, editId: params.get("edit") ?? undefined };
  if (create === "stay") return { kind: "stay", stayId: params.get("edit") ?? undefined };
  if (create === "service") return { kind: "service" };
  return null;
}

/** Manage · Listings (Figma node 1059:29461): everything the lister has listed, as properties, stays and services, with its approval status and how fresh it is. */
function ManageListings() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const search = useDebouncedSearch();
  const [filter, setFilter] = useState<Filter>("all");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [dialog, setDialog] = useState<{ initial: ListingTarget | null } | null>(null);
  const [action, setAction] = useState<{ property: PropertyDto; action: RowAction } | null>(null);
  const [documentsFor, setDocumentsFor] = useState<PropertyDto | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [postFor, setPostFor] = useState<PropertyDto | null>(null);

  // A link such as /manage/listings?create=stay opens the dialog once, then drops the parameters so a reload does not reopen it.
  useEffect(() => {
    const initial = targetFromParams(params);
    if (initial === undefined) return;
    setDialog({ initial });
    router.replace("/manage/listings");
  }, [params, router]);

  const showProperties = kindFilter === "all" || kindFilter === "property";
  const showStays = kindFilter === "all" || kindFilter === "stay";
  const showServices = kindFilter === "all" || kindFilter === "service";

  const summary = useQuery({ queryKey: ["properties", "summary"], queryFn: getPortfolioSummary });
  const properties = useMyProperties({ q: search || undefined, status: ASSUME_APPROVED && (filter === "Approved" || filter === "Pending") ? undefined : PROPERTY_STATUS[filter] }, showProperties && filter !== "drafts");
  const stays = useQuery({ queryKey: [...STAY_KEY, "operator"], queryFn: listOperatorProperties });
  const offerings = useMyOfferings();
  const drafts = useQuery({ queryKey: ["drafts"], queryFn: listDrafts, enabled: showProperties && (filter === "drafts" || filter === "all") });

  const refreshAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["properties"] });
    void queryClient.invalidateQueries({ queryKey: STAY_KEY });
    void queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
  };

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

  const toggleStay = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) => (publish ? publishOperatorProperty(id) : pauseOperatorProperty(id)),
    onSuccess: (_result, variables) => {
      refreshAll();
      showSuccessToast(variables.publish ? "Your stay is live" : "Your stay is paused. Existing bookings stay valid.");
    },
    onError: (error) => notifyError(error, "That could not be done."),
  });

  const serviceAction = useMutation({
    mutationFn: ({ id, action: next }: { id: string; action: "publish" | "pause" | "archive" }) => offeringAction(id, next),
    onSuccess: refreshAll,
    onError: (error) => notifyError(error, "That could not be done."),
  });

  const byStatus = summary.data?.byStatus ?? {};
  const kpis = [
    { id: "total", label: "Listings", value: (summary.data?.total ?? 0) + (stays.data?.length ?? 0) + (offerings.data?.length ?? 0), pending: summary.isPending, icon: "/icons/house-03.svg", flip: true },
    { id: "review", label: "Pending approval", value: ASSUME_APPROVED ? 0 : byStatus.PendingReview ?? 0, pending: summary.isPending, icon: "/icons/timer-01.svg" },
    { id: "viewings", label: "Viewing requests waiting", value: summary.data?.viewingRequestsWaiting ?? 0, pending: summary.isPending, icon: "/icons/calendar-03.svg" },
    { id: "stale", label: "Need confirming", value: (summary.data?.stale ?? 0) + (summary.data?.hiddenByReports ?? 0), pending: summary.isPending, icon: "/icons/message-01.svg" },
  ];

  const needle = search.trim().toLowerCase();
  const matchesSearch = (row: ListingRow) => !needle || `${row.title} ${row.meta}`.toLowerCase().includes(needle);
  const propertyById = new Map(properties.items.map((property) => [property.id, property]));
  const rows: ListingRow[] = [
    ...(showProperties && filter !== "drafts" ? properties.items.map(propertyRow).filter((row) => matchesStatus(row, filter)) : []),
    ...(showStays ? (stays.data ?? []).map(stayRow).filter((row) => matchesStatus(row, filter) && matchesSearch(row)) : []),
    ...(showServices ? (offerings.data ?? []).filter((offering) => offering.status !== "Archived").map(serviceRow).filter((row) => matchesStatus(row, filter) && matchesSearch(row)) : []),
  ];
  const pending = (showProperties && filter !== "drafts" && properties.isPending) || (showStays && stays.isPending) || (showServices && offerings.isPending);
  const failure = (showProperties && properties.isError && properties.error) || (showStays && stays.isError && stays.error) || (showServices && offerings.isError && offerings.error) || null;
  const showDrafts = showProperties && (filter === "drafts" || filter === "all");

  function menuItems(row: ListingRow) {
    if (row.kind === "property") {
      const property = propertyById.get(row.id);
      if (!property) return [];
      return [
        ...(propertyListingStatus(property.status) === "Approved" ? [{ label: "Post to feed", run: () => setPostFor(property) }] : []),
        { label: "Still available", run: () => confirm.mutate(property.id) },
        { label: "Documents", run: () => setDocumentsFor(property) },
        ...rowActions(property).map((item) => ({ label: item.label, run: () => setAction({ property, action: item.action }) })),
      ];
    }
    if (row.kind === "stay") {
      return [row.status === "Approved" ? { label: "Pause", run: () => toggleStay.mutate({ id: row.id, publish: false }) } : { label: "Publish", run: () => toggleStay.mutate({ id: row.id, publish: true }) }];
    }
    return [
      row.status === "Approved" ? { label: "Pause", run: () => serviceAction.mutate({ id: row.id, action: "pause" }) } : { label: "Publish", run: () => serviceAction.mutate({ id: row.id, action: "publish" }) },
      { label: "Archive", run: () => serviceAction.mutate({ id: row.id, action: "archive" }) },
    ];
  }

  function editRow(row: ListingRow) {
    if (row.kind === "property") setDialog({ initial: { kind: "property", editId: row.id } });
    else if (row.kind === "stay") setDialog({ initial: { kind: "stay", stayId: row.id } });
    else setDialog({ initial: { kind: "service", offering: (offerings.data ?? []).find((offering) => offering.id === row.id) } });
  }

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Listings" }]} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Listings</h1>
            <p className="text-sm leading-5 text-gray-500">Your properties, stays and services, with their approval status and how fresh they are.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="primary" onClick={() => setDialog({ initial: null })} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + Create listing
            </Button>
          </div>
        </div>

        <ManageTabs active="listings" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.id} className="flex min-w-0 flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-4">
              <p className="flex items-center gap-2 text-[13px] font-medium leading-[19px] text-gray-500">
                <NavIcon icon={kpi.icon} size={16} className={cn("shrink-0 bg-gray-500", kpi.flip && "-scale-y-100")} />
                {kpi.label}
              </p>
              {kpi.pending ? <Skeleton className="h-7 w-12" /> : <p className="text-[22px] font-bold leading-[30px] text-[#0f172a]">{kpi.value}</p>}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label="Status" className="no-scrollbar flex gap-2 overflow-x-auto">
            {FILTERS.map((option) => (
              <button
                key={option.key}
                type="button"
                role="tab"
                aria-selected={option.key === filter}
                onClick={() => setFilter(option.key)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium leading-[19px]",
                  option.key === filter ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div role="tablist" aria-label="Type" className="flex shrink-0 self-start rounded-[10px] border border-gray-200 bg-white p-1 lg:self-auto">
            {KIND_FILTERS.map((option) => (
              <button
                key={option.key}
                type="button"
                role="tab"
                aria-selected={option.key === kindFilter}
                onClick={() => setKindFilter(option.key)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[13px] font-medium leading-[19px]",
                  option.key === kindFilter ? "bg-brand-900 text-white" : "text-[#334155] hover:bg-gray-50",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {showDrafts && (drafts.data?.length ?? 0) > 0 && (
          <div className="flex flex-col rounded-2xl border border-gray-200 bg-white">
            <p className="border-b border-gray-200 px-4 py-3 text-sm font-bold text-[#0f172a]">Unfinished property drafts</p>
            {drafts.data?.map((draft) => (
              <div key={draft.id} className="flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 text-[13px] text-[#334155] last:border-b-0">
                <span className="min-w-0 flex-1 truncate font-medium text-[#0f172a]">{draft.name || "Untitled draft"}</span>
                <span className="hidden shrink-0 text-xs text-gray-500 sm:inline">Saved {formatDate(draft.updatedAt)}</span>
                <button type="button" onClick={() => setDialog({ initial: { kind: "property", draftId: draft.id } })} className="shrink-0 font-medium text-brand-900">
                  Continue
                </button>
                <button type="button" onClick={() => discard.mutate(draft.id)} className="shrink-0 font-medium text-[#dc2626]">
                  Discard
                </button>
              </div>
            ))}
          </div>
        )}

        {!pending && rows.length === 0 && !failure && filter === "all" && kindFilter === "all" && !needle ? (
          <EmptyState
            mood="sad"
            icon="home-sad"
            title="You have not listed anything yet"
            body="List a property, a stay or a service to start getting enquiries and bookings."
            primary={{ label: "Create listing", onClick: () => setDialog({ initial: null }) }}
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-[#f8fafc]">
                <tr className="text-[11px] font-bold uppercase leading-4 tracking-wide text-gray-500">
                  {["Listing", "Price", "Status", "Availability"].map((heading) => (
                    <th key={heading} scope="col" className="px-4 py-3 font-bold">
                      {heading}
                    </th>
                  ))}
                  <th scope="col" aria-label="Actions" className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {pending &&
                  [0, 1, 2].map((n) => (
                    <tr key={n} className="border-t border-gray-200">
                      <td colSpan={5} className="p-4">
                        <Skeleton className="h-12 w-full" />
                      </td>
                    </tr>
                  ))}
                {rows.map((row) => {
                  const property = row.kind === "property" ? propertyById.get(row.id) : undefined;
                  return (
                    <tr key={row.key} className="border-t border-gray-200 text-[13px] leading-[19px] text-[#334155] hover:bg-[#f8fafc]">
                      <td className="max-w-[360px] px-4 py-3">
                        <Link href={row.href} className="flex items-center gap-3">
                          <span className="relative block h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[#eef2ff]">
                            <Image src={row.image} alt="" fill className="object-cover" sizes="64px" />
                          </span>
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate font-semibold text-[#0f172a]">{row.title}</span>
                            <span className="truncate text-xs leading-[17px] text-gray-500">{row.meta}</span>
                            {row.details.length > 0 && <span className="truncate text-xs leading-[17px] text-gray-400">{row.details.join(" · ")}</span>}
                          </span>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#0f172a]">{row.price}</td>
                      <td className="px-4 py-3">
                        <span className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", LISTING_STATUS_TONE[row.status])}>{LISTING_STATUS_LABEL[row.status]}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {property ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="flex items-center gap-2">
                              <span className={cn("rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", property.availability === "Available" ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#f1f5f9] text-[#334155]")}>{property.availability}</span>
                              {property.isStale && <span className="rounded-full bg-[#fef3c7] px-2 py-[2px] text-[10px] font-medium text-[#b45309]">Confirm</span>}
                            </span>
                            <span className="text-xs leading-[17px] text-gray-500">Confirmed {formatDate(property.lastConfirmedAt)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="relative px-4 py-3">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <button type="button" onClick={() => editRow(row)} className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-[#0f172a] hover:bg-gray-50">
                            Edit
                          </button>
                          <RowMenu open={menuFor === row.key} onToggle={() => setMenuFor(menuFor === row.key ? null : row.key)} onClose={() => setMenuFor(null)} items={menuItems(row)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!pending && rows.length === 0 && (
                  <tr className="border-t border-gray-200">
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                      {failure ? errorMessage(failure) : "No listings match."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {showProperties && filter !== "drafts" && properties.hasNextPage && (
          <button type="button" disabled={properties.isFetchingNextPage} onClick={() => void properties.fetchNextPage()} className="self-center text-[13px] font-medium text-brand-900">
            {properties.isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        )}
      </PageContainer>

      {dialog && <CreateListingModal initial={dialog.initial} onClose={() => setDialog(null)} />}
      {postFor && <PostPropertyModal open onClose={() => setPostFor(null)} initialId={postFor.id} />}
      <ListingActionDialog property={action?.property ?? null} action={action?.action ?? null} onClose={() => setAction(null)} />
      <ListingDocumentsDialog propertyId={documentsFor?.id ?? null} title={documentsFor?.name ?? ""} onClose={() => setDocumentsFor(null)} />
    </AppShell>
  );
}

export default function ManageListingsPage() {
  return (
    <Suspense fallback={null}>
      <ManageListings />
    </Suspense>
  );
}
