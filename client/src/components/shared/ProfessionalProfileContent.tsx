"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { KeyFacts } from "@/components/shared/KeyFacts";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { PROFILE_TABS, type ProfessionalProfile, type ProfileTabKey } from "@/lib/dummy-professional-profile";
import { shareContent } from "@/lib/share";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

/** The left column of a professional's profile (Figma node 1052:24176): identity, key facts, tabs and the profile sections. */
export function ProfessionalProfileContent({ profile }: { profile: ProfessionalProfile }) {
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTabKey>("overview");
  const { professional } = profile;
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  function openTab(tab: ProfileTabKey) {
    if (tab === "posts") {
      router.push(comingSoonHref("Posts"));
      return;
    }
    setActiveTab(tab);
    const target = tab === "overview" ? "profile-top" : `profile-${tab}`;
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div id="profile-top" className="flex w-full min-w-0 flex-1 flex-col gap-5">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="relative block size-[72px] shrink-0 overflow-hidden rounded-full bg-[#eef2ff] sm:size-24">
          <Image src={professional.avatar} alt={professional.name} fill className="object-cover" sizes="96px" />
        </span>
        <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
          <h1 className="text-2xl font-bold leading-8 text-[#0f172a] sm:text-[26px] sm:leading-[34px]">{professional.name}</h1>
          <p className="text-[15px] font-medium leading-[22px] text-brand-900">{profile.subtitle}</p>
          <p className="flex items-start gap-1.5 text-[13px] leading-[19px] text-gray-500">
            <NavIcon icon="/icons/post-options-location.svg" size={13} className="mt-[3px] shrink-0 bg-gray-500" />
            <span>Osu, Accra · works across Greater Accra &amp; Eastern</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[...professional.badges, "Business verified ✓"].map((badge) => (
              <span key={badge} className="rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium leading-[14px] text-[#16a34a]">
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            onClick={() => setFollowing((v) => !v)}
            aria-pressed={following}
            className="h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px]"
          >
            {following ? "Following" : "Follow"}
          </Button>
          <Button
            variant="outline"
            onClick={() => shareContent({ title: professional.name, path: `#professional-${professional.id}` })}
            className="h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px]"
          >
            Share
          </Button>
        </div>
      </header>

      <KeyFacts facts={profile.keyFacts} />

      <div role="tablist" aria-label="Profile sections" className="no-scrollbar flex overflow-x-auto border-b border-gray-200">
        {PROFILE_TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => openTab(tab.key)}
              className={cn(
                "-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm leading-5",
                active ? "border-brand-900 font-semibold text-brand-900" : "border-transparent font-medium text-gray-500 hover:text-[#0f172a]",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">About</h2>
        <p className="text-sm leading-5 text-[#334155]">{profile.about}</p>
      </section>

      <section className={CARD}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Credentials &amp; registration</h2>
          <button type="button" onClick={comingSoon("How we check")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
            How we check ›
          </button>
        </div>
        {profile.credentials.map((credential) => (
          <div key={credential.id} className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl",
                credential.verified ? "bg-[#dcfce7]" : "bg-[#f1f5f9]",
              )}
            >
              <NavIcon
                icon="/icons/checkmark-badge-01.svg"
                size={17}
                className={credential.verified ? "bg-[#16a34a]" : "bg-[#64748a]"}
              />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-sm font-semibold leading-5 text-[#0f172a]">{credential.title}</p>
              <p className="text-xs leading-[17px] text-gray-500">{credential.note}</p>
            </div>
          </div>
        ))}
      </section>

      <section id="profile-services" className="flex scroll-mt-4 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Services &amp; prices</h2>
          <button type="button" onClick={comingSoon("All services")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
            All {profile.servicesTotal} services ›
          </button>
        </div>
        {profile.services.map((service) => (
          <div key={service.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex min-w-[180px] flex-1 flex-col gap-0.5">
              <p className="text-sm font-semibold leading-5 text-[#0f172a]">{service.title}</p>
              <p className="text-xs leading-[17px] text-gray-500">{service.unit}</p>
            </div>
            <p className="shrink-0 whitespace-nowrap text-[15px] font-bold leading-[22px] text-[#0f172a]">{service.price}</p>
            <Button
              variant="outline"
              onClick={comingSoon("View service")}
              className="h-9 w-auto shrink-0 rounded-[10px] px-4 lg:rounded-[10px]"
            >
              View
            </Button>
          </div>
        ))}
      </section>

      <section id="profile-portfolio" className="flex scroll-mt-4 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Portfolio</h2>
          <button type="button" onClick={comingSoon("Portfolio")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
            See all {profile.portfolioTotal} ›
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {profile.portfolio.map((item) => (
            <button key={item.id} type="button" onClick={comingSoon("Portfolio item")} className="flex min-w-0 flex-col gap-1.5 text-left">
              <span className="relative block h-[140px] w-full overflow-hidden rounded-xl bg-[#eef2ff]">
                <Image src={item.image} alt="" fill className="object-cover" sizes="(min-width: 640px) 240px, 100vw" />
              </span>
              <span className="truncate text-[13px] font-semibold leading-[19px] text-[#0f172a]">{item.title}</span>
            </button>
          ))}
        </div>
      </section>

      <section id="profile-reviews" className={`${CARD} scroll-mt-4`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">{profile.reviewsHeading}</h2>
          <button type="button" onClick={comingSoon("Reviews")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
            See all ›
          </button>
        </div>
        {profile.reviews.map((review) => (
          <div key={review.id} className="flex items-start gap-3">
            <span className="relative block size-9 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
              <Image src={review.avatar} alt="" fill className="object-cover" sizes="36px" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{review.author}</span>
                <span className="text-xs font-medium leading-[17px] text-[#f59e0b]" aria-label="5 stars">
                  ★★★★★
                </span>
              </p>
              <p className="text-[11px] font-medium leading-4 text-[#16a34a]">{review.context}</p>
              <p className="text-[13px] leading-[19px] text-[#334155]">{review.text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
