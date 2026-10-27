"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { showSuccessToast } from "@/components/shared/AppToast";
import { MobileSelectSheet, type SelectSheetItem } from "@/components/shared/MobileSelectSheet";
import { VisibilityRow } from "@/components/shared/VisibilityRow";
import { buildCustomVisibility, type PostVisibility } from "@/components/shared/VisibilityMenu";
import { cn } from "@/lib/utils";

interface SearchProfile {
  name: string;
  role: string;
  avatar: string;
}

const SEARCH_PROFILES: SearchProfile[] = [
  { name: "Andy Ansong", role: "Real Estate Consultant", avatar: "/icons/avatar-andy.png" },
  { name: "Edwin Adu", role: "Sales Agent", avatar: "/icons/avatar-sample.jpg" },
  { name: "Madeline Price", role: "Researcher", avatar: "/icons/avatar-sample.jpg" },
];

const DEFAULT_ORGANIZATION_ITEMS: SelectSheetItem[] = [
  { name: "Organization 1", role: "Lead Product Designer", avatar: "/icons/org.svg", avatarIsIcon: true },
  { name: "Organization 2", role: "Product Designer", avatar: "/icons/org.svg", avatarIsIcon: true, disabled: true },
  { name: "Organization 3", role: "Head of Design", avatar: "/icons/org.svg", avatarIsIcon: true },
  { name: "Organization 4", role: "Product Designer", avatar: "/icons/org.svg", avatarIsIcon: true },
  { name: "Organization 5", role: "Chief Strategy Officer", avatar: "/icons/org.svg", avatarIsIcon: true },
];
const DEFAULT_COMMUNITY_ITEMS: SelectSheetItem[] = [
  { name: "Community 1", role: "Lead Product Designer", avatar: "/icons/avatar-sample.jpg" },
  { name: "Community 2", role: "Product Designer", avatar: "/icons/avatar-andy.png", disabled: true },
  { name: "Community 3", role: "Head of Design", avatar: "/icons/avatar-sample.jpg" },
  { name: "Community 4", role: "Product Designer", avatar: "/icons/avatar-andy.png" },
  { name: "Community 5", role: "Chief Strategy Officer", avatar: "/icons/avatar-sample.jpg" },
];

const MENU_WIDTH = 250;

function Row({
  label,
  icon,
  active,
  hasChevron,
  onClick,
  buttonRef,
  ariaExpanded,
}: {
  label: string;
  icon: string;
  active: boolean;
  hasChevron?: boolean;
  onClick: () => void;
  buttonRef?: RefObject<HTMLButtonElement | null>;
  ariaExpanded?: boolean;
}) {
  return (
    <VisibilityRow
      buttonRef={buttonRef}
      icon={icon}
      label={label}
      selected={active}
      hasSubmenu={hasChevron}
      expanded={ariaExpanded}
      onClick={onClick}
    />
  );
}

interface MobileVisibilityMenuProps {
  open: boolean;
  onClose: () => void;
  value: PostVisibility;
  onChange: (value: PostVisibility) => void;
  anchorRef: RefObject<HTMLElement | null>;
}

/** The compact floating "Everyone/Following/Community/Organization" menu
 * used by the mobile quick-post composer (Figma node 400:14042) — distinct
 * from the desktop VisibilityMenu's larger "Who can view?" panel. */
