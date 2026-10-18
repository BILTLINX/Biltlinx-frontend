"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { showSuccessToast } from "@/components/shared/AppToast";
import { BillingTab } from "@/components/shared/BillingTab";
import { GeneralSettingsTab } from "@/components/shared/GeneralSettingsTab";
import { NavIcon } from "@/components/shared/NavIcon";
import { SecurityTab } from "@/components/shared/SecurityTab";
import { cn } from "@/lib/utils";

const TABS = ["Profile", "Security", "Billings", "General Settings"] as const;
type Tab = (typeof TABS)[number];

const PERSONAL_INFO = [
  { label: "First Name", value: "Madeline" },
  { label: "Last Name", value: "Price" },
  { label: "Email", value: "madelineprice@gmail.com" },
  { label: "Phone Number", value: "0246508595" },
  { label: "Account ID", value: "Personal" },
];

const ADDRESS = [
  { label: "Country", value: "Ghana" },
  { label: "Region/State", value: "Greater Accra" },
  { label: "City", value: "Accra" },
  { label: "Postal Code", value: "00233" },
];

type Field = { label: string; value: string };

const AVATAR = "/icons/avatar-sample.jpg";

const isFilled = (fields: Field[]) => fields.every((field) => field.value.trim().length > 0);

/** Profile completion is derived from the saved profile data, so editing a section updates it live. */
function getCompletionSteps(personal: Field[], address: Field[]) {
  const valueOf = (label: string) => personal.find((field) => field.label === label)?.value.trim() ?? "";
  return [
    { label: "Setup account", percent: 50, done: valueOf("Email").length > 0 && valueOf("Account ID").length > 0 },
    { label: "Upload your photo", percent: 5, done: AVATAR.length > 0 },
    { label: "Personal Info", percent: 25, done: isFilled(personal) },
    { label: "Address", percent: 20, done: isFilled(address) },
  ];
}

const ACCOUNTS = [
  { name: "Madeline Price", email: "Madelinerrince@gmail.com", avatar: "/icons/avatar-sample.jpg" },
  { name: "Organization Name", email: "Madeline@amalitech.org" },
];

export default function AccountSettingsPage() {
  const [tab, setTab] = useState<Tab>("Profile");
  const [personal, setPersonal] = useState<Field[]>(PERSONAL_INFO);
  const [address, setAddress] = useState<Field[]>(ADDRESS);
  const completionCard = <ProfileCompletionCard steps={getCompletionSteps(personal, address)} />;

  return (
    <AppShell contentFullWidth rightRail={completionCard}>
      <div className="mx-auto flex w-full max-w-[762px] flex-col gap-4 pb-6 pt-2">
        <ProfileBanner />
        <nav
          className="flex h-[43px] w-full items-stretch overflow-x-auto rounded-2xl border border-[#e6e7ec] bg-white pl-4 pr-2.5 no-scrollbar"
          aria-label="Account sections"
        >
          {TABS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setTab(name)}
              aria-current={tab === name ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center justify-center whitespace-nowrap border-b px-4 text-[13px] leading-7",
                tab === name
                  ? "rounded-tl-2xl border-b-2 border-[#5d9afb] font-medium text-[#498cf8]"
                  : "border-[#e6e7ec] text-[#111826] hover:text-[#498cf8]",
              )}
            >
              {name}
            </button>
          ))}
        </nav>

        <div className="rounded-2xl border border-gray-200 bg-white p-3">
          {tab === "Profile" ? (
            <ProfileTab personal={personal} address={address} onSavePersonal={setPersonal} onSaveAddress={setAddress} />
          ) : tab === "Security" ? (
            <SecurityTab />
          ) : tab === "Billings" ? (
            <BillingTab />
          ) : tab === "General Settings" ? (
            <GeneralSettingsTab />
          ) : (
            <p className="px-4 py-16 text-center text-sm text-gray-500">{tab} is coming soon.</p>
          )}
        </div>

        <div className="hidden sm:block xl:hidden">
          {completionCard}
        </div>
      </div>
    </AppShell>
  );
}

