// Stand-ins for what the projects API will return until it exists.

export const PROJECT_STAGES = ["Selling now", "Under construction", "Planning", "Completed"] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];

export const PROJECT_FILTERS = ["All", ...PROJECT_STAGES, "Following"] as const;
export type ProjectFilter = (typeof PROJECT_FILTERS)[number];

export interface Project {
  id: string;
  name: string;
  developer: string;
  area: string;
  stage: ProjectStage;
  image: string;
  /** 0–100 */
  progress: number;
  priceFrom: string;
  /** e.g. "Handover Q2 2027 · 120 units" */
  summary: string;
}

export const PROJECTS: Project[] = [
  {
    id: "adenta-heights-2",
    name: "Adenta Heights · Phase 2",
    developer: "Dzorwulu Developments",
    area: "Adenta, Accra",
    stage: "Under construction",
    image: "/images/marketplace/development.jpg",
    progress: 68,
    priceFrom: "From GHS 600,000",
    summary: "Handover Q2 2027 · 120 units",
  },
  {
    id: "legon-courtyard",
    name: "Legon Courtyard Homes",
    developer: "Ama Boatengmaa Studio",
    area: "Trasacco, Accra",
    stage: "Under construction",
    image: "/images/marketplace/property-sale.jpg",
    progress: 35,
    priceFrom: "From GHS 1,200,000",
    summary: "Handover Q4 2027 · 3 units",
  },
  {
    id: "cantonments-residences",
    name: "Cantonments Residences",
    developer: "Kasapa Properties Ltd",
    area: "Cantonments, Accra",
    stage: "Selling now",
    image: "/images/marketplace/property-tower.jpg",
    progress: 90,
    priceFrom: "From GHS 2,100,000",
    summary: "Handover Jan 2027 · 48 units",
  },
  {
    id: "oyibi-gardens",
    name: "Oyibi Gardens Estate",
    developer: "Greenline Estates",
    area: "Oyibi, Greater Accra",
    stage: "Planning",
    image: "/images/marketplace/land.jpg",
    progress: 10,
    priceFrom: "From GHS 180,000",
    summary: "Serviced plots · 300 plots",
  },
];

export interface SiteUpdate {
  id: string;
  project: string;
  note: string;
  avatar: string;
}

export const SITE_UPDATES: SiteUpdate[] = [
  { id: "u1", project: "Adenta Heights", note: "Phase 2 roofing complete · 2h ago", avatar: "/images/project-update-1.png" },
  { id: "u2", project: "Legon Courtyard", note: "Foundation poured · yesterday", avatar: "/images/project-update-2.png" },
  { id: "u3", project: "Cantonments Res.", note: "Show unit open this Saturday", avatar: "/images/project-update-3.png" },
];
