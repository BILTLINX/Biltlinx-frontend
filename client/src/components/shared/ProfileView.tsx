"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { PostCard } from "@/components/shared/PostCard";
import { PostCardSkeleton } from "@/components/shared/PostCardSkeleton";
import { PortfolioCard } from "@/components/shared/ProviderProfile";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useFollowAccount } from "@/hooks/useFollowAccount";
import { useStartConversation } from "@/hooks/useMessaging";
import { useProfile, type Profile } from "@/hooks/useProfile";
import { useProviderPage } from "@/hooks/useProviderPage";
import { CAPABILITIES } from "@/lib/account-api";
import { shareContent } from "@/lib/share";
import { cn } from "@/lib/utils";
import type { Capability } from "@/types/api/auth";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5";
const PILL = "rounded-full px-2.5 py-1 text-[11px] font-medium leading-4";
const BUTTON = "h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px]";
const TABS = [
  { key: "posts", label: "Posts" },
  { key: "about", label: "About" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_TONES: Record<string, string> = {
  Approved: "bg-[#dcfce7] text-[#16a34a]",
  Pending: "bg-[#fef3c7] text-[#b45309]",
};

function capabilityLabel(capability: string) {
  return CAPABILITIES.find((item) => item.value === capability)?.label ?? capability;
}

function monthYear(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="break-words text-[13px] font-medium text-[#0f172a]">{children}</dd>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className={cn(PILL, "bg-[#f1f5f9] text-[#334155]")}>
          {item}
        </span>
      ))}
    </div>
  );
}

/** Follow and message someone else, or edit your own profile; both can share it. */
function ProfileActions({ profile }: { profile: Profile }) {
  const router = useRouter();
  const message = useStartConversation();
  const { following, toggle } = useFollowAccount(profile.id, profile.following);

  return (
    <div className="flex flex-wrap gap-2">
      {profile.own ? (
        <Button variant="primary" onClick={() => router.push("/account-settings")} className={BUTTON}>
          Edit profile
        </Button>
      ) : (
        <>
          <Button variant={following ? "outline" : "primary"} aria-pressed={following} onClick={toggle} className={BUTTON}>
            {following ? "Following" : "Follow"}
          </Button>
          <Button
            variant="outline"
            disabled={message.isPending}
            onClick={() => message.mutate({ recipientAccountId: profile.id, contextType: "Direct", contextTitle: `Chat with ${profile.name}` }, { onSuccess: (conversation) => router.push(`/messages?c=${conversation.id}`) })}
            className={BUTTON}
          >
            Message
          </Button>
        </>
      )}
      <Button variant="outline" onClick={() => shareContent({ title: profile.name, text: `${profile.name} on Biltlinx`, path: "" })} className={BUTTON}>
        Share
      </Button>
    </div>
  );
}

