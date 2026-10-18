import type { ProviderCardData } from "@/types/provider";

// Stand-ins for what the artisans API will return until it exists.

export const ARTISAN_TRADES = [
  "All trades",
  "Masons",
  "Electricians",
  "Plumbers",
  "Carpenters",
  "Painters",
  "Tilers",
  "Welders",
  "Aluminium & glass",
] as const;

export type ArtisanTrade = (typeof ARTISAN_TRADES)[number];

export const AVAILABLE_TODAY_CHIP = "Available today";

export interface Artisan extends ProviderCardData {
  trade: Exclude<ArtisanTrade, "All trades">;
  availableToday: boolean;
}

const TRADE_CHECKED = "Trade certificate checked ✓";
const REQUEST_QUOTE = "Request quote";

export const ARTISANS: Artisan[] = [
  {
    id: "yaw-osei",
    name: "Yaw Osei",
    role: "Electrician",
    trade: "Electricians",
    availableToday: true,
    location: "Within 15 km of Dzorwulu",
    avatar: "/images/artisans/yaw-osei.png",
    badges: ["ID verified ✓", TRADE_CHECKED],
    summary: "House wiring, fault finding, solar inverter installs. Available today from 2 pm.",
    stats: [
      { value: "4.9 ★", label: "Rating" },
      { value: "230", label: "Jobs" },
      { value: "< 1 hr", label: "Replies" },
    ],
    pricing: { headline: "From GHS 250", note: "/ job" },
    cta: REQUEST_QUOTE,
  },
  {
    id: "kofi-asante",
    name: "Kofi Asante",
    role: "Plumber",
    trade: "Plumbers",
    availableToday: false,
    location: "Within 10 km of Dzorwulu",
    avatar: "/images/artisans/kofi-asante.png",
    badges: ["ID verified ✓"],
    summary: "Leaks, borehole pumps, water heaters and bathroom refits.",
    stats: [
      { value: "4.7 ★", label: "Rating" },
      { value: "180", label: "Jobs" },
      { value: "2 hrs", label: "Replies" },
    ],
    pricing: { headline: "From GHS 200", note: "/ visit" },
    cta: REQUEST_QUOTE,
  },
  {
    id: "esi-darko",
    name: "Esi Darko",
    role: "Tiler & finisher",
    trade: "Tilers",
    availableToday: false,
    location: "Within 20 km of Dzorwulu",
    avatar: "/images/artisans/esi-darko.png",
    badges: ["ID verified ✓", TRADE_CHECKED],
    summary: "Floor and wall tiling, terrazzo and screeding. Portfolio of 60+ homes.",
    stats: [
      { value: "4.8 ★", label: "Rating" },
      { value: "95", label: "Jobs" },
      { value: "3 hrs", label: "Replies" },
    ],
    pricing: { headline: "From GHS 35", note: "/ m²" },
    cta: REQUEST_QUOTE,
  },
  {
    id: "abena-owusu",
    name: "Abena Owusu",
    role: "Painter",
    trade: "Painters",
    availableToday: true,
    location: "Within 25 km of Dzorwulu",
    avatar: "/images/artisans/abena-owusu.png",
    badges: ["ID verified ✓"],
    summary: "Interior and exterior painting, texture coat and waterproofing.",
    stats: [
      { value: "4.6 ★", label: "Rating" },
      { value: "140", label: "Jobs" },
      { value: "1 hr", label: "Replies" },
    ],
    pricing: { headline: "From GHS 18", note: "/ m²" },
    cta: REQUEST_QUOTE,
  },
];
