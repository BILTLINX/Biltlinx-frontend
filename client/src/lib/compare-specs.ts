import type { CompareItem, CompareKind } from "@/context/CompareContext";

// Stand-ins for the details a listing's own API record will carry. The three homes in the design have the values it
// shows; anything else gets plausible values worked out from its id, so the same item always compares the same way.

export interface SpecCell {
  text: string;
  /** Higher is better. Leave out for facts that are not better or worse, such as the number of bedrooms. */
  rank?: number;
}

export interface SpecRow {
  label: string;
  cells: SpecCell[];
}

function seedOf(id: string) {
  return Array.from(id).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 7), 0);
}

function pick<T>(options: readonly T[], seed: number, offset: number): T {
  return options[(seed + offset * 13) % options.length];
}

function priceNumber(price: string) {
  return Number(price.replace(/[^\d]/g, "")) || 0;
}

const ghs = (amount: number) => `GHS ${amount.toLocaleString("en-US")}`;

const HOME_OVERRIDES: Record<string, HomeSpec> = {
  p1: { area: 420, plot: 0.25, beds: 4, baths: 4, title: 2, year: 2023, bq: true, water: 2, power: "Generator", gated: 2, service: 300, commute: 25, listedBy: "Agent · licence checked ✓" },
  p2: { area: 400, plot: 0.12, beds: 4, baths: 5, title: 1, year: 2025, bq: false, water: 0, power: "Solar + inverter", gated: 1, service: 650, commute: 30, listedBy: "Agent · ID verified ✓" },
  p3: { area: 340, plot: 0.2, beds: 4, baths: 3, title: 0, year: 2019, bq: true, water: 1, power: "None", gated: 0, service: 0, commute: 20, listedBy: "Owner · ID verified ✓" },
};

interface HomeSpec {
  area: number;
  plot: number;
  beds: number;
  baths: number;
  /** 0 not checked, 1 pending, 2 checked */
  title: number;
  year: number;
  bq: boolean;
  /** 0 mains only, 1 borehole, 2 borehole + tank */
  water: number;
  power: string;
  /** 0 no, 1 yes, 2 yes with 24h security */
  gated: number;
  service: number;
  commute: number;
  listedBy: string;
}

const TITLE_TEXT = ["Freehold · not checked", "Leasehold · pending", "Leasehold · checked ✓"];
const WATER_TEXT = ["Mains only", "Borehole", "Borehole + tank"];
const GATED_TEXT = ["No", "Yes", "Yes · 24h"];
const POWER = ["Generator", "Solar + inverter", "None", "Generator + solar"];
const LISTED_BY = ["Agent · licence checked ✓", "Agent · ID verified ✓", "Owner · ID verified ✓", "Developer · registered ✓"];

function homeSpec(item: CompareItem): HomeSpec {
  const override = HOME_OVERRIDES[item.id];
  if (override) return override;
  const seed = seedOf(item.id);
  return {
    area: 180 + (seed % 26) * 10,
    plot: 0.1 + ((seed >> 2) % 6) * 0.05,
    beds: 2 + (seed % 4),
    baths: 2 + ((seed >> 1) % 4),
    title: seed % 3,
    year: 2015 + (seed % 11),
    bq: seed % 2 === 0,
    water: (seed >> 1) % 3,
    power: pick(POWER, seed, 3),
    gated: (seed >> 2) % 3,
    service: pick([0, 300, 450, 650], seed, 5),
    commute: 15 + (seed % 7) * 5,
    listedBy: pick(LISTED_BY, seed, 7),
  };
}

function homeRows(items: CompareItem[]): SpecRow[] {
  const specs = items.map((item) => ({ item, spec: homeSpec(item) }));
  const row = (label: string, cell: (entry: (typeof specs)[number]) => SpecCell): SpecRow => ({ label, cells: specs.map(cell) });

  return [
    row("Price per m²", ({ item, spec }) => {
      const perM2 = Math.round(priceNumber(item.price) / spec.area);
      return { text: ghs(perM2), rank: -perM2 };
    }),
    row("Bedrooms / baths", ({ spec }) => ({ text: `${spec.beds} / ${spec.baths}` })),
    row("Floor area", ({ spec }) => ({ text: `${spec.area} m²`, rank: spec.area })),
    row("Plot size", ({ spec }) => ({ text: `${Number(spec.plot.toFixed(2))} acre`, rank: spec.plot })),
    row("Title", ({ spec }) => ({ text: TITLE_TEXT[spec.title], rank: spec.title })),
    row("Year built", ({ spec }) => ({ text: String(spec.year), rank: spec.year })),
    row("Boys’ quarters", ({ spec }) => ({ text: spec.bq ? "Yes" : "No" })),
    row("Water", ({ spec }) => ({ text: WATER_TEXT[spec.water], rank: spec.water })),
    row("Power backup", ({ spec }) => ({ text: spec.power })),
    row("Gated / security", ({ spec }) => ({ text: GATED_TEXT[spec.gated], rank: spec.gated })),
    row("Service charge", ({ spec }) => ({ text: spec.service ? `${ghs(spec.service)} / month` : "None", rank: -spec.service })),
    row("Commute to Airport", ({ spec }) => ({ text: `${spec.commute} min`, rank: -spec.commute })),
    row("Listed by", ({ spec }) => ({ text: spec.listedBy })),
  ];
}

