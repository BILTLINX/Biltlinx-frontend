"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavIcon } from "@/components/shared/NavIcon";
import { VisibilityRow } from "@/components/shared/VisibilityRow";
import { comingSoonHref } from "@/lib/coming-soon";
import { cn } from "@/lib/utils";

/** Where a menu entry goes: Post a Request has its own page; the rest are not built yet. */
function menuItemHref(item: { key: string; label: string }) {
  return item.key === "request" ? "/request-board/new" : comingSoonHref(item.label);
}

interface DesktopSubmenuItem {
  key: string;
  icon: string;
  label: string;
  locked?: boolean;
}

interface DesktopMenuItem {
  key: string;
  icon: string;
  label: string;
  locked?: boolean;
}

interface DesktopMenuSection {
  items: DesktopMenuItem[];
  divider?: boolean;
}

const CREATE_POST_ITEM = {
  key: "post",
  icon: "/icons/create-menu-dt-add-alt.svg",
  label: "Create Post",
};
const CREATE_POST_SUBMENU: DesktopSubmenuItem[] = [
  { key: "media", icon: "/icons/media-gallery.svg", label: "Media" },
  { key: "poll", icon: "/icons/poll-bar-chart.svg", label: "Poll" },
  { key: "article", icon: "/icons/article-document.svg", label: "Article" },
];

const DESKTOP_LIST_SECTIONS: DesktopMenuSection[] = [
  {
    divider: true,
    items: [
      {
        key: "property",
        icon: "/icons/building-03.svg",
        label: "Post a Property",
        locked: true,
      },
      {
        key: "stay",
        icon: "/icons/guest-house-sm.svg",
        label: "Add Stay",
        locked: true,
      },
      {
        key: "service",
        icon: "/icons/map-pin-02-sm.svg",
        label: "Offer a Service",
        locked: true,
      },
      {
        key: "project",
        icon: "/icons/briefcase-09.svg",
        label: "Post Project",
        locked: true,
      },
    ],
  },
  {
    items: [
      {
        key: "event",
        icon: "/icons/event-calendar-01.svg",
        label: "Create Events",
      },
      {
        key: "community",
        icon: "/icons/user-group.svg",
        label: "Create Community",
      },
    ],
  },
  {
    items: [
      {
        key: "request",
        icon: "/icons/create-menu-dt-help-circle.svg",
        label: "Post a Request",
      },
    ],
  },
];

