"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AnchoredPanel } from "@/components/shared/AnchoredPanel";
import { NavIcon } from "@/components/shared/NavIcon";
import { VisibilityRow } from "@/components/shared/VisibilityRow";
import { MANAGE_ROLES, ROLE_HOMES } from "@/lib/dummy-manage";
import { cn } from "@/lib/utils";

/** The breadcrumb and "Viewing as" pill at the top of the artisan and professional Manage pages. Roles without a workspace of their own go to /manage. */
export function ArtisanRoleBar({ page, role = "Artisan" }: { page: string; role?: (typeof MANAGE_ROLES)[number] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] leading-[19px] text-gray-500">
          <Link href="/manage" className="hover:text-brand-900">
            Manage
          </Link>
          <span aria-hidden>/</span>
          <span className="text-[#334155]">{page}</span>
        </nav>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs leading-[17px] hover:bg-gray-50"
        >
          <span className="text-gray-500">Viewing as:</span>
          <span className="font-semibold text-[#0f172a]">{role}</span>
          <NavIcon icon="/icons/poll-chevron-down.svg" size={14} className={cn("bg-gray-500 transition-transform duration-150", open && "rotate-180")} />
        </button>
      </div>

      <AnchoredPanel open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} estimatedHeight={40 + MANAGE_ROLES.length * 40} minWidth={200}>
        {MANAGE_ROLES.map((option) => (
          <VisibilityRow
            key={option}
            label={option}
            selected={option === role}
            onClick={() => {
              setOpen(false);
              if (option !== role) router.push(ROLE_HOMES[option] ?? "/manage");
            }}
          />
        ))}
      </AnchoredPanel>
    </>
  );
}
