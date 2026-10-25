"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { TopNav } from "@/components/shared/TopNav";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSE_KEY = "biltlinx:sidebar-collapsed";

// Module-scoped (not component state) so the user's manual collapse choice
// can be read via `useSyncExternalStore` — same pattern as `useMediaQuery` —
// instead of a `useState` + effect. That matters because every page mounts
// its own `AppShell` (there's no persistent layout): an effect-based read
// only applies a frame after the first paint, visibly flashing the sidebar
// from expanded to the real state on every navigation; `useSyncExternalStore`
// resolves the real value before that first paint, like `useMediaQuery`
// already does for the responsive breakpoint below.
let cachedSidebarOverride: boolean | null | undefined;
const sidebarOverrideListeners = new Set<() => void>();

function readSidebarOverride(): boolean | null {
  try {
    const stored = window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
    return stored === null ? null : stored === "true";
  } catch {
    return null;
  }
}

function getSidebarOverrideSnapshot(): boolean | null {
  if (cachedSidebarOverride === undefined) cachedSidebarOverride = readSidebarOverride();
  return cachedSidebarOverride;
}

function getSidebarOverrideServerSnapshot(): boolean | null {
  return null;
}

function subscribeToSidebarOverride(listener: () => void) {
  sidebarOverrideListeners.add(listener);
  return () => sidebarOverrideListeners.delete(listener);
}

function setSidebarOverride(next: boolean) {
  cachedSidebarOverride = next;
  try {
    window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(next));
  } catch {
    // Ignore — the toggle still works for this session, it just won't persist.
  }
  sidebarOverrideListeners.forEach((listener) => listener());
}

interface AppShellProps {
  activeKey?: string;
  activeChildKey?: string;
  /** Rendered above the scrollable body, outside the scroll container —
   * genuinely fixed in place rather than relying on `position: sticky`. */
  header?: ReactNode;
  /** Overrides the default `<TopNav>` in its exact slot — full width, above
   * the sidebar, stretching edge to edge — for screens with their own
   * navigation bar (e.g. Discover's search+filter bar) that should carry
   * the same position/sizing "effect" as the standard TopNav rather than
   * being confined to the main column like `header`. */
  topNav?: ReactNode;
  children: ReactNode;
  rightRail?: ReactNode;
  /** Lets `rightRail` size and style itself (e.g. Discover's narrow 59px
   * story aside) instead of being forced into the standard 333px padded
   * column built for card-shaped content like `FeedRightRail`. */
  rightRailBare?: boolean;
  /** Lets `children` span the full main-column width instead of the
   * standard 762px feed cap — for screens that need content to be centered
   * relative to the real content column (sidebar edge to `railAccessory`/
   * `rightRail` edge) rather than within an off-center fixed-width cap. */
  contentFullWidth?: boolean;
  /** Rendered as its own flex column directly beside `rightRail` — outside
   * `main`'s padding entirely, so it can sit flush against the rail with no
   * gap (e.g. Discover's prev/next reel buttons hugging the story aside),
   * rather than being positioned from inside the padded scroll area. */
  railAccessory?: ReactNode;
  /** Overrides the scroll container's own padding classes (default
   * `"px-[15px] pb-24 sm:px-[23px] lg:pb-[23px]"`) — for screens that need
   * `children` genuinely edge-to-edge (e.g. Discover's full-screen mobile
   * reel) rather than fighting the default padding with negative margins on
   * the child, which can't correctly re-widen a `width: 100%` box. */
  contentPadding?: string;
}

export function AppShell({
  activeKey,
  activeChildKey,
  header,
  topNav,
  children,
  rightRail,
  rightRailBare,
  contentFullWidth,
  railAccessory,
  contentPadding = "px-[15px] pb-24 sm:px-[23px] lg:pb-[23px]",
}: AppShellProps) {
  // Below xl (1280px) the sidebar defaults to icon-only so the feed column
  // keeps enough room; it expands automatically once there's space again,
  // unless the user has manually toggled it (that choice then sticks).
  const isXlUp = useMediaQuery("(min-width: 1280px)");
  // Every page mounts its own AppShell (there's no persistent layout), so a
  // plain useState here would forget the user's manual toggle on every
  // navigation. Read via `useSyncExternalStore` (see its definitions above)
  // rather than `useState` + an effect, so the real stored value resolves
  // before the first paint instead of a frame after it — otherwise every
  // navigation flashes the sidebar expanded, then snaps to the real
  // collapsed state a moment later.
  const collapsedOverride = useSyncExternalStore(
    subscribeToSidebarOverride,
    getSidebarOverrideSnapshot,
    getSidebarOverrideServerSnapshot,
  );
  const collapsed = collapsedOverride ?? !isXlUp;

  const toggleCollapse = () => setSidebarOverride(!collapsed);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-50">
      <OfflineBanner />
      {topNav ?? <TopNav />}
      <div className="flex w-full flex-1 overflow-hidden">
        <AppSidebar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          activeKey={activeKey}
          activeChildKey={activeChildKey}
        />
        {/* `header` lives outside the scroll container entirely (a real,
            non-scrolling region) rather than being pinned there with
            `position: sticky`, so it can't ever scroll away or flicker. */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {header && (
            <div className="shrink-0 px-[15px] pt-[15px] sm:px-[23px] sm:pt-[23px]">
              <div className="mx-auto w-full max-w-[762px] 4xl:max-w-[920px] 5xl:max-w-[1100px]">{header}</div>
            </div>
          )}
          {/* Extra bottom clearance below lg so the floating mobile nav pill
              never overlaps the last post. */}
          {/* `snap-y snap-mandatory` is inert unless a child opts in with
              `snap-start`/etc — only Discover's mobile reel stack does, for
              a one-reel-per-swipe feed instead of free scrolling. */}
          <div className={cn("no-scrollbar flex-1 snap-y snap-mandatory overflow-y-auto", contentPadding)}>
            {contentFullWidth ? (
              children
            ) : (
              <div className="mx-auto w-full max-w-[762px] 4xl:max-w-[920px] 5xl:max-w-[1100px]">{children}</div>
            )}
            <div aria-hidden className="shrink-0" style={{ height: "var(--compare-tray-space, 0px)" }} />
          </div>
        </main>
        {railAccessory && (
          <div className="z-10 hidden shrink-0 flex-col items-center justify-center xl:flex">{railAccessory}</div>
        )}
        {rightRail && rightRailBare && <div className="hidden h-full shrink-0 xl:block">{rightRail}</div>}
        {rightRail && !rightRailBare && (
          <div className="no-scrollbar hidden w-[333px] shrink-0 overflow-y-auto px-[23px] py-[23px] xl:block 4xl:w-[380px] 5xl:w-[420px]">
            {rightRail}
          </div>
        )}
      </div>
      <MobileBottomNav activeKey={activeKey} activeChildKey={activeChildKey} />
    </div>
  );
}
