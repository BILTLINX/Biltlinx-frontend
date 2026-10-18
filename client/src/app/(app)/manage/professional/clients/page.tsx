"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { ArtisanRoleBar } from "@/components/shared/ArtisanRoleBar";
import { ProfessionalTabs } from "@/components/shared/ManageTabs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { CLIENT_FILTERS, PROFESSIONAL_CLIENTS, type ClientFilterKey, type ClientStageKind, type MilestoneState } from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

const STAGE_TONE: Record<ClientStageKind, string> = {
  design: "bg-[#eff5ff] text-brand-900",
  permit: "bg-[#fef3c7] text-[#b45309]",
  build: "bg-[#dcfce7] text-[#16a34a]",
  concept: "bg-[#eff5ff] text-brand-900",
  accepted: "bg-[#dcfce7] text-[#16a34a]",
};

const MILESTONE_TONE: Record<MilestoneState, string> = {
  done: "bg-[#dcfce7] text-[#16a34a]",
  waiting: "bg-[#fef3c7] text-[#b45309]",
  todo: "bg-[#f1f5f9] text-[#334155]",
};

const ghs = (amount: number) => `GHS ${amount.toLocaleString("en-US")}`;

/** Manage · Professional · Clients (Figma node 1083:34004): everyone the professional works for, with a project panel for the selected client. */
export default function ProfessionalClientsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ClientFilterKey>("active");
  const [selectedId, setSelectedId] = useState("abena");
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const clients = useMemo(() => {
    if (filter === "past") return [];
    const needle = query.trim().toLowerCase();
    return PROFESSIONAL_CLIENTS.filter((client) => !needle || `${client.name} ${client.project}`.toLowerCase().includes(needle));
  }, [query, filter]);

  const selected = PROFESSIONAL_CLIENTS.find((client) => client.id === selectedId) ?? PROFESSIONAL_CLIENTS[0];
  const panel = selected.panel;

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <ArtisanRoleBar page="Clients" role="Professional" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Clients</h1>
            <p className="text-sm leading-5 text-gray-500">Everyone you work for, with their projects, files, invoices and notes.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Import contacts")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Import contacts
            </Button>
            <Button variant="primary" onClick={comingSoon("Add client")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + Add client
            </Button>
          </div>
        </div>

        <ProfessionalTabs active="clients" />

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="flex h-10 w-full items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-3.5 focus-within:border-brand-900 sm:w-[280px]">
                <NavIcon icon="/icons/search-02.svg" size={16} className="shrink-0 bg-gray-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search clients"
                  aria-label="Search clients"
                  className="min-w-0 flex-1 bg-transparent text-[13px] leading-[19px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
                />
              </label>
              <div role="tablist" aria-label="Show" className="flex flex-wrap gap-2.5">
                {CLIENT_FILTERS.map((option) => {
                  const active = option.key === filter;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setFilter(option.key)}
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-[13px] font-medium leading-[19px]",
                        active ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                      )}
                    >
                      {option.label}
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
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead className="bg-[#f8fafc]">
                  <tr className="text-[11px] font-bold leading-4 text-gray-500">
                    {["CLIENT", "PROJECT", "STAGE", "BALANCE"].map((heading) => (
                      <th key={heading} scope="col" className="px-4 py-2.5 font-bold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} aria-selected={client.id === selectedId} className={cn("border-t border-gray-200 text-[13px] leading-[19px] text-[#334155]", client.id === selectedId && "bg-[#f8fafc]")}>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => setSelectedId(client.id)} className="flex items-center gap-2.5 whitespace-nowrap text-left">
                          <span className="relative block size-8 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                            <Image src={client.avatar} alt="" fill className="object-cover" sizes="32px" />
                          </span>
                          <span className="flex flex-col">
                            <span className="font-semibold text-[#0f172a]">{client.name}</span>
                            <span className="text-xs leading-[17px] text-gray-500">{client.since}</span>
                          </span>
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">{client.project}</td>
                      <td className="px-4 py-3">
                        <span className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", STAGE_TONE[client.stage.kind])}>{client.stage.label}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">{ghs(client.balance)}</td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr className="border-t border-gray-200">
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                        {filter === "past" ? "Past clients aren’t in this sample." : "No clients match."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <section className="flex w-full shrink-0 flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 xl:w-[400px]">
            <div className="flex items-center gap-3">
              <span className="relative block size-12 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                <Image src={panel?.avatar ?? selected.avatar} alt="" fill className="object-cover" sizes="48px" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <h2 className="truncate text-base font-bold leading-[23px] text-[#0f172a]">{selected.name}</h2>
                <p className="truncate text-xs leading-[17px] text-gray-500">{panel?.subtitle ?? selected.project}</p>
              </div>
            </div>

            {panel ? (
              <>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">Milestones</h3>
                  {panel.milestones.map((milestone) => (
                    <div key={milestone.label} className="flex items-start justify-between gap-3 text-[13px] leading-[19px] text-[#334155]">
                      <span>{milestone.label}</span>
                      <span className={cn("shrink-0 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", MILESTONE_TONE[milestone.state])}>{milestone.note}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">Files</h3>
                  {panel.files.map((file) => (
                    <button key={file} type="button" onClick={comingSoon("Open file")} className="flex items-center gap-1.5 text-left text-[13px] font-medium leading-[19px] text-brand-900">
                      <NavIcon icon="/icons/attachment-01.svg" size={14} className="shrink-0 bg-brand-900" />
                      {file}
                    </button>
                  ))}
                </div>
                <dl className="flex flex-col gap-1.5 text-[13px] leading-[19px]">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Invoiced</dt>
                    <dd className="font-medium text-[#0f172a]">{ghs(panel.invoiced)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Paid</dt>
                    <dd className="font-medium text-[#0f172a]">{ghs(panel.paid)}</dd>
                  </div>
                  <div className="flex justify-between font-bold text-[#0f172a]">
                    <dt>Balance</dt>
                    <dd>{ghs(panel.invoiced - panel.paid)}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="rounded-xl bg-[#f8fafc] p-3.5 text-[13px] leading-[19px] text-gray-500">Milestones, files and billing for {selected.name} aren’t in this sample.</p>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={comingSoon("Messages")} className="h-[38px] min-w-0 flex-1 rounded-[10px] px-3 lg:rounded-[10px]">
                Message
              </Button>
              <Button variant="primary" onClick={() => showSuccessToast(`Invoice sent to ${selected.name}`)} className="h-[38px] min-w-0 flex-1 whitespace-nowrap rounded-[10px] px-3 lg:rounded-[10px]">
                Send invoice
              </Button>
            </div>
          </section>
        </div>
      </PageContainer>
    </AppShell>
  );
}