function DesktopMenuRow({
  item,
  onNavigate,
  onOpenListingModal,
}: {
  item: DesktopMenuItem;
  onNavigate: () => void;
  onOpenListingModal: (type: "property" | "stay" | "service") => void;
}) {
  if (
    item.key === "property" ||
    item.key === "stay" ||
    item.key === "service"
  ) {
    const listingKey = item.key;
    return (
      <button
        type="button"
        onClick={() => {
          onOpenListingModal(listingKey);
          onNavigate();
        }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-[#f8fafc]"
      >
        <NavIcon
          icon={item.icon}
          color="night"
          size={14}
          className="shrink-0"
        />
        <span className="flex-1 truncate text-[13.5px] leading-[20.25px] tracking-[-0.337px] text-[#334155]">
          {item.label}
        </span>
        {item.locked && (
          <NavIcon
            icon="/icons/create-menu2-lock-key.svg"
            color="night"
            size={10}
            className="shrink-0"
          />
        )}
      </button>
    );
  }

  return (
    <Link
      href={menuItemHref(item)}
      onClick={onNavigate}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 hover:bg-[#f8fafc]"
    >
      <NavIcon icon={item.icon} color="night" size={14} className="shrink-0" />
      <span className="flex-1 truncate text-[13.5px] leading-[20.25px] tracking-[-0.337px] text-[#334155]">
        {item.label}
      </span>
      {item.locked && (
        <NavIcon
          icon="/icons/create-menu2-lock-key.svg"
          color="night"
          size={10}
          className="shrink-0"
        />
      )}
    </Link>
  );
}

interface MobileMenuItem {
  key: string;
  icon: string;
  label: string;
  submenu?: DesktopSubmenuItem[];
}

const LISTINGS_SUBMENU: DesktopSubmenuItem[] = [
  {
    key: "property",
    icon: "/icons/building-03.svg",
    label: "Post a Property",
    locked: true,
  },
  {
    key: "stay",
    icon: "/icons/guest-house-sm.svg",
    label: "Add Stay",
    locked: true,
  },
  {
    key: "service",
    icon: "/icons/map-pin-02-sm.svg",
    label: "Offer a Service",
    locked: true,
  },
  {
    key: "project",
    icon: "/icons/briefcase-09.svg",
    label: "Post Project",
    locked: true,
  },
];

const MOBILE_ITEMS: MobileMenuItem[] = [
  {
    key: "post",
    icon: CREATE_POST_ITEM.icon,
    label: "Create post",
    submenu: CREATE_POST_SUBMENU,
  },
  {
    key: "listings",
    icon: "/icons/clipboard-list-01.svg",
    label: "Listings",
    submenu: LISTINGS_SUBMENU,
  },
  { key: "event", icon: "/icons/event-calendar-01.svg", label: "Create Event" },
  {
    key: "community",
    icon: "/icons/user-group.svg",
    label: "Create Community",
  },
];

const MOBILE_REQUEST_ITEM: MobileMenuItem = {
  key: "request",
  icon: "/icons/create-menu-dt-help-circle.svg",
  label: "Post a Request",
};

const MOBILE_ROW_CLASS =
  "flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left hover:bg-[#f8fafc]";

function MobileRowContent({
  icon,
  label,
  locked,
}: {
  icon: string;
  label: string;
  locked?: boolean;
}) {
  return (
    <>
      <NavIcon icon={icon} color="night" size={13} className="shrink-0" />
      <span className="flex-1 truncate text-[13.5px] leading-[20.25px] tracking-[-0.337px] text-[#334155]">
        {label}
      </span>
      {locked && (
        <NavIcon
          icon="/icons/create-menu2-lock-key.svg"
          color="night"
          size={10}
          className="shrink-0"
        />
      )}
    </>
  );
}

function MobileMenuRow({
  item,
  onNavigate,
  open,
  onToggle,
  onOpenMobilePostModal,
  onOpenListingModal,
}: {
  item: MobileMenuItem;
  onNavigate: () => void;
  open: boolean;
  onToggle: () => void;
  onOpenMobilePostModal: (type: "media" | "poll" | "article") => void;
  onOpenListingModal: (type: "property" | "stay" | "service") => void;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  function handleToggle() {
    if (!open) {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) setPosition({ top: rect.bottom + 4, left: rect.left + 36 });
    }
    onToggle();
  }

  if (!item.submenu) {
    return (
      <Link
        href={menuItemHref(item)}
        onClick={onNavigate}
        className={MOBILE_ROW_CLASS}
      >
        <MobileRowContent icon={item.icon} label={item.label} />
      </Link>
    );
  }

  return (
    <div className="relative w-full">
      <VisibilityRow
        buttonRef={triggerRef}
        icon={item.icon}
        label={item.label}
        selected={false}
        hasSubmenu
        expanded={open}
        onClick={handleToggle}
      />

      {open &&
        position &&
        createPortal(
          <div
            data-create-post-submenu
            className="fixed inset-0 z-[110] bg-black/50"
            onClick={onToggle}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{ top: position.top, left: position.left }}
              className="absolute flex w-[266px] flex-col rounded-[26px] border border-[rgba(15,22,33,0.12)] bg-white p-2.5 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)]"
            >
              <div className="flex w-full flex-col gap-1 rounded-2xl bg-white/90 p-2.5">
                {item.submenu.map((sub) =>
                  sub.key === "media" ||
                  sub.key === "poll" ||
                  sub.key === "article" ? (
                    <VisibilityRow
                      key={sub.key}
                      icon={sub.icon}
                      label={sub.label}
                      selected={false}
                      onClick={() => {
                        onOpenMobilePostModal(
                          sub.key as "media" | "poll" | "article",
                        );
                        onNavigate();
                      }}
                    />
                  ) : sub.key === "property" ||
                    sub.key === "stay" ||
                    sub.key === "service" ? (
                    <button
                      key={sub.key}
                      type="button"
                      onClick={() => {
                        onOpenListingModal(
                          sub.key as "property" | "stay" | "service",
                        );
                        onNavigate();
                      }}
                      className={MOBILE_ROW_CLASS}
                    >
                      <MobileRowContent
                        icon={sub.icon}
                        label={sub.label}
                        locked={sub.locked}
                      />
                    </button>
                  ) : (
                    <Link
                      key={sub.key}
                      href={comingSoonHref(sub.label)}
                      onClick={onNavigate}
                      className={MOBILE_ROW_CLASS}
                    >
                      <MobileRowContent
                        icon={sub.icon}
                        label={sub.label}
                        locked={sub.locked}
                      />
                    </Link>
                  ),
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function CreatePostRow({
  onNavigate,
  onOpenPostModal,
}: {
  onNavigate: () => void;
  onOpenPostModal: (type: "media" | "poll" | "article") => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  function toggleOpen() {
    setOpen((v) => {
      const next = !v;
      if (next) {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (rect)
          setPosition({
            top: rect.bottom + 8,
            left: rect.left + rect.width / 2,
          });
      }
      return next;
    });
  }

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#337df2] bg-[#eff6ff]/20 px-[15px] py-[11px] text-left outline-none hover:bg-[#eff6ff]/60"
      >
        <span className="flex min-w-0 items-center gap-3">
          <NavIcon
            icon={CREATE_POST_ITEM.icon}
            color="night"
            size={18}
            className="shrink-0 bg-[#337df2]"
          />
          <span className="truncate text-sm leading-5 tracking-[-0.35px] text-[#0f172a]">
            {CREATE_POST_ITEM.label}
          </span>
        </span>
        <span className="flex shrink-0 items-center justify-center rounded p-1">
          <NavIcon icon="/icons/more-horizontal.svg" color="night" size={16} />
        </span>
      </button>

      {open &&
        position &&
        createPortal(
          <div
            data-create-post-submenu
            className="fixed inset-0 z-[110] bg-black/50"
            onClick={() => setOpen(false)}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{ top: position.top, left: position.left }}
              className="absolute flex w-[266px] flex-col rounded-[26px] border border-[rgba(15,22,33,0.12)] bg-white p-2.5 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)]"
            >
              <div className="flex w-full flex-col gap-1 rounded-2xl bg-white/90 p-2.5">
                {CREATE_POST_SUBMENU.map((sub) =>
                  sub.key === "media" ||
                  sub.key === "poll" ||
                  sub.key === "article" ? (
                    <VisibilityRow
                      key={sub.key}
                      icon={sub.icon}
                      label={sub.label}
                      selected={false}
                      onClick={() => {
                        onOpenPostModal(
                          sub.key as "media" | "poll" | "article",
                        );
                        onNavigate();
                      }}
                    />
                  ) : (
                    <Link
                      key={sub.key}
                      href={comingSoonHref(sub.label)}
                      onClick={onNavigate}
                      className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 hover:bg-[#f8fafc]"
                    >
                      <NavIcon
                        icon={sub.icon}
                        color="night"
                        size={13}
                        className="shrink-0"
                      />
                      <span className="truncate text-[13.5px] leading-[20.25px] tracking-[-0.337px] text-[#334155]">
                        {sub.label}
                      </span>
                    </Link>
                  ),
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function CreateMenu({
  onNavigate,
  onOpenPostModal,
  onOpenMobilePostModal,
  onOpenListingModal,
}: {
  onNavigate: () => void;
  onOpenPostModal: (type: "media" | "poll" | "article") => void;
  onOpenMobilePostModal: (type: "media" | "poll" | "article") => void;
  onOpenListingModal: (type: "property" | "stay" | "service") => void;
}) {
  const [openMobileKey, setOpenMobileKey] = useState<string | null>(null);
  const toggleMobileKey = (key: string) =>
    setOpenMobileKey((current) => (current === key ? null : key));

  return (
    <>
      <div className="w-[266px] rounded-[26px] border border-[rgba(15,22,33,0.12)] bg-white p-2.5 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)] sm:hidden">
        <div className="flex flex-col gap-1 rounded-2xl bg-white/90 p-2.5">
          {MOBILE_ITEMS.map((item) => (
            <MobileMenuRow
              key={item.key}
              item={item}
              onNavigate={onNavigate}
              open={openMobileKey === item.key}
              onToggle={() => toggleMobileKey(item.key)}
              onOpenMobilePostModal={onOpenMobilePostModal}
              onOpenListingModal={onOpenListingModal}
            />
          ))}
          <div className="my-1 h-px w-full bg-[#e2e8f0]" />
          <MobileMenuRow
            item={MOBILE_REQUEST_ITEM}
            onNavigate={onNavigate}
            open={false}
            onToggle={() => {}}
            onOpenMobilePostModal={onOpenMobilePostModal}
            onOpenListingModal={onOpenListingModal}
          />
        </div>
      </div>

      <div className="hidden w-[358px] flex-col rounded-[26px] border border-[rgba(15,22,33,0.12)] bg-white p-2.5 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)] sm:flex">
        <div className="flex w-full flex-col gap-2.5 rounded-2xl bg-white/90 p-2.5">
          <div className="flex items-center gap-1.5 px-2 py-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="shrink-0 text-[#001f3f]"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm font-medium uppercase leading-4 tracking-[0.6px] text-[#001f3f]">
              Share
            </p>
          </div>

          <CreatePostRow
            onNavigate={onNavigate}
            onOpenPostModal={onOpenPostModal}
          />

          <div className="flex w-full flex-col rounded-2xl border border-[#e2e8f0]/85 bg-white p-1.5 shadow-[0px_20px_45px_-12px_rgba(15,23,42,0.12),0px_0px_0px_1px_rgba(15,23,42,0.05)]">
            {DESKTOP_LIST_SECTIONS.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className={cn(
                  "flex w-full flex-col items-start",
                  section.divider && "mb-1.5 border-b border-[#f1f5f9] pb-1.5",
                )}
              >
                {section.items.map((item) => (
                  <DesktopMenuRow
                    key={item.key}
                    item={item}
                    onNavigate={onNavigate}
                    onOpenListingModal={onOpenListingModal}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
