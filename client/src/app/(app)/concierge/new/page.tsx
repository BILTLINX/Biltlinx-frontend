"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { DetailAside } from "@/components/shared/DetailAside";
import { FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { RequestSentDialog } from "@/components/shared/RequestSentDialog";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { isNonEmpty } from "@/lib/validation";
import { cn } from "@/lib/utils";

const NEEDS = [
  { label: "Buy or rent a home", note: "Shortlist, viewings, checks", icon: "/icons/home-03.svg" },
  { label: "Renovate or repair", note: "Scope, quotes, site supervision", icon: "/icons/wrench-01.svg" },
  { label: "Build a house", note: "Design, permit, contractor", icon: "/icons/briefcase-01.svg" },
  { label: "Manage my rental property", note: "Tenants, rent, maintenance", icon: "/icons/user-group.svg" },
];
const BUDGETS = ["Under 20,000", "20,000 – 80,000", "80,000 – 120,000", "120,000 – 300,000", "300,000 – 1,000,000", "Over 1,000,000", "Not sure yet"];
const STARTS = ["As soon as possible", "Within 2 weeks", "Within 1 month", "Within 3 months", "Just exploring"];
const CHANNELS = ["WhatsApp", "Phone call", "Email"];
const CONTACT_PLACEHOLDER: Record<string, string> = { WhatsApp: "+44 7700 900123", "Phone call": "+233 24 555 0192", Email: "you@example.com" };
const PLANS = [
  { name: "Free consultation", price: "GHS 0", note: "30-minute call to scope the job" },
  { name: "Managed project", price: "8% of project cost", note: "Sourcing, quotes, weekly site reports" },
  { name: "Rental management", price: "10% of rent collected", note: "Tenants, rent, repairs, inspections" },
];
const REASONS = ["Every provider is ID and credential checked", "Weekly photo and video updates", "Payments held until you approve each milestone"];
const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5";

export default function ConciergeStartPage() {
  const router = useRouter();
  const [need, setNeed] = useState(NEEDS[1].label);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [start, setStart] = useState(STARTS[2]);
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<{ description?: string; location?: string; contact?: string }>({});
  const [sent, setSent] = useState(false);

  // The Concierge home page passes what the visitor already typed along as ?q=.
  useEffect(() => {
    const typed = new URLSearchParams(window.location.search).get("q");
    if (typed) setDescription(typed);
  }, []);

  function send() {
    const found = {
      description: isNonEmpty(description) ? undefined : "Tell Concierge what you want done",
      location: isNonEmpty(location) ? undefined : "Enter where the property is",
      contact: isNonEmpty(contact) ? undefined : `Enter your ${channel === "Email" ? "email address" : "number"}`,
    };
    setErrors(found);
    if (!found.description && !found.location && !found.contact) setSent(true);
  }

  return (
    <AppShell activeKey="concierge" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Concierge", href: "/concierge" }, { label: "Start a request" }]} />

        <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
          <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Tell Concierge what you need</h1>
              <p className="text-sm leading-5 text-gray-500">
                A Biltlinx specialist plans the work, finds vetted providers and keeps you updated. You approve every step and every payment.
              </p>
            </div>

            <section className="flex flex-col gap-[18px] rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
              <div role="radiogroup" aria-label="What do you need?" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {NEEDS.map((item) => {
                  const selected = item.label === need;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setNeed(item.label)}
                      className={cn(
                        "flex min-w-0 items-center gap-3 rounded-[14px] border p-4 text-left",
                        selected ? "border-brand-900 bg-[#eff5ff]" : "border-gray-200 hover:bg-gray-50",
                      )}
                    >
                      <NavIcon icon={item.icon} size={22} className="shrink-0 bg-[#334155]" />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-semibold leading-5 text-[#0f172a]">{item.label}</span>
                        <span className="truncate text-xs leading-[17px] text-gray-500">{item.note}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <FormField label="Describe what you want done" error={errors.description}>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="e.g. Renovate a 3-bed bungalow: new roof, re-wiring, kitchen and 2 bathrooms. I’m abroad, so I need someone to supervise."
                  className={cn(
                    "h-24 resize-none rounded-[10px] border px-3.5 py-3 text-[13px] leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none sm:text-sm",
                    errors.description ? "border-[#dc2626]" : "border-gray-200",
                  )}
                />
              </FormField>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Property location" error={errors.location}>
                  <label className={cn(FIELD_BOX, errors.location ? "border-[#dc2626]" : "border-gray-200")}>
                    <NavIcon icon="/icons/post-options-location.svg" size={16} className="bg-gray-500" />
                    <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Dansoman, Accra" className={FIELD_INPUT} />
                  </label>
                </FormField>
                <FormField label="Budget (GHS)">
                  <OptionSelectField value={budget} options={BUDGETS} onChange={setBudget} placeholder="Select a range" />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Start">
                  <OptionSelectField value={start} options={STARTS} onChange={setStart} icon="/icons/calendar-03.svg" />
                </FormField>
                <FormField label="Best way to reach you">
                  <OptionSelectField value={channel} options={CHANNELS} onChange={setChannel} />
                </FormField>
              </div>

              <FormField label={channel === "Email" ? "Your email address" : `Your ${channel === "WhatsApp" ? "WhatsApp" : "phone"} number`} error={errors.contact}>
                <label className={cn(FIELD_BOX, errors.contact ? "border-[#dc2626]" : "border-gray-200")}>
                  <input
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    type={channel === "Email" ? "email" : "tel"}
                    placeholder={CONTACT_PLACEHOLDER[channel]}
                    className={FIELD_INPUT}
                  />
                </label>
              </FormField>

              <div className="flex flex-wrap justify-end gap-2.5">
                <Button variant="outline" onClick={() => router.push(comingSoonHref("Book a call"))} className="h-11 w-auto rounded-[10px] px-4 lg:rounded-[10px]">
                  Book a call instead
                </Button>
                <Button variant="primary" onClick={send} className="h-11 w-auto rounded-[10px] px-4 lg:rounded-[10px]">
                  Send to Concierge
                </Button>
              </div>
            </section>
          </div>

          <DetailAside className="xl:w-[380px]">
            <section className={CARD}>
              <h2 className="text-[15px] font-bold leading-[22px] text-[#0f172a]">How Concierge is priced</h2>
              {PLANS.map((plan) => (
                <div key={plan.name} className="flex flex-col gap-0.5 rounded-xl border border-gray-200 p-3">
                  <div className="flex items-start justify-between gap-3 text-[13px] leading-[19px]">
                    <p className="font-semibold text-[#0f172a]">{plan.name}</p>
                    <p className="shrink-0 text-right font-bold text-brand-900">{plan.price}</p>
                  </div>
                  <p className="text-xs leading-[17px] text-gray-500">{plan.note}</p>
                </div>
              ))}
            </section>

            <section className={`${CARD} gap-2.5`}>
              <h2 className="text-[15px] font-bold leading-[22px] text-[#0f172a]">Why people use Concierge</h2>
              {REASONS.map((reason) => (
                <p key={reason} className="flex gap-2 text-[13px] leading-[19px] text-[#334155]">
                  <span className="font-bold text-[#16a34a]">✓</span>
                  {reason}
                </p>
              ))}
            </section>
          </DetailAside>
        </div>
      </PageContainer>

      <RequestSentDialog
        open={sent}
        onClose={() => setSent(false)}
        title="Sent to Concierge"
        message="A Biltlinx specialist will review it and reach you with a plan. Nothing is booked or paid until you approve it."
        rows={[
          { label: "Need", value: need },
          { label: "Location", value: location },
          { label: "Start", value: start },
          { label: "Contact", value: `${channel} · ${contact}` },
        ]}
        secondary={{ label: "Back to Concierge", onClick: () => router.push("/concierge") }}
        primary={{ label: "Message Concierge", onClick: () => router.push("/messages") }}
      />
    </AppShell>
  );
}
