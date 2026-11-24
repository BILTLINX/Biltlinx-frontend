"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { BookmarkIcon } from "@/components/shared/BookmarkIcon";
import { NavIcon } from "@/components/shared/NavIcon";
import { MODE_LABEL, offeringAmount } from "@/components/shared/OfferingCard";
import { PageContainer } from "@/components/shared/PageContainer";
import { ProjectDetailDialog } from "@/components/shared/ProjectDetailDialog";
import { ProviderReviews, type ProviderReview } from "@/components/shared/ProviderReviews";
import { QuoteRequestDialog } from "@/components/shared/QuoteRequestDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStartConversation } from "@/hooks/useMessaging";
import { useSaved } from "@/hooks/useSaved";
import { useOfferings, useProvider } from "@/hooks/useServices";
import { errorKind, errorMessage } from "@/lib/errors";
import { formatPricePeriod } from "@/lib/format";
import { savedProvider } from "@/lib/saved-items";
import { cn } from "@/lib/utils";
import type { OfferingDto, PortfolioItemDto, ProviderDto } from "@/types/api/schema";

const CHIP = "rounded-full bg-[#dcfce7] px-3 py-1.5 text-xs font-medium leading-4 text-[#166534]";
const PROJECTS_SHOWN = 6;
const SERVICES_SHOWN = 5;

export function PortfolioCard({ item }: { item: PortfolioItemDto }) {
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

/** One finished project in the Projects tab: its first photo, the title and the year. */
function ProjectTile({ item, onOpen }: { item: PortfolioItemDto; onOpen: () => void }) {
  const cover = item.media?.find((file) => file.url)?.url;
  const count = item.media?.filter((file) => file.url).length ?? 0;
  return (
    <button type="button" onClick={onOpen} aria-label={`Open ${item.title ?? "project"}`} className="group flex min-w-0 flex-col gap-1.5 text-left">
      <div className="relative aspect-[246/130] overflow-hidden rounded-xl bg-[#eef2ff] ring-1 ring-transparent group-hover:ring-brand-900">
        {cover && <Image src={cover} alt="" fill unoptimized className="object-cover" sizes="(min-width: 1024px) 246px, 50vw" />}
        {count > 1 && <span className="absolute bottom-2 right-2 rounded-full bg-[#0f172a]/70 px-2 py-0.5 text-[11px] font-medium text-white">{count} photos</span>}
      </div>
      <p className="w-full truncate text-sm font-semibold text-[#0f172a] group-hover:text-brand-900">{item.title}</p>
      {item.completedYear && <p className="text-xs text-gray-500">{item.completedYear}</p>}
    </button>
  );
}

/** One service in the Services tab (Figma node 1563:52087): title and what it is priced per on the left, the price on the right. It opens the service. */
function ServiceRow({ offering }: { offering: OfferingDto }) {
  const unit = offering.price !== null ? formatPricePeriod(offering.priceUnit).replace("/", "per") : "";
  const note = [unit ? unit.charAt(0).toUpperCase() + unit.slice(1) : "", MODE_LABEL[offering.mode ?? ""]].filter(Boolean).join(" · ");
  return (
    <Link href={`/services/${offering.id}`} className="flex items-center justify-between gap-4 border-b border-gray-200 py-3.5 hover:bg-gray-50/60">
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-base font-semibold leading-[23px] text-[#0f172a]">{offering.title}</span>
        {note && <span className="truncate text-[13px] leading-[19px] text-gray-500">{note}</span>}
      </span>
      <span className="shrink-0 whitespace-nowrap text-base font-bold text-[#0f172a]">{offeringAmount(offering)}</span>
    </Link>
  );
}

/** One credential (Figma node 1563:53509): a tick tile, what it is and its number, and whether Biltlinx checked it. */
function CredentialRow({ title, note, checked }: { title: string; note: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 py-3.5">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", checked ? "bg-[#dcfce7]" : "bg-[#f1f5f9]")}>
        {checked ? <Image src="/icons/checkmark-badge-01.svg" alt="" width={18} height={18} /> : <NavIcon icon="/icons/checkmark-badge-01.svg" size={18} className="bg-[#94a3b8]" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-base font-semibold leading-[23px] text-[#0f172a]">{title}</span>
        <span className="truncate text-[13px] leading-[19px] text-gray-500">{note}</span>
      </span>
      <span className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-medium leading-4", checked ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f1f5f9] text-[#475569]")}>{checked ? "Checked" : "Self-reported"}</span>
    </div>
  );
}

