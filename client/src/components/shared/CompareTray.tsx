"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ComparePicker } from "@/components/shared/ComparePicker";
import { COMPARE_KIND_PLURAL, MAX_COMPARE, useCompare } from "@/context/CompareContext";

const BROWSE_ROUTES = ["/home", "/feed", "/discover", "/post", "/marketplace", "/properties", "/stay", "/professionals", "/artisans", "/compare"];

/**
 * The compare tray (Figma node 1054:33396). It rises from the bottom of the screen once something is added to compare,
 * grows by one card for every addition (photo, title and price, with an ✕ to remove it) up to four, and goes away when
 * the last one is removed. On narrow screens the cards scroll sideways inside the tray.
 */
export function CompareTray() {
  const router = useRouter();
  const pathname = usePathname();
  const { items, remove, clear } = useCompare();
  const [pickerOpen, setPickerOpen] = useState(false);
  const addRef = useRef<HTMLButtonElement | null>(null);

  const browsing = BROWSE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  useEffect(() => {
    if (!browsing) clear();
  }, [browsing, clear]);

  const visible = items.length > 0 && browsing && pathname !== "/compare";

  useEffect(() => {
    if (!visible) return;
    const root = document.documentElement;
    root.style.setProperty("--compare-tray-space", "7rem");
    return () => {
      root.style.removeProperty("--compare-tray-space");
    };
  }, [visible]);

  if (!visible) return null;

  const plural = COMPARE_KIND_PLURAL[items[0].kind];
  const canCompare = items.length >= 2;
  const room = MAX_COMPARE - items.length;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-3 lg:bottom-5">
      <section
        aria-label={`${plural} to compare`}
        className="pointer-events-auto flex max-w-full animate-tray-rise flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-[0px_12px_32px_0px_rgba(0,0,0,0.16)] sm:flex-row sm:items-center"
      >
        <div className="flex items-center justify-between gap-3 sm:contents">
          <p className="shrink-0 whitespace-nowrap text-sm font-bold leading-5 text-[#0f172a]">Compare {plural}</p>
          <button
            type="button"
            disabled={!canCompare}
            onClick={() => router.push("/compare")}
            className="h-11 shrink-0 whitespace-nowrap rounded-[10px] bg-brand-900 px-[18px] text-sm font-medium text-white hover:bg-brand-900/90 disabled:cursor-not-allowed disabled:opacity-50 sm:order-last"
          >
            Compare {items.length}
          </button>
        </div>

        <ul className="no-scrollbar flex min-w-0 items-center gap-3 overflow-x-auto">
          {items.map((item) => (
            <li key={item.id} className="flex shrink-0 animate-chip-pop items-center gap-2 rounded-[10px] border border-gray-200 p-1.5">
              <button
                type="button"
                onClick={item.href ? () => router.push(item.href!) : undefined}
                aria-label={`Open ${item.title}`}
                className="flex items-center gap-2 text-left"
              >
                <span className="relative block size-10 shrink-0 overflow-hidden rounded-lg bg-[#eef2ff]">
                  <Image src={item.image} alt="" fill className="object-cover" sizes="40px" />
                </span>
                <span className="flex flex-col text-xs leading-[17px]">
                  <span className="whitespace-nowrap font-semibold text-[#0f172a]">{item.title}</span>
                  <span className="whitespace-nowrap text-gray-500">{item.price}</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.title} from compare`}
                className="shrink-0 px-1 text-xs font-medium leading-[17px] text-[#94a3b8] hover:text-[#dc2626]"
              >
                ✕
              </button>
            </li>
          ))}
          {room > 0 && (
            <li className="shrink-0">
              <button
                ref={addRef}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={pickerOpen}
                onClick={() => setPickerOpen((open) => !open)}
                className="flex h-[52px] items-center justify-center whitespace-nowrap rounded-[10px] border border-dashed border-[#cbd5e1] px-3 text-xs font-medium leading-[17px] text-gray-500 hover:border-brand-900 hover:text-brand-900"
              >
                + Add {room} more
              </button>
            </li>
          )}
        </ul>
      </section>

      <ComparePicker open={pickerOpen && room > 0} onClose={() => setPickerOpen(false)} triggerRef={addRef} kind={items[0].kind} />
    </div>
  );
}
