"use client";

import { useRouter } from "next/navigation";
import { NavIcon } from "@/components/shared/NavIcon";
import { comingSoonHref } from "@/lib/coming-soon";
import { SAVED_SEARCHES } from "@/lib/dummy-saved";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

/** Saved side cards (Figma node 1046:22763): saved searches with alert frequency, and a privacy note. */
export function SavedRail() {
  const router = useRouter();
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <div className="flex w-full flex-col gap-4">
      <section className={CARD}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Saved searches &amp; alerts</h2>
          <button type="button" onClick={comingSoon("Saved searches")} className="shrink-0 whitespace-nowrap text-[13px] font-medium text-brand-900">
            Manage ›
          </button>
        </div>
        {SAVED_SEARCHES.map((search) => (
          <div key={search.id} className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{search.label}</p>
              <p className="text-xs leading-[17px] text-gray-500">{search.frequency}</p>
            </div>
            <button
              type="button"
              onClick={comingSoon("Search alerts")}
              aria-label={`Alert settings for ${search.label}`}
              className="flex size-[18px] shrink-0 items-center justify-center"
            >
              <NavIcon icon="/icons/post-options-mute.svg" size={15} className="bg-brand-900" />
            </button>
          </div>
        ))}
      </section>

      <section className={`${CARD} gap-2`}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Saving is private</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Owners and providers are not told when you save their listing. Share a collection only if you choose to.
        </p>
      </section>
    </div>
  );
}
