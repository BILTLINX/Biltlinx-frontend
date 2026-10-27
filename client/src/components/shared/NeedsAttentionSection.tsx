"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useActionNeeded } from "@/hooks/useActionNeeded";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { toActionCard, type ActionCardData } from "@/lib/action-needed";
import { errorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

// A faint tint that gradually brightens toward the middle and back down, so
// the sweep reads as a soft traveling glow rather than a hard-edged dash.
const BORDER_GRADIENT =
  "linear-gradient(90deg, rgba(84,51,255,0.15) 0%, rgba(84,51,255,0.3) 20%, #5433ff 40%, #1465e6 50%, rgba(20,101,230,0.3) 60%, rgba(20,101,230,0.15) 80%, rgba(84,51,255,0.15) 100%)";

const MAX_CARDS = 6;

function chunkPairs<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return rows;
}

/** "/home" dashboard section fed by GET /account/action-needed — the highest
 * priority items from every module. On mobile every card sits in a single
 * horizontally scrolling line; on desktop they pair up two-per-row, each pair
 * sharing one slow-moving gradient frame (a subtle "look here" cue) that
 * respects prefers-reduced-motion by holding still instead. */
export function NeedsAttentionSection() {
  const { data, isPending, isError, error, refetch } = useActionNeeded();
  const cards = (data ?? []).slice(0, MAX_CARDS).map(toActionCard);
  const rows = chunkPairs(cards);

  return (
    <section className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-bold text-night-900">Needs your attention</h2>
        <span className="flex items-center gap-1 text-[11px] text-gray-400">
          Only you can see this
          <NavIcon icon="/icons/create-menu2-lock-key.svg" color="night" size={10} className="shrink-0" />
        </span>
      </div>

      {isPending && <Skeleton className="h-[170px] w-full rounded-[22px]" />}

      {isError && (
        <div className="flex flex-col items-start gap-2 rounded-[14px] border border-gray-200 bg-gray-50 p-5">
          <p className="text-sm text-gray-700">{errorMessage(error, "We couldn't load this right now.")}</p>
          <button type="button" onClick={() => void refetch()} className="text-sm font-medium text-brand-900 hover:underline">
            Try again
          </button>
        </div>
      )}

      {!isPending && !isError && cards.length === 0 && (
        <EmptyState
          size="section"
          mood="celebrate"
          title="You’re all caught up"
          body="Nothing needs you right now. Rent reminders, repairs and expiring documents will show up here when they do."
          primary={{ label: "Open Manage", href: "/manage" }}
        />
      )}

      {cards.length > 0 && (
        <>
          <div className="sm:hidden">
            <GradientRow>
              {cards.map((card, index) => (
                <AttentionCard key={card.key} item={card} primary={index === 0} />
              ))}
            </GradientRow>
          </div>

          <div className="hidden w-full flex-col gap-3 sm:flex">
            {rows.map((row, rowIndex) => (
              <GradientRow key={row[0].key}>
                {row.map((card, index) => (
                  <AttentionCard key={card.key} item={card} primary={rowIndex === 0 && index === 0} />
                ))}
                {row.length === 1 && <div className="flex-1" aria-hidden="true" />}
              </GradientRow>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function GradientRow({ children }: { children: ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className="w-full rounded-[29.5px] p-[1.5px] sm:rounded-[22px]"
      style={{ backgroundImage: BORDER_GRADIENT, backgroundSize: "300% 100%" }}
      animate={prefersReducedMotion ? undefined : { backgroundPositionX: ["0%", "100%", "0%"] }}
      transition={prefersReducedMotion ? undefined : { duration: 8, repeat: Infinity, ease: "linear" }}
    >
      <div className="no-scrollbar flex w-full items-stretch gap-2 overflow-x-auto rounded-[28px] bg-gray-50 p-3 sm:rounded-[21px]">
        {children}
      </div>
    </motion.div>
  );
}

function AttentionCard({ item, primary }: { item: ActionCardData; primary?: boolean }) {
  return (
    <div className="flex w-[270px] shrink-0 flex-col gap-4 rounded-[14px] border border-gray-200 bg-gray-50 p-5 sm:w-auto sm:flex-1 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-900/10">
          <NavIcon icon={item.icon} color="brand" size={16} />
        </span>
        <p className="text-[16px] font-bold tracking-tight text-night-900">{item.module}</p>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <p className="text-[16px] font-bold tracking-tight text-night-900">{item.title}</p>
        <p className="text-[12px] text-gray-700">{item.detail}</p>
      </div>

      <Link
        href={item.href}
        className={cn(
          "flex h-10 w-full items-center justify-center rounded-full text-[13px] font-medium",
          // Desktop (Figma node 755:34636): 8px-radius rectangle, Inter Regular 14/20, 16×10 padding.
          "lg:gap-2 lg:rounded-lg lg:px-4 lg:py-2.5 lg:font-inter lg:text-sm lg:font-normal lg:leading-5",
          primary
            ? "bg-brand-900 text-white hover:bg-brand-900/90"
            : "border border-gray-200 text-night-900 hover:bg-gray-50",
        )}
      >
        {item.label}
      </Link>
    </div>
  );
}
