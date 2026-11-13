"use client";

import Image from "next/image";
import Link from "next/link";
import { formatRelative } from "@/lib/format";
import type { SavedItem } from "@/lib/saved-items";

/** One saved item: thumbnail that opens it, what it is, its price, when it was saved, and a way to remove it. */
export function SavedItemRow({ item, onRemove }: { item: SavedItem; onRemove: () => void }) {
  return (
    <article className="flex items-center gap-3.5 rounded-2xl border border-gray-200 bg-white p-3 hover:border-gray-300">
      <Link href={item.href} aria-label={`Open ${item.title}`} className="relative block size-[72px] shrink-0 overflow-hidden rounded-[10px] bg-[#eef2ff]">
        <Image src={item.image} alt="" fill unoptimized className="object-cover" sizes="72px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-medium leading-4 text-[#334155]">{item.kind}</span>
        <Link href={item.href} className="line-clamp-2 text-sm font-semibold leading-5 text-[#0f172a] hover:text-brand-900 hover:underline">
          {item.title}
        </Link>
        <p className="line-clamp-1 text-xs leading-[17px] text-gray-500">{[item.subtitle, item.price].filter(Boolean).join(" · ")}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-xs leading-[17px] text-gray-500">Saved {formatRelative(item.savedAt)}</span>
        <button type="button" onClick={onRemove} className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-[#334155] hover:bg-gray-50">
          Remove
        </button>
      </div>
    </article>
  );
}
