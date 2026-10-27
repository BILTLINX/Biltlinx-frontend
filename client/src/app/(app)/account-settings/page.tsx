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
import { PrivacyTab } from "@/components/shared/PrivacyTab";
import { SecurityTab } from "@/components/shared/SecurityTab";
import { TeamsTab } from "@/components/shared/TeamsTab";
import { useOrganization } from "@/context/OrganizationContext";
import { useSession } from "@/context/SessionContext";
import { updateProfile, type ProfileChanges } from "@/lib/account-api";
import { notifyError } from "@/lib/errors";
import { formatDate } from "@/lib/format";
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

/** One line of a profile card. Read-only lines are shown but can't be changed here. */
interface Field {
  key: string;
  label: string;
  value: string;
  readOnly?: boolean;
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

function ProfileBanner() {
  const { user } = useSession();
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[181px] w-full overflow-hidden rounded-[32px] border-[10px] border-white/20 bg-[#1465e6]">
        <Image src="/icons/account-banner-star.svg" alt="" width={80} height={118} unoptimized className="absolute right-[16%] top-[112px]" />
        <Image src="/icons/account-banner-stars.svg" alt="" width={211} height={232} unoptimized className="absolute -top-[69px] left-[72%]" />
        <Image src="/icons/account-banner-stars.svg" alt="" width={211} height={232} unoptimized className="absolute -left-[39px] -top-[33px]" />
      </div>
      <div className="-mt-[68px] flex w-[calc(100%-24px)] items-center justify-between gap-2 rounded-2xl bg-gradient-to-b from-[#cfddfa] via-white to-white p-3 shadow-[0px_20px_27px_0px_rgba(0,0,0,0.06)] sm:w-[calc(100%-54px)] sm:rounded-[33px]">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative block size-14 shrink-0 sm:size-[72px]">
            <span className="relative block size-full overflow-hidden rounded-[23px] bg-[#eef2ff]">
              <Image src={user?.profilePicUrl ?? PLACEHOLDER_AVATAR} alt={user?.username ?? "Your photo"} fill className="object-cover" sizes="72px" />
            </span>
            <span className="absolute -bottom-[2px] -right-[2px] flex items-center rounded-full border border-dashed border-[#ff8d28] bg-gradient-to-r from-[#ff8d28] via-[#ff3d9a] to-[#a43dff] p-1.5">
              <Image src="/icons/account-banner-upload.svg" alt="Upload photo" width={10} height={10} unoptimized />
            </span>
          </span>
          <div className="flex min-w-0 flex-col items-start gap-0.5">
            <p className="truncate text-base font-semibold leading-4 text-[#0f1621]">{user?.username}</p>
            <p className="flex items-center gap-1.5 text-[11px] text-[#0f1621]">
              <NavIcon icon="/icons/map-pin-02-sm.svg" color="night" size={12} />
              {user?.location || (user ? `Member since ${formatDate(user.createdAt)}` : "")}
            </p>
            <span className="flex h-4 w-fit shrink-0 items-center whitespace-nowrap rounded-full bg-[#e2e8f0] px-2 text-[10px] leading-4 text-[#1465e6]">{user?.isVerified ? "ID verified" : "ID not verified yet"}</span>
          </div>
        </div>
        <SwitchRoleMenu />
      </div>
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
        <NavIcon icon="/icons/poll-chevron-down.svg" color="night" size={10} />
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
  const { user, refresh } = useSession();

  const personal: Field[] = [
    { key: "displayName", label: "Display name", value: user?.username ?? "" },
    { key: "email", label: "Email", value: user?.accounts[0]?.email ?? "", readOnly: true },
    { key: "phone", label: "Phone number", value: user?.primaryContact ?? "", readOnly: true },
    ...(user?.otherContact ? [{ key: "other", label: "Other contact", value: user.otherContact, readOnly: true }] : []),
    { key: "bio", label: "Bio", value: user?.bio ?? "" },
    { key: "status", label: "Account status", value: user?.status ?? "", readOnly: true },
  ];
  const address: Field[] = [{ key: "location", label: "Location", value: user?.location ?? "" }];

  /** Saves the editable lines of a card; the other lines are read from the account and can't be changed here. */
  async function save(fields: Field[]) {
    const changes: ProfileChanges = {};
    for (const field of fields) {
      if (field.readOnly) continue;
      if (field.key === "displayName") changes.displayName = field.value.trim();
      if (field.key === "bio") changes.bio = field.value.trim();
      if (field.key === "location") changes.location = field.value.trim();
    }
    try {
      await updateProfile(changes);
      await refresh();
      return true;
    } catch (error) {
      notifyError(error, "That could not be saved. Please try again.");
      return false;
    }
  }

  return (
    <div className="flex flex-col gap-4 px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-night-900">Profile</h1>
        <p className="text-[13px] text-gray-600">Your account details. To change your email or phone, use the Security tab.</p>
      </div>

      <InfoCard title="Personal Information" fields={personal} onSave={save} />
      <InfoCard title="Address" fields={address} onSave={save} />
    </div>
  );
}

/** A profile card that opens up in place: the page dims behind it, its lines become inputs, and Esc or a press outside discards. */
function InfoCard({ title, fields, onSave }: { title: string; fields: Field[]; onSave: (fields: Field[]) => Promise<boolean> }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(fields);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const firstEditable = fields.findIndex((field) => !field.readOnly);

  useEffect(() => {
    if (!editing) return;
    // preventScroll: a plain autoFocus scrolls the page abruptly while the card is still resizing.
    firstInputRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") discard();
    };
    // The dim layer ignores pointer events so wheel/touch scrolling still reaches the page; a press outside the card discards instead.
    const onPointerDown = (event: PointerEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) discard();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  function startEditing() {
    setDraft(fields);
    setEditing(true);
  }

  function discard() {
    setDraft(fields);
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    const saved = await onSave(draft);
    setSaving(false);
    if (!saved) return;
    setEditing(false);
    showSuccessToast(`${title} updated`);
  }

  const shown = editing ? draft : fields;

  return (
    <>
      {editing && <div className="pointer-events-none fixed inset-0 z-50 bg-black/25" aria-hidden="true" />}
      <section
        ref={cardRef}
        className={cn(
          "flex flex-col gap-5 border border-gray-200 bg-white p-4 transition-[border-radius,box-shadow] duration-200 sm:p-5",
          editing ? "relative z-[60] rounded-[28px] shadow-[0px_24px_60px_-15px_rgba(0,0,0,0.25)]" : "rounded-2xl",
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className={cn("text-night-900", editing ? "text-base font-semibold tracking-[-0.48px] text-[#111826]" : "text-[15px] font-medium")}>{title}</h2>
          {!editing && (
            <button type="button" onClick={startEditing} className="flex h-8 items-center gap-2 rounded-2xl border border-gray-200 px-3 text-xs text-night-900 hover:bg-gray-50 sm:rounded-lg">
              Edit
              <NavIcon icon="/icons/poll-option-edit.svg" color="night" size={12} />
            </button>
          )}
        </div>
        <dl className="grid grid-cols-1 gap-x-12 gap-y-4 sm:grid-cols-2">
          {shown.map((field, index) => (
            <div key={field.key} className={cn("flex items-center justify-between gap-3 border-b pb-2 text-[13px]", editing && index === firstEditable ? "border-brand-900" : "border-gray-200")}>
              <dt className="shrink-0 text-gray-400">{field.label}</dt>
              {editing && !field.readOnly ? (
                <dd className="min-w-0 flex-1">
                  <input
                    value={field.value}
                    maxLength={field.key === "bio" ? 160 : 80}
                    onChange={(event) => setDraft((current) => current.map((item) => (item.key === field.key ? { ...item, value: event.target.value } : item)))}
                    aria-label={field.label}
                    ref={index === firstEditable ? firstInputRef : undefined}
                    className="w-full bg-transparent text-right font-medium text-[#334154] focus:outline-none"
                  />
                </dd>
              ) : (
                <dd className={cn("min-w-0 flex-1 truncate text-right", field.readOnly && editing ? "text-gray-400" : "text-night-900")}>{field.value || "—"}</dd>
              )}
            </div>
          ))}
        </dl>
        {editing && (
          <div className="flex items-center gap-2 sm:gap-4">
            <button type="button" onClick={discard} className="h-10 shrink-0 whitespace-nowrap rounded-2xl border border-[#e2e8f0] bg-white px-3 text-xs text-[#0f1621] hover:bg-gray-50 sm:rounded-lg sm:px-4 sm:text-sm">
              Discard Changes
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="h-10 min-w-0 flex-1 whitespace-nowrap rounded-2xl bg-brand-900 px-3 text-xs text-white hover:bg-brand-900/90 disabled:opacity-60 sm:rounded-lg sm:px-4 sm:text-sm"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}
      </section>
    </>
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
