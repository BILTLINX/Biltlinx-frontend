"use client";

import { parseKey } from "@/components/shared/ViewingSlotPickers";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { KeyFacts, type KeyFact } from "@/components/shared/KeyFacts";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { PropertyGallery } from "@/components/shared/PropertyGallery";
import { SelectField } from "@/components/shared/SelectField";
import { StayAvailabilityCalendar } from "@/components/shared/StayAvailabilityCalendar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStartConversation } from "@/hooks/useMessaging";
import { useStayDetail } from "@/hooks/useStay";
import { errorKind, errorMessage, notifyError } from "@/lib/errors";
import { formatDate, formatMoney } from "@/lib/format";
import { newIdempotencyKey } from "@/lib/idempotency";
import { holdBooking } from "@/lib/stay-api";
import { FALLBACK_STAY_IMAGE, nightsBetween, SHAPE_LABEL, STAY_TYPE_LABEL } from "@/lib/stay-mapper";
import type { PriceBreakdownDto, RatePlanDto, RoomDto } from "@/types/api/schema";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

function PriceLines({ price, className }: { price: PriceBreakdownDto; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1 rounded-lg bg-[#f8fafc] p-3 text-[12px] leading-[17px] text-[#334155]", className)}>
      {(price.lines ?? []).map((line, index) => (
        <div key={`${line.label}-${index}`} className="flex justify-between gap-3">
          <span>{line.label}</span>
          <span className="font-medium text-[#0f172a]">{formatMoney(line.amount, price.currency ?? "GHS")}</span>
        </div>
      ))}
      <div className="flex justify-between gap-3 border-t border-gray-200 pt-1 text-[13px] font-bold text-[#0f172a]">
        <span>Total</span>
        <span>{formatMoney(price.total, price.currency ?? "GHS")}</span>
      </div>
      {price.cancellationTerms && <p className="pt-1 text-gray-500">{price.cancellationTerms}</p>}
    </div>
  );
}

/** "Sat 24 Oct" */
function shortDate(key: string) {
  return parseKey(key).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).replace(",", "");
}

/** One half of the dates box in the booking panel; it takes you to the calendar to pick the day. */
function DateCell({ label, value }: { label: string; value: string }) {
  return (
    <a href="#availability" className="flex flex-col gap-0.5 px-3.5 py-2.5 hover:bg-gray-50">
      <span className="text-[10px] font-bold tracking-wide text-gray-500">{label}</span>
      <span className={cn("text-sm font-semibold", value ? "text-[#0f172a]" : "text-[#94a3b8]")}>{value ? shortDate(value) : "Add date"}</span>
    </a>
  );
}

function RatePlanRow({ plan, room, nights, onReserve, reserving }: { plan: RatePlanDto; room: RoomDto; nights: number; onReserve: () => void; reserving: boolean }) {
  const [open, setOpen] = useState(false);
  const currency = plan.currency ?? "GHS";
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#0f172a]">{plan.name}</p>
          <p className="text-xs text-gray-500">
            {plan.refundable ? "Refundable" : "Non-refundable"}
            {plan.includesBreakfast ? " · Breakfast included" : ""}
            {plan.minNights > 1 ? ` · min ${plan.minNights} nights` : ""}
            {plan.longStayDiscountPercent > 0 ? ` · ${plan.longStayDiscountPercent}% off long stays` : ""}
          </p>
        </div>
        <div className="text-right">
          {nights > 0 ? (
            <>
              <p className="text-base font-bold text-[#0f172a]">{formatMoney(plan.quote.total, currency)}</p>
              <p className="text-xs text-gray-500">for {nights} {nights === 1 ? "night" : "nights"}</p>
            </>
          ) : (
            <>
              <p className="text-base font-bold text-[#0f172a]">{formatMoney(plan.nightly, currency)}</p>
              <p className="text-xs text-gray-500">per night</p>
            </>
          )}
        </div>
      </div>
      {nights > 0 && (
        <>
          <button type="button" onClick={() => setOpen((v) => !v)} className="self-start text-[12px] font-medium text-brand-900">
            {open ? "Hide price breakdown" : "Price breakdown"}
          </button>
          {open && <PriceLines price={plan.quote} />}
        </>
      )}
      <Button
        variant="primary"
        disabled={nights === 0 || room.bookable === false || reserving}
        onClick={onReserve}
        className="h-10 w-full rounded-[10px] sm:w-auto sm:self-end sm:px-5 lg:rounded-[10px]"
      >
        {nights === 0 ? "Choose dates to reserve" : reserving ? "Reserving…" : "Reserve"}
      </Button>
    </div>
  );
}

