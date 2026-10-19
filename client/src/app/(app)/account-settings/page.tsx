"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { NavIcon } from "@/components/shared/NavIcon";
import { PrivacyTab } from "@/components/shared/PrivacyTab";
import { SecurityTab } from "@/components/shared/SecurityTab";
import { TeamsTab } from "@/components/shared/TeamsTab";
import { useSession } from "@/context/SessionContext";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "security", label: "Security" },
  { key: "privacy", label: "Privacy" },
  { key: "teams", label: "Roles & teams" },
  { key: "payments", label: "Payments" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function AccountSettings() {
  const router = useRouter();
  const requested = useSearchParams().get("tab");
  const tab: TabKey = TABS.some((item) => item.key === requested) ? (requested as TabKey) : "profile";
  const { user } = useSession();

  function select(key: TabKey) {
    if (key === "payments") {
      router.push("/payments");
      return;
    }
    router.replace(`/account-settings?tab=${key}`);
  }

  const security = (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <h2 className="text-[15px] font-semibold text-night-900">Account at a glance</h2>
      <ul className="flex flex-col gap-2 text-[13px] text-[#334155]">
        <li className="flex items-center justify-between gap-2">
          Identity
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", user?.isVerified ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fef3c7] text-[#b45309]")}>{user?.isVerified ? "Verified" : "Not verified"}</span>
        </li>
        <li className="flex items-center justify-between gap-2">
          Two-step verification
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", user?.totpEnabled ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#f1f5f9] text-[#334155]")}>{user?.totpEnabled ? "On" : "Off"}</span>
        </li>
        <li className="flex items-center justify-between gap-2">
          Roles
          <span className="text-gray-500">{user?.capabilities.filter((item) => item.status === "Approved").length ?? 0} approved</span>
        </li>
      </ul>
      <Link href="/verification" className="text-[13px] font-medium text-brand-900">
        Open the Verification centre ›
      </Link>
    </div>
  );

  return (
    <AppShell contentFullWidth rightRail={security}>
      <div className="mx-auto flex w-full max-w-[762px] flex-col gap-4 pb-6 pt-2">
        <ProfileBanner />
        <nav className="no-scrollbar flex h-[43px] w-full items-stretch overflow-x-auto rounded-2xl border border-[#e6e7ec] bg-white pl-4 pr-2.5" aria-label="Account sections">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => select(item.key)}
              aria-current={tab === item.key ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center justify-center whitespace-nowrap border-b px-4 text-[13px] leading-7",
                tab === item.key ? "rounded-tl-2xl border-b-2 border-[#5d9afb] font-medium text-[#498cf8]" : "border-[#e6e7ec] text-[#111826] hover:text-[#498cf8]",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="rounded-2xl border border-gray-200 bg-white p-3">
          {tab === "profile" && <ProfileTab />}
          {tab === "security" && <SecurityTab />}
          {tab === "privacy" && <PrivacyTab />}
          {tab === "teams" && <TeamsTab />}
        </div>

        <div className="hidden sm:block xl:hidden">{security}</div>
      </div>
    </AppShell>
  );
}

function ProfileBanner() {
  const { user } = useSession();
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[181px] w-full overflow-hidden rounded-[32px] border-[10px] border-white/20 bg-[#1465e6]">
        <Image src="/icons/account-banner-star.svg" alt="" width={80} height={118} unoptimized className="absolute right-[16%] top-[112px]" />
        <Image src="/icons/account-banner-stars.svg" alt="" width={211} height={232} unoptimized className="absolute -top-[69px] left-[72%]" />
        <Image src="/icons/account-banner-stars.svg" alt="" width={211} height={232} unoptimized className="absolute -left-[39px] -top-[33px]" />
      </div>
      <div className="-mt-[68px] flex w-[calc(100%-24px)] items-center justify-between gap-2 rounded-2xl bg-gradient-to-b from-[#cfddfa] via-white to-white p-3 shadow-[0px_20px_27px_0px_rgba(0,0,0,0.05)] backdrop-blur-[13.5px] sm:w-[calc(100%-54px)] sm:gap-3 sm:rounded-[33px] sm:p-6">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative block size-14 shrink-0 overflow-hidden rounded-[23px] bg-[#eef2ff] sm:size-[72px]">
            <Image src={user?.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt={user?.username ?? "Your photo"} fill className="object-cover" sizes="72px" />
          </span>
          <div className="flex min-w-0 flex-col items-start gap-0.5">
            <p className="truncate text-base font-semibold leading-4 text-[#0f1621]">{user?.username}</p>
            <p className="flex items-center gap-1.5 text-[11px] text-[#0f1621]">
              <NavIcon icon="/icons/map-pin-02-sm.svg" color="night" size={12} />
              Member since {user ? formatDate(user.createdAt) : ""}
            </p>
            <span className="flex h-4 w-fit shrink-0 items-center whitespace-nowrap rounded-full bg-[#e2e8f0] px-2 text-[10px] leading-4 text-[#1465e6]">{user?.isVerified ? "ID verified" : "Not yet verified"}</span>
          </div>
        </div>
        <Link href="/account-settings?tab=teams" className="flex h-9 shrink-0 items-center gap-1.5 rounded-2xl bg-white px-3 text-xs text-[#404040] hover:bg-gray-50 sm:h-10 sm:rounded-[10px] sm:px-4 sm:text-sm">
          Switch account
        </Link>
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user } = useSession();
  const rows = [
    { label: "Username", value: user?.username },
    { label: "Email", value: user?.accounts[0]?.email },
    { label: "Phone number", value: user?.primaryContact },
    { label: "Other contact", value: user?.otherContact },
    { label: "Account status", value: user?.status },
  ];
  return (
    <div className="flex flex-col gap-4 px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-night-900">Profile</h1>
        <p className="text-[13px] text-gray-600">Your account details. To change your email or phone, use the Security tab.</p>
      </div>
      <section className="flex flex-col gap-5 rounded-2xl border border-gray-200 p-4 sm:p-5">
        <h2 className="text-[15px] font-medium text-night-900">Personal information</h2>
        <dl className="grid grid-cols-1 gap-x-12 gap-y-4 sm:grid-cols-2">
          {rows
            .filter((row) => row.value)
            .map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 border-b border-gray-200 pb-2 text-[13px]">
                <dt className="shrink-0 text-gray-400">{row.label}</dt>
                <dd className="min-w-0 flex-1 truncate text-right text-night-900">{row.value}</dd>
              </div>
            ))}
        </dl>
      </section>
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <Suspense fallback={null}>
      <AccountSettings />
    </Suspense>
  );
}
