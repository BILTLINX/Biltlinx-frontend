"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { showSuccessToast } from "@/components/shared/AppToast";
import { NavIcon } from "@/components/shared/NavIcon";
import { SideListMenu } from "@/components/shared/SideListMenu";
import { VisibilityRow } from "@/components/shared/VisibilityRow";
import { cn } from "@/lib/utils";

export type PostVisibility =
  | { kind: "everyone" }
  | { kind: "followings" }
  | { kind: "custom"; communities: string[]; organizations: string[] };

export const DEFAULT_VISIBILITY: PostVisibility = { kind: "everyone" };

/** Builds a "custom" visibility from the given lists, falling back to "everyone" when both are empty. */
export function buildCustomVisibility(communities: string[], organizations: string[]): PostVisibility {
  return communities.length > 0 || organizations.length > 0
    ? { kind: "custom", communities, organizations }
    : DEFAULT_VISIBILITY;
}

export function getVisibilityLabel(value: PostVisibility): string {
  switch (value.kind) {
    case "everyone":
      return "Everyone can view";
    case "followings":
      return "Followings";
    case "custom": {
      const names = [...value.communities, ...value.organizations];
      if (names.length === 1) return names[0];
      return value.communities.length > 0 ? "Community" : "Organization";
    }
  }
}

export function getVisibilityIcon(value: PostVisibility): string {
  switch (value.kind) {
    case "everyone":
      return "/icons/create-menu-globe-visibility.svg";
    case "followings":
      return "/icons/user-add-01.svg";
    case "custom":
      return value.organizations.length > 0 ? "/icons/org.svg" : "/icons/user-group.svg";
  }
}

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

const COMMUNITY_ITEMS = ["Community 5", "Community 9", "Community 4", "Community 8", "Community 5", "Community 3", "Community 2"];
const ORGANIZATION_ITEMS = COMMUNITY_ITEMS.map((item) => item.replace("Community", "Organization"));

interface VisibilityMenuProps {
  open: boolean;
  onClose: () => void;
  value: PostVisibility;
  onChange: (value: PostVisibility) => void;
  anchorRef: RefObject<HTMLElement | null>;
  /** Desktop composers let you search and pick several communities/organizations at once. */
  enableMultiSelect?: boolean;
}

