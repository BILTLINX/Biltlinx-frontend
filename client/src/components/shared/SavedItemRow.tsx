"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import type { SavedItem } from "@/lib/dummy-saved";
import { cn } from "@/lib/utils";

/** One saved item (Figma node 1046:22819): thumbnail, kind, title and price, an optional alert, and a move action. */
export function SavedItemRow({ item }: { item: SavedItem }) {
  const router = useRouter();

  return (
    <article className="flex flex-wrap items-center gap-x-3.5 gap-y-3 rounded-2xl border border-gray-200 bg-white p-3">
      <span className="relative block size-[72px] shrink-0 overflow-hidden rounded-[10px] bg-[#eef2ff]">
        <Image src={item.image} alt="" fill className="object-cover" sizes="72px" />
      </span>
      <div className="flex min-w-[160px] flex-1 flex-col items-start gap-1">
        <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-medium leading-4 text-[#334155]">
          {item.kind}
        </span>
        <h3 className="text-sm font-semibold leading-5 text-[#0f172a]">{item.title}</h3>
        <p className="text-[13px] font-medium leading-[19px] text-[#334155]">{item.price}</p>
      </div>
      {item.status && (
        <span
          className={cn(
            "shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium leading-4",
            item.status.tone === "good" ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fee2e2] text-[#dc2626]",
          )}
        >
          {item.status.label}
        </span>
      )}
      <Button
        variant="outline"
        onClick={() => router.push(comingSoonHref("Move saved item"))}
        className="h-9 w-auto shrink-0 whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]"
      >
        Move to…
      </Button>
    </article>
  );
}
