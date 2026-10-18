"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { QuoteRequestDialog } from "@/components/shared/QuoteRequestDialog";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStartConversation } from "@/hooks/useMessaging";
import { useOfferings, useProvider } from "@/hooks/useServices";
import { errorKind, errorMessage } from "@/lib/errors";
import { OfferingCard } from "@/components/shared/OfferingCard";
import type { PortfolioItemDto } from "@/types/api/schema";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

function PortfolioCard({ item }: { item: PortfolioItemDto }) {
  const media = item.media ?? [];
  return (
    <article className="flex flex-col gap-2 overflow-hidden rounded-xl border border-gray-200">
      <div className="grid grid-cols-2 gap-px bg-gray-200">
        {media.slice(0, 2).map((file, index) => (
          <div key={`${file.url}-${index}`} className="relative aspect-[4/3] bg-[#eef2ff]">
            {file.url && <Image src={file.url} alt={file.caption ?? item.title ?? ""} fill unoptimized className="object-cover" sizes="240px" />}
            {file.stage && file.stage !== "Work" && <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#0f172a]">{file.stage}</span>}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-0.5 px-3 pb-3">
        <p className="text-sm font-semibold text-[#0f172a]">{item.title}</p>
        {item.completedYear && <p className="text-xs text-gray-500">{item.completedYear}</p>}
        {item.description && <p className="text-[13px] text-[#334155]">{item.description}</p>}
      </div>
    </article>
  );
}

export function ProviderProfile({ id, kind }: { id: string; kind: "professional" | "artisan" }) {
  const router = useRouter();
  const provider = useProvider(id);
  const offerings = useOfferings({ providerId: id });
  const message = useStartConversation();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const data = provider.data;
  const base = kind === "professional" ? "/professionals" : "/artisans";
  const name = data?.displayName ?? data?.owner.username ?? "Provider";

  return (
    <AppShell activeKey="people" activeChildKey={kind === "professional" ? "professionals" : "artisans"} contentFullWidth>
      <PageContainer>
        {provider.isPending && <Skeleton className="h-64 w-full rounded-2xl" />}
        {provider.isError && (
          <>
            <Link href={base} className="self-start text-sm font-medium text-brand-900">
              ‹ Back
            </Link>
            <p className="text-sm text-gray-500">{errorKind(provider.error) === "notFound" ? "This profile is no longer available." : errorMessage(provider.error)}</p>
          </>
        )}
        {data && (
          <>
            <Breadcrumbs crumbs={[{ label: kind === "professional" ? "Professionals" : "Artisans", href: base }, { label: name }]} />
            <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
              <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
                <header className={`${CARD} sm:flex-row sm:items-center`}>
                  <span className="relative block size-20 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                    <Image src={data.owner.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt={name} fill className="object-cover" sizes="80px" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">{name}</h1>
                    {data.headline && <p className="text-sm font-medium text-brand-900">{data.headline}</p>}
                    <p className="flex items-center gap-1.5 text-[13px] text-gray-500">
                      <NavIcon icon="/icons/post-options-location.svg" size={13} className="bg-gray-500" />
                      {data.city}
                      {(data.serviceAreas ?? []).length > 0 ? ` · also serves ${data.serviceAreas?.join(", ")}` : ""}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {data.owner.isVerified && <span className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium text-[#16a34a]">ID verified ✓</span>}
                      {data.credentialVerified && <span className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium text-[#16a34a]">Credential verified ✓</span>}
                      {data.urgentAvailable && <span className="rounded-full bg-[#fef3c7] px-2 py-[3px] text-[11px] font-medium text-[#b45309]">Takes urgent jobs</span>}
                    </div>
                  </div>
                </header>

                {data.credentialWarning && <p className="rounded-xl bg-[#fef3c7] p-3.5 text-[13px] leading-[19px] text-[#b45309]">{data.credentialWarning}</p>}

                {data.bio && (
                  <section className={CARD}>
                    <h2 className="text-base font-bold text-[#0f172a]">About</h2>
                    <p className="whitespace-pre-line text-sm leading-5 text-[#334155]">{data.bio}</p>
                  </section>
                )}

                <section className={CARD}>
                  <h2 className="text-base font-bold text-[#0f172a]">Experience</h2>
                  <dl className="grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
                    {data.professional.profession && (
                      <div>
                        <dt className="text-xs text-gray-500">Profession</dt>
                        <dd className="font-medium text-[#0f172a]">
                          {data.professional.profession}
                          {data.professional.firmName ? ` · ${data.professional.firmName}` : ""}
                        </dd>
                      </div>
                    )}
                    {data.professional.registrationBody && (
                      <div>
                        <dt className="text-xs text-gray-500">Registered with</dt>
                        <dd className="font-medium text-[#0f172a]">{data.professional.registrationBody}</dd>
                      </div>
                    )}
                    {data.artisan.trade && (
                      <div>
                        <dt className="text-xs text-gray-500">Trade</dt>
                        <dd className="font-medium text-[#0f172a]">
                          {data.artisan.trade}
                          {data.artisan.isBusiness ? ` · crew of ${data.artisan.crewSize ?? 1}` : ""}
                        </dd>
                      </div>
                    )}
                    {(data.professional.yearsExperience ?? data.artisan.yearsExperience) !== null && (
                      <div>
                        <dt className="text-xs text-gray-500">Years of experience</dt>
                        <dd className="font-medium text-[#0f172a]">{data.professional.yearsExperience ?? data.artisan.yearsExperience}</dd>
                      </div>
                    )}
                  </dl>
                  {(data.artisan.skills ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {data.artisan.skills?.map((skill) => (
                        <span key={skill} className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-medium text-[#334155]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </section>

                {(data.portfolio ?? []).length > 0 && (
                  <section className="flex flex-col gap-3">
                    <h2 className="text-base font-bold text-[#0f172a]">Past work</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {data.portfolio?.map((item) => (
                        <PortfolioCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                )}

                {offerings.items.length > 0 && (
                  <section className="flex flex-col gap-3">
                    <h2 className="text-base font-bold text-[#0f172a]">Services</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {offerings.items.map((offering) => (
                        <OfferingCard key={offering.id} offering={offering} />
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className="flex w-full flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 xl:sticky xl:top-0 xl:w-[340px] xl:shrink-0 xl:self-start">
                <h2 className="text-base font-bold text-[#0f172a]">Work with {name}</h2>
                <Button variant="primary" onClick={() => setQuoteOpen(true)} className="h-11 rounded-[10px] lg:rounded-[10px]">
                  Request a quote
                </Button>
                <Button
                  variant="outline"
                  disabled={message.isPending}
                  onClick={() =>
                    message.mutate(
                      { recipientAccountId: data.owner.accountId, contextType: "Service", contextId: data.id, contextTitle: name },
                      { onSuccess: (conversation) => router.push(`/messages?c=${conversation.id}`) },
                    )
                  }
                  className="h-11 rounded-[10px] lg:rounded-[10px]"
                >
                  Message
                </Button>
                <p className="text-xs leading-[17px] text-gray-500">Free to ask. You compare quotes before you accept one, and you pay only for the agreed work.</p>
              </aside>
            </div>
            {quoteOpen && <QuoteRequestDialog open onClose={() => setQuoteOpen(false)} target={{ providerIds: [data.id], providerName: name, category: data.categories?.[0], city: data.city ?? undefined }} />}
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
