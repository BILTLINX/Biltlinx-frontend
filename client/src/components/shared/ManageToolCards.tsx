"use client";

import { useRouter } from "next/navigation";
import { NavIcon } from "@/components/shared/NavIcon";
import { comingSoonHref } from "@/lib/coming-soon";

export interface ManageTool {
  id: string;
  title: string;
  note: string;
  blurb: string;
  icon: string;
  /** Tools without a page yet go to the coming-soon page. */
  href?: string;
}

/** The "Your tools" grid on an overview page: one card per module with a count, a one-line blurb and an Open link. */
export function ManageToolCards({ tools }: { tools: readonly ManageTool[] }) {
  const router = useRouter();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool) => (
        <button
          key={tool.id}
          type="button"
          onClick={() => router.push(tool.href ?? comingSoonHref(tool.title))}
          className="flex min-w-0 flex-col items-start gap-2.5 rounded-2xl border border-gray-200 bg-white p-5 text-left hover:bg-gray-50"
        >
          <span className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eff5ff]">
              <NavIcon icon={tool.icon} size={20} className="bg-brand-900" />
            </span>
            <span className="flex flex-col">
              <span className="text-[15px] font-bold leading-[22px] text-[#0f172a]">{tool.title}</span>
              <span className="text-xs font-medium leading-[17px] text-brand-900">{tool.note}</span>
            </span>
          </span>
          <span className="text-[13px] leading-[19px] text-gray-500">{tool.blurb}</span>
          <span className="text-[13px] font-medium leading-[19px] text-brand-900">Open ›</span>
        </button>
      ))}
    </div>
  );
}
