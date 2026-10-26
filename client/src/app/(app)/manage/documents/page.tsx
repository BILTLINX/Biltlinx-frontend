"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ManageTabs } from "@/components/shared/ManageTabs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import {
  DOCUMENT_FILTERS,
  DOCUMENT_FOLDERS,
  DOCUMENT_KPIS,
  MANAGE_DOCUMENTS,
  matchesDocumentFilter,
  type DocumentFilterKey,
  type DocumentFolderKey,
  type DocumentKind,
} from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<DocumentKind, string> = {
  checked: "bg-[#dcfce7] text-[#16a34a]",
  awaiting: "bg-[#fef3c7] text-[#b45309]",
  draft: "bg-[#f1f5f9] text-[#334155]",
  expiring: "bg-[#fee2e2] text-[#dc2626]",
  sent: "bg-[#eff5ff] text-brand-900",
};

/** Manage · Documents (Figma node 1058:29691): titles, agreements, receipts and permits in one library. */
export default function ManageDocumentsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DocumentFilterKey>("All");
  const [folder, setFolder] = useState<DocumentFolderKey>("all");
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const documents = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return MANAGE_DOCUMENTS.filter(
      (doc) =>
        (folder === "all" || doc.folder === folder) &&
        matchesDocumentFilter(doc, filter) &&
        (!needle || `${doc.name} ${doc.detail} ${doc.property}`.toLowerCase().includes(needle)),
    );
  }, [query, filter, folder]);

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Documents" }]} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Documents</h1>
            <p className="text-sm leading-5 text-gray-500">Titles, tenancy agreements, receipts and permits in one place. Share or send for e-signature.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Request a document")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Request a document
            </Button>
            <Button variant="primary" onClick={comingSoon("Upload document")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Upload
            </Button>
          </div>
        </div>

        <ManageTabs active="documents" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {DOCUMENT_KPIS.map((kpi) => (
            <div key={kpi.id} className="flex min-w-0 flex-col gap-1.5 rounded-2xl border border-gray-200 bg-white p-4">
              <p className="flex items-center gap-2 text-[13px] font-medium leading-[19px] text-gray-500">
                <NavIcon icon={kpi.icon} size={16} className="shrink-0 bg-gray-500" />
                {kpi.label}
              </p>
              <p className="text-[22px] font-bold leading-[30px] text-[#0f172a]">{kpi.value}</p>
              {kpi.note && <p className={cn("text-xs font-medium leading-[17px]", kpi.tone)}>{kpi.note}</p>}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <nav aria-label="Folders" className="no-scrollbar flex shrink-0 gap-1 overflow-x-auto lg:w-[240px] lg:flex-col lg:overflow-visible">
            {DOCUMENT_FOLDERS.map((item) => {
              const active = item.key === folder;
              return (
                <button
                  key={item.key}
                  type="button"
                  aria-current={active ? "true" : undefined}
                  onClick={() => setFolder(item.key)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[10px] px-3 py-[9px] text-left text-[13px] leading-[19px]",
                    active ? "bg-[#eff5ff] font-semibold text-brand-900" : "font-medium text-[#334155] hover:bg-gray-50",
                  )}
                >
                  <span className="min-w-0 flex-1">{item.label}</span>
                  <span className="text-xs font-medium leading-[17px] text-gray-500">{item.count}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="flex h-10 w-full items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-3.5 focus-within:border-brand-900 sm:w-[300px]">
                <NavIcon icon="/icons/search-02.svg" size={16} className="shrink-0 bg-gray-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search documents"
                  aria-label="Search documents"
                  className="min-w-0 flex-1 bg-transparent text-[13px] leading-[19px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
                />
              </label>
              <div role="tablist" aria-label="Show" className="flex flex-wrap gap-2.5">
                {DOCUMENT_FILTERS.map((option) => {
                  const active = option === filter;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setFilter(option)}
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-[13px] font-medium leading-[19px]",
                        active ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={comingSoon("Filters")}
                className="ml-auto flex h-10 items-center gap-1.5 rounded-[10px] border border-gray-200 bg-white px-3.5 text-[13px] font-medium leading-[19px] text-[#334155] hover:bg-gray-50"
              >
                <NavIcon icon="/icons/list-bullet.svg" size={16} className="bg-[#334155]" />
                Filters
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead className="bg-[#f8fafc]">
                  <tr className="text-[11px] font-bold leading-4 text-gray-500">
                    {["NAME", "PROPERTY", "UPDATED", "STATUS"].map((heading) => (
                      <th key={heading} scope="col" className="px-4 py-2.5 font-bold">
                        {heading}
                      </th>
                    ))}
                    <th scope="col" aria-label="Actions" className="w-[60px] px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-t border-gray-200 text-[13px] leading-[19px] text-[#334155]">
                      <td className="px-4 py-3">
                        <button type="button" onClick={comingSoon("Document preview")} className="flex flex-col items-start whitespace-nowrap text-left">
                          <span className="font-semibold text-[#0f172a]">{doc.name}</span>
                          <span className="text-xs leading-[17px] text-gray-500">{doc.detail}</span>
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">{doc.property}</td>
                      <td className="whitespace-nowrap px-4 py-3">{doc.updated}</td>
                      <td className="px-4 py-3">
                        <span className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", STATUS_TONE[doc.status.kind])}>{doc.status.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button type="button" aria-label={`More actions for ${doc.name}`} onClick={comingSoon("Document actions")} className="text-[13px] font-medium text-gray-500 hover:text-[#0f172a]">
                          ···
                        </button>
                      </td>
                    </tr>
                  ))}
                  {documents.length === 0 && (
                    <tr className="border-t border-gray-200">
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                        No documents match.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-[#f8fafc] p-4">
              <NavIcon icon="/icons/message-lock-02.svg" size={18} className="shrink-0 bg-brand-900" />
              <p className="min-w-0 flex-1 text-[13px] font-medium leading-[19px] text-[#334155]">Documents are encrypted. Only people you share with can open them, and every view is logged.</p>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}

