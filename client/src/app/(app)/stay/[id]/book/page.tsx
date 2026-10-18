"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { DetailAside } from "@/components/shared/DetailAside";
import { FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { RequestSentDialog } from "@/components/shared/RequestSentDialog";
import { Button } from "@/components/ui/Button";
import { PAYMENT_METHODS, STAY_EXTRAS, getStayDetail } from "@/lib/dummy-stay-detail";
import { formatGhs, formatStayDate, priceBreakdown } from "@/lib/stay-booking";
import { isNonEmpty, isValidPhone } from "@/lib/validation";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5";

function toDay(value: string | undefined, fallback: number) {
  const day = Number(value);
  return Number.isInteger(day) && day >= 1 && day <= 31 ? day : fallback;
}

function SummaryLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex items-start justify-between gap-3 text-[13px] leading-[19px]", strong && "font-bold text-[#0f172a]")}>
      <span className={strong ? undefined : "text-gray-500"}>{label}</span>
      <span className={cn("shrink-0 whitespace-nowrap", !strong && "font-medium text-[#0f172a]")}>{value}</span>
    </div>
  );
}

/** Confirm and pay for a stay (Figma node 1060:30287): the trip, optional extras, guest details, how to pay and the price. */
export default function StayCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ in?: string; out?: string; guests?: string }>;
}) {
  const { id } = use(params);
  const query = use(searchParams);
  const router = useRouter();
  const detail = getStayDetail(id);
  const [extras, setExtras] = useState<string[]>(["pickup"]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState(PAYMENT_METHODS[0].id);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [paid, setPaid] = useState(false);

  // Falls back to the dates the stay page starts on when the link carries none.
  const checkIn = toDay(query.in, 24);
  const checkOut = toDay(query.out, 26);
  const nights = Math.max(checkOut - checkIn, 0);
  const guests = query.guests || "2 adults";

  if (!detail) {
    return (
      <AppShell activeKey="property" activeChildKey="stay" contentFullWidth>
        <PageContainer>
          <Link href="/stay" className="self-start text-sm font-medium text-brand-900">
            ‹ Back to stays
          </Link>
          <p className="text-sm text-gray-500">This stay is no longer available.</p>
        </PageContainer>
      </AppShell>
    );
  }

  const { listing } = detail;
  const [hotel, room = "Room"] = listing.title.split(" · ");
  const bed = detail.keyFacts[1]?.value ?? "1 bed";
  const nightlyRate = Number(listing.price.replace(/\D/g, ""));
  const chosen = STAY_EXTRAS.filter((extra) => extras.includes(extra.id));
  const price = priceBreakdown(nightlyRate, nights, chosen.reduce((sum, extra) => sum + extra.price, 0));
  const dates = nights > 0 ? `${formatStayDate(checkIn)} – ${formatStayDate(checkOut)} · ${nights} ${nights === 1 ? "night" : "nights"}` : "Choose your dates";
  const cancelBy = `${formatStayDate(Math.max(checkIn - 2, 1))}, 2 pm`;
  const editStay = () => router.push(`/stay/${id}`);

  function toggleExtra(extraId: string) {
    setExtras((current) => (current.includes(extraId) ? current.filter((value) => value !== extraId) : [...current, extraId]));
  }

  function pay() {
    const found = {
      name: isNonEmpty(name) ? undefined : "Enter the guest’s name",
      phone: isValidPhone(phone) ? undefined : "Enter a valid phone number",
    };
    setErrors(found);
    if (nights < 1) {
      editStay();
      return;
    }
    if (!found.name && !found.phone) setPaid(true);
  }

  return (
    <AppShell activeKey="property" activeChildKey="stay" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Stay", href: "/stay" }, { label: hotel, href: `/stay/${id}` }, { label: "Confirm and pay" }]} />
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Confirm and pay</h1>

        <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
          <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
            <section className={CARD}>
              <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Your trip</h2>
              {[
                { label: "Dates", value: dates },
                { label: "Guests", value: guests },
                { label: "Room", value: `${room} · ${bed} bed` },
              ].map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-3 text-[13px] leading-[19px]">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="font-semibold text-[#0f172a]">{row.label}</p>
                    <p className="text-gray-500">{row.value}</p>
                  </div>
                  <button type="button" onClick={editStay} className="shrink-0 font-medium text-brand-900">
                    Edit
                  </button>
                </div>
              ))}
            </section>

            <section className={cn(CARD, "gap-2.5")}>
              <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Add extras</h2>
              {STAY_EXTRAS.map((extra) => {
                const selected = extras.includes(extra.id);
                return (
                  <button
                    key={extra.id}
                    type="button"
                    role="checkbox"
                    aria-checked={selected}
                    onClick={() => toggleExtra(extra.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left",
                      selected ? "border-brand-900 bg-[#eff5ff]" : "border-gray-200 hover:bg-gray-50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-[18px] shrink-0 items-center justify-center rounded text-[11px] font-bold leading-3",
                        selected ? "bg-brand-900 text-white" : "border border-[#cbd5e1] text-transparent",
                      )}
                    >
                      ✓
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium leading-5 text-[#0f172a]">{extra.label}</span>
                    <span className="shrink-0 whitespace-nowrap text-sm font-semibold leading-5 text-[#0f172a]">{formatGhs(extra.price)}</span>
                  </button>
                );
              })}
            </section>

            <section className={CARD}>
              <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Guest details</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Full name" error={errors.name}>
                  <label className={cn(FIELD_BOX, errors.name ? "border-[#dc2626]" : "border-gray-200")}>
                    <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Your full name" className={FIELD_INPUT} />
                  </label>
                </FormField>
                <FormField label="Phone" error={errors.phone}>
                  <label className={cn(FIELD_BOX, errors.phone ? "border-[#dc2626]" : "border-gray-200")}>
                    <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" placeholder="+233 24 555 0192" className={FIELD_INPUT} />
                  </label>
                </FormField>
              </div>
            </section>

            <section className={cn(CARD, "gap-2.5")}>
              <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Pay with</h2>
              <div role="radiogroup" aria-label="Pay with" className="flex flex-col gap-2.5">
                {PAYMENT_METHODS.map((method) => {
                  const selected = method.id === payment;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setPayment(method.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left",
                        selected ? "border-brand-900 bg-[#eff5ff]" : "border-gray-200 hover:bg-gray-50",
                      )}
                    >
                      <span className={cn("flex size-[18px] shrink-0 items-center justify-center rounded-full border", selected ? "border-brand-900" : "border-[#cbd5e1]")}>
                        {selected && <span className="size-2.5 rounded-full bg-brand-900" />}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-sm font-semibold leading-5 text-[#0f172a]">{method.label}</span>
                        <span className="text-xs leading-[17px] text-gray-500">{method.note}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <p className="text-xs leading-[17px] text-gray-500">
              By paying you agree to the hotel’s house rules and Biltlinx booking terms. Free cancellation until {cancelBy}.
            </p>
          </div>

          <DetailAside single className="xl:w-[400px]">
            <section className={CARD}>
              <div className="flex items-center gap-3">
                <span className="relative block h-[60px] w-[72px] shrink-0 overflow-hidden rounded-[10px] bg-[#eef2ff]">
                  <Image src={listing.image} alt="" fill className="object-cover" sizes="72px" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate text-sm font-semibold leading-5 text-[#0f172a]">{hotel}</p>
                  <p className="truncate text-xs leading-[17px] text-gray-500">
                    {room} · {listing.location.split(",")[0]}
                  </p>
                  <p className="text-xs font-medium leading-[17px] text-[#334155]">{detail.ratingLabel.replace("stays", "reviews").replace(" · ", " (").replace(" reviews", ")")}</p>
                </div>
              </div>
              <SummaryLine label={`${formatGhs(nightlyRate)} × ${nights} ${nights === 1 ? "night" : "nights"}`} value={formatGhs(price.subtotal)} />
              {chosen.map((extra) => (
                <SummaryLine key={extra.id} label={extra.label} value={formatGhs(extra.price)} />
              ))}
              <SummaryLine label="Biltlinx service fee" value={formatGhs(price.serviceFee)} />
              <SummaryLine label="Tourism levy (1%)" value={formatGhs(price.levy)} />
              <SummaryLine label="Total (GHS)" value={formatGhs(price.total)} strong />
              <Button variant="primary" onClick={pay} className="h-12 rounded-[10px] lg:rounded-[10px]">
                Pay {formatGhs(price.total)}
              </Button>
              <p className="flex items-center gap-2 text-xs font-medium leading-[17px] text-[#16a34a]">
                <NavIcon icon="/icons/message-lock-02.svg" size={14} className="shrink-0 bg-[#16a34a]" />
                Held by Biltlinx until check-in
              </p>
            </section>
          </DetailAside>
        </div>
      </PageContainer>

      <RequestSentDialog
        open={paid}
        onClose={() => setPaid(false)}
        title="Booking confirmed"
        message="Your payment is held by Biltlinx until you check in. We’ve sent the details to your phone."
        rows={[
          { label: "Stay", value: hotel },
          { label: "Dates", value: dates },
          { label: "Paid", value: formatGhs(price.total) },
          { label: "Paying with", value: PAYMENT_METHODS.find((method) => method.id === payment)?.label ?? "" },
        ]}
        secondary={{ label: "Back to stays", onClick: () => router.push("/stay") }}
        primary={{ label: "Message host", onClick: () => router.push("/messages") }}
      />
    </AppShell>
  );
}