function ProfileBanner() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[181px] w-full overflow-hidden rounded-[32px] border-[10px] border-white/20 bg-[#1465e6]">
        <Image src="/icons/account-banner-star.svg" alt="" width={80} height={118} unoptimized className="absolute right-[16%] top-[112px]" />
        <Image src="/icons/account-banner-stars.svg" alt="" width={211} height={232} unoptimized className="absolute -top-[69px] left-[72%]" />
        <Image src="/icons/account-banner-stars.svg" alt="" width={211} height={232} unoptimized className="absolute -left-[39px] -top-[33px]" />
      </div>
      <div className="-mt-[68px] flex w-[calc(100%-24px)] sm:w-[calc(100%-54px)] items-center justify-between gap-2 rounded-2xl bg-gradient-to-b sm:rounded-[33px] from-[#cfddfa] via-white to-white p-3 sm:gap-3 shadow-[0px_20px_27px_0px_rgba(0,0,0,0.05)] backdrop-blur-[13.5px] sm:p-6">
        <IdentityBlock banner />
        <SwitchRoleMenu />
      </div>
    </div>
  );
}

function IdentityBlock({ compact = false, banner = false }: { compact?: boolean; banner?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className={cn("relative block shrink-0", banner ? "size-14 sm:size-[72px]" : "size-[67px]")}>
        <span className={cn("relative block size-full overflow-hidden", banner ? "rounded-[23px]" : "rounded-2xl")}>
          <Image src="/icons/avatar-sample.jpg" alt="Madeline Price" fill className="object-cover" sizes="72px" />
        </span>
        {banner ? (
          <span className="absolute -bottom-[2px] -right-[2px] flex items-center rounded-full border border-dashed border-[#ff8d28] bg-gradient-to-r from-[#ff8d28] via-[#e24bb9] to-[#983fe0] p-1 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)]">
            <Image src="/icons/account-banner-upload.svg" alt="Upload photo" width={10} height={10} unoptimized />
          </span>
        ) : (
          <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-[#ff3d9a] to-[#a43dff] ring-2 ring-white">
            <NavIcon icon="/icons/file-verified.svg" color="night" size={10} className="bg-white" />
          </span>
        )}
      </span>
      <div className="flex min-w-0 flex-col items-start gap-0.5">
        <p className={cn("truncate font-semibold text-[#0f1621]", compact ? "text-sm" : "text-base leading-4")}>Madeline Price</p>
        <p className="flex items-center gap-1.5 text-[11px] text-[#0f1621]">
          <NavIcon icon="/icons/map-pin-02-sm.svg" color="night" size={12} />
          Accra , Ghana
        </p>
        <span className="flex h-4 w-fit shrink-0 items-center whitespace-nowrap rounded-full bg-[#e2e8f0] px-2 text-[10px] leading-4 text-[#1465e6]">ID Verified</span>
      </div>
    </div>
  );
}

function SwitchRoleMenu() {
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

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-2xl bg-white px-3 text-xs sm:h-10 sm:gap-2 sm:rounded-[10px] sm:px-4 sm:text-sm text-[#404040] hover:bg-gray-50"
      >
        Switch role
        <NavIcon icon="/icons/poll-chevron-down.svg" color="night" size={10} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[266px] rounded-[26px] border border-[rgba(15,22,33,0.12)] bg-white/10 p-2.5 shadow-[0px_24px_60px_-15px_rgba(0,0,0,0.15)] backdrop-blur-[8px]">
          <div className="flex flex-col gap-2.5 rounded-2xl bg-white/90 p-2.5">
            <p className="text-sm font-semibold leading-5 text-[#001f3f]">Switch account</p>
            <ul className="flex flex-col gap-1">
              {ACCOUNTS.map((account) => (
                <li key={account.name}>
                  <button type="button" className="flex w-full items-center gap-2 py-1 text-left" onClick={() => setOpen(false)}>
                    <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-[0.4px] border-[#ebebeb] bg-white">
                      {account.avatar ? (
                        <Image src={account.avatar} alt="" fill className="object-cover" sizes="32px" />
                      ) : (
                        <NavIcon icon="/icons/org.svg" color="night" size={16} />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[15px] font-medium leading-4 text-black">{account.name}</span>
                      <span className="truncate text-xs leading-4 text-gray-400">{account.email}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileTab({
  personal,
  address,
  onSavePersonal,
  onSaveAddress,
}: {
  personal: Field[];
  address: Field[];
  onSavePersonal: (fields: Field[]) => void;
  onSaveAddress: (fields: Field[]) => void;
}) {
  return (
    <div className="flex flex-col gap-4 px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-night-900">Profile</h1>
        <p className="text-[13px] text-gray-600">Account information from your authentication profile</p>
      </div>

      <InfoCard title="Personal Information" fields={personal} onSave={onSavePersonal} />
      <InfoCard title="Address" fields={address} onSave={onSaveAddress} />
    </div>
  );
}

function InfoCard({ title, fields, onSave }: { title: string; fields: Field[]; onSave: (fields: Field[]) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(fields);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);

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

  function save() {
    onSave(draft);
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
          "flex flex-col gap-5 border border-gray-200 p-4 transition-[border-radius,box-shadow] duration-200 sm:p-5",
          editing
            ? "relative z-[60] rounded-[28px] bg-white shadow-[0px_24px_60px_-15px_rgba(0,0,0,0.25)]"
            : "rounded-2xl",
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className={cn("text-night-900", editing ? "text-base font-semibold tracking-[-0.48px] text-[#111826]" : "text-[15px] font-medium")}>
            {title}
          </h2>
          {!editing && (
            <button
              type="button"
              onClick={startEditing}
              className="flex h-8 items-center gap-2 rounded-2xl border border-gray-200 px-3 text-xs text-night-900 hover:bg-gray-50 sm:rounded-lg"
            >
              Edit
              <NavIcon icon="/icons/poll-option-edit.svg" color="night" size={12} />
            </button>
          )}
        </div>
        <dl className={cn("grid grid-cols-1 gap-x-12 sm:grid-cols-2", editing ? "gap-y-4" : "gap-y-4")}>
          {shown.map((field, index) => (
            <div
              key={field.label}
              className={cn(
                "flex items-center justify-between gap-3 border-b pb-2 text-[13px]",
                editing && index === 0 ? "border-brand-900" : "border-gray-200",
              )}
            >
              <dt className="shrink-0 text-gray-400">{field.label}</dt>
              {editing ? (
                <dd className="min-w-0 flex-1">
                  <input
                    value={field.value}
                    onChange={(event) =>
                      setDraft((current) => current.map((item, i) => (i === index ? { ...item, value: event.target.value } : item)))
                    }
                    aria-label={field.label}
                    ref={index === 0 ? firstInputRef : undefined}
                    className="w-full bg-transparent text-right font-medium text-[#334154] focus:outline-none"
                  />
                </dd>
              ) : (
                <dd className="truncate text-night-900">{field.value}</dd>
              )}
            </div>
          ))}
        </dl>
        {editing && (
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={discard}
              className="h-10 shrink-0 whitespace-nowrap rounded-2xl border border-[#e2e8f0] bg-white px-3 text-xs sm:rounded-lg sm:px-4 sm:text-sm text-[#0f1621] hover:bg-gray-50"
            >
              Discard Changes
            </button>
            <button
              type="button"
              onClick={save}
              className="h-10 min-w-0 flex-1 whitespace-nowrap rounded-2xl bg-brand-900 px-3 text-xs text-white sm:rounded-lg sm:px-4 sm:text-sm hover:bg-brand-900/90"
            >
              Save Changes
            </button>
          </div>
        )}
      </section>
    </>
  );
}

function ProfileCompletionCard({ steps }: { steps: ReturnType<typeof getCompletionSteps> }) {
  const total = steps.reduce((sum, step) => sum + (step.done ? step.percent : 0), 0);

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5">
      <span
        className="flex size-[56px] items-center justify-center rounded-full p-[3px]"
        style={{ background: `conic-gradient(#1465e6 ${total}%, #e2e8f0 0)` }}
      >
        <span className="relative block size-full overflow-hidden rounded-full border-2 border-white">
          <Image src={AVATAR} alt="" fill className="object-cover" sizes="56px" />
        </span>
      </span>
      <div className="flex flex-col items-center gap-0.5 text-center">
        <p className="text-sm font-semibold text-night-900">Good Morning Madeline</p>
        <p className="text-[10px] text-night-900">
          Profile is <span className="text-brand-900">{total}%</span> Percent Complete.
        </p>
      </div>
      <ul className="flex w-full flex-col gap-1.5">
        {steps.map((step) => (
          <li
            key={step.label}
            className={cn("flex items-center justify-between text-[10px]", step.done ? "text-night-900" : "text-gray-400")}
          >
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
