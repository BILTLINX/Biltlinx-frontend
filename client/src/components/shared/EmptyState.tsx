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

const ART = "/empty-states";
/** The art is drawn once at the Page size (200 × 150) and scaled down for the smaller sizes, as in the design. */
const ART_SCALE: Record<EmptySize, number> = { page: 1, section: 0.7, compact: 0.6 };

const MOOD = {
  default: { bar: "bg-[#c7dbfb]", shadow: "shadow-[0_12px_24px_-6px_rgba(20,101,230,0.18)]" },
  celebrate: { bar: "bg-[#a7f3d0]", shadow: "shadow-[0_12px_24px_-6px_rgba(22,163,74,0.18)]" },
  sad: { bar: "bg-[#cbd5e1]", shadow: "shadow-[0_12px_24px_-6px_rgba(100,116,139,0.18)]" },
} satisfies Record<EmptyMood, { bar: string; shadow: string }>;

/** [left, top, width, height, rotation, colour] of each confetti piece's bounding box. */
const CONFETTI: [number, number, number, number, number, string][] = [
  [30, 18, 13.092, 10.677, -30, "#f59e0b"],
  [158.15, 20, 13.123, 9.179, 20, "#ec4899"],
  [24, 93.61, 10.677, 13.092, -60, "#1465e6"],
  [166.53, 96, 12.664, 11.85, 40, "#f59e0b"],
  [150, 124.89, 12.989, 8.322, -15, "#22c55e"],
  [47.06, 132, 12.755, 7.402, 10, "#ec4899"],
  [100, -2.49, 12.304, 12.304, -45, "#1465e6"],
];

/**
 * The tile icons drawn for each page (files under /empty-states/icons). Each SVG was exported with its own padding inside
 * the 34px tile (`inset`, then `bleed` for its stroke), and some came out upside-down (`flip`), so both are kept here.
 */
export type EmptyIcon = "search-sad" | "home-sad" | "stay-sad" | "professional-sad" | "wrench-sad" | "services-sad" | "requests" | "bookmark" | "bell-celebrate" | "chat" | "communities" | "projects";

interface IconGeometry {
  inset: string;
  bleed: string;
  flip?: boolean;
}

const ICONS: Record<EmptyIcon, IconGeometry> = {
  "search-sad": { inset: "8.33%", bleed: "-2.5%" },
  "home-sad": { inset: "8.33%", bleed: "-2.5%", flip: true },
  "stay-sad": { inset: "14.58% 8.33%", bleed: "-2.94% -2.5%", flip: true },
  "professional-sad": { inset: "8.33%", bleed: "-2.5% -2.51% -2.51% -2.5%" },
  "wrench-sad": { inset: "10.42%", bleed: "-2.63%" },
  "services-sad": { inset: "10.42%", bleed: "-2.63%" },
  requests: { inset: "8.33%", bleed: "-1.77%" },
  bookmark: { inset: "8.33% 16.67%", bleed: "-1.77% -2.2% -1.76% -2.21%" },
  chat: { inset: "8.33%", bleed: "-1.77%" },
  communities: { inset: "16.67% 4.17%", bleed: "-2.2% -1.6% -2.2% -1.61%" },
  projects: { inset: "8.33% 10.42% 8.33% 8.33%", bleed: "-1.77% -1.81%" },
  "bell-celebrate": { inset: "8.33% 12.5%", bleed: "-2.5% -2.77% -2.5% -2.78%" },
};

const DROPS: [number, number][] = [[44, 22], [58, 40], [150, 30], [162, 50]];

function Decor({ src, left, top, size, className }: { src: string; left: number; top: number; size: number; className?: string }) {
  return <Image src={src} alt="" width={size} height={size} className={cn("absolute max-w-none", className)} style={{ left, top }} />;
}

interface EmptyArtProps {
  mood?: EmptyMood;
  /** The tile's icon for this page; defaults to the inbox. */
  icon?: EmptyIcon;
  size?: EmptySize;
}

