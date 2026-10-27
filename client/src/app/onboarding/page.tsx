"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingHouseIllustration } from "@/components/shared/OnboardingHouseIllustration";
import { ACCOUNT_TYPES, type AccountType, type AccountTypeId } from "@/lib/dummy-onboarding";
import { cn } from "@/lib/utils";

function AccountTypeOption({ type, selected, onSelect }: { type: AccountType; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl text-left shadow-[0_1px_1px_rgba(0,0,0,0.05)]",
        selected ? "border-2 border-brand-900 bg-[#eff5ff] p-[18px] [@media(min-height:641px)_and_(max-height:780px)]:lg:p-[13px] [@media(max-height:640px)]:lg:p-[10px]" : "border border-[#e2e8f0] bg-white p-[17px] hover:border-gray-300 [@media(min-height:641px)_and_(max-height:780px)]:lg:p-[14px] [@media(max-height:640px)]:lg:p-[11px]",
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-3.5 pr-2">
        <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl [@media(min-height:641px)_and_(max-height:780px)]:lg:size-11 [@media(max-height:640px)]:lg:size-10", selected ? "bg-brand-900" : "bg-[#f1f5f9]")}>
          <NavIcon icon={type.icon} size={24} className={cn(selected ? "bg-white" : "bg-[#334155]", type.iconFlipped && "-scale-y-100")} />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className={cn("font-inter text-base font-semibold leading-6", selected ? "text-[#0f172a]" : "text-[#1e293b]")}>{type.title}</span>
          <span className="text-[13px] leading-[1.45] text-[#64748a] lg:truncate">{type.description}</span>
        </span>
      </span>
      <NavIcon icon="/icons/chevron-right.svg" size={16} className={cn("shrink-0", selected ? "bg-brand-900" : "bg-[#94a3b8]")} />
    </button>
  );
}

/** Onboarding · Choose account type (Figma node 1281:125225): a branded left panel and the list of account types on the right. */
export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<AccountTypeId>("professional");
  const selectedType = ACCOUNT_TYPES.find((type) => type.id === selected) ?? ACCOUNT_TYPES[0];

  return (
    <div className="flex min-h-dvh flex-col bg-white lg:h-dvh lg:flex-row lg:overflow-hidden">
      <section className="flex flex-col justify-between border-b border-[#f1f5f9] bg-gradient-to-b from-[rgba(239,246,255,0.7)] via-[rgba(248,250,252,0.5)] to-[rgba(239,246,255,0.4)] px-6 py-8 sm:px-12 sm:py-12 lg:min-h-0 lg:flex-1 lg:border-b-0 lg:border-r [@media(max-height:780px)]:lg:py-6">
        <div className="flex flex-col gap-4 [@media(max-height:780px)]:lg:gap-2">
          <span className="relative block h-[51px] w-[102px] shrink-0">
            <Image src="/icons/logo-biltlinx.png" alt="Biltlinx" fill className="object-contain object-left" sizes="102px" priority />
          </span>
          <h1 className="pt-4 text-[28px] font-extrabold leading-[1.45] text-[#0f172a] sm:text-4xl [@media(max-height:780px)]:lg:pt-2 [@media(max-height:780px)]:lg:text-3xl">How will you use Biltlinx?</h1>
          <p className="max-w-[448px] text-base leading-[1.45] text-[#64748a]">
            Pick the one that fits best right now. It only changes what we set up first. One account covers every role, so you can add the others later from your profile.
          </p>
        </div>

        <div className="hidden min-h-0 justify-center py-6 lg:flex [@media(max-height:780px)]:py-2">
          <OnboardingHouseIllustration />
        </div>
        <div aria-hidden className="hidden h-3.5 lg:block" />
      </section>

      <section className="flex flex-col justify-between gap-8 bg-white px-6 py-8 sm:px-12 sm:py-12 lg:min-h-0 lg:flex-1 lg:px-10 2xl:px-12 [@media(min-height:641px)_and_(max-height:780px)]:lg:gap-4 [@media(min-height:641px)_and_(max-height:780px)]:lg:py-6 [@media(max-height:640px)]:lg:gap-3 [@media(max-height:640px)]:lg:py-5">
        <div className="flex flex-col gap-7 [@media(min-height:641px)_and_(max-height:780px)]:lg:gap-5 [@media(max-height:640px)]:lg:gap-3">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-inter text-2xl font-bold leading-8 tracking-[-0.6px] text-[#0f172a]">Get started</h2>
            <p className="font-inter text-sm leading-5 text-[#64748b]">Choose the type of account that best describes you.</p>
          </div>

          <div role="radiogroup" aria-label="Account type" className="flex flex-col gap-3.5 [@media(min-height:641px)_and_(max-height:780px)]:lg:gap-2.5 [@media(max-height:640px)]:lg:gap-2">
            {ACCOUNT_TYPES.map((type) => (
              <AccountTypeOption key={type.id} type={type} selected={type.id === selected} onSelect={() => setSelected(type.id)} />
            ))}
          </div>
        </div>

        <div className="border-t border-[#f1f5f9] pt-8 [@media(min-height:641px)_and_(max-height:780px)]:lg:pt-5 [@media(max-height:640px)]:lg:pt-4">
          <button
            type="button"
            onClick={() => router.push(selectedType.setupHref ?? "/home")}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold leading-[1.45] text-white hover:opacity-90"
          >
            Continue as {selectedType.title}
            <NavIcon icon="/icons/onboarding-arrow-right.svg" size={10} className="bg-white" />
          </button>
        </div>
      </section>
    </div>
  );
}