export function MobileVisibilityMenu({ open, onClose, value, onChange, anchorRef }: MobileVisibilityMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ bottom: number; left: number } | null>(null);
  const [communitySheetOpen, setCommunitySheetOpen] = useState(false);
  const [organizationSheetOpen, setOrganizationSheetOpen] = useState(false);
  const [profileQuery, setProfileQuery] = useState("");
  const [addedProfiles, setAddedProfiles] = useState<string[]>([]);
  const [organizationItems, setOrganizationItems] = useState(DEFAULT_ORGANIZATION_ITEMS);
  const [communityItems, setCommunityItems] = useState(DEFAULT_COMMUNITY_ITEMS);

  const matchingProfiles =
    profileQuery.trim().length > 0
      ? SEARCH_PROFILES.filter((profile) => profile.name.toLowerCase().includes(profileQuery.trim().toLowerCase()))
      : [];

  function toggleProfile(name: string) {
    const alreadyAdded = addedProfiles.includes(name);
    setAddedProfiles((current) =>
      alreadyAdded ? current.filter((added) => added !== name) : [...current, name],
    );
    showSuccessToast(alreadyAdded ? `${name} removed from this post's audience` : `${name} added to this post's audience`);
  }

  function addOrganization() {
    const name = `Organization ${organizationItems.length + 1}`;
    setOrganizationItems((current) => [...current, { name, role: "Member", avatar: "/icons/org.svg", avatarIsIcon: true }]);
    const currentCommunities = value.kind === "custom" ? value.communities : [];
    const currentOrganizations = value.kind === "custom" ? value.organizations : [];
    onChange(buildCustomVisibility(currentCommunities, [...currentOrganizations, name]));
    showSuccessToast(`${name} added to this post's audience`);
  }

  function addCommunity() {
    const name = `Community ${communityItems.length + 1}`;
    setCommunityItems((current) => [...current, { name, role: "Member", avatar: "/icons/avatar-sample.jpg" }]);
    const currentCommunities = value.kind === "custom" ? value.communities : [];
    const currentOrganizations = value.kind === "custom" ? value.organizations : [];
    onChange(buildCustomVisibility([...currentCommunities, name], currentOrganizations));
    showSuccessToast(`${name} added to this post's audience`);
  }

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const left = Math.min(Math.max(rect.left - 12, 8), window.innerWidth - MENU_WIDTH - 8);
      setPosition({ bottom: window.innerHeight - rect.top + 8, left });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      if (anchorRef.current?.contains(event.target as Node)) return;
      if ((event.target as HTMLElement).closest?.("[data-mobile-select-sheet]")) return;
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !position) return null;

  return createPortal(
    <div
      ref={menuRef}
      style={{ bottom: position.bottom, left: position.left, width: MENU_WIDTH }}
      className="fixed z-[110] rounded-[26px] border border-[rgba(15,22,33,0.12)] bg-white p-2.5 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)]"
    >
      <div className="flex flex-col gap-1 rounded-2xl bg-white/90 p-2.5">
      <Row
        label="Everyone"
        icon="/icons/visibility-user-sharing.svg"
        active={value.kind === "everyone"}
        onClick={() => onChange({ kind: "everyone" })}
      />
      <Row
        label="Following"
        icon="/icons/visibility-user-add-02.svg"
        active={value.kind === "followings"}
        onClick={() => onChange({ kind: "followings" })}
      />
      <Row
        label="Community"
        icon="/icons/visibility-user-group.svg"
        active={value.kind === "custom" && value.communities.length > 0}
        hasChevron
        ariaExpanded={communitySheetOpen}
        onClick={() => setCommunitySheetOpen(true)}
      />
      <Row
        label="Organization"
        icon="/icons/visibility-user.svg"
        active={value.kind === "custom" && value.organizations.length > 0}
        hasChevron
        ariaExpanded={organizationSheetOpen}
        onClick={() => setOrganizationSheetOpen(true)}
      />

      <MobileSelectSheet
        open={communitySheetOpen}
        onClose={() => setCommunitySheetOpen(false)}
        title="Select Community"
        items={communityItems}
        selected={value.kind === "custom" ? value.communities : []}
        onChangeSelected={(names) => {
          onChange(buildCustomVisibility(names, value.kind === "custom" ? value.organizations : []));
        }}
        onAdd={addCommunity}
      />
      <MobileSelectSheet
        open={organizationSheetOpen}
        onClose={() => setOrganizationSheetOpen(false)}
        title="Select Organization"
        items={organizationItems}
        selected={value.kind === "custom" ? value.organizations : []}
        onChangeSelected={(names) => {
          onChange(buildCustomVisibility(value.kind === "custom" ? value.communities : [], names));
        }}
        onAdd={addOrganization}
      />

      <div className="mt-0.5 flex h-[29px] w-full items-center gap-1 rounded-2xl border-[0.6px] border-gray-300 bg-[#f6f6f9] px-2 py-1.5">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-gray-400">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          value={profileQuery}
          onChange={(event) => setProfileQuery(event.target.value)}
          placeholder="Search Profile"
          className="w-full flex-1 bg-transparent text-[10px] font-medium text-night-900 placeholder:text-gray-400 focus:outline-none"
        />
      </div>

      {matchingProfiles.length > 0 && (
        <ul className="flex max-h-[160px] w-full flex-col gap-1 overflow-y-auto">
          {matchingProfiles.map((profile) => {
            const added = addedProfiles.includes(profile.name);
            return (
              <li key={profile.name} className="flex w-full items-center gap-2 rounded-lg px-1 py-1">
                <span className="relative block size-7 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                  <Image src={profile.avatar} alt="" fill className="object-cover" sizes="28px" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-xs font-medium text-[#2d264b]">{profile.name}</p>
                  <p className="truncate text-[10px] text-[#94a3b7]">{profile.role}</p>
                </div>
                <button
                  type="button"
                  aria-label={added ? `Remove ${profile.name}` : `Add ${profile.name}`}
                  onClick={() => toggleProfile(profile.name)}
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full",
                    added ? "bg-[#fee2e2] text-red-600" : "bg-[#f1f6ff] text-brand-900",
                  )}
                >
                  {added ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      </div>
    </div>,
    document.body,
  );
}