type TabKey = "projects" | "services" | "reviews" | "credentials" | "about";

// There is no endpoint for a provider's reviews yet, so this stays empty until the backend sends them.
const NO_REVIEWS: ProviderReview[] = [];

function Stat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eff5ff]">
        <NavIcon icon={icon} size={18} className="bg-brand-900" />
      </span>
      <span className="flex flex-col">
        <span className="text-xl font-bold leading-6 text-[#0f172a]">{value}</span>
        <span className="text-[13px] leading-[19px] text-gray-500">{label}</span>
      </span>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-[#f8fafc] px-3 py-2.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{value}</span>
    </div>
  );
}

/** An artisan's About tab (Figma node 1563:54480): the bio, then what we know about where and how they work. */
function ArtisanAbout({ data }: { data: ProviderDto }) {
  const years = data.artisan?.yearsExperience;
  const tiles = [
    { label: "Service area", value: data.serviceRadiusKm && data.city ? `Within ${data.serviceRadiusKm} km of ${data.city}` : data.city },
    (data.serviceAreas ?? []).length > 0 ? { label: "Also serves", value: data.serviceAreas?.join(", ") } : null,
    data.artisan?.isBusiness ? { label: "Team", value: `Crew of ${data.artisan?.crewSize ?? 1}` } : null,
    years != null ? { label: "Experience", value: `${years} ${years === 1 ? "year" : "years"}` } : null,
    data.artisan?.pricing ? { label: "Pricing", value: data.artisan?.pricing } : null,
  ].filter((tile): tile is { label: string; value: string } => Boolean(tile?.value));

  return (
    <div className="flex flex-col gap-4">
      {data.bio ? <p className="whitespace-pre-line text-sm leading-5 text-[#334155]">{data.bio}</p> : <p className="text-sm text-gray-500">No description added yet.</p>}
      {(data.artisan?.skills ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.artisan?.skills?.map((skill) => (
            <span key={skill} className="rounded-full border border-gray-200 px-3.5 py-1.5 text-[13px] font-medium text-[#0f172a]">
              {skill}
            </span>
          ))}
        </div>
      )}
      {tiles.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {tiles.map((tile) => (
            <InfoTile key={tile.label} label={tile.label} value={tile.value} />
          ))}
        </div>
      )}
    </div>
  );
}

