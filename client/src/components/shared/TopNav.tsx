"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AddRoleModal } from "@/components/shared/AddRoleModal";
import { CreateMenu } from "@/components/shared/CreateMenu";
import { MobileQuickPostModal, type QuickComposerMode } from "@/components/shared/MobileQuickPostModal";
import { NavIcon } from "@/components/shared/NavIcon";
import { VisibilityRow } from "@/components/shared/VisibilityRow";
import { Tooltip } from "@/components/shared/Tooltip";
import { usePostModals } from "@/hooks/usePostModals";
import { useAccountBadge } from "@/hooks/useDisplayName";
import { useSession } from "@/context/SessionContext";
import { comingSoonHref } from "@/lib/coming-soon";

export function TopNav() {
  const router = useRouter();
  const { signOut } = useSession();
  const badge = useAccountBadge();
  const [menuOpen, setMenuOpen] = useState(false);
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement | null>(null);
  const { openPostModal, modals } = usePostModals();
  const [mobileQuickOpen, setMobileQuickOpen] = useState(false);
  const [mobileQuickMode, setMobileQuickMode] = useState<QuickComposerMode>("post");

  function openMobileQuickPost(type: "media" | "poll" | "article") {
    setMobileQuickMode(type === "poll" || type === "article" ? type : "post");
    setMobileQuickOpen(true);
  }

  async function handleLogout() {
    setMenuOpen(false);
    try {
      await signOut();
    } catch {
      // session may already be gone; leave the page regardless
    }
    showSuccessToast("You've been logged out");
    router.push("/auth");
  }

  function goComingSoon(feature: string) {
    setMenuOpen(false);
    router.push(comingSoonHref(feature));
  }

  function handleCreateClick() {
    setCreateMenuOpen((v) => !v);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!createMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (createMenuRef.current?.contains(event.target as Node)) return;
      if ((event.target as HTMLElement).closest?.("[data-create-post-submenu]")) return;
      setCreateMenuOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [createMenuOpen]);

  return (
    <header className="flex h-[67px] shrink-0 items-center border-b border-gray-200 bg-white px-[15px] py-2 sm:px-[23px]">
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-[15px] md:gap-[38px] lg:gap-[57px] 3xl:gap-[109px] 3xl:flex-initial">
          <Link href="/home" aria-label="Home" className="relative size-[34px] shrink-0 sm:hidden">
            <Image src="/brand/mobile%20logo.png" alt="Biltlinx" fill className="object-contain" sizes="34px" priority />
          </Link>
          <Link href="/home" aria-label="Home" className="relative hidden h-[36px] w-[72px] shrink-0 sm:block">
            <Image src="/icons/logo-biltlinx.png" alt="Biltlinx" fill className="object-contain" sizes="72px" priority />
          </Link>

          <button
            type="button"
            onClick={() => goComingSoon("Search")}
            className="hidden h-[46px] min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-[11px] py-[13px] text-left sm:flex sm:max-w-[350px]"
          >
            <span className="relative block size-[15px] shrink-0">
              <Image src="/icons/search.svg" alt="" fill sizes="15px" />
            </span>
            <span className="truncate text-[13px] text-gray-500">Search anything</span>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1 py-1 sm:gap-2 sm:px-2">
          <Tooltip label="Search" side="bottom" className="sm:hidden">
            <button
              type="button"
              aria-label="Search"
              onClick={() => goComingSoon("Search")}
              className="relative flex size-[38px] items-center justify-center rounded-full hover:bg-gray-50"
            >
              <span className="relative block size-[19px] shrink-0">
                <Image src="/icons/search.svg" alt="" fill sizes="19px" />
              </span>
            </button>
          </Tooltip>

          <div ref={createMenuRef} className="relative">
            <button
              type="button"
              aria-label="Create"
              aria-expanded={createMenuOpen}
              onClick={handleCreateClick}
              className="flex h-[34px] items-center justify-center gap-2 rounded-[20px] bg-[#0072ff] px-4 hover:opacity-90 sm:h-[38px] sm:w-[93px] sm:rounded-lg sm:bg-brand-900 sm:px-[15px] sm:hover:bg-brand-900/90 sm:hover:opacity-100"
            >
              <NavIcon icon="/icons/add-circle-01.svg" color="white" size={19} className="hidden sm:block" />
              <span className="text-[11px] text-white sm:text-[13px]">Create</span>
            </button>

            {createMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50">
                <CreateMenu
                  onNavigate={() => setCreateMenuOpen(false)}
                  onOpenPostModal={openPostModal}
                  onOpenMobilePostModal={openMobileQuickPost}
                  onOpenListingModal={openPostModal}
                />
              </div>
            )}
          </div>

          <Tooltip label="Messages" side="bottom" className="hidden sm:inline-flex">
            <button
              type="button"
              aria-label="Messages"
              onClick={() => router.push("/messages")}
              className="relative flex size-[38px] shrink-0 items-center justify-center rounded-full hover:bg-gray-50"
            >
              <span className="relative block size-[19px] shrink-0">
                <Image src="/icons/message-programming.svg" alt="" fill sizes="19px" />
              </span>
              <span className="absolute right-[7px] top-[8px] size-1.5 rounded-full border border-[#f5f0f9] bg-red-500" />
            </button>
          </Tooltip>

          <Tooltip label="Notifications" side="bottom" className="hidden sm:inline-flex">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => router.push("/notifications")}
              className="relative flex size-[38px] shrink-0 items-center justify-center rounded-full hover:bg-gray-50"
            >
              <span className="relative block size-[19px] shrink-0">
                <Image src="/icons/notification.svg" alt="" fill sizes="19px" />
              </span>
              <span className="absolute right-[7px] top-[8px] size-1.5 rounded-full border border-[#f5f0f9] bg-red-500" />
            </button>
          </Tooltip>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Account menu"
              className="flex items-center gap-2 rounded-full hover:bg-gray-50"
            >
              <span className="block shrink-0 rounded-full bg-gradient-to-r from-[#ff8008] to-[#ffc837] p-px">
                <span className="relative block size-12 overflow-hidden rounded-full">
                  <Image src={badge.avatar} alt={badge.name} fill className="object-cover" sizes="48px" />
                </span>
              </span>
              <div className="hidden flex-col items-start md:flex">
                <p className="text-[11px] font-semibold text-night-900">{badge.name}</p>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[9.5px] capitalize text-brand-900">{badge.role}</span>
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[266px] rounded-[26px] border border-[rgba(15,22,33,0.12)] bg-white/10 p-2.5 shadow-[0px_24px_60px_-15px_rgba(0,0,0,0.15)] backdrop-blur-[8px]">
                <div className="flex flex-col gap-1 rounded-2xl bg-white/90 p-2.5">
                  <div className="sm:hidden">
                    <VisibilityRow icon="/icons/message-programming.svg" label="Messages" selected={false} onClick={() => { setMenuOpen(false); router.push("/messages"); }} />
                    <VisibilityRow icon="/icons/notification.svg" label="Notifications" selected={false} onClick={() => { setMenuOpen(false); router.push("/notifications"); }} />
                  </div>
                  <VisibilityRow
                    icon="/icons/menu-settings.svg"
                    label="Account Settings"
                    selected={false}
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/account-settings");
                    }}
                  />
                  <VisibilityRow
                    icon="/icons/user-add-01.svg"
                    label="Add a role"
                    selected={false}
                    onClick={() => {
                      setMenuOpen(false);
                      setAddRoleOpen(true);
                    }}
                  />
                  <div className="mt-1 border-t border-[#e2e8f0] pt-1">
                    <VisibilityRow icon="/icons/menu-power.svg" label="Log out" selected={false} destructive onClick={handleLogout} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {modals}
      <AddRoleModal open={addRoleOpen} onClose={() => setAddRoleOpen(false)} />
      <MobileQuickPostModal
        open={mobileQuickOpen}
        onClose={() => setMobileQuickOpen(false)}
        initialMode={mobileQuickMode}
      />
    </header>
  );
}
