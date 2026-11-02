"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { showSuccessToast } from "@/components/shared/AppToast";
import { BillingTab } from "@/components/shared/BillingTab";
import { GeneralSettingsTab } from "@/components/shared/GeneralSettingsTab";
import { NavIcon } from "@/components/shared/NavIcon";
import { ProfileEditForm } from "@/components/shared/ProfileEditForm";
import { PrivacyTab } from "@/components/shared/PrivacyTab";
import { SecurityTab } from "@/components/shared/SecurityTab";
import { TeamsTab } from "@/components/shared/TeamsTab";
import { useOrganization } from "@/context/OrganizationContext";
import { useSession } from "@/context/SessionContext";
import { updateProfile } from "@/lib/account-api";
import { notifyError } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { PROFILE_PHOTO_MAX_BYTES, PROFILE_PHOTO_TYPES } from "@/lib/dummy-onboarding";
import { uploadMedia } from "@/lib/upload";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "security", label: "Security" },
  { key: "privacy", label: "Privacy" },
  { key: "teams", label: "Roles & teams" },
  { key: "billing", label: "Billings" },
  { key: "general", label: "General Settings" },
  { key: "payments", label: "Payments" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/** One line of the profile card. */
interface Field {
  key: string;
  label: string;
  value: string;
}

const PLACEHOLDER_AVATAR = "/icons/avatar-placeholder-user.svg";

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

  const completion = <ProfileCompletionCard />;
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
  const rail = (
    <div className="flex w-full flex-col gap-4">
      {completion}
      {security}
    </div>
  );

  return (
    <AppShell contentFullWidth rightRail={rail}>
      <div className="mx-auto flex w-full max-w-[762px] flex-col gap-4 pb-6 pt-2">
        <ProfileHero />
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
          {tab === "billing" && <BillingTab />}
          {tab === "general" && <GeneralSettingsTab />}
        </div>

        <div className="hidden flex-col gap-4 sm:flex xl:hidden">
          {completion}
          {security}
        </div>
      </div>
    </AppShell>
  );
}