function ProfileHeader({ profile }: { profile: Profile }) {
  const { provider } = profile;
  const approved = profile.capabilities.filter((item) => item.status === "Approved");

  return (
    <header className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="h-24 bg-gradient-to-r from-brand-900 to-brand-600 sm:h-32" />
      <div className="flex flex-col gap-4 px-5 pb-5">
        <div className="-mt-12 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 sm:-mt-14">
          <span className="relative block size-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#eef2ff] sm:size-28">
            <Image src={profile.avatar ?? "/icons/avatar-placeholder-user.svg"} alt={profile.name} fill className={profile.avatar ? "object-cover" : "object-contain p-6"} sizes="112px" />
          </span>
          <ProfileActions profile={profile} />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">{profile.name}</h1>
            {profile.verified && <span className={cn(PILL, "bg-[#dcfce7] text-[#16a34a]")}>ID verified ✓</span>}
            {provider?.credentialVerified && <span className={cn(PILL, "bg-[#dcfce7] text-[#16a34a]")}>Credential verified ✓</span>}
          </div>
          {provider?.headline && <p className="text-sm font-medium text-brand-900">{provider.headline}</p>}
          {profile.organizationName && <p className="text-[13px] text-gray-500">{profile.organizationName}</p>}
          {approved.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {approved.map((item) => (
                <span key={item.id} className={cn(PILL, "bg-[#eff5ff] text-brand-900")}>
                  {capabilityLabel(item.capability)}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-[13px] text-gray-500">
            {profile.location && (
              <span className="flex items-center gap-1.5">
                <NavIcon icon="/icons/post-options-location.svg" size={13} className="bg-gray-500" />
                {profile.location}
              </span>
            )}
            {profile.memberSince && (
              <span className="flex items-center gap-1.5">
                <NavIcon icon="/icons/calendar-03.svg" size={13} className="bg-gray-500" />
                Joined {monthYear(profile.memberSince)}
              </span>
            )}
          </div>
        </div>
        {profile.bio && <p className="whitespace-pre-line text-sm leading-5 text-[#334155]">{profile.bio}</p>}
      </div>
    </header>
  );
}

function PostsTab({ profile, feed }: { profile: Profile; feed: ReturnType<typeof useProfile>["feed"] }) {
  const { posts, isPending, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = feed;

  return (
    <div className="flex flex-col gap-4">
      {isPending && (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      )}
      {isError && <p className="text-sm text-gray-500">Posts could not be loaded. Please try again.</p>}
      {!isPending && !isError && posts.length === 0 && (
        <EmptyState
          size="section"
          icon="chat"
          title="No posts yet"
          body={profile.own ? "Share an update, a listing or a question and it will show up here." : `${profile.name} has not posted anything yet.`}
          primary={profile.own ? { label: "Go to your feed", href: "/feed" } : undefined}
        />
      )}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <PostCardSkeleton />}
      {hasNextPage && !isFetchingNextPage && (
        <button type="button" onClick={() => void fetchNextPage()} className="self-center py-2 text-[13px] font-bold text-brand-900">
          Load more
        </button>
      )}
    </div>
  );
}

function RoleRow({ capability }: { capability: Capability }) {
  const note = CAPABILITIES.find((item) => item.value === capability.capability)?.note;
  return (
    <li className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col">
        <span className="text-[13px] font-semibold text-[#0f172a]">{capabilityLabel(capability.capability)}</span>
        {capability.status === "Rejected" && capability.reviewReason ? (
          <span className="text-xs text-[#b45309]">{capability.reviewReason}</span>
        ) : (
          note && <span className="text-xs text-gray-500">{note}</span>
        )}
      </div>
      <span className={cn(PILL, "shrink-0", STATUS_TONES[capability.status] ?? "bg-[#f1f5f9] text-[#334155]")}>{capability.status}</span>
    </li>
  );
}

/** The professional or artisan side of a profile: what they do, where, how experienced and what they have built. */
function ProviderSection({ profile }: { profile: Profile }) {
  const provider = profile.provider;
  if (!provider) return null;
  const { professional, artisan } = provider;
  const kind = artisan.trade ? "artisans" : "professionals";
  const years = professional.yearsExperience ?? artisan.yearsExperience;
  const areas = [provider.city, ...(provider.serviceAreas ?? [])].filter(Boolean).join(", ");
  const specialities = [...(professional.specialisations ?? []), ...(artisan.skills ?? [])];

  return (
    <>
      <section className={CARD}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#0f172a]">{artisan.trade ? "Trade" : "Professional"} details</h2>
          {provider.isPublished ? (
            <Link href={`/${kind}/${provider.id}`} className="shrink-0 text-[13px] font-medium text-brand-900 hover:underline">
              View public page ›
            </Link>
          ) : (
            profile.own && <span className="text-xs text-gray-500">Not published yet</span>
          )}
        </div>
        {provider.credentialWarning && <p className="rounded-xl bg-[#fef3c7] p-3 text-[13px] leading-[19px] text-[#b45309]">{provider.credentialWarning}</p>}
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {professional.profession && (
            <Fact label="Profession">
              {professional.profession}
              {professional.firmName ? ` · ${professional.firmName}` : ""}
            </Fact>
          )}
          {artisan.trade && (
            <Fact label="Trade">
              {artisan.trade}
              {artisan.isBusiness ? ` · crew of ${artisan.crewSize ?? 1}` : ""}
            </Fact>
          )}
          {years !== null && years !== undefined && <Fact label="Years of experience">{years}</Fact>}
          {professional.registrationBody && <Fact label="Registered with">{professional.registrationBody}</Fact>}
          {profile.own && professional.registrationNumber && <Fact label="Registration number (only you see this)">{professional.registrationNumber}</Fact>}
          {areas && (
            <Fact label="Works in">
              {areas}
              {provider.serviceRadiusKm ? ` · up to ${provider.serviceRadiusKm} km` : ""}
            </Fact>
          )}
          {artisan.pricing && <Fact label="Pricing">{artisan.pricing}</Fact>}
          <Fact label="Urgent jobs">{provider.urgentAvailable ? "Takes urgent jobs" : "Not available for urgent jobs"}</Fact>
          {provider.publishedServices > 0 && <Fact label="Services offered">{provider.publishedServices}</Fact>}
        </dl>
        {specialities.length > 0 && <Chips items={specialities} />}
        {(provider.categories ?? []).length > 0 && <Chips items={provider.categories ?? []} />}
      </section>

      {(provider.portfolio ?? []).length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-[#0f172a]">Past work</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {provider.portfolio?.map((item) => (
              <PortfolioCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function AboutTab({ profile }: { profile: Profile }) {
  const { organisation, contact } = profile;
  const hasDetails = Boolean(profile.provider) || profile.own;

  return (
    <div className="flex flex-col gap-4">
      <section className={CARD}>
        <h2 className="text-base font-bold text-[#0f172a]">About</h2>
        {profile.bio ? <p className="whitespace-pre-line text-sm leading-5 text-[#334155]">{profile.bio}</p> : <p className="text-sm text-gray-500">{profile.own ? "Add a short bio in your profile settings so people know who you are." : `${profile.name} has not written a bio yet.`}</p>}
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {profile.location && <Fact label="Location">{profile.location}</Fact>}
          {profile.memberSince && <Fact label="Member since">{monthYear(profile.memberSince)}</Fact>}
          <Fact label="Identity">{profile.verified ? "Verified ✓" : "Not verified yet"}</Fact>
          {profile.organizationName && <Fact label="Organisation">{profile.organizationName}</Fact>}
        </dl>
      </section>

      {profile.own && profile.capabilities.length > 0 && (
        <section className={CARD}>
          <h2 className="text-base font-bold text-[#0f172a]">Your roles</h2>
          <ul className="flex flex-col gap-3">
            {profile.capabilities.map((capability) => (
              <RoleRow key={capability.id} capability={capability} />
            ))}
          </ul>
        </section>
      )}

      <ProviderSection profile={profile} />

      {profile.own && (contact || organisation) && (
        <section className={CARD}>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-[#0f172a]">Contact and organisation</h2>
            <p className="text-xs text-gray-500">Only you can see this. Other people reach you through Message.</p>
          </div>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {contact?.email && <Fact label="Email">{contact.email}</Fact>}
            {contact?.phone && <Fact label="Phone">{contact.phone}</Fact>}
            {contact?.other && <Fact label="Other contact">{contact.other}</Fact>}
            {organisation && <Fact label="Organisation">{organisation.name}</Fact>}
            {organisation && <Fact label="Organisation status">{organisation.status}</Fact>}
          </dl>
        </section>
      )}

      {!hasDetails && <p className="text-[13px] leading-[19px] text-gray-500">More about {profile.name}, like their work and credentials, shows here once it has been shared.</p>}
    </div>
  );
}

/** A person's profile (opened from their name on posts, comments, reels and messages): who they are, how to reach them, what they do and what they have posted. */
export function ProfileView({ id, providerId }: { id: string; providerId?: string }) {
  const router = useRouter();
  const { profile, loading: loadingProfile, feed } = useProfile(id, providerId);
  const [tab, setTab] = useState<TabKey>("posts");
  // A professional or artisan has their own page, which is where their name should lead; this page is for everyone else.
  const dedicated = useProviderPage(id, [profile?.name, profile?.organizationName], Boolean(profile) && !profile?.own);
  const toDedicatedPage = dedicated.data ?? null;
  const loading = loadingProfile || dedicated.isPending && dedicated.fetchStatus !== "idle" || toDedicatedPage !== null;

  useEffect(() => {
    if (toDedicatedPage) router.replace(toDedicatedPage);
  }, [toDedicatedPage, router]);

  return (
    <AppShell activeKey="you" contentFullWidth>
      <PageContainer>
        {loading && <Skeleton className="h-72 w-full rounded-2xl" />}
        {!loading && !profile && (
          <EmptyState
            icon="communities"
            title="We can’t show this profile yet"
            body="This person has no public details or posts to show right now."
            primary={{ label: "Back to your feed", href: "/feed" }}
          />
        )}
        {profile && !loading && (
          <>
            <Breadcrumbs crumbs={[{ label: "Home", href: "/feed" }, { label: profile.own ? "Your profile" : profile.name }]} />
            <ProfileHeader profile={profile} />
            <div role="tablist" aria-label="Profile sections" className="flex border-b border-gray-200">
              {TABS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.key}
                  onClick={() => setTab(item.key)}
                  className={cn(
                    "-mb-px border-b-2 px-4 py-2.5 text-[13px] leading-[19px]",
                    tab === item.key ? "border-brand-900 font-semibold text-brand-900" : "border-transparent font-medium text-gray-500 hover:text-[#0f172a]",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {tab === "posts" ? <PostsTab profile={profile} feed={feed} /> : <AboutTab profile={profile} />}
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
