"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { ACCOUNT_TYPES, NEW_ACCOUNT_NAME, type AccountType, type AccountTypeId } from "@/lib/dummy-onboarding";
import { logout } from "@/lib/auth-api";
import { cn } from "@/lib/utils";

/* On short screens (laptops) everything tightens up via the max-height variants so the whole step still fits without scrolling. Class names are written out in full so Tailwind can see them. */

function AccountTypeCard({ type, selected, onSelect }: { type: AccountType; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-3.5 rounded-2xl p-5 text-left transition-colors",
        `[@media(max-height:780px)]:gap-2 [@media(max-height:780px)]:p-3.5`,
        selected ? `border-2 border-brand-900 bg-[#eff5ff] p-[19px] [@media(max-height:780px)]:p-[13px]` : "border border-gray-200 bg-white hover:border-gray-300",
      )}
    >
      <span className="flex w-full items-center justify-between">
        <span className={cn("flex size-12 items-center justify-center rounded-xl", `[@media(max-height:780px)]:size-10`, selected ? "bg-brand-900" : "bg-[#f1f5f9]")}>
          <NavIcon icon={type.icon} size={24} className={cn(selected ? "bg-white" : "bg-[#334155]", type.iconFlipped && "-scale-y-100")} />
        </span>
        <span aria-hidden className={cn("size-5 rounded-[10px] bg-white", selected ? "border-[6px] border-brand-900" : "border-[1.5px] border-gray-200")} />
      </span>
      <span className="flex w-full flex-col gap-1">
        <span className={cn("text-lg font-bold leading-[1.45] text-[#0f172a]", `[@media(max-height:780px)]:text-base`)}>{type.title}</span>
        <span className={cn("text-[13px] leading-[1.45] text-gray-500", `[@media(max-height:780px)]:text-xs`)}>{type.description}</span>
      </span>
      <span aria-hidden className={cn("h-px w-full", selected ? "bg-[#c4d7fa]" : "bg-gray-200")} />
      <span className={cn("flex w-full flex-col gap-2", `[@media(max-height:780px)]:gap-1`)}>
        {type.features.map((feature) => (
          <span key={feature} className={cn("flex items-start gap-2 text-[13px] font-medium leading-[1.45] text-[#334155]", `[@media(max-height:780px)]:text-xs`)}>
            <NavIcon icon="/icons/onboarding-tick.svg" size={10} className={cn("mt-0.5", selected ? "bg-brand-900" : "bg-[#16a34a]")} />
            {feature}
          </span>
        ))}
      </span>
      <span className="mt-auto flex w-full flex-wrap items-center justify-between gap-2 pt-2">
        <span className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium leading-[1.45] text-gray-500">
          <NavIcon icon="/icons/onboarding-clock.svg" size={14} className="bg-gray-500" />
          {type.duration}
        </span>
        {type.hint && <span className="whitespace-nowrap rounded-lg bg-[#f1f5f9] px-2 py-1 text-[11px] font-semibold leading-[1.45] text-gray-500">{type.hint}</span>}
      </span>
    </button>
  );
}

/** Onboarding · Choose account type (Figma node 1068:31114): the first step after a new account is created. */
export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<AccountTypeId>("professional");
  const selectedType = ACCOUNT_TYPES.find((type) => type.id === selected) ?? ACCOUNT_TYPES[0];

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // session may already be gone; leave the page regardless
    }
    showSuccessToast("You've been logged out");
    router.push("/auth");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar actionLabel="Log out" onAction={handleLogout} />

      <main className={cn("flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 py-4 sm:px-10 xl:px-20", `[@media(max-height:780px)]:py-2`)}>
        <div className={cn("my-auto flex w-full flex-col items-center gap-4", `[@media(max-height:780px)]:gap-2.5`)}>
          <div className={cn("flex flex-col items-center gap-2.5 text-center", `[@media(max-height:780px)]:gap-1.5`)}>
            <p className="flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1.5 text-[13px] font-semibold text-[#16a34a]">
              <NavIcon icon="/icons/onboarding-check-circle.svg" size={16} className="bg-[#16a34a]" />
              Account created · Welcome, {NEW_ACCOUNT_NAME}
            </p>
            <h1 className={cn("text-[28px] font-extrabold leading-[1.45] text-[#0f172a] sm:text-[32px]", `[@media(max-height:780px)]:text-2xl [@media(max-height:780px)]:leading-tight`)}>How will you use Biltlinx?</h1>
            <p className={cn("max-w-[640px] text-base leading-[1.45] text-gray-500", `[@media(max-height:780px)]:text-[13px]`)}>
              Pick the one that fits best right now. It only changes what we set up first. One account covers every role, so you can add the others later from your profile.
            </p>
          </div>

          <div role="radiogroup" aria-label="Account type" className={cn("grid w-full max-w-[1280px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5", `[@media(max-height:780px)]:gap-3`)}>
            {ACCOUNT_TYPES.map((type) => (
              <AccountTypeCard key={type.id} type={type} selected={type.id === selected} onSelect={() => setSelected(type.id)} />
            ))}
          </div>

          <p className={cn("flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[13px] font-medium leading-[1.45] text-[#334155]", `[@media(max-height:780px)]:py-2 [@media(max-height:780px)]:text-xs`)}>
            <NavIcon icon="/icons/onboarding-user-switch.svg" size={18} className="shrink-0 bg-brand-900" />
            Already do more than one thing? Start with your main role. You can switch between roles anytime from your profile menu.
          </p>

          <div className={cn("flex flex-col items-center gap-3", `[@media(max-height:780px)]:gap-1.5`)}>
            <button
              type="button"
              onClick={() => {
                router.push(selectedType.setupHref ?? "/home");
              }}
              className={cn("flex w-full items-center justify-center gap-2 rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90 sm:w-[360px]", `[@media(max-height:780px)]:py-2.5`)}
            >
              Continue as {selectedType.title}
              <NavIcon icon="/icons/onboarding-arrow-right.svg" size={10} className="bg-white" />
            </button>
            <button type="button" onClick={() => router.push("/home")} className="text-sm font-semibold text-brand-900">
              Skip for now, I&apos;m just looking around
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

