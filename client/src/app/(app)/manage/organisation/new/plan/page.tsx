"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { CreateOrganisationStepper } from "@/components/shared/CreateOrganisationStepper";
import { ChoiceChip, FormField } from "@/components/shared/ModalFormParts";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { useOrganization } from "@/context/OrganizationContext";
import { useSession } from "@/context/SessionContext";
import { getBillingPlans } from "@/lib/billing-api";
import { notifyError } from "@/lib/errors";
import { createOrganisation } from "@/lib/organisation-create";
import { ORGANISATION_KINDS, formatPlanPrice } from "@/lib/organisation-flow";
import { loadOpenOrganisationDraft, updateOrganisationDraft, type OrganisationDraft } from "@/lib/organisation-draft";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-[18px] rounded-2xl border border-gray-200 bg-white p-5 sm:p-6";
const DOCUMENT_COUNT = 3;

type Billing = "monthly" | "annual";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Create organisation · step 4 (Figma node 1084:35333): the plan, a review of every step, and the payment details. */
export default function CreateOrganisationPlanPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<OrganisationDraft | null>(null);
  const [billing, setBilling] = useState<Billing>("monthly");
  const [payWith, setPayWith] = useState("");
  const [authorised, setAuthorised] = useState(false);
  const [trialEnds, setTrialEnds] = useState("");
  const [creating, setCreating] = useState(false);
  const { user, refresh } = useSession();
  const { switchOrganization } = useOrganization();
  const plans = useQuery({ queryKey: ["billing", "plans"], queryFn: getBillingPlans, staleTime: 5 * 60_000 });
  const plan = plans.data?.[0];
  const payMethods = plan?.payMethods ?? [];
  const selectedPayWith = payWith || payMethods[0] || "";

  // Earlier steps' choices live in the tab session, so they are read after mount.
  useEffect(() => {
    const open = loadOpenOrganisationDraft();
    if (open) setDraft(open);
  }, []);

  // "Today" differs per visitor, so the trial end is worked out after mount too.
  useEffect(() => {
    if (!plan) return;
    const end = new Date();
    end.setDate(end.getDate() + plan.trialDays);
    setTrialEnds(formatDate(end));
  }, [plan]);

  const name = draft?.name || "Your organisation";
  const kind = draft?.kind ?? ORGANISATION_KINDS[0];
  const documents = draft?.documents ?? 0;
  const branches = draft?.branches ?? [];
  const invoiceTo = [name, draft?.tin && `TIN ${draft.tin}`].filter(Boolean).join(" · ");
  const monthlyPrice = plan ? formatPlanPrice(plan.currency, plan.monthly) : "";
  const annualPrice = plan ? formatPlanPrice(plan.currency, plan.annual) : "";
  const price = billing === "monthly" ? monthlyPrice : annualPrice;
  const freeMonths = plan && plan.monthly > 0 ? Math.round((plan.monthly * 12 - plan.annual) / plan.monthly) : 0;

  const reviewRows = [
    { label: "Organisation", value: `${name} · ${kind}` },
    { label: "Page", value: draft?.slug ? `biltlinx.com/${draft.slug}` : "Not set" },
    { label: "Verification", value: documents > 0 ? `${documents} of ${DOCUMENT_COUNT} documents · in review` : "Not yet verified" },
    { label: "Branches", value: branches.length > 0 ? branches.join(", ") : "Head office only" },
    { label: "Owner", value: `${user?.username ?? ""} (you)` },
    { label: "Your plan", value: plan ? `${plan.name} · ${plan.trialDays}-day free trial` : "Loading…" },
  ];

  async function handleCreate() {
    if (!draft || !draft.email || !plan || creating) {
      if (!draft || !draft.email) router.push("/manage/organisation/new");
      return;
    }
    setCreating(true);
    try {
      const { id, problems } = await createOrganisation({
        draft,
        planCode: plan.code,
        interval: billing === "monthly" ? "Monthly" : "Annual",
        payWith: selectedPayWith,
        activate: switchOrganization,
      });
      updateOrganisationDraft({ createdId: id });
      await refresh();
      showSuccessToast(`${draft.name} was created`);
      for (const problem of problems) notifyError(new Error(problem));
      router.push("/manage/organisation/new/done");
    } catch (error) {
      notifyError(error, "The organisation could not be created. Please try again.");
      setCreating(false);
    }
  }

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Create organisation" }]} />

        <div className="flex w-full flex-col items-start gap-6 lg:flex-row lg:gap-8">
          <CreateOrganisationStepper current={3} />

          <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold leading-[17px] text-brand-900">Step 4 of 4</p>
              <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Plan &amp; confirm</h1>
            </div>

            <section className={CARD}>
              <div className="flex flex-col gap-4 rounded-2xl border-2 border-brand-900 bg-[#f5f9ff] p-[18px] sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-bold leading-[26px] text-[#0f172a]">{plan?.name ?? (plans.isError ? "Plan unavailable" : "Loading plan…")}</p>
                    {plan && <span className="rounded-full bg-[#eff5ff] px-2.5 py-[3px] text-[11px] font-medium leading-4 text-brand-900">{plan.badge}</span>}
                  </div>
                  <p className="text-[13px] leading-[19px] text-[#334155]">{plan?.features ?? (plans.isError ? "Reload the page to try again." : "")}</p>
                </div>
                <div className="flex shrink-0 flex-col sm:items-end">
                  <p className="text-2xl font-bold leading-8 text-[#0f172a]">{price}</p>
                  <p className="text-xs leading-[17px] text-gray-500">{billing === "monthly" ? "per month" : "per year"}</p>
                </div>
              </div>

              <FormField label="Billing" className="gap-2">
                <div role="radiogroup" aria-label="Billing" className="flex flex-wrap gap-2">
                  <ChoiceChip role="radio" label={`Monthly · ${monthlyPrice}`} selected={billing === "monthly"} onClick={() => setBilling("monthly")} />
                  <ChoiceChip role="radio" label={`Annual · ${annualPrice}${freeMonths > 0 ? ` (${freeMonths} months free)` : ""}`} selected={billing === "annual"} onClick={() => setBilling("annual")} />
                </div>
              </FormField>

              <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-xl bg-[#dcfce7] p-3.5 text-[13px] leading-[19px]">
                <span className="font-bold text-[#16a34a]">{plan?.trialDays ?? ""}-day free trial</span>
                <span className="font-medium text-[#166534]">You won&rsquo;t be charged until {trialEnds || "the trial ends"}. Cancel any time before then.</span>
              </p>

              <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-4 text-[13px] leading-[19px]">
                <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Review</h2>
                <dl className="flex flex-col gap-2">
                {reviewRows.map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4">
                    <dt className="shrink-0 text-gray-500">{row.label}</dt>
                    <dd className="min-w-0 text-right font-medium text-[#0f172a]">{row.value}</dd>
                  </div>
                ))}
                </dl>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Pay with">
                  <OptionSelectField value={selectedPayWith} options={payMethods} onChange={setPayWith} />
                </FormField>
                <FormField label="Invoice to">
                  <OptionSelectField value={invoiceTo} options={[invoiceTo]} onChange={() => undefined} />
                </FormField>
              </div>

              <button type="button" role="checkbox" aria-checked={authorised} onClick={() => setAuthorised((value) => !value)} className="flex items-center gap-2.5 self-start text-left">
                <span className={cn("flex size-[18px] shrink-0 items-center justify-center rounded border", authorised ? "border-brand-900 bg-brand-900" : "border-[#cbd5e1] bg-white")}>
                  {authorised && <NavIcon icon="/icons/onboarding-tick.svg" size={10} className="bg-white" />}
                </span>
                <span className="text-[13px] font-medium leading-[19px] text-[#334155]">I&rsquo;m authorised to act for this organisation</span>
              </button>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2.5">
              <p className="flex-1 text-xs leading-[17px] text-gray-500">Plans unlock tools. They never change verification badges.</p>
              <div className="flex gap-2.5">
                <button type="button" onClick={() => router.push("/manage/organisation/new/structure")} className="h-11 rounded-[10px] border border-gray-200 bg-white px-4 text-sm font-medium text-[#0f172a] hover:bg-gray-50">
                  Back
                </button>
                <button type="button" onClick={() => void handleCreate()} disabled={!authorised || !plan || creating} className="h-11 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
                  {creating ? "Creating…" : "Create organisation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
