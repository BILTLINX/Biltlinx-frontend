"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { NavIcon } from "@/components/shared/NavIcon";
import { NAV_ITEMS, type NavChildItem } from "@/components/shared/nav-items";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeKey?: string;
  activeChildKey?: string;
}

export function AppSidebar({
  collapsed,
  onToggleCollapse,
  activeKey = "feed",
  activeChildKey = "home",
}: AppSidebarProps) {
  // AppSidebar remounts on every navigation (each page renders its own AppShell,
  // there's no persistent layout), so default to whichever section is active
  // rather than always starting closed — otherwise clicking a child link
  // "collapses" the section you just expanded. Only when expanded, though:
  // collapsed mode shows children in a hover/click flyout rather than an
  // inline list, and defaulting it open here would auto-pop the flyout back
  // open on the very page a child link just navigated to, which looks
  // indistinguishable from "it never closed".
  const [openKey, setOpenKey] = useState<string | null>(collapsed ? null : activeKey ?? null);
  const asideRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const flyoutRef = useRef<HTMLDivElement | null>(null);
  const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number } | null>(null);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ top: number; left: number } | null>(null);
  const collapseBtnRef = useRef<HTMLButtonElement | null>(null);
  const [collapseHovered, setCollapseHovered] = useState(false);
  const [collapsePos, setCollapsePos] = useState<{ top: number; left: number } | null>(null);

  // This sidebar stays mounted (just CSS-hidden via `lg:flex`) below the `lg`
  // breakpoint, where MobileBottomNav takes over. `collapsed` is true there
  // too (AppShell's responsive default below xl), so without this check the
  // flyout/tooltip portals below — which aren't scoped by that hidden `<aside>`,
  // since they're portalled straight to <body> — would render floating on mobile.
  const isLgUp = useMediaQuery("(min-width: 1024px)");
  const openItem = openKey ? NAV_ITEMS.find((item) => item.key === openKey) : undefined;
  const showFlyout = isLgUp && collapsed && !!openItem?.children?.length;
  // Suppressed once that item's own flyout is open — otherwise the tooltip
  // and the flyout render over each other for the same item at once.
  const hoverItem =
    isLgUp && collapsed && hoverKey && hoverKey !== openKey
      ? NAV_ITEMS.find((item) => item.key === hoverKey)
      : undefined;

  // Same clipping issue as the flyout below: the collapsed rail's icon-only
  // buttons need a label on hover, but a plain CSS tooltip positioned to the
  // right gets clipped by the nav's overflow-y-auto ancestor. So this is
  // portalled to <body> and positioned from the trigger's rect too.
  function showTooltip(key: string) {
    if (!isLgUp || !collapsed) return;
    const rect = itemRefs.current.get(key)?.getBoundingClientRect();
    if (!rect) return;
    setHoverKey(key);
    setHoverPos({ top: rect.top + rect.height / 2, left: rect.right + 8 });
  }

  // The collapsed rail sits inside overflow-hidden/overflow-auto ancestors, so
  // the flyout is portalled to <body> and positioned from the trigger's rect
  // instead of relying on CSS `absolute` (which those ancestors would clip).
  useEffect(() => {
    if (!showFlyout || !openKey) return;
    const updatePosition = () => {
      const rect = itemRefs.current.get(openKey)?.getBoundingClientRect();
      if (rect) setFlyoutPos({ top: rect.top, left: rect.right + 8 });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    // Collapsing the rail itself triggers this flyout to appear while the
    // rail's width is still animating (`transition-[width,padding]`), so the
    // first measurement can land mid-transition, well past the collapsed
    // rail's edge. Re-measure once that transition settles.
    const asideEl = asideRef.current;
    asideEl?.addEventListener("transitionend", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      asideEl?.removeEventListener("transitionend", updatePosition);
      setFlyoutPos(null);
    };
  }, [showFlyout, openKey]);

  useEffect(() => {
    if (!showFlyout || !openKey) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (itemRefs.current.get(openKey)?.contains(target) || flyoutRef.current?.contains(target)) return;
      setOpenKey(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [showFlyout, openKey]);

  return (
    <aside
      ref={asideRef}
      className={cn(
        "hidden h-full shrink-0 flex-col gap-3 border-r border-gray-200 bg-white pb-[17px] pt-6 transition-[width,padding] duration-200 ease-in-out lg:flex",
        collapsed ? "w-20 px-3" : "w-[240px] px-[18px]",
      )}
      aria-label="Primary navigation"
    >
      <nav className="no-scrollbar flex flex-1 flex-col items-start gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const hasChildren = !!item.children?.length;
          const isOpen = hasChildren && openKey === item.key;
          const isActive = item.key === activeKey;
          // Expanded groups mark their active child instead of the header; childless items and the
          // icon-only rail (which hides children) mark the item itself.
          const highlighted = isActive && (!hasChildren || collapsed);

          return (
            <div
              key={item.key}
              className="relative w-full"
              ref={(node) => {
                if (node) itemRefs.current.set(item.key, node);
                else itemRefs.current.delete(item.key);
              }}
            >
              <Link
                href={item.href}
                aria-expanded={hasChildren ? isOpen : undefined}
                aria-label={collapsed ? item.label : undefined}
                onMouseEnter={() => showTooltip(item.key)}
                onMouseLeave={() => setHoverKey(null)}
                onFocus={() => showTooltip(item.key)}
                onBlur={() => setHoverKey(null)}
                onClick={(event) => {
                  if (item.href === "#") {
                    event.preventDefault();
                    if (hasChildren) setOpenKey((current) => (current === item.key ? null : item.key));
                  }
                }}
                className={cn(
                  "group relative flex h-12 w-full items-center rounded-xl text-sm",
                  collapsed ? "justify-center px-1" : "gap-3 pl-4 pr-3",
                  highlighted ? "bg-[#eff5ff] font-medium text-brand-900" : "text-[#334154] hover:bg-gray-50",
                  isOpen && !collapsed && "font-medium text-[#0f172a]",
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center">
                  <NavIcon icon={item.icon} color={highlighted ? "brand" : "night"} size={item.iconSize ?? 20} />
                </span>
                {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                {hasChildren && (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.label}`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setOpenKey((current) => (current === item.key ? null : item.key));
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      event.stopPropagation();
                      setOpenKey((current) => (current === item.key ? null : item.key));
                    }}
                    className={cn(
                      "relative flex shrink-0 items-center justify-center transition-transform duration-150",
                      collapsed ? "size-4" : "size-5",
                      isOpen && "rotate-90",
                    )}
                  >
                    <Image
                      src="/icons/chevron-right-gray.svg"
                      alt=""
                      width={5}
                      height={10}
                      className="h-[10px] w-auto object-contain"
                    />
                  </span>
                )}
              </Link>

              {isOpen && item.children && !collapsed && (
                <div className="flex w-full flex-col items-start pl-[18px]">
                  {item.children.map((child) => (
                    <SubItem key={child.key} child={child} isActive={isActive && child.key === activeChildKey} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <button
        ref={collapseBtnRef}
        type="button"
        onClick={onToggleCollapse}
        onMouseEnter={() => {
          const rect = collapseBtnRef.current?.getBoundingClientRect();
          if (rect) setCollapsePos({ top: rect.top + rect.height / 2, left: rect.right + 8 });
          setCollapseHovered(true);
        }}
        onMouseLeave={() => setCollapseHovered(false)}
        onFocus={() => {
          const rect = collapseBtnRef.current?.getBoundingClientRect();
          if (rect) setCollapsePos({ top: rect.top + rect.height / 2, left: rect.right + 8 });
          setCollapseHovered(true);
        }}
        onBlur={() => setCollapseHovered(false)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse bar"}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl py-3 text-sm text-text-secondary-dark hover:bg-gray-50",
          collapsed ? "justify-center px-1" : "pl-4",
        )}
      >
        <span className="relative block size-5 shrink-0">
          <Image src="/icons/collapse-bar.svg" alt="" fill sizes="20px" />
        </span>
        {!collapsed && <span className="whitespace-nowrap">Collapse bar</span>}
      </button>

      {collapsed &&
        collapseHovered &&
        collapsePos &&
        createPortal(
          <div
            style={{ top: collapsePos.top, left: collapsePos.left }}
            className="pointer-events-none fixed z-50 -translate-y-1/2 whitespace-nowrap rounded-lg bg-night-900 px-3 py-2 text-xs font-medium text-white shadow-lg"
          >
            Expand sidebar
          </div>,
          document.body,
        )}

      {hoverItem &&
        hoverPos &&
        createPortal(
          <div
            style={{ top: hoverPos.top, left: hoverPos.left }}
            className="pointer-events-none fixed z-50 -translate-y-1/2 whitespace-nowrap rounded-lg bg-night-900 px-3 py-2 text-xs font-medium text-white shadow-lg"
          >
            {hoverItem.label}
          </div>,
          document.body,
        )}

      {showFlyout &&
        flyoutPos &&
        openItem?.children &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpenKey(null)}>
            <div
              ref={flyoutRef}
              onClick={(event) => event.stopPropagation()}
              style={{ top: flyoutPos.top, left: flyoutPos.left }}
              className="absolute w-[220px] rounded-[26px] border border-[rgba(15,22,33,0.12)] bg-white p-2.5 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)] transition-[top,left] duration-200 ease-out"
            >
              <div className="flex flex-col gap-1 rounded-2xl bg-white/90 p-2.5">
                {openItem.children.map((child) => (
                  <ChildLink
                    key={child.key}
                    child={child}
                    isActive={child.key === activeChildKey}
                    onNavigate={() => setOpenKey(null)}
                  />
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </aside>
  );
}

/** An inline child of an expanded group: a dot marker and label, tinted blue when it's the current page. */
function SubItem({ child, isActive }: { child: NavChildItem; isActive: boolean }) {
  return (
    <Link
      href={child.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-9 w-full items-center gap-3.5 rounded-[10px] pl-2 text-sm",
        isActive ? "bg-[#eff5ff] font-medium text-brand-900" : "text-[#334154] hover:bg-gray-50",
      )}
    >
      <span className="flex size-3.5 shrink-0 items-center justify-center">
        <span className={cn("size-1.5 rounded-full", isActive ? "bg-brand-600" : "bg-gray-200")} />
      </span>
      <span className="truncate">{child.label}</span>
    </Link>
  );
}

function ChildLink({
  child,
  isActive,
  onNavigate,
}: {
  child: NavChildItem;
  isActive: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={child.href}
      onClick={(event) => {
        if (child.href === "#") event.preventDefault();
        onNavigate();
      }}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-[13.5px] leading-[20.25px] tracking-[-0.337px] hover:bg-[#f8fafc]",
        isActive ? "border-[#e2e8f0]/60 bg-[#f8fafc]" : "border-transparent",
      )}
    >
      <NavIcon icon={child.icon} color={isActive ? "brand" : "night"} size={14} />
      <span className={cn("whitespace-nowrap", isActive ? "font-medium text-brand-600" : "text-[#334155]")}>
        {child.label}
      </span>
    </Link>
  );
}