export function VisibilityMenu({ open, onClose, value, onChange, anchorRef, enableMultiSelect = false }: VisibilityMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ bottom: number; left: number } | null>(null);
  const communityRef = useRef<HTMLButtonElement | null>(null);
  const organizationRef = useRef<HTMLButtonElement | null>(null);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [organizationOpen, setOrganizationOpen] = useState(false);
  const [profileQuery, setProfileQuery] = useState("");
  const [addedProfiles, setAddedProfiles] = useState<string[]>([]);

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

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({ bottom: window.innerHeight - rect.top + 4, left: rect.left + 16 });
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
      if ((event.target as HTMLElement).closest?.("[data-side-list-menu]")) return;
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
    <div className="fixed inset-0 z-[110] bg-black/50" onClick={onClose}>
    <div
      ref={menuRef}
      onClick={(event) => event.stopPropagation()}
      style={{ bottom: position.bottom, left: position.left }}
      className="absolute flex w-[264px] flex-col rounded-[26px] border border-[rgba(15,22,33,0.12)] bg-white p-2.5 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)]"
    >
    <div className="flex w-full flex-col gap-2.5 rounded-2xl bg-white/90 p-2.5">
      <div className="flex flex-col">
        <p className="text-sm font-semibold leading-5 text-[#001f3f]">Who can view?</p>
        <p className="text-[11px] font-medium leading-4 text-[#64748a]">Choose who can view this post</p>
      </div>

      <div className="flex flex-col gap-1">
        <VisibilityRow
          icon="/icons/visibility-user-sharing.svg"
          label="Everyone can view"
          selected={value.kind === "everyone"}
          onClick={() => onChange({ kind: "everyone" })}
        />
        <VisibilityRow
          icon="/icons/visibility-user-add-02.svg"
          label="Followings"
          selected={value.kind === "followings"}
          onClick={() => onChange({ kind: "followings" })}
        />
        <VisibilityRow
          buttonRef={communityRef}
          icon="/icons/visibility-user-group.svg"
          label={value.kind === "custom" && value.communities.length === 1 ? value.communities[0] : "Community"}
          selected={value.kind === "custom" && value.communities.length > 0}
          hasSubmenu
          expanded={communityOpen}
          onClick={() => {
            setCommunityOpen((v) => !v);
            setOrganizationOpen(false);
          }}
        />
        <VisibilityRow
          buttonRef={organizationRef}
          icon="/icons/visibility-user.svg"
          label={value.kind === "custom" && value.organizations.length === 1 ? value.organizations[0] : "Organization"}
          selected={value.kind === "custom" && value.organizations.length > 0}
          hasSubmenu
          expanded={organizationOpen}
          onClick={() => {
            setOrganizationOpen((v) => !v);
            setCommunityOpen(false);
          }}
        />
      </div>

      <SideListMenu
        open={communityOpen}
        onClose={() => setCommunityOpen(false)}
        anchorRef={communityRef}
        items={COMMUNITY_ITEMS}
        icon="/icons/visibility-user-group.svg"
        title={enableMultiSelect ? "Your Communities" : undefined}
        searchable={enableMultiSelect}
        multiple={enableMultiSelect}
        selected={value.kind === "custom" ? value.communities : []}
        onToggle={(item) => {
          const currentCommunities = value.kind === "custom" ? value.communities : [];
          const currentOrganizations = value.kind === "custom" ? value.organizations : [];
          const next = currentCommunities.includes(item)
            ? currentCommunities.filter((name) => name !== item)
            : [...currentCommunities, item];
          onChange(buildCustomVisibility(next, currentOrganizations));
        }}
        onSelect={(item) => {
          setCommunityOpen(false);
          onChange(buildCustomVisibility([item], value.kind === "custom" ? value.organizations : []));
          onClose();
        }}
      />
      <SideListMenu
        open={organizationOpen}
        onClose={() => setOrganizationOpen(false)}
        anchorRef={organizationRef}
        items={ORGANIZATION_ITEMS}
        icon="/icons/visibility-user.svg"
        title={enableMultiSelect ? "Your Organizations" : undefined}
        searchable={enableMultiSelect}
        multiple={enableMultiSelect}
        selected={value.kind === "custom" ? value.organizations : []}
        onToggle={(item) => {
          const currentCommunities = value.kind === "custom" ? value.communities : [];
          const currentOrganizations = value.kind === "custom" ? value.organizations : [];
          const next = currentOrganizations.includes(item)
            ? currentOrganizations.filter((name) => name !== item)
            : [...currentOrganizations, item];
          onChange(buildCustomVisibility(currentCommunities, next));
        }}
        onSelect={(item) => {
          setOrganizationOpen(false);
          onChange(buildCustomVisibility(value.kind === "custom" ? value.communities : [], [item]));
          onClose();
        }}
      />

      <div className="flex w-full flex-col border-t-[0.5px] border-[#cbd5e0] py-1.5">
        <div className="flex h-7 w-full items-center gap-2 overflow-hidden rounded-lg border border-[#e2e8f0] bg-white px-3">
          <NavIcon icon="/icons/visibility-search-sm.svg" color="night" size={12} />
          <input
            value={profileQuery}
            onChange={(event) => setProfileQuery(event.target.value)}
            placeholder="Search Profile"
            className="min-w-0 flex-1 bg-transparent text-xs leading-5 text-[#334155] placeholder:text-[#53575a] focus:outline-none"
          />
        </div>
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
                  <p className="truncate text-sm font-medium text-[#2d264b]">{profile.name}</p>
                  <p className="truncate text-xs text-[#94a3b7]">{profile.role}</p>
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
    </div>
    </div>,
    document.body,
  );
}
