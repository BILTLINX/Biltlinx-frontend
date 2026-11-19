"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { KeyFacts, type KeyFact } from "@/components/shared/KeyFacts";
import { offeringPrice } from "@/components/shared/OfferingCard";
import { PageContainer } from "@/components/shared/PageContainer";
import { PropertyGallery } from "@/components/shared/PropertyGallery";
import { QuoteRequestDialog } from "@/components/shared/QuoteRequestDialog";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStartConversation } from "@/hooks/useMessaging";
import { useAvailability, useOffering, useServicesMutations } from "@/hooks/useServices";
import { errorKind, errorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const offering = useOffering(id);
  const data = offering.data;
  const bookable = data?.primaryAction === "Book";
  const days = useAvailability(id, todayKey(), bookable);
  const { book } = useServicesMutations();
  const message = useStartConversation();
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const provider = data?.provider;
  const name = provider?.displayName ?? provider?.owner.username ?? "Provider";
  const photos = (data?.media ?? []).map((file) => file.url).filter((url): url is string => Boolean(url));
  const facts: KeyFact[] = [];
  if (data) facts.push({ value: offeringPrice(data), label: "Price" });
  if (data?.serviceAreas && data.serviceAreas.length > 0) facts.push({ value: data.serviceAreas.join(", "), label: "Service area" });
  if (data?.maxBookingsPerDay) facts.push({ value: String(data.maxBookingsPerDay), label: "Jobs per day" });

  function submitBooking() {
    book.mutate(
      { id, date, notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          showSuccessToast("Booking requested. The provider will confirm.");
          setDate("");
          setNotes("");
          setTerms(false);
        },
      },
    );
  }

  return (
    <AppShell activeKey="services" activeChildKey="services" contentFullWidth>
      <PageContainer>
        {offering.isPending && <Skeleton className="h-64 w-full rounded-2xl" />}
        {offering.isError && (
          <>
            <Link href="/services" className="self-start text-sm font-medium text-brand-900">
              ‹ Back to services
            </Link>
            <p className="text-sm text-gray-500">{errorKind(offering.error) === "notFound" ? "This service is no longer available." : errorMessage(offering.error)}</p>
          </>
        )}
        {data && provider && (
          <>
            <Breadcrumbs crumbs={[{ label: "Services", href: "/services" }, { label: data.category ?? "Service" }, { label: data.title ?? "Service" }]} />
            {photos.length > 0 && (
              <PropertyGallery
                gallery={{ main: photos[0], side: [photos[1] ?? null, photos[2] ?? null], moreLabel: photos.length > 3 ? `+ ${photos.length - 3} photos` : null }}
                title={data.title ?? "Service"}
              />
            )}
            <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
              <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
                <header className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-medium text-brand-900">{data.category}</span>
                    {provider.credentialVerified && <span className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium text-[#16a34a]">Credential verified ✓</span>}
                    {provider.owner.isVerified && <span className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium text-[#16a34a]">ID verified ✓</span>}
                  </div>
                  <h1 className="text-2xl font-bold leading-8 text-[#0f172a] sm:text-[26px] sm:leading-[34px]">{data.title}</h1>
                  <Link href={`/professionals/${provider.id}`} className="flex items-center gap-2 text-[13px] leading-[19px]">
                    <span className="relative block size-6 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                      <Image src={provider.owner.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt="" fill className="object-cover" sizes="24px" />
                    </span>
                    <span className="font-medium text-brand-900">{name}</span>
                    {provider.city && <span className="text-gray-500">· {provider.city}</span>}
                  </Link>
                </header>

                <KeyFacts facts={facts} />
                {data.description && (
                  <section className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4">
                    <h2 className="text-base font-bold text-[#0f172a]">What is included</h2>
                    <p className="whitespace-pre-line text-sm leading-5 text-[#334155]">{data.description}</p>
                  </section>
                )}
                {data.terms && (
                  <section className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4">
                    <h2 className="text-base font-bold text-[#0f172a]">Terms</h2>
                    <p className="whitespace-pre-line text-[13px] leading-[19px] text-[#334155]">{data.terms}</p>
                  </section>
                )}
                {provider.credentialWarning && <p className="rounded-xl bg-[#fef3c7] p-3.5 text-[13px] leading-[19px] text-[#b45309]">{provider.credentialWarning}</p>}
              </div>

              <aside className="flex w-full flex-col gap-3.5 rounded-2xl border border-gray-200 bg-white p-5 xl:sticky xl:top-0 xl:w-[360px] xl:shrink-0 xl:self-start">
                <p className="text-[26px] font-bold leading-9 text-[#0f172a]">{offeringPrice(data)}</p>

                {bookable ? (
                  <>
                    <p className="text-[13px] font-semibold text-[#0f172a]">Pick a date</p>
                    {days.isPending && <Skeleton className="h-20 w-full" />}
                    <div className="grid grid-cols-5 gap-1.5">
                      {days.data?.slice(0, 20).map((day) => (
                        <button
                          key={day.date}
                          type="button"
                          disabled={!day.available}
                          onClick={() => setDate(day.date)}
                          aria-pressed={date === day.date}
                          className={cn(
                            "rounded-lg border py-1.5 text-center text-[11px] font-medium leading-4",
                            date === day.date ? "border-brand-900 bg-brand-900 text-white" : "border-gray-200 text-[#0f172a] hover:bg-gray-50",
                            !day.available && "cursor-not-allowed text-[#cbd5e1] line-through hover:bg-transparent",
                          )}
                        >
                          {formatDate(day.date).split(" ").slice(0, 2).join(" ")}
                        </button>
                      ))}
                    </div>
                    <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Notes for the provider (optional)" className="rounded-[10px] border border-gray-200 px-3.5 py-2.5 text-[13px] focus:border-brand-900 focus:outline-none" />
                    <label className="flex items-start gap-2.5 text-[13px] text-[#334155]">
                      <input type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} className="mt-0.5 size-4 accent-[#1465e6]" />
                      I accept the terms above.
                    </label>
                    <Button variant="primary" disabled={!date || !terms || book.isPending} onClick={submitBooking} className="h-12 rounded-[10px] lg:rounded-[10px]">
                      {book.isPending ? "Requesting…" : "Request this date"}
                    </Button>
                  </>
                ) : (
                  <Button variant="primary" onClick={() => setQuoteOpen(true)} className="h-12 rounded-[10px] lg:rounded-[10px]">
                    {data.primaryAction === "RequestInspection" ? "Request an inspection" : "Request a quote"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  disabled={message.isPending}
                  onClick={() =>
                    message.mutate(
                      { recipientAccountId: provider.owner.accountId, contextType: "Service", contextId: data.id, contextTitle: data.title ?? undefined },
                      { onSuccess: (conversation) => router.push(`/messages?c=${conversation.id}`) },
                    )
                  }
                  className="h-11 rounded-[10px] lg:rounded-[10px]"
                >
                  Message {name}
                </Button>
                <p className="text-xs leading-[17px] text-gray-500">You will not be charged until you accept a quote or the provider confirms. Payments are held by Biltlinx until the work is delivered.</p>
                <Link href="/services/my-bookings" className="text-center text-[13px] font-medium text-brand-900">
                  See my bookings
                </Link>
              </aside>
            </div>
            {quoteOpen && (
              <QuoteRequestDialog
                open
                onClose={() => setQuoteOpen(false)}
                target={{
                  providerIds: [provider.id],
                  providerName: name,
                  offeringId: data.id,
                  category: data.category ?? undefined,
                  city: provider.city ?? undefined,
                  title: data.title ?? undefined,
                  needsInspection: data.primaryAction === "RequestInspection",
                }}
              />
            )}
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
