"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { ArtisanRoleBar } from "@/components/shared/ArtisanRoleBar";
import { ProfessionalTabs } from "@/components/shared/ManageTabs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { PROFESSIONAL_QUOTES, PROFESSIONAL_QUOTE_KPIS, type ProfessionalQuote } from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<ProfessionalQuote["status"]["kind"], string> = {
  viewed: "bg-[#fef3c7] text-[#b45309]",
  waiting: "bg-[#f1f5f9] text-[#334155]",
  accepted: "bg-[#dcfce7] text-[#16a34a]",
  declined: "bg-[#f1f5f9] text-[#334155]",
};

const ghs = (amount: number) => `GHS ${amount.toLocaleString("en-US")}`;

/** Manage · Professional · Quotes (Figma node 1083:34576): fee proposals sent, and which became client projects. */
export default function ProfessionalQuotesPage() {
  const router = useRouter();
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  function act(quote: ProfessionalQuote) {
    if (quote.action === "Follow up") return showSuccessToast(`Follow-up sent to ${quote.client.name}`);
    if (quote.action === "Open client") return router.push("/manage/professional/clients");
    return router.push(comingSoonHref(`${quote.action} quote`));
  }

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <ArtisanRoleBar page="Quotes" role="Professional" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Quotes</h1>
            <p className="text-sm leading-5 text-gray-500">Fee proposals you’ve sent. Accepted quotes become client projects.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" onClick={comingSoon("Quote templates")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Templates
            </Button>
            <Button variant="primary" onClick={comingSoon("New quote")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              + New quote
            </Button>
          </div>
        </div>

        <ProfessionalTabs active="quotes" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {PROFESSIONAL_QUOTE_KPIS.map((kpi) => (
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

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead className="bg-[#f8fafc]">
              <tr className="text-[11px] font-bold leading-4 text-gray-500">
                {["QUOTE", "CLIENT", "FEE", "SENT", "STATUS"].map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-2.5 font-bold">
                    {heading}
                  </th>
                ))}
                <th scope="col" aria-label="Actions" className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {PROFESSIONAL_QUOTES.map((quote) => (
                <tr key={quote.id} className="border-t border-gray-200 text-[13px] leading-[19px] text-[#334155]">
                  <td className="px-4 py-3">
                    <span className="flex flex-col whitespace-nowrap">
                      <span className="font-semibold text-[#0f172a]">{quote.title}</span>
                      <span className="text-xs leading-[17px] text-gray-500">{quote.detail}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5 whitespace-nowrap font-semibold text-[#0f172a]">
                      <span className="relative block size-8 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                        <Image src={quote.client.avatar} alt="" fill className="object-cover" sizes="32px" />
                      </span>
                      {quote.client.name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{ghs(quote.fee)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{quote.sent}</td>
                  <td className="px-4 py-3">
                    <span className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", STATUS_TONE[quote.status.kind])}>{quote.status.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => act(quote)} className="whitespace-nowrap text-[13px] font-medium text-brand-900">
                      {quote.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageContainer>
    </AppShell>
  );
}

