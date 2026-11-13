"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { PostOptionsMenu, type PostOptionsGroup } from "@/components/shared/PostOptionsMenu";
import type { SavedCollection, SavedItem } from "@/lib/saved-items";

interface SavedItemRowProps {
  item: SavedItem;
  collections: SavedCollection[];
  /** Called without a collection to take the item out of the one it is in. */
  onMove: (collection?: SavedCollection) => void;
  onNewCollection: () => void;
  onRemove: () => void;
}

/** One saved item (Figma node 1046:22570): thumbnail that opens it, what it is, its price, and a "Move to…" menu that files it under a collection or removes it. */
export function SavedItemRow({ item, collections, onMove, onNewCollection, onRemove }: SavedItemRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const current = collections.find((collection) => collection.id === item.collectionId);
  const line = item.price ?? item.subtitle;

  const groups: PostOptionsGroup[] = [
    [
      ...collections
        .filter((collection) => collection.id !== current?.id)
        .map((collection) => ({ key: collection.id, icon: "/icons/folder-01.svg", iconSize: 16, label: collection.name, onSelect: () => onMove(collection) })),
      { key: "new", icon: "/icons/add-alt.svg", iconSize: 16, label: "New collection…", onSelect: onNewCollection },
    ],
    [
      ...(current ? [{ key: "out", icon: "/icons/poll-close-outline.svg", iconSize: 15, label: `Remove from “${current.name}”`, onSelect: () => onMove() }] : []),
      { key: "remove", icon: "/icons/poll-trash-delete.svg", iconSize: 15, label: "Remove from saved", destructive: true, onSelect: onRemove },
    ],
  ];

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
        {line && <p className="line-clamp-1 text-[13px] font-medium leading-[19px] text-[#334155]">{line}</p>}
      </div>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
        className="h-9 shrink-0 whitespace-nowrap rounded-[10px] border border-gray-200 bg-white px-4 text-sm font-medium text-[#0f172a] hover:bg-gray-50"
      >
        Move to…
      </button>
      <PostOptionsMenu open={menuOpen} onClose={() => setMenuOpen(false)} anchorRef={trigger} groups={groups} />
    </article>
  );
}
