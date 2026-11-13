"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/** The page numbers to show: first, last and a window around the current page, with gaps as null. */
function pageList(page: number, totalPages: number) {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const numbers = [...wanted].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  return numbers.flatMap((n, i) => (i > 0 && n - numbers[i - 1] > 1 ? [null, n] : [n]));
}

const BASE = "flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-[13px] font-medium";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

/** Previous / numbered / next controls for a paged list. Renders nothing when there is only one page. */
export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  const ref = useRef<HTMLElement>(null);
  if (totalPages <= 1) return null;

  function go(next: number) {
    onChange(next);
    // The app scrolls inside a panel, not the window, so bring that panel back to the top of the results.
    let node = ref.current?.parentElement ?? null;
    while (node && !/auto|scroll/.test(getComputedStyle(node).overflowY)) node = node.parentElement;
    (node ?? window).scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <nav ref={ref} aria-label="Pagination" className={cn("flex flex-wrap items-center justify-center gap-1.5", className)}>
      <button type="button" disabled={page <= 1} onClick={() => go(page - 1)} className={cn(BASE, "border-gray-200 bg-white text-[#334155] hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40")}>
        Previous
      </button>
      {pageList(page, totalPages).map((n, i) =>
        n === null ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            aria-current={n === page ? "page" : undefined}
            aria-label={`Page ${n}`}
            onClick={() => go(n)}
            className={cn(BASE, n === page ? "border-brand-900 bg-brand-900 text-white" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50")}
          >
            {n}
          </button>
        ),
      )}
      <button type="button" disabled={page >= totalPages} onClick={() => go(page + 1)} className={cn(BASE, "border-gray-200 bg-white text-[#334155] hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40")}>
        Next
      </button>
    </nav>
  );
}
