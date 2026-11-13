"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { showSuccessToast } from "@/components/shared/AppToast";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterDropdown } from "@/components/shared/FilterDropdown";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { SavedItemRow } from "@/components/shared/SavedItemRow";
import { SavedRail } from "@/components/shared/SavedRail";
import { SearchEmpty } from "@/components/shared/SearchEmpty";
import { Button } from "@/components/ui/Button";
import { useSearchTerm } from "@/context/SearchContext";
import { useSavedCollections, useSavedItems } from "@/hooks/useSaved";
import { SAVED_FILTERS, type SavedCollection, type SavedFilter, type SavedItem } from "@/lib/saved-items";
import { cn } from "@/lib/utils";

const SECTION_TITLE = "text-base font-bold leading-[23px] text-[#0f172a]";

/** A collection as a card: the newest item's picture, its name and how much is in it. Picking it shows only its items. */
function CollectionCard({ collection, items, active, onSelect }: { collection: SavedCollection; items: SavedItem[]; active: boolean; onSelect: () => void }) {
  const cover = items[0]?.image;
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={cn("flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-white text-left", active ? "border-brand-900" : "border-gray-200 hover:border-gray-300")}
    >
      <span className="relative block h-[120px] w-full bg-[#eef2ff]">
        {cover ? (
          <Image src={cover} alt="" fill unoptimized className="object-cover" sizes="(min-width: 768px) 25vw, 50vw" />
        ) : (
          <span className="flex size-full items-center justify-center">
            <NavIcon icon="/icons/folder-01.svg" size={28} className="bg-[#94a3b8]" />
          </span>
        )}
      </span>
      <span className="flex w-full flex-col gap-0.5 p-3">
        <span className="truncate text-sm font-semibold leading-5 text-[#0f172a]">{collection.name}</span>
        <span className="text-xs leading-[17px] text-gray-500">
          {items.length} {items.length === 1 ? "item" : "items"} · Private
        </span>
      </span>
    </button>
  );
}

function NewCollectionDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState("");
  const trimmed = name.trim();

  return (
    <CenteredDialog open onClose={onClose} labelledBy="new-collection-title" className="max-w-[440px]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (trimmed) onCreate(trimmed);
        }}
        className="flex flex-col gap-3 p-6"
      >
        <h2 id="new-collection-title" className="text-lg font-bold text-[#0f172a]">
          New collection
        </h2>
        <p className="text-sm text-gray-500">Group what you saved, like “Homes in East Legon”. Only you can see your collections.</p>
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={40}
          aria-label="Collection name"
          placeholder="Collection name"
          className="h-12 min-w-0 rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#0f172a] focus:border-brand-900 focus:outline-none"
        />
        <div className="flex justify-end gap-2.5">
          <button type="button" onClick={onClose} className="h-10 rounded-[10px] border border-gray-200 px-4 text-sm font-medium">
            Cancel
          </button>
          <button type="submit" disabled={!trimmed} className="h-10 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white disabled:opacity-60">
            Create
          </button>
        </div>
      </form>
    </CenteredDialog>
  );
}

export default function SavedPage() {
  const { items, remove } = useSavedItems();
  const { collections, create, move, remove: deleteCollection } = useSavedCollections();
  const [filter, setFilter] = useState<SavedFilter>("All");
  const [collectionId, setCollectionId] = useState<string | null>(null);
  // The "New collection" dialog; `item` is the saved item to move into the collection once it exists.
  const [creating, setCreating] = useState<{ item?: SavedItem } | null>(null);
  const term = useSearchTerm();

  // Only the types you have saved something of are offered, so there are no dead ends.
  const types = useMemo(() => SAVED_FILTERS.filter((key) => key === "All" || items.some((item) => item.type === key)), [items]);
  const active = types.includes(filter) ? filter : "All";
  const collection = collections.find((entry) => entry.id === collectionId);
  const shown = useMemo(
    () =>
      items.filter(
        (item) =>
          (active === "All" || item.type === active) &&
          (!collection || item.collectionId === collection.id) &&
          (!term || `${item.title} ${item.kind} ${item.subtitle ?? ""}`.toLowerCase().includes(term)),
      ),
    [items, active, collection, term],
  );

  function createCollection(name: string) {
    const created = create(name);
    if (creating?.item) move(creating.item, created);
    else showSuccessToast("Collection created. Use “Move to…” on a saved item to add to it.");
    setCreating(null);
  }

  return (
    <AppShell activeKey="you" activeChildKey="saved" contentFullWidth rightRail={<SavedRail />}>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Saved</h1>
            <p className="text-sm leading-5 text-gray-500">Everything you saved, in one private place. Only you can see it.</p>
          </div>
          {items.length > 0 && (
            <Button variant="primary" onClick={() => setCreating({})} className="h-10 shrink-0 rounded-[10px] px-4 sm:w-auto lg:rounded-[10px]">
              New collection
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon="bookmark"
            title="Nothing saved yet"
            body="Tap the bookmark on a listing, post or reel and it will be kept here, ready when you want it."
            primary={{ label: "Browse properties", href: "/properties" }}
            secondary={{ label: "Explore the marketplace", href: "/marketplace" }}
          />
        ) : (
          <>
            <FilterDropdown label="Type" value={active} onChange={(value) => setFilter(value as SavedFilter)} options={types.map((type) => ({ value: type, label: type }))} />

            {/* As in the design, the headings, the collections and each saved item sit straight in the page column, evenly spaced. */}
            {collections.length > 0 && (
              <>
                <h2 className={SECTION_TITLE}>Collections</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {collections.map((entry) => (
                    <CollectionCard
                      key={entry.id}
                      collection={entry}
                      items={items.filter((item) => item.collectionId === entry.id)}
                      active={entry.id === collection?.id}
                      onSelect={() => setCollectionId(entry.id === collection?.id ? null : entry.id)}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <h2 className={SECTION_TITLE}>{collection ? collection.name : "Recently saved"}</h2>
              {collection && (
                <div className="flex items-center gap-4 text-[13px] font-medium leading-[19px]">
                  <button type="button" onClick={() => setCollectionId(null)} className="text-brand-900 hover:underline">
                    Show all saved
                  </button>
                  <button type="button" onClick={() => deleteCollection(collection)} className="text-[#dc2626] hover:underline">
                    Delete collection
                  </button>
                </div>
              )}
            </div>
            {shown.map((item) => (
              <SavedItemRow
                key={item.key}
                item={item}
                collections={collections}
                onMove={(target) => move(item, target)}
                onNewCollection={() => setCreating({ item })}
                onRemove={() => remove(item)}
              />
            ))}
            {shown.length === 0 && (term ? <SearchEmpty noun="saved items" /> : <p className="text-sm leading-5 text-gray-500">Nothing here yet. Use “Move to…” on a saved item to add it to this collection.</p>)}
          </>
        )}

        <div className="xl:hidden">
          <SavedRail />
        </div>
      </PageContainer>
      {creating && <NewCollectionDialog onClose={() => setCreating(null)} onCreate={createCollection} />}
    </AppShell>
  );
}
