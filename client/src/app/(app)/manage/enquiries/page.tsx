"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ManageTabs } from "@/components/shared/ManageTabs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { FEATURED_LEAD, LEADS, LEAD_KPIS, LEAD_SOURCES, LEAD_STAGES, type LeadSourceFilter, type LeadStage } from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

const CHIP = "rounded-full border px-3.5 py-2 text-[13px] font-medium leading-[19px]";

/** Manage · Enquiries & leads (Figma node 1059:29837): every enquiry in one pipeline, with the open conversation beside it. */
export default function ManageEnquiriesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<LeadSourceFilter>("All sources");
  const [stages, setStages] = useState<Record<string, LeadStage>>(() => Object.fromEntries(LEADS.map((lead) => [lead.id, lead.stage])));
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  const leads = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return LEADS.filter(
      (lead) => (source === "All sources" || lead.source === source) && (!needle || `${lead.name} ${lead.subject} ${lead.note}`.toLowerCase().includes(needle)),
    );
  }, [query, source]);

  const featuredStage = stages[FEATURED_LEAD.leadId];
  const featuredStageLabel = LEAD_STAGES.find((stage) => stage.key === featuredStage)?.label ?? "";

  function moveFeaturedToContacted() {
    setStages((current) => ({ ...current, [FEATURED_LEAD.leadId]: "contacted" }));
    showSuccessToast("Kofi Mensah moved to Contacted");
  }

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Enquiries & leads" }]} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Enquiries &amp; leads</h1>
            <p className="text-sm leading-5 text-gray-500">Every enquiry from your listings, posts and profile in one pipeline. Reply fast to win more.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Export leads")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Export
            </Button>
            <Button variant="primary" onClick={comingSoon("Add lead")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + Add lead
            </Button>
          </div>
        </div>

        <ManageTabs active="enquiries" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {LEAD_KPIS.map((kpi) => (
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

        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex h-10 w-full items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-3.5 focus-within:border-brand-900 sm:w-[280px]">
            <NavIcon icon="/icons/search-02.svg" size={16} className="shrink-0 bg-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search leads"
              aria-label="Search leads"
              className="min-w-0 flex-1 bg-transparent text-[13px] leading-[19px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
            />
          </label>
          <div role="tablist" aria-label="Source" className="flex flex-wrap gap-2.5">
            {LEAD_SOURCES.map((option) => {
              const active = option === source;
              return (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSource(option)}
                  className={cn(CHIP, active ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50")}
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

        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="grid min-w-[1000px] grid-cols-5 gap-3.5">
            {LEAD_STAGES.map((stage) => {
              const items = leads.filter((lead) => stages[lead.id] === stage.key);
              return (
                <section key={stage.key} aria-label={stage.label} className="flex min-w-0 flex-col gap-2.5 self-stretch rounded-2xl bg-[#f8fafc] p-3">
                  <div className="flex items-center gap-2">
                    <h2 className="whitespace-nowrap text-[13px] font-bold leading-[19px] text-[#0f172a]">{stage.label}</h2>
                    <span className="rounded-full bg-[#f1f5f9] px-2.5 py-[3px] text-[11px] font-medium leading-4 text-[#334155]">{items.length}</span>
                  </div>
                  {items.map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={comingSoon("Lead details")}
                      className="flex flex-col items-start gap-2 rounded-2xl border border-gray-200 bg-white p-3 text-left hover:border-gray-300"
                    >
                      <span className="flex w-full items-center gap-2">
                        <span className="relative block size-7 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                          <Image src={lead.avatar} alt="" fill className="object-cover" sizes="28px" />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold leading-[19px] text-[#0f172a]">{lead.name}</span>
                        {lead.unread && <span aria-label="Unanswered" className="size-2 shrink-0 rounded-full bg-brand-900" />}
                      </span>
                      <span className="text-xs font-medium leading-[17px] text-brand-900">{lead.subject}</span>
                      <span className="text-xs leading-[17px] text-[#334155]">{lead.note}</span>
                      <span className="text-[11px] font-medium leading-4 text-[#94a3b8]">{lead.time}</span>
                    </button>
                  ))}
                </section>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <section className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="min-w-0 text-base font-bold leading-[23px] text-[#0f172a]">{FEATURED_LEAD.title}</h2>
              <button type="button" onClick={comingSoon("Messages")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
                Open in Messages ›
              </button>
            </div>
            {FEATURED_LEAD.messages.map((message) => (
              <p
                key={message.id}
                className={cn(
                  "w-full max-w-[520px] rounded-[14px] px-3.5 py-2.5 text-[13px] leading-[19px]",
                  message.from === "you" ? "bg-brand-900 text-white" : "bg-[#f1f5f9] text-[#0f172a]",
                )}
              >
                {message.text}
              </p>
            ))}
            <div className="flex flex-wrap gap-2">
              {FEATURED_LEAD.quickReplies.map((reply) => (
                <button key={reply} type="button" onClick={comingSoon(reply)} className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium leading-[17px] text-[#334155] hover:bg-gray-50">
                  {reply}
                </button>
              ))}
            </div>
          </section>

          <section className="flex w-full shrink-0 flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-5 lg:w-[340px]">
            <h2 className="text-[15px] font-bold leading-[22px] text-[#0f172a]">Lead details</h2>
            {[...FEATURED_LEAD.details, { label: "Stage", value: featuredStageLabel, tone: "" }].map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-3 text-[13px] leading-[19px]">
                <span className="text-gray-500">{row.label}</span>
                <span className={cn("text-right font-semibold text-[#0f172a]", row.tone)}>{row.value}</span>
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <Button variant="primary" onClick={comingSoon("Book a viewing")} className="h-[38px] w-full rounded-[10px] lg:rounded-[10px]">
                Book a viewing
              </Button>
              <Button
                variant="outline"
                onClick={moveFeaturedToContacted}
                disabled={featuredStage !== "new"}
                className="h-[38px] w-full whitespace-nowrap rounded-[10px] lg:rounded-[10px]"
              >
                Move to Contacted
              </Button>
            </div>
          </section>
        </div>
      </PageContainer>
    </AppShell>
  );
}

