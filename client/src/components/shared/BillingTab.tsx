"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { OUTLINE_BUTTON, SETTINGS_CARD, SETTINGS_ROW, SectionHeading } from "@/components/shared/SettingsParts";
import { Button } from "@/components/ui/Button";
import { BILLING_DETAILS, CURRENT_BILLING_PLAN, PAYMENT_METHODS, PLAN_USAGE, RECEIPTS, type ReceiptStatus } from "@/lib/dummy-billing";
import { comingSoonHref } from "@/lib/coming-soon";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<ReceiptStatus, string> = {
  Paid: "bg-[#dcfce7] text-[#16a34a]",
  Refunded: "bg-[#fef3c7] text-[#b45309]",
};

/** The Billing tab of Account settings (Figma node 1050:24636): plan and usage, payment methods, receipts and billing details. */
export function BillingTab() {
  const router = useRouter();
  const [methods, setMethods] = useState(PAYMENT_METHODS);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  function removeMethod(id: string, title: string) {
    setMethods((current) => current.filter((method) => method.id !== id));
    showSuccessToast(`${title} removed`);
  }

  return (
    <div className="flex flex-col gap-4 px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-night-900">Billing</h1>
        <p className="text-[13px] text-gray-600">Your plan, payment methods and receipts.</p>
      </div>

      <section className={SETTINGS_CARD}>
        <SectionHeading
          title="Your plan"
          action={
            <Button variant="primary" onClick={() => router.push("/account-settings/plans")} className="h-9 w-auto shrink-0 whitespace-nowrap rounded-[10px] px-4 text-[13px] lg:rounded-[10px]">
              Compare plans
            </Button>
          }
        />
        <div className="flex flex-col gap-3 rounded-xl bg-[#eff5ff] p-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="flex items-center gap-2">
              <span className="text-lg font-bold leading-6 text-[#0f1621]">{CURRENT_BILLING_PLAN.name}</span>
              <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-medium leading-4 text-[#16a34a]">{CURRENT_BILLING_PLAN.status}</span>
            </p>
            <p className="text-xs font-medium leading-[17px] text-[#334155]">{CURRENT_BILLING_PLAN.price}</p>
            <p className="text-xs leading-[17px] text-gray-500">{CURRENT_BILLING_PLAN.includes}</p>
          </div>
          <button type="button" onClick={comingSoon("Change plan")} className={cn(OUTLINE_BUTTON, "self-start sm:self-auto")}>
            Change plan
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PLAN_USAGE.map((item) => (
            <div key={item.id} className="flex flex-col gap-1.5 rounded-xl border border-gray-200 p-3">
              <p className="text-xs leading-[17px] text-gray-500">{item.label}</p>
              <p className="text-[13px] font-semibold leading-[19px] text-[#0f1621]">{item.value}</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#e2e8f0]">
                <div className={cn("h-1.5 rounded-full", item.tone)} style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={SETTINGS_CARD}>
        <SectionHeading
          title="Payment methods"
          note="Card details are stored by our payment provider, not by Biltlinx."
          action={
            <button type="button" onClick={comingSoon("Add payment method")} className={OUTLINE_BUTTON}>
              Add method
            </button>
          }
        />
        <div>
          {methods.map((method) => (
            <div key={method.id} className={cn(SETTINGS_ROW, "first:border-t-0")}>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-[13px] leading-[19px] text-[#0f1621]">{method.title}</p>
                <p className="text-xs leading-[17px] text-gray-500">{method.note}</p>
              </div>
              {method.isDefault ? (
                <span className="shrink-0 rounded-full bg-[#eff5ff] px-2.5 py-[3px] text-[11px] font-medium leading-4 text-brand-900">Default</span>
              ) : (
                <button type="button" onClick={() => removeMethod(method.id, method.title)} className={OUTLINE_BUTTON}>
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className={SETTINGS_CARD}>
        <SectionHeading
          title="Receipts & transactions"
          action={
            <button type="button" onClick={comingSoon("Download receipts")} className={OUTLINE_BUTTON}>
              Download all
            </button>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <tbody>
              {RECEIPTS.map((receipt) => (
                <tr key={receipt.id} className="border-t border-gray-200 text-[13px] leading-[19px] text-[#0f1621]">
                  <td className="whitespace-nowrap py-3.5 pr-4 text-gray-500">{receipt.date}</td>
                  <td className="py-3.5 pr-4">{receipt.description}</td>
                  <td className="whitespace-nowrap py-3.5 pr-4 text-right font-bold">{receipt.amount}</td>
                  <td className="py-3.5 pr-4">
                    <span className={cn("whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", STATUS_TONE[receipt.status])}>{receipt.status}</span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button type="button" onClick={comingSoon("Receipt")} className="whitespace-nowrap text-[13px] font-medium text-brand-900">
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={SETTINGS_CARD}>
        <SectionHeading
          title="Billing details"
          note="Shown on receipts."
          action={
            <button type="button" onClick={comingSoon("Edit billing details")} className={OUTLINE_BUTTON}>
              Edit
            </button>
          }
        />
        <div>
          {BILLING_DETAILS.map((detail) => (
            <div key={detail.id} className="flex flex-col gap-0.5 border-t border-gray-200 py-3.5 first:border-t-0">
              <p className="text-[13px] leading-[19px] text-[#0f1621]">{detail.label}</p>
              <p className="text-xs leading-[17px] text-gray-500">{detail.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
