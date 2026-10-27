import Image from "next/image";
import { NavIcon } from "@/components/shared/NavIcon";
import { cn } from "@/lib/utils";

interface OnboardingTopBarProps {
  /** Centered caption, e.g. the setup flow the user is in. */
  title?: string;
  /** Without a label the exit is just the close icon. */
  actionLabel?: string;
  /** The icon beside the label: a close cross by default, the logout arrow, or a bookmark for "save and finish later". */
  actionIcon?: "close" | "logout" | "bookmark";
  onAction: () => void;
}

/** The sticky bar across every onboarding step: logo, where you are, and a way out. */
export function OnboardingTopBar({ title, actionLabel, actionIcon = "close", onAction }: OnboardingTopBarProps) {
  return (
    <header className={cn("sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-2.5 sm:px-12", "[@media(max-height:780px)]:py-1")}>
      <span className="relative block h-[51px] w-[102px] shrink-0 [@media(max-height:780px)]:h-10 [@media(max-height:780px)]:w-20">
        <Image src="/icons/logo-biltlinx.png" alt="Biltlinx" fill className="object-contain" sizes="102px" priority />
      </span>
      {title && <p className="hidden text-sm font-semibold text-[#334155] md:block">{title}</p>}
      <button type="button" onClick={onAction} aria-label={actionLabel ? undefined : "Close"} className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-semibold text-brand-900">
        {actionLabel}
        {actionIcon === "logout" && <NavIcon icon="/icons/onboarding-logout.svg" size={16} className="bg-brand-900" />}
        {actionIcon === "bookmark" && <NavIcon icon="/icons/onboarding-bookmark.svg" size={17} className="bg-brand-900" />}
        {actionIcon === "close" && <NavIcon icon="/icons/onboarding-cancel.svg" size={12} className="bg-gray-500" />}
      </button>
    </header>
  );
}
