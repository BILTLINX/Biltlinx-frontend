"use client";

import Link from "next/link";
import { NavIcon } from "@/components/shared/NavIcon";
import { NAV_DESTINATIONS } from "@/components/shared/nav-items";

interface MobileNavGridProps {
  open: boolean;
  onClose: () => void;
  activeKey?: string;
  activeChildKey?: string;
}

/** The light/blue grid the bottom nav's menu button opens on mobile, listing
 * every nav category's sub-items flattened into one screen. */
export function MobileNavGrid({ open, onClose, activeKey, activeChildKey }: MobileNavGridProps) {
  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-24 right-4 z-40 grid grid-cols-4 gap-x-3 gap-y-4 rounded-[32px] border-2 border-white bg-[#e6e6e6] p-4 shadow-[0px_24px_48px_-12px_rgba(0,0,0,0.25)] lg:hidden">
      {NAV_DESTINATIONS
        // The active item is already shown by the menu button's own icon, so
        // it's left out of the grid.
        .filter((child) => !(child.parentKey === activeKey && (child.key === activeChildKey || child.key === activeKey)))
        .map((child) => (
          <Link
            key={`${child.parentKey}-${child.key}`}
            href={child.href}
            onClick={onClose}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white">
              <NavIcon icon={child.icon} color="night" size={20} />
            </span>
            <span className="w-full truncate text-center text-[10px] font-medium text-night-900">{child.label}</span>
          </Link>
        ))}
    </div>
  );
}
