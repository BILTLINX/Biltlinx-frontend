import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The right-hand column of a detail page. It stacks full width on phones, lays its cards out two across on tablets
 * (an odd last card spans both) and becomes a sticky column from `xl`. Pass the column width as `className`, e.g.
 * `xl:w-[360px]`, so Tailwind sees the class. `single` keeps one column at every width, so every card is the same width.
 */
export function DetailAside({ children, className, single }: { children: ReactNode; className?: string; single?: boolean }) {
  return (
    <aside
      className={cn(
        "flex w-full flex-col gap-4",
        single && "items-stretch [&>*]:w-full",
        !single && "md:grid md:grid-cols-2 md:items-start md:[&>:last-child:nth-child(odd)]:col-span-2",
        "xl:sticky xl:top-0 xl:flex xl:shrink-0 xl:items-stretch xl:self-start",
        className,
      )}
    >
      {children}
    </aside>
  );
}