/** The illustration for empty states: Default = nothing yet, Celebrate = all caught up, Sad = no results. */
export function EmptyArt({ mood = "default", icon, size = "page" }: EmptyArtProps) {
  const scale = ART_SCALE[size];
  const style = MOOD[mood];
  return (
    <div aria-hidden className="relative shrink-0" style={{ width: 200 * scale, height: 150 * scale }}>
      <div className="absolute left-0 top-0 h-[150px] w-[200px] origin-top-left" style={{ transform: `scale(${scale})` }}>
        <Image src={`${ART}/ring-${mood}.png`} alt="" width={156} height={156} className="absolute left-[22px] top-[-3px] max-w-none" />
        <Image src={`${ART}/blob-${mood}.svg`} alt="" width={128} height={128} className="absolute left-9 top-[11px] max-w-none" />

        <div className="absolute left-[22.1px] top-[23px] h-[66px] w-[96px] -rotate-[8deg] overflow-hidden rounded-[14px] border border-[#e2e8f0] bg-white">
          <span className={cn("absolute left-[11px] top-[13px] h-[7px] w-[40px] rounded-[4px]", style.bar)} />
          <span className="absolute left-[11px] top-[29px] h-[7px] w-[64px] rounded-[4px] bg-[#f1f5f9]" />
          <span className="absolute left-[11px] top-[43px] h-[7px] w-[48px] rounded-[4px] bg-[#f1f5f9]" />
        </div>
        <div className="absolute left-[100.3px] top-[78.85px] h-[58px] w-[84px] rotate-[10deg] overflow-hidden rounded-[14px] border border-[#e2e8f0] bg-white">
          <span className="absolute left-[11px] top-[11px] h-[7px] w-[28px] rounded-[4px] bg-[#f1f5f9]" />
          <span className="absolute left-[11px] top-[25px] h-[7px] w-[56px] rounded-[4px] bg-[#f1f5f9]" />
        </div>

        <div className={cn("absolute left-[62px] top-[37px] size-[76px] overflow-hidden rounded-[22px] border border-[#e2e8f0] bg-white", style.shadow)}>
          {icon ? (
            <span className={cn("absolute left-5 top-5 size-[34px]", ICONS[icon].flip && "rotate-180 -scale-x-100")}>
              <span className="absolute" style={{ inset: ICONS[icon].inset }}>
                <span className="absolute" style={{ inset: ICONS[icon].bleed }}>
                  <Image src={`${ART}/icons/${icon}.svg`} alt="" fill className="max-w-none" />
                </span>
              </span>
            </span>
          ) : (
            <Image src={`${ART}/icon-inbox-${mood}.svg`} alt="" width={28.33} height={28.33} className="absolute left-[23.5px] top-[23.5px] max-w-none" />
          )}
        </div>

        {mood === "default" && (
          <>
            <Decor src={`${ART}/accent-1.svg`} left={150} top={22} size={10} />
            <Decor src={`${ART}/accent-2.svg`} left={30} top={118} size={7} />
            <Decor src={`${ART}/accent-3.svg`} left={168} top={104} size={6} />
            <Decor src={`${ART}/accent-4.svg`} left={40} top={20} size={5} />
            <Decor src={`${ART}/sparkle.svg`} left={138} top={30} size={22} />
          </>
        )}

        {mood === "celebrate" && (
          <>
            {CONFETTI.map(([left, top, width, height, rotation, colour]) => (
              <span
                key={`${left}-${top}`}
                className="absolute flex items-center justify-center"
                style={{ left, top, width, height }}
              >
                <span className="h-[5.4px] w-[12px] shrink-0 rounded-[2px]" style={{ background: colour, transform: `rotate(${rotation}deg)` }} />
              </span>
            ))}
            <span className="absolute left-[124px] top-[28px] size-[30px] rounded-full border-[3px] border-white bg-[#16a34a]">
              <Image src={`${ART}/badge-tick.svg`} alt="" width={11} height={9} className="absolute left-[2.5px] top-[3.5px] max-w-none" />
            </span>
          </>
        )}

        {mood === "sad" && (
          <>
            {DROPS.map(([left, top]) => (
              <Image key={`${left}-${top}`} src={`${ART}/drop.svg`} alt="" width={5} height={9} className="absolute max-w-none" style={{ left, top }} />
            ))}
            <span className="absolute left-[124px] top-[28px] size-[30px] rounded-full border-[3px] border-white bg-[#fef3c7]">
              <Image src={`${ART}/badge-sad.svg`} alt="" width={15} height={15} className="absolute left-[1.5px] top-[1.5px] max-w-none rotate-180 -scale-x-100" />
            </span>
          </>
        )}
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
  /** The tile's icon for this page; defaults to the inbox. */
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
