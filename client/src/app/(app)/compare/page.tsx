"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { ComparePicker } from "@/components/shared/ComparePicker";
import { PageContainer } from "@/components/shared/PageContainer";
import { RequestViewingModal } from "@/components/shared/RequestViewingModal";
import { Button } from "@/components/ui/Button";
import { COMPARE_KIND_PLURAL, MAX_COMPARE, useCompare, type CompareItem, type CompareKind } from "@/context/CompareContext";
import { comingSoonHref } from "@/lib/coming-soon";
import { bestCells, buildSpecRows, rowDiffers } from "@/lib/compare-specs";
import { shareContent } from "@/lib/share";
import { cn } from "@/lib/utils";

const NAV: Record<CompareKind, { key: string; child: string; addLabel: string; action: string }> = {
  home: { key: "property", child: "properties", addLabel: "Add a home", action: "Request viewing" },
  stay: { key: "property", child: "stay", addLabel: "Add a stay", action: "View stay" },
  project: { key: "property", child: "projects", addLabel: "Add a project", action: "View project" },
  professional: { key: "people", child: "professionals", addLabel: "Add a professional", action: "View profile" },
  artisan: { key: "people", child: "artisans", addLabel: "Add an artisan", action: "View profile" },
};

function Switch({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={onToggle} className="flex items-center gap-2">
      <span className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", checked ? "bg-brand-900" : "bg-[#cbd5e1]")}>
        <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", checked ? "left-[18px]" : "left-0.5")} />
      </span>
      <span className="whitespace-nowrap text-[13px] font-medium leading-[19px] text-[#334155]">{label}</span>
    </button>
  );
}

/** Compare homes (Figma node 1055:28243): what was picked in the tray, side by side, with the best value in each row marked. */
export default function ComparePage() {
  const router = useRouter();
  const { items, remove } = useCompare();
  const [onlyDifferences, setOnlyDifferences] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [viewing, setViewing] = useState<CompareItem | null>(null);
  const addRef = useRef<HTMLButtonElement | null>(null);

  const kind = items[0]?.kind ?? "home";
  const plural = COMPARE_KIND_PLURAL[kind];
  const nav = NAV[kind];

  if (items.length === 0) {
    return (
      <AppShell activeKey={nav.key} activeChildKey={nav.child} contentFullWidth>
        <PageContainer>
          <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Compare</h1>
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-8">
            <p className="text-sm leading-5 text-gray-500">Nothing to compare yet. Use “Add to compare” on a listing, a project or a provider to line them up here.</p>
            <Link href="/properties" className="text-sm font-medium text-brand-900">
              Browse properties ›
            </Link>
          </div>
        </PageContainer>
      </AppShell>
    );
  }

  const allRows = buildSpecRows(kind, items);
  const rows = onlyDifferences ? allRows.filter(rowDiffers) : allRows;
  const columns = { gridTemplateColumns: `220px repeat(${items.length}, minmax(240px, 1fr))` };

  function openItem(item: CompareItem) {
    if (item.kind === "home") setViewing(item);
    else router.push(item.href ?? comingSoonHref(nav.action));
  }

  return (
    <AppShell activeKey={nav.key} activeChildKey={nav.child} contentFullWidth>
      <PageContainer>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex min-w-[220px] flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Compare {plural}</h1>
            <p className="text-sm leading-5 text-gray-500">
              {items.length} {items.length === 1 ? plural.replace(/s$/, "") : plural} from your feed and saved list · differences highlighted
            </p>
          </div>
          <Switch checked={onlyDifferences} onToggle={() => setOnlyDifferences((value) => !value)} label="Only show differences" />
          <Button
            variant="outline"
            onClick={() => shareContent({ title: `Compare ${plural}`, text: `Compare ${plural} on Biltlinx`, path: "#compare" })}
            className="h-10 w-auto rounded-[10px] px-4 lg:rounded-[10px]"
          >
            Share
          </Button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <div className="min-w-max">
            <div className="grid" style={columns}>
              <div className="flex flex-col gap-2 p-4 text-[13px] leading-[19px]">
                <p className="font-medium text-gray-500">
                  {items.length} of {MAX_COMPARE} slots
                </p>
                {items.length < MAX_COMPARE && (
                  <button ref={addRef} type="button" onClick={() => setPickerOpen((open) => !open)} className="self-start font-semibold text-brand-900">
                    + {nav.addLabel}
                  </button>
                )}
              </div>
              {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 border-l border-gray-200 p-4">
                  <span className="relative block h-[150px] w-full overflow-hidden rounded-xl bg-[#eef2ff]">
                    <Image src={item.image} alt="" fill className="object-cover" sizes="320px" />
                  </span>
                  <p className="text-lg font-bold leading-[26px] text-[#0f172a]">{item.price}</p>
                  <p className="text-sm font-semibold leading-5 text-[#0f172a]">{item.title}</p>
                  {item.subtitle && <p className="text-xs leading-[17px] text-gray-500">{item.subtitle}</p>}
                  <div className="mt-auto flex gap-2 pt-1">
                    <Button variant="primary" onClick={() => openItem(item)} className="h-[38px] min-w-0 flex-1 whitespace-nowrap rounded-[10px] px-3 lg:rounded-[10px]">
                      {nav.action}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.title} from compare`}
                      className="h-[38px] w-auto shrink-0 rounded-[10px] px-4 lg:rounded-[10px]"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {rows.length === 0 && <p className="border-t border-gray-200 p-6 text-center text-sm text-gray-500">These {plural} match on everything we compare.</p>}
            {rows.map((row, rowIndex) => {
              const best = bestCells(row);
              return (
                <div key={row.label} className={cn("grid border-t border-gray-200", rowIndex % 2 === 0 && "bg-[#f8fafc]")} style={columns}>
                  <p className="px-4 py-3 text-[13px] font-medium leading-[19px] text-gray-500">{row.label}</p>
                  {row.cells.map((cell, index) => (
                    <div key={index} className="flex items-center gap-1.5 border-l border-gray-200 px-4 py-3">
                      <span className={cn("text-[13px] leading-[19px]", best.has(index) ? "font-semibold text-[#16a34a]" : "text-[#0f172a]")}>{cell.text}</span>
                      {best.has(index) && <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-[10px] font-medium leading-4 text-[#16a34a]">Best</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-3 rounded-xl bg-[#eff5ff] p-3.5">
          <p className="min-w-[220px] flex-1 text-[13px] font-medium leading-[19px] text-brand-900">
            Not sure which to pick? Concierge can arrange viewings for all {items.length === 3 ? "three" : items.length} on one day and send a surveyor.
          </p>
          <Button variant="primary" onClick={() => router.push("/concierge/new")} className="h-9 w-auto rounded-[10px] px-4 lg:rounded-[10px]">
            Ask Concierge
          </Button>
        </div>
      </PageContainer>

      <ComparePicker open={pickerOpen && items.length < MAX_COMPARE} onClose={() => setPickerOpen(false)} triggerRef={addRef} kind={kind} />
      {viewing && (
        <RequestViewingModal
          open
          onClose={() => setViewing(null)}
          property={{ id: viewing.id, title: viewing.title, summary: `${viewing.subtitle?.split(",")[0] ?? "Home"} · ${viewing.price}`, image: viewing.image }}
        />
      )}
    </AppShell>
  );
}