/** The About tab (Figma node 1563:53150): who they are and what they do, where they work, then the numbers behind them. */
function AboutTab({ data, projects, services }: { data: ProviderDto; projects: number; services: number }) {
  const specialities = data.artisan?.skills ?? data.professional?.specialisations ?? [];
  const years = data.professional?.yearsExperience ?? data.artisan?.yearsExperience;
  const facts = [
    (data.serviceAreas ?? []).length > 0 ? { icon: "/icons/post-options-location.svg", text: `Also serves ${data.serviceAreas?.join(", ")}` } : null,
    data.artisan?.isBusiness ? { icon: "/icons/user-group.svg", text: `Crew of ${data.artisan?.crewSize ?? 1}` } : null,
  ].filter((fact): fact is { icon: string; text: string } => fact !== null);

  return (
    <div className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-2xl border border-gray-200">
        <div className="flex flex-col gap-3 p-5">
          <h2 className="text-base font-bold text-[#0f172a]">About</h2>
          {data.bio ? <p className="whitespace-pre-line text-sm leading-5 text-[#334155]">{data.bio}</p> : <p className="text-sm text-gray-500">No description added yet.</p>}
          {specialities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {specialities.map((item) => (
                <span key={item} className="rounded-full border border-gray-200 px-3.5 py-1.5 text-[13px] font-medium text-[#0f172a]">
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
        {facts.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-[#f8fafc] px-5 py-3 text-[13px] text-[#334155]">
            {facts.map((fact) => (
              <span key={fact.text} className="flex items-center gap-2">
                <NavIcon icon={fact.icon} size={14} className="bg-[#475569]" />
                {fact.text}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 rounded-2xl border border-gray-200 p-5 sm:grid-cols-3">
        <Stat icon="/icons/post-options-compare.svg" value={String(projects)} label="Projects" />
        {years !== null && years !== undefined && <Stat icon="/icons/calendar-03.svg" value={`${years} ${years === 1 ? "yr" : "yrs"}`} label="Experience" />}
        <Stat icon="/icons/settings-02.svg" value={String(services)} label="Services" />
      </section>
    </div>
  );
}

/** A professional's or artisan's page (Figma nodes 1560:50184 and 1560:50588): a profile card beside tabs for their projects or photos, services, reviews, credentials or certificates, and about. */
export function ProviderProfile({ id, kind }: { id: string; kind: "professional" | "artisan" }) {
  const router = useRouter();
  const provider = useProvider(id);
  const offerings = useOfferings({ providerId: id });
  const message = useStartConversation();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("projects");
  const [allProjects, setAllProjects] = useState(false);
  const [openProject, setOpenProject] = useState<PortfolioItemDto | null>(null);
  const [allServices, setAllServices] = useState(false);
  const data = provider.data;
  const isArtisan = kind === "artisan";
  const base = isArtisan ? "/artisans" : "/professionals";
  const workNoun = isArtisan ? "photo" : "project";
  const name = data?.displayName ?? data?.owner.username ?? "Provider";
  const { canSave, saved, toggle: toggleSaved } = useSaved(data ? savedProvider(data, kind, name) : null);

  const projects = data?.portfolio ?? [];
  const services = offerings.items;
  const registration = data?.professional?.registrationBody;
  const hasCredentials = Boolean(registration || data?.credentialVerified || data?.credentialWarning);
  // The line under the name: the profession and firm when they are set, otherwise the headline.
  const role = data ? [data.professional?.profession ?? data.artisan?.trade, data.professional?.firmName].filter(Boolean).join(", ") || data.headline : null;
  const priced = services.filter((offering) => offering.price !== null);
  const cheapest = priced.length > 0 ? priced.reduce((best, offering) => ((offering.price ?? 0) < (best.price ?? 0) ? offering : best)) : null;

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "projects", label: isArtisan ? "Photos" : "Projects", count: projects.length },
    { key: "services", label: "Services", count: services.length },
    { key: "reviews", label: "Reviews", count: NO_REVIEWS.length },
    ...(hasCredentials ? [{ key: "credentials" as const, label: isArtisan ? "Certificates" : "Credentials" }] : []),
    { key: "about", label: "About" },
  ];

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
            {data.credentialWarning && <p className="rounded-xl bg-[#fef3c7] p-3.5 text-[13px] leading-[19px] text-[#b45309]">{data.credentialWarning}</p>}
            <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
              <aside className="flex w-full shrink-0 flex-col gap-3 rounded-[20px] border border-gray-200 bg-white p-5 lg:sticky lg:top-0 lg:w-[300px]">
                <div className="flex items-start justify-between gap-3">
                  <span className="relative block size-20 shrink-0 overflow-hidden rounded-full border-2 border-[#dbeafe] bg-[#eef2ff]">
                    <Image src={data.owner.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt={name} fill className="object-cover" sizes="80px" />
                  </span>
                  {canSave && (
                    <button
                      type="button"
                      aria-pressed={saved}
                      aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`}
                      onClick={toggleSaved}
                      className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-gray-200 hover:bg-gray-50"
                    >
                      <BookmarkIcon saved={saved} size={18} />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <h1 className="flex items-center gap-1.5 text-[22px] font-bold leading-[30px] text-[#0f172a]">
                    <span className="min-w-0 truncate">{name}</span>
                    {(data.owner.isVerified || data.credentialVerified) && <Image src="/icons/checkmark-badge-01.svg" alt="Verified" title="Verified" width={18} height={18} className="shrink-0" />}
                  </h1>
                  {role && <p className="text-sm leading-5 text-[#475569]">{role}</p>}
                  {data.city && (
                    <p className="flex items-center gap-1.5 text-[13px] leading-[19px] text-gray-500">
                      <NavIcon icon="/icons/post-options-location.svg" size={13} className="bg-gray-500" />
                      {isArtisan && data.serviceRadiusKm ? `Within ${data.serviceRadiusKm} km of ${data.city}` : data.city}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {data.owner.isVerified && <span className={CHIP}>ID verified</span>}
                  {data.credentialVerified && <span className={CHIP}>Credential verified</span>}
                  {registration && <span className={CHIP}>{registration}</span>}
                  {data.urgentAvailable && <span className="rounded-full bg-[#fef3c7] px-3 py-1.5 text-xs font-medium leading-4 text-[#b45309]">Takes urgent jobs</span>}
                </div>

                {cheapest && (
                  <p className="flex flex-wrap items-baseline gap-x-1.5 border-t border-gray-200 pt-3 text-xl font-bold text-[#0f172a]">
                    From {cheapest.currency ?? "GHS"} {(cheapest.price ?? 0).toLocaleString("en-GH")}
                    <span className="text-xs font-normal text-gray-500">{formatPricePeriod(cheapest.priceUnit).replace("/", "per")}</span>
                  </p>
                )}

                <button type="button" onClick={() => setQuoteOpen(true)} className="flex h-11 items-center justify-center rounded-full bg-[#1465e6] px-5 text-sm font-semibold text-white hover:bg-[#0f52c0]">
                  {kind === "professional" ? "Request consultation" : "Request a quote"}
                </button>
                <button
                  type="button"
                  disabled={message.isPending}
                  onClick={() =>
                    message.mutate(
                      { recipientAccountId: data.owner.accountId, contextType: "Service", contextId: data.id, contextTitle: name },
                      { onSuccess: (conversation) => router.push(`/messages?c=${conversation.id}`) },
                    )
                  }
                  className="flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 text-sm font-medium text-[#0f172a] hover:bg-gray-50 disabled:opacity-60"
                >
                  <NavIcon icon="/icons/message-01.svg" size={16} className="bg-[#334155]" />
                  Message
                </button>
              </aside>

              <section className="flex w-full min-w-0 flex-1 flex-col gap-4 rounded-[20px] border border-gray-200 bg-white p-4">
                <div role="tablist" className="no-scrollbar flex gap-5 overflow-x-auto border-b border-gray-200">
                  {tabs.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      role="tab"
                      aria-selected={tab === item.key}
                      onClick={() => setTab(item.key)}
                      className={cn("-mb-px flex shrink-0 items-baseline gap-1.5 border-b-2 px-1 pb-3 pt-2 text-sm", tab === item.key ? "border-brand-900 font-semibold text-brand-900" : "border-transparent font-medium text-[#334155] hover:text-[#0f172a]")}
                    >
                      {item.label}
                      {item.count !== undefined && <span className="text-xs font-medium text-gray-500">{item.count}</span>}
                    </button>
                  ))}
                </div>

                {tab === "projects" &&
                  (projects.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                        {(allProjects ? projects : projects.slice(0, PROJECTS_SHOWN)).map((item) => (
                          <ProjectTile key={item.id} item={item} onOpen={() => setOpenProject(item)} />
                        ))}
                      </div>
                      {projects.length > PROJECTS_SHOWN && (
                        <button type="button" onClick={() => setAllProjects((current) => !current)} className="self-start text-[13px] font-medium text-brand-900">
                          {allProjects ? "Show fewer" : `See all ${projects.length} ${workNoun}s ›`}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="py-6 text-center text-sm text-gray-500">{`No ${workNoun}s added yet.`}</p>
                  ))}

                {tab === "services" &&
                  (services.length > 0 ? (
                    <div className="flex flex-col">
                      {(allServices ? services : services.slice(0, SERVICES_SHOWN)).map((offering) => (
                        <ServiceRow key={offering.id} offering={offering} />
                      ))}
                      {services.length > SERVICES_SHOWN && (
                        <button type="button" onClick={() => setAllServices((current) => !current)} className="self-start pt-3.5 text-[13px] font-medium text-brand-900">
                          {allServices ? "Show fewer" : `See all ${services.length} services ›`}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="py-6 text-center text-sm text-gray-500">No services listed yet.</p>
                  ))}

                {tab === "reviews" && <ProviderReviews reviews={NO_REVIEWS} verifiedLabel={isArtisan ? "Verified job" : "Verified client"} />}

                {tab === "credentials" && (
                  <div className="flex flex-col">
                    <CredentialRow
                      title={registration ?? (isArtisan ? "Trade certificate" : "Credentials")}
                      note={
                        data.credentialVerified
                          ? [data.professional?.registrationNumber ? `Reg. no. ${data.professional?.registrationNumber}` : null, "checked by Biltlinx"].filter(Boolean).join(" · ")
                          : `Added by ${name}, not checked by Biltlinx`
                      }
                      checked={data.credentialVerified}
                    />
                    <p className="pt-3.5 text-[13px] leading-[19px] text-gray-500">Biltlinx checks each {isArtisan ? "certificate" : "licence"} with the issuing body. A paid plan never adds a badge.</p>
                  </div>
                )}

                {tab === "about" && (isArtisan ? <ArtisanAbout data={data} /> : <AboutTab data={data} projects={projects.length} services={services.length} />)}
              </section>
            </div>
            {openProject && <ProjectDetailDialog item={openProject} onClose={() => setOpenProject(null)} />}
            {quoteOpen && <QuoteRequestDialog open onClose={() => setQuoteOpen(false)} target={{ providerIds: [data.id], providerName: name, consultation: kind === "professional", category: data.categories?.[0], city: data.city ?? undefined }} />}
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
