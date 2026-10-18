import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The centered column every content page sits in, inside AppShell's `contentFullWidth` area. It caps the width
 * (widening on very large monitors, like the feed does) and sets the vertical rhythm, so each page doesn't
 * repeat — and drift from — the same layout classes.
 */
export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[1100px] flex-col gap-5 pt-[15px] sm:gap-6 sm:pt-[23px] 4xl:max-w-[1280px] 5xl:max-w-[1440px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
