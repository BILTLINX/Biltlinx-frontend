"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { PLAN_COMPARISON, PLAN_FAQS, PLANS, type Plan } from "@/lib/dummy-plans";
import { cn } from "@/lib/utils";

const CURRENT_PLAN = "pro";
const BILLING_PERIODS = ["Monthly", "Annual"] as const;

function Cell({ value, current }: { value: string; current: boolean }) {
  return (
    <td className={cn("px-3 py-3 text-center text-xs leading-[17px]", current && "bg-[#f3f7ff]", value === "—" ? "text-gray-400" : "text-[#334155]")}>
      {value === "✓" ? <span className="font-bold text-[#16a34a]">✓</span> : value}
    </td>
  );
}

function PlanCard({ plan, onAction }: { plan: Plan; onAction: (plan: Plan) => void }) {
  const current = plan.id === CURRENT_PLAN;
  return (
    <div className={cn("flex flex-col gap-4 rounded-2xl bg-white p-4", current ? "border-2 border-brand-900" : "border border-gray-200")}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold leading-6 text-[#0f1621]">{plan.name}</h2>
          {plan.badge && (
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium leading-4", current ? "bg-[#eff5ff] text-brand-900" : "bg-[#dcfce7] text-[#16a34a]")}>{plan.badge}</span>
          )}
        </div>
        <p className="text-xs font-medium leading-[17px] text-brand-900">{plan.tagline}</p>
      </div>
      <p className="flex items-baseline gap-1">
        <span className="text-2xl font-bold leading-8 text-[#0f1621]">{plan.price}</span>
        <span className="text-xs leading-[17px] text-gray-500">{plan.priceNote}</span>
      </p>
      <p className="text-xs leading-[17px] text-gray-500">{plan.audience}</p>
      <button
        type="button"
        disabled={current}
        onClick={() => onAction(plan)}
        className={cn(
          "h-10 w-full rounded-[10px] border text-[13px] font-medium",
          plan.id === "business" && "border-brand-900 bg-brand-900 text-white hover:opacity-90",
          plan.id === "enterprise" && "border-night-900 bg-night-900 text-white hover:opacity-90",
          plan.id === "free" && "border-gray-200 bg-white text-[#0f1621] hover:bg-gray-50",
          current && "cursor-default border-[#eff5ff] bg-[#eff5ff] text-brand-900",
        )}
      >
        {plan.action}
      </button>
      <ul className="flex flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2 text-xs leading-[17px] text-[#334155]">
            <span aria-hidden className="font-bold text-[#16a34a]">✓</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Account settings · Billing · Compare plans (Figma node 1056:28543). */
export default function ComparePlansPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<(typeof BILLING_PERIODS)[number]>("Monthly");
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <AppShell contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Settings", href: "/account-settings" }, { label: "Billing", href: "/account-settings" }, { label: "Compare plans" }]} />

        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Pick the plan that fits how you work</h1>
          <p className="max-w-[620px] text-[13px] leading-[19px] text-gray-500">Plans unlock tools in Manage. They never change your verification badges, which only show what Biltlinx has checked.</p>
          <div role="group" aria-label="Billing period" className="flex items-center gap-1 rounded-full bg-[#eff5ff] p-1">
            {BILLING_PERIODS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={period === option}
                onClick={() => setPeriod(option)}
                className={cn("flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium", period === option ? "bg-white text-[#0f1621] shadow-sm" : "text-gray-500")}
              >
                {option}
                {option === "Annual" && <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] text-[#16a34a]">Save 2 months</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onAction={(selected) => comingSoon(selected.action)()} />
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th scope="col" className="px-4 py-3 text-[13px] font-semibold text-[#0f1621]">Premium tools in Manage</th>
                {PLANS.map((plan) => (
                  <th key={plan.id} scope="col" className={cn("px-3 py-3 text-center text-xs font-semibold", plan.id === CURRENT_PLAN ? "bg-[#f3f7ff] text-brand-900" : "text-[#0f1621]")}>
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            {PLAN_COMPARISON.map((section) => (
              <tbody key={section.group}>
                <tr className="bg-gray-50">
                  <th colSpan={5} scope="colgroup" className="px-4 py-2 text-left text-[10px] font-semibold uppercase leading-4 tracking-wide text-gray-500">
                    {section.group}
                  </th>
                </tr>
                {section.rows.map((row) => (
                  <tr key={row.label} className="border-t border-gray-200">
                    <th scope="row" className="px-4 py-3 text-left text-xs font-normal leading-[17px] text-[#0f1621]">{row.label}</th>
                    {row.values.map((value, index) => (
                      <Cell key={PLANS[index].id} value={value} current={PLANS[index].id === CURRENT_PLAN} />
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl bg-night-900 p-5 text-white sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-[15px] font-semibold leading-[22px]">Not sure which plan you need?</p>
            <p className="text-xs leading-[17px] text-white/70">Try Business free for 14 days. You go back to Pro automatically unless you choose to stay.</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={comingSoon("Business free trial")} className="h-10 whitespace-nowrap rounded-[10px] bg-white px-4 text-[13px] font-medium text-[#0f1621] hover:bg-gray-100">
              Start free trial
            </button>
            <button type="button" onClick={comingSoon("Talk to sales")} className="h-10 whitespace-nowrap px-2 text-[13px] font-medium text-white">
              Talk to sales
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {PLAN_FAQS.map((faq) => (
            <div key={faq.id} className="flex flex-col gap-1.5 rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-[13px] font-semibold leading-[19px] text-[#0f1621]">{faq.question}</h3>
              <p className="text-xs leading-[17px] text-gray-500">{faq.answer}</p>
            </div>
          ))}
        </div>
      </PageContainer>
    </AppShell>
  );
}
