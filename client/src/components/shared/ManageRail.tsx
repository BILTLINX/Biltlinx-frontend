"use client";

import { useRouter } from "next/navigation";
import { NavIcon } from "@/components/shared/NavIcon";
import { comingSoonHref } from "@/lib/coming-soon";
import { ATTENTION_ITEMS, WORKSPACES } from "@/lib/dummy-manage";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

/** Manage side cards (Figma node 1044:22703): what needs the owner's attention and the workspaces they can switch to. */
export function ManageRail() {
  const router = useRouter();
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <div className="flex w-full flex-col gap-4">
      <section className={CARD}>
        <h2 className="text-base font-bold leading-[23px] text-[#0f172a]">Needs your attention</h2>
        {ATTENTION_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={comingSoon(item.action)}
            className="flex flex-col items-start gap-1.5 rounded-xl bg-[#f8fafc] p-3 text-left hover:bg-[#f1f5f9]"
          >
            <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{item.title}</span>
            <span className="text-xs leading-[17px] text-gray-500">{item.note}</span>
            <span className="text-xs font-medium leading-[17px] text-brand-900">{item.action} ›</span>
          </button>
        ))}
      </section>

      <section className={`${CARD} gap-2.5`}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Your workspaces</h2>
        {WORKSPACES.map((workspace) => (
          <button key={workspace.id} type="button" onClick={comingSoon("Switch workspace")} className="flex items-center gap-2.5 text-left">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f5f9]">
              <NavIcon icon="/icons/user-circle.svg" size={20} className="bg-[#334155]" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-semibold leading-[19px] text-[#0f172a]">{workspace.name}</span>
              <span className="truncate text-xs leading-[17px] text-gray-500">{workspace.note}</span>
            </span>
          </button>
        ))}
      </section>
    </div>
  );
}