function generic(items: CompareItem[], rows: { label: string; make: (seed: number) => SpecCell }[]): SpecRow[] {
  return rows.map((entry) => ({ label: entry.label, cells: items.map((item) => entry.make(seedOf(item.id))) }));
}

const STAY_ROWS = [
  { label: "Rating", make: (s: number) => ({ text: `${(4.2 + (s % 8) / 10).toFixed(1)} ★`, rank: s % 8 }) },
  { label: "Guests", make: (s: number) => ({ text: `Up to ${2 + (s % 4)}` }) },
  { label: "Breakfast", make: (s: number) => ({ text: s % 2 ? "Included" : "Extra cost", rank: s % 2 }) },
  { label: "Cancellation", make: (s: number) => ({ text: s % 3 ? "Free until 48 h before" : "Non-refundable", rank: s % 3 ? 1 : 0 }) },
  { label: "Wi-Fi", make: (s: number) => ({ text: `${25 + (s % 5) * 25} Mbps`, rank: s % 5 }) },
];
const PROJECT_ROWS = [
  { label: "Stage", make: (s: number) => ({ text: pick(["Selling now", "Under construction", "Planning"], s, 1) }) },
  { label: "Handover", make: (s: number) => ({ text: `Q${1 + (s % 4)} ${2026 + (s % 3)}` }) },
  { label: "Units", make: (s: number) => ({ text: String(40 + (s % 9) * 20) }) },
  { label: "Payment plan", make: (s: number) => ({ text: s % 2 ? "Up to 24 months" : "Up to 12 months", rank: s % 2 }) },
  { label: "Developer", make: (s: number) => ({ text: s % 3 ? "Registered · verified ✓" : "Registered", rank: s % 3 ? 1 : 0 }) },
];
const PROVIDER_ROWS = [
  { label: "Rating", make: (s: number) => ({ text: `${(4.3 + (s % 7) / 10).toFixed(1)} ★`, rank: s % 7 }) },
  { label: "Experience", make: (s: number) => ({ text: `${4 + (s % 12)} years`, rank: s % 12 }) },
  { label: "Completed jobs", make: (s: number) => ({ text: String(20 + (s % 30) * 10), rank: s % 30 }) },
  { label: "Replies", make: (s: number) => ({ text: pick(["within 1 hr", "within 2 hrs", "same day"], s, 2), rank: -(s % 3) }) },
  { label: "Verification", make: (s: number) => ({ text: s % 2 ? "ID + credential checked ✓" : "ID checked ✓", rank: s % 2 }) },
];

/** Every row of the comparison table for what is in the tray; all of the same kind. */
export function buildSpecRows(kind: CompareKind, items: CompareItem[]): SpecRow[] {
  switch (kind) {
    case "home":
      return homeRows(items);
    case "stay":
      return generic(items, STAY_ROWS);
    case "project":
      return generic(items, PROJECT_ROWS);
    case "professional":
    case "artisan":
      return generic(items, PROVIDER_ROWS);
  }
}

/** The cell(s) that win a row: the highest rank, unless every cell ties. */
export function bestCells(row: SpecRow): Set<number> {
  const ranks = row.cells.map((cell) => cell.rank);
  if (ranks.some((rank) => rank === undefined)) return new Set();
  const top = Math.max(...(ranks as number[]));
  if (ranks.every((rank) => rank === top)) return new Set();
  return new Set(ranks.flatMap((rank, index) => (rank === top ? [index] : [])));
}

/** Whether the cells of a row do not all say the same thing. */
export function rowDiffers(row: SpecRow): boolean {
  return new Set(row.cells.map((cell) => cell.text)).size > 1;
}
