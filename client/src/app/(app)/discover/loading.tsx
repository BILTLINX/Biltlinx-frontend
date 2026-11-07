import { AppShell } from "@/components/shared/AppShell";
import { DiscoverReelCardSkeleton } from "@/components/shared/DiscoverReelCardSkeleton";
import { TopNav } from "@/components/shared/TopNav";
import { Skeleton } from "@/components/ui/Skeleton";

// Overrides the shared `(app)/loading.tsx` for this route specifically —
// Discover shows the standard TopNav only from `xl:` up (see page.tsx), so the generic fallback
// would otherwise flash it on mobile. Uses the same shell options as the real page
// (full-width, no padding, nav bar hidden below `xl:`) so nothing shifts.
export default function DiscoverLoading() {
  return (
    <AppShell
      topNav={
        <div className="hidden shrink-0 xl:block">
          <TopNav />
        </div>
      }
      rightRail={
        <div className="flex h-full w-[59px] flex-col items-center gap-[16px] border-l border-gray-200 bg-white py-[24px]">
          <Skeleton className="size-[32px] rounded-full" />
          <Skeleton className="size-[32px] rounded-full" />
          <Skeleton className="size-[32px] rounded-full" />
          <Skeleton className="size-[32px] rounded-full" />
          <Skeleton className="size-[32px] rounded-full" />
          <Skeleton className="size-[48px] rounded-full" />
        </div>
      }
      rightRailBare
      contentFullWidth
      contentPadding="px-0 pb-0"
    >
      <DiscoverReelCardSkeleton />
    </AppShell>
  );
}