function ProfileHero() {
  const { user, refresh } = useSession();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function changePhoto(file: File | undefined) {
    if (!file) return;
    if (!PROFILE_PHOTO_TYPES.includes(file.type)) {
      notifyError(new Error("Use a JPG or PNG photo."));
      return;
    }
    if (file.size > PROFILE_PHOTO_MAX_BYTES) {
      notifyError(new Error("That photo is over 5 MB. Choose a smaller one."));
      return;
    }
    setUploading(true);
    try {
      const uploaded = await uploadMedia(file, { allowVideo: false });
      await updateProfile({ photoPath: uploaded.path });
      await refresh();
      showSuccessToast("Your photo was updated");
    } catch (error) {
      notifyError(error, "Your photo could not be updated. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-[33px] border border-gray-200 bg-white/80 p-4 shadow-[0px_20px_27px_0px_rgba(0,0,0,0.05)] backdrop-blur-[13.5px] sm:p-6">
      <div className="flex min-w-0 items-center gap-2">
        <span className="relative block size-[72px] shrink-0">
          <span className="relative block size-full overflow-hidden rounded-[23px] bg-[#eef2ff]">
            <Image src={user?.profilePicUrl ?? PLACEHOLDER_AVATAR} alt={user?.username ?? "Your photo"} fill className="object-cover" sizes="72px" />
          </span>
          <button
            type="button"
            aria-label="Change photo"
            disabled={uploading}
            onClick={() => fileInput.current?.click()}
            className="absolute -bottom-[1.67px] -right-[2.17px] flex items-center rounded-[29px] border border-dashed border-[#ff8d28] bg-gradient-to-r from-[#ff8d28] via-[#e24bb9] to-[#983fe0] p-1 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] backdrop-blur-[13.5px] hover:opacity-90 disabled:opacity-60"
          >
            <Image src="/icons/account-banner-upload.svg" alt="" width={12} height={12} unoptimized />
          </button>
          <input
            ref={fileInput}
            type="file"
            accept={PROFILE_PHOTO_TYPES.join(",")}
            className="hidden"
            onChange={(event) => {
              void changePhoto(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </span>
        <div className="flex min-w-0 flex-col items-start">
          <p className="max-w-full truncate text-base font-semibold leading-4 text-[#0f1621]">{user?.username}</p>
          <p className="flex h-6 items-center gap-1.5 px-2 text-[11px] leading-4 text-[#0f1621]">
            <NavIcon icon="/icons/map-pin-02-sm.svg" color="night" size={14} />
            {user?.location || (user ? `Member since ${formatDate(user.createdAt)}` : "")}
          </p>
          <span className="flex h-4 w-fit shrink-0 items-center whitespace-nowrap rounded-full bg-[#e2e8f0] px-2 text-[10px] leading-4 text-[#1465e6]">{user?.isVerified ? "ID verified" : "ID not verified yet"}</span>
        </div>
      </div>
      <SwitchRoleMenu />
    </div>
  );
}

/** The "Switch role" dropdown: your own account, or any organisation you belong to. */
function SwitchRoleMenu() {
  const { user } = useSession();
  const { activeOrganizationId, switchOrganization } = useOrganization();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const options = [
    { id: null, name: user?.username ?? "", email: user?.primaryContact ?? "", photo: user?.profilePicUrl ?? null },
    ...(user?.accounts ?? []).map((account) => ({ id: account.organization.id, name: account.organization.name, email: account.email, photo: account.organization.photo })),
  ];

  function choose(id: string | null, name: string) {
    setOpen(false);
    if (id === activeOrganizationId) return;
    switchOrganization(id);
    showSuccessToast(`Switched to ${name}`);
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-2xl bg-white px-3 text-xs text-[#404040] hover:bg-gray-50 sm:h-10 sm:gap-2 sm:rounded-[10px] sm:px-4 sm:text-sm"
      >
        Switch role
        <NavIcon icon="/icons/poll-chevron-down.svg" color="night" size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[266px] rounded-[26px] border border-[rgba(15,22,33,0.12)] bg-white p-2.5 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-2.5 rounded-2xl bg-white/90 p-2.5">
            <p className="text-sm font-semibold leading-5 text-[#001f3f]">Switch account</p>
            <ul className="flex flex-col gap-1">
              {options.map((option) => {
                const active = option.id === activeOrganizationId;
                return (
                  <li key={option.id ?? "personal"}>
                    <button type="button" className="flex w-full items-center gap-2 rounded-lg py-1 text-left hover:bg-gray-50" onClick={() => choose(option.id, option.name)}>
                      <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-[0.4px] border-[#ebebeb] bg-white">
                        {option.photo ? <Image src={option.photo} alt="" fill className="object-cover" sizes="32px" /> : <NavIcon icon={option.id ? "/icons/org.svg" : "/icons/onboarding-user.svg"} color="night" size={16} />}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[15px] font-medium leading-4 text-black">{option.name}</span>
                        <span className="truncate text-xs leading-4 text-gray-400">{option.email}</span>
                      </span>
                      {active && <NavIcon icon="/icons/visibility-tick-check.svg" color="brand" size={14} className="shrink-0 bg-[#1465e6]" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileTab() {
  const { user } = useSession();
  const [editing, setEditing] = useState(false);

  const personal: Field[] = [
    { key: "displayName", label: "Display name", value: user?.username ?? "" },
    { key: "email", label: "Email", value: user?.accounts[0]?.email ?? "" },
    { key: "phone", label: "Phone number", value: user?.primaryContact ?? "" },
    ...(user?.otherContact ? [{ key: "other", label: "Other contact", value: user.otherContact }] : []),
    { key: "location", label: "Location", value: user?.location ?? "" },
    { key: "bio", label: "Bio", value: user?.bio ?? "" },
    { key: "status", label: "Account status", value: user?.status ?? "" },
  ];

  return (
    <div className="flex flex-col gap-4 px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-night-900">Profile</h1>
        <p className="text-[13px] text-gray-600">Your account details. To change your email or phone, use the Security tab.</p>
      </div>

      <section className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[15px] font-medium text-night-900">Personal Information</h2>
          {!editing && (
            <button type="button" onClick={() => setEditing(true)} className="text-[13px] font-medium text-brand-900 hover:underline">
              Edit profile
            </button>
          )}
        </div>
        {editing ? (
          <ProfileEditForm onDone={() => setEditing(false)} />
        ) : (
        <dl className="grid grid-cols-1 gap-x-12 gap-y-4 sm:grid-cols-2">
          {personal.map((field) => (
            <div key={field.key} className="flex items-center justify-between gap-3 border-b border-gray-200 pb-2 text-[13px]">
              <dt className="shrink-0 text-gray-400">{field.label}</dt>
              <dd className="min-w-0 flex-1 truncate text-right text-night-900">{field.value || "—"}</dd>
            </div>
          ))}
        </dl>
        )}
      </section>
    </div>
  );
}

/** The ring around your photo fills as the profile does; each step adds its share. */
function ProfileCompletionCard() {
  const { user } = useSession();
  const steps = [
    { label: "Setup account", percent: 50, done: Boolean(user?.accounts[0]?.email && user.primaryContact) },
    { label: "Upload your photo", percent: 5, done: Boolean(user?.profilePicUrl) },
    { label: "Personal Info", percent: 25, done: Boolean(user?.username && user.bio) },
    { label: "Address", percent: 20, done: Boolean(user?.location) },
  ];
  const total = steps.reduce((sum, step) => sum + (step.done ? step.percent : 0), 0);

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5">
      <span className="flex size-[56px] items-center justify-center rounded-full p-[3px]" style={{ background: `conic-gradient(#1465e6 ${total}%, #e2e8f0 0)` }}>
        <span className="relative block size-full overflow-hidden rounded-full border-2 border-white bg-[#eef2ff]">
          <Image src={user?.profilePicUrl ?? PLACEHOLDER_AVATAR} alt="" fill className="object-cover" sizes="56px" />
        </span>
      </span>
      <div className="flex flex-col items-center gap-0.5 text-center">
        <p className="text-sm font-semibold text-night-900">Hello {user?.username}</p>
        <p className="text-[10px] text-night-900">
          Profile is <span className="text-brand-900">{total}%</span> Percent Complete.
        </p>
      </div>
      <ul className="flex w-full flex-col gap-1.5">
        {steps.map((step) => (
          <li key={step.label} className={cn("flex items-center justify-between text-[10px]", step.done ? "text-night-900" : "text-gray-400")}>
            <span className="flex items-center gap-2">
              <span className="w-2.5">{step.done ? "✓" : ""}</span>
              {step.label}
            </span>
            <span>{step.percent}%</span>
          </li>
        ))}
      </ul>
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