function StayDetail({ id }: { id: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [checkIn, setCheckIn] = useState(params.get("checkIn") ?? "");
  const [checkOut, setCheckOut] = useState(params.get("checkOut") ?? "");
  const [guests, setGuests] = useState(Number(params.get("guests")) || 2);
  const [rooms, setRooms] = useState(Number(params.get("rooms")) || 1);
  const [periodId, setPeriodId] = useState("");
  const idempotency = useRef<string>(newIdempotencyKey());
  const nights = nightsBetween(checkIn || undefined, checkOut || undefined);
  const datesValid = nights > 0;

  const detail = useStayDetail(id, datesValid ? { checkIn, checkOut, guests, rooms } : {});
  const message = useStartConversation();

  const hold = useMutation({
    mutationFn: (ratePlanId: string) =>
      holdBooking(
        { ratePlanId, checkIn, checkOut, guests, rooms, academicPeriodId: periodId || undefined },
        idempotency.current,
      ),
    onSuccess: (booking) => router.push(`/stay/${id}/book?booking=${booking.id}`),
    onError: (error) => {
      idempotency.current = newIdempotencyKey();
      notifyError(error, errorKind(error) === "conflict" ? "Someone just took that room. Please pick again." : undefined);
      void detail.refetch();
    },
  });

  const stay = detail.data;
  const stayRooms = stay?.rooms ?? [];
  const plans = stayRooms.flatMap((room) => (room.ratePlans ?? []).map((plan) => ({ plan, room })));
  const fromNightly = plans.length > 0 ? Math.min(...plans.map(({ plan }) => plan.nightly)) : null;
  // "Book now" reserves the cheapest rate that is free for the chosen dates; the other rates are reserved from the list on the left.
  const open = datesValid ? plans.filter(({ room }) => room.bookable !== false) : [];
  const cheapest = open.length > 0 ? open.reduce((best, item) => (item.plan.quote.total < best.plan.quote.total ? item : best)) : null;
  const facts: KeyFact[] = [];
  if (stayRooms.length > 0) facts.push({ value: `Up to ${Math.max(...stayRooms.map((room) => room.maxGuestsPerUnit))}`, label: "Guests" });
  if (stayRooms.length === 1 && stayRooms[0].bedsDescription) facts.push({ value: stayRooms[0].bedsDescription, label: "Bed" });
  if (stay?.checkInFrom) facts.push({ value: `From ${stay.checkInFrom}`, label: "Check-in" });
  if (stay?.checkOutBy) facts.push({ value: `By ${stay.checkOutBy}`, label: "Check-out" });
  const photos = stay?.photos ?? [];
  const gallery = useMemo(
    () => ({ main: photos[0] ?? FALLBACK_STAY_IMAGE, side: [photos[1] ?? null, photos[2] ?? null] as [string | null, string | null], moreLabel: photos.length > 3 ? `+ ${photos.length - 3} photos` : null }),
    [photos],
  );

  return (
    <AppShell activeKey="property" activeChildKey="stay" contentFullWidth>
      <PageContainer>
        {detail.isPending && <Skeleton className="h-[320px] w-full rounded-2xl" />}
        {detail.isError && (
          <>
            <Link href="/stay" className="self-start text-sm font-medium text-brand-900">
              ‹ Back to stays
            </Link>
            <p className="text-sm text-gray-500">{errorKind(detail.error) === "notFound" ? "This stay is no longer available." : errorMessage(detail.error)}</p>
          </>
        )}
        {stay && (
          <>
            <Breadcrumbs crumbs={[{ label: "Stay", href: "/stay" }, { label: stay.city ?? "Ghana", href: "/stay" }, { label: stay.name ?? "Stay" }]} />
            <PropertyGallery gallery={gallery} title={stay.name ?? "Stay"} />
            <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
              <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
                <header className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-medium text-brand-900">{STAY_TYPE_LABEL[stay.type ?? ""] ?? "Stay"}</span>
                    {stay.operator.isVerified && <span className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium text-[#16a34a]">Verified operator ✓</span>}
                    {!stay.isOpen && stay.opensOn && <span className="rounded-full bg-[#fef3c7] px-2.5 py-1 text-[11px] font-medium text-[#b45309]">Opens {formatDate(stay.opensOn)}</span>}
                  </div>
                  <h1 className="text-2xl font-bold leading-8 text-[#0f172a] sm:text-[26px]">{stay.name}</h1>
                  <p className="flex items-start gap-1.5 text-[13px] leading-[19px] text-gray-500">
                    <NavIcon icon="/icons/post-options-location.svg" size={13} className="mt-[3px] shrink-0 bg-gray-500" />
                    <span>
                      {[stay.area, stay.city].filter(Boolean).join(", ")}
                      {stay.address ? ` · ${stay.address}` : " · exact address shared once your booking is confirmed"}
                    </span>
                  </p>
                </header>

                {facts.length > 0 && <KeyFacts facts={facts} />}

                {stay.description && (
                  <section className={CARD}>
                    <h2 className="text-base font-bold text-[#0f172a]">About this stay</h2>
                    <p className="whitespace-pre-line text-sm leading-5 text-[#334155]">{stay.description}</p>
                  </section>
                )}

                {(stay.amenities ?? []).length > 0 && (
                  <section className={CARD}>
                    <h2 className="text-base font-bold text-[#0f172a]">What this place offers</h2>
                    <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                      {stay.amenities?.map((amenity) => (
                        <li key={amenity} className="flex items-center gap-2 text-[13px] text-[#334155]">
                          <span className="font-bold text-[#16a34a]">✓</span>
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="flex flex-col gap-3">
                  <h2 className="text-base font-bold text-[#0f172a]">Rooms and rates</h2>
                  {!datesValid && <p className="rounded-xl bg-[#eff5ff] p-3 text-[13px] text-brand-900">Choose your dates on the right to see availability and the full price.</p>}
                  {(stay.rooms ?? []).map((room) => (
                    <article key={room.id} className={CARD}>
                      <div className="flex flex-wrap items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[15px] font-bold text-[#0f172a]">{room.name}</h3>
                          <p className="text-xs text-gray-500">
                            {SHAPE_LABEL[room.shape ?? ""] ?? room.shape} · up to {room.maxGuestsPerUnit} {room.maxGuestsPerUnit === 1 ? "guest" : "guests"}
                            {room.bedsDescription ? ` · ${room.bedsDescription}` : ""}
                          </p>
                          {room.description && <p className="pt-1 text-[13px] text-[#334155]">{room.description}</p>}
                        </div>
                        {datesValid && (
                          <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium", room.bookable ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fee2e2] text-[#dc2626]")}>
                            {room.bookable ? `${room.availableUnits} left` : room.unavailableReason ?? "Unavailable"}
                          </span>
                        )}
                      </div>
                      {(room.ratePlans ?? []).map((plan) => (
                        <RatePlanRow key={plan.id} plan={plan} room={room} nights={datesValid ? nights : 0} reserving={hold.isPending} onReserve={() => hold.mutate(plan.id)} />
                      ))}
                    </article>
                  ))}
                </section>

                <StayAvailabilityCalendar
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={(start, end) => {
                    setCheckIn(start);
                    setCheckOut(end);
                  }}
                />

                <section className={CARD}>
                  <h2 className="text-base font-bold text-[#0f172a]">House rules and cancellation</h2>
                  <dl className="grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
                    {stay.checkInFrom && (
                      <div>
                        <dt className="text-xs text-gray-500">Check in from</dt>
                        <dd className="font-medium text-[#0f172a]">{stay.checkInFrom}</dd>
                      </div>
                    )}
                    {stay.checkOutBy && (
                      <div>
                        <dt className="text-xs text-gray-500">Check out by</dt>
                        <dd className="font-medium text-[#0f172a]">{stay.checkOutBy}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs text-gray-500">Cancellation</dt>
                      <dd className="font-medium text-[#0f172a]">{stay.cancellationPolicy}</dd>
                    </div>
                    {stay.securityDeposit > 0 && (
                      <div>
                        <dt className="text-xs text-gray-500">Security deposit</dt>
                        <dd className="font-medium text-[#0f172a]">{formatMoney(stay.securityDeposit, stay.currency ?? "GHS")} (returned after your stay)</dd>
                      </div>
                    )}
                  </dl>
                  {stay.cancellationTerms && <p className="text-[13px] leading-[19px] text-[#334155]">{stay.cancellationTerms}</p>}
                  {stay.houseRules && <p className="whitespace-pre-line text-[13px] leading-[19px] text-[#334155]">{stay.houseRules}</p>}
                  {stay.accessibility && <p className="text-[13px] leading-[19px] text-[#334155]">Accessibility: {stay.accessibility}</p>}
                </section>

                <section className={CARD}>
                  <h2 className="text-base font-bold text-[#0f172a]">Reviews</h2>
                  <p className="text-[13px] leading-[19px] text-gray-500">No reviews yet. Guests will be able to review this stay after they check out.</p>
                </section>
              </div>

              <aside className="flex w-full flex-col gap-3.5 rounded-2xl border border-gray-200 bg-white p-5 xl:sticky xl:top-0 xl:w-[360px] xl:shrink-0 xl:self-start">
                <p className="flex items-baseline gap-1.5 text-[26px] font-bold leading-9 text-[#0f172a]">
                  {fromNightly !== null ? formatMoney(fromNightly, stay.currency ?? "GHS") : "Price on request"}
                  {fromNightly !== null && <span className="text-sm font-normal text-gray-500">/ night</span>}
                </p>
                <div className="grid grid-cols-2 divide-x divide-gray-200 overflow-hidden rounded-xl border border-gray-200">
                  <DateCell label="CHECK IN" value={checkIn} />
                  <DateCell label="CHECK OUT" value={checkOut} />
                </div>
                <div className="flex flex-col gap-0.5 rounded-xl border border-gray-200 px-3.5 pb-1 pt-2.5">
                  <span className="text-[10px] font-bold tracking-wide text-gray-500">GUESTS</span>
                  <SelectField
                    aria-label="Guests"
                    value={String(guests)}
                    onChange={(value) => setGuests(Number(value))}
                    className="h-7 rounded-none border-0 px-0 text-sm font-semibold"
                    options={Array.from({ length: 10 }, (_, index) => ({ value: String(index + 1), label: `${index + 1} ${index === 0 ? "guest" : "guests"}` }))}
                  />
                </div>
                {stayRooms.some((room) => room.quantity > 1) && (
                  <label className="flex flex-col gap-0.5 rounded-xl border border-gray-200 px-3.5 py-2.5">
                    <span className="text-[10px] font-bold tracking-wide text-gray-500">ROOMS</span>
                    <input type="number" min={1} max={10} value={rooms} onChange={(event) => setRooms(Math.max(1, Number(event.target.value) || 1))} className="w-full bg-transparent text-sm font-semibold text-[#0f172a] focus:outline-none" />
                  </label>
                )}
                {(stay.academicPeriods ?? []).length > 0 && (
                  <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#0f172a]">
                    Academic period
                    <SelectField
                      value={periodId}
                      onChange={setPeriodId}
                      placeholder="Choose a period"
                      className="h-10 rounded-[10px] text-[13px]"
                      options={(stay.academicPeriods ?? []).map((period) => ({ value: period.id ?? "", label: `${period.name} (${formatDate(period.startsOn)} to ${formatDate(period.endsOn)})` }))}
                    />
                  </label>
                )}
                {datesValid && (
                  <span className={cn("self-start rounded-full px-2.5 py-1 text-[11px] font-medium", cheapest ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fee2e2] text-[#dc2626]")}>
                    {cheapest ? "Available for your dates" : "Not available for your dates"}
                  </span>
                )}
                <Button variant="primary" disabled={!cheapest || hold.isPending} onClick={() => cheapest && hold.mutate(cheapest.plan.id)} className="h-12 rounded-[10px] lg:rounded-[10px]">
                  {!datesValid ? "Choose your dates" : hold.isPending ? "Reserving…" : "Book now"}
                </Button>
                <Button
                  variant="outline"
                  disabled={message.isPending}
                  onClick={() =>
                    message.mutate(
                      { recipientAccountId: stay.operator.accountId, contextType: "Stay", contextId: stay.id, contextTitle: stay.name ?? undefined },
                      { onSuccess: (conversation) => router.push(`/messages?c=${conversation.id}`) },
                    )
                  }
                  className="h-11 rounded-[10px] lg:rounded-[10px]"
                >
                  Message host
                </Button>
                {cheapest && (
                  <>
                    <PriceLines price={cheapest.plan.quote} className="bg-transparent p-0 text-[13px] leading-5 text-gray-500" />
                    <p className="text-xs leading-[17px] text-gray-500">
                      {cheapest.room.name} · {cheapest.plan.name}, the lowest rate for these dates. You are not charged yet; we hold it for 15 minutes while you pay.
                    </p>
                  </>
                )}
                {!datesValid && <p className="text-xs leading-[17px] text-gray-500">Choose both dates to see what is available and the full price.</p>}
                <div className="flex items-center gap-3 border-t border-gray-200 pt-3.5">
                  <span className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                    <Image src={stay.operator.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt="" fill className="object-cover" sizes="40px" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#0f172a]">{stay.operator.name}</p>
                    <p className="text-xs text-gray-500">Host</p>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}

export default function StayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={null}>
      <StayDetail id={id} />
    </Suspense>
  );
}
