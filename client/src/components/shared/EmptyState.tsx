import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type EmptyMood = "default" | "celebrate" | "sad";
export type EmptySize = "page" | "section" | "compact";

export interface EmptyAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

/**
 * The three 3D pictures for each page, left to right (files under /3d: Microsoft's Fluent Emoji, MIT licence, see
 * LICENSE-fluentui-emoji.txt). The middle one is the page's own; the other two are its companions.
 */
const TRIO = {
  "search-sad": ["houses", "search", "label"],
  "home-sad": ["rent", "houses", "buy"],
  "stay-sad": ["houses", "stay", "rent"],
  "professional-sad": ["memo", "briefcase", "build"],
  "wrench-sad": ["toolbox", "tools", "build"],
  "services-sad": ["tools", "toolbox", "memo"],
  requests: ["briefcase", "memo", "tools"],
  bookmark: ["houses", "bookmark", "label"],
  "bell-celebrate": ["party", "bell", "sparkles"],
  chat: ["wave", "envelope", "megaphone"],
  communities: ["wave", "megaphone", "newspaper"],
  projects: ["houses", "build", "manage"],
  feed: ["wave", "newspaper", "megaphone"],
  marketplace: ["houses", "label", "stay"],
  follow: ["megaphone", "wave", "sparkles"],
  trends: ["newspaper", "sparkles", "bell"],
} as const satisfies Record<string, readonly [string, string, string]>;

export type EmptyIcon = keyof typeof TRIO;

/** A page without its own pictures gets a set that matches the mood. */
const MOOD_TRIO: Record<EmptyMood, readonly [string, string, string]> = {
  default: ["label", "inbox", "memo"],
  celebrate: ["sparkles", "party", "bell"],
  sad: ["houses", "search", "label"],
};

/** The art is laid out once at the page size (280 x 170) and scaled down for the smaller sizes. */
const ART_SCALE: Record<EmptySize, number> = { page: 1, section: 0.65, compact: 0.5 };

const TILE = "absolute flex size-[104px] items-center justify-center rounded-[28px] border border-[#eef1f6] bg-white shadow-[0_14px_28px_-8px_rgba(15,23,42,0.22)]";

interface EmptyArtProps {
  mood?: EmptyMood;
  icon?: EmptyIcon;
  size?: EmptySize;
}

/** The picture at the top of an empty state: three tilted tiles, each holding a 3D picture, the middle one peeking out behind. */
export function EmptyArt({ mood = "default", icon, size = "page" }: EmptyArtProps) {
  const [left, middle, right] = icon ? TRIO[icon] : MOOD_TRIO[mood];
  const scale = ART_SCALE[size];
  const picture = (name: string) => <Image src={`/3d/${name}.png`} alt="" width={64} height={64} className="size-16 object-contain" />;

  return (
    <div aria-hidden className="relative shrink-0" style={{ width: 280 * scale, height: 170 * scale }}>
      <div className="absolute left-0 top-0 h-[170px] w-[280px] origin-top-left" style={{ transform: `scale(${scale})` }}>
        <span className={cn(TILE, "left-[88px] top-0")}>{picture(middle)}</span>
        <span className={cn(TILE, "left-[16px] top-[54px] -rotate-[8deg]")}>{picture(left)}</span>
        <span className={cn(TILE, "left-[160px] top-[62px] rotate-[10deg]")}>{picture(right)}</span>
      </div>
    </div>
  );
}

const PRIMARY_BUTTON = "inline-flex items-center justify-center rounded-[10px] bg-brand-900 px-[18px] py-2.5 text-sm font-semibold text-white hover:opacity-90";
const SECONDARY_BUTTON = "inline-flex items-center justify-center rounded-[10px] border border-[#e2e8f0] bg-white px-[18px] py-2.5 text-sm font-semibold text-[#0f172a] hover:bg-gray-50";
const PRIMARY_LINK = "text-[13px] font-semibold text-brand-900 hover:underline";
const SECONDARY_LINK = "text-[13px] font-semibold text-[#64748b] hover:underline";

function ActionControl({ action, className }: { action: EmptyAction; className: string }) {
  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}

interface EmptyStateProps {
  /** Page = a whole list or page is empty. Section = a block on a page. Compact = a right-rail card. */
  size?: EmptySize;
  mood?: EmptyMood;
  /** The set of pictures for this page; without one the mood picks them. */
  icon?: EmptyIcon;
  title: string;
  body: string;
  /** The card's own heading; Compact only. */
  header?: string;
  primary?: EmptyAction;
  secondary?: EmptyAction;
  className?: string;
}

/** Empty state (Figma node 1226:37951): one look for every list, feed and dashboard that can be empty. */
export function EmptyState({ size = "page", mood = "default", icon, title, body, header, primary, secondary, className }: EmptyStateProps) {
  const art = <EmptyArt mood={mood} icon={icon} size={size} />;

  if (size === "section") {
    return (
      <section className={cn("flex flex-col items-center gap-4 rounded-[18px] border-[1.5px] border-dashed border-[#cbd5e1] bg-[#f8fafc] p-5 text-center sm:flex-row sm:gap-6 sm:py-5 sm:pl-5 sm:pr-7 sm:text-left", className)}>
        {art}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="text-[17px] font-bold tracking-[-0.17px] text-[#0f172a]">{title}</h2>
          <p className="text-sm leading-[1.55] text-[#64748b]">{body}</p>
        </div>
        {(primary || secondary) && (
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
            {primary && <ActionControl action={primary} className={PRIMARY_BUTTON} />}
            {secondary && <ActionControl action={secondary} className={SECONDARY_BUTTON} />}
          </div>
        )}
      </section>
    );
  }

  if (size === "compact") {
    return (
      <section className={cn("flex flex-col items-center gap-1.5 rounded-2xl border border-[#e2e8f0] bg-white px-5 pb-5 pt-4", className)}>
        {header && <h2 className="w-full text-[15px] font-semibold text-[#0f172a]">{header}</h2>}
        {art}
        <h3 className="text-center text-[15px] font-semibold tracking-[-0.15px] text-[#0f172a]">{title}</h3>
        <p className="max-w-[260px] text-center text-[13px] leading-[1.55] text-[#64748b]">{body}</p>
        {(primary || secondary) && (
          <div className="flex items-start gap-3 pt-1.5">
            {primary && <ActionControl action={primary} className={PRIMARY_LINK} />}
            {secondary && <ActionControl action={secondary} className={SECONDARY_LINK} />}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className={cn("flex flex-col items-center gap-4 rounded-[20px] border border-[#e2e8f0] bg-white px-5 py-10 text-center sm:px-10 sm:py-14", className)}>
      {art}
      <div className="h-1" />
      <h2 className="text-[22px] font-bold tracking-[-0.22px] text-[#0f172a]">{title}</h2>
      <p className="max-w-[460px] text-[15px] leading-[1.55] text-[#64748b]">{body}</p>
      {(primary || secondary) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {primary && <ActionControl action={primary} className={PRIMARY_BUTTON} />}
          {secondary && <ActionControl action={secondary} className={SECONDARY_BUTTON} />}
        </div>
      )}
    </section>
  );
}
