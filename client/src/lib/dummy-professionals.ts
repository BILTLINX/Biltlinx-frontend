import type { ProviderCardData } from "@/types/provider";

// Stand-ins for what the professionals API will return until it exists.

export const PROFESSIONAL_DISCIPLINES = [
  "All",
  "Architects",
  "Land surveyors",
  "Structural engineers",
  "Quantity surveyors",
  "Real estate agents",
  "Property lawyers",
  "Valuers",
  "Interior designers",
] as const;

export type ProfessionalDiscipline = (typeof PROFESSIONAL_DISCIPLINES)[number];

export interface Professional extends ProviderCardData {
  discipline: Exclude<ProfessionalDiscipline, "All">;
}

export const PROFESSIONALS: Professional[] = [
  {
    id: "ama-boatengmaa",
    profileHref: "/professionals/ama-boatengmaa",
    name: "Ama Boatengmaa",
    role: "Architect · Studio Horizon",
    discipline: "Architects",
    location: "Osu, Accra",
    avatar: "/images/professionals/ama-boatengmaa.png",
    badges: ["ID verified ✓", "Credential verified · GIA ✓"],
    summary: "Residential and courtyard homes. 40+ completed builds across Greater Accra, permit packs included.",
    stats: [
      { value: "4.9 ★", label: "Rating" },
      { value: "42", label: "Projects" },
      { value: "11", label: "Years" },
    ],
    pricing: { headline: "From GHS 1,500", note: "/ drawing set" },
    cta: "Request consultation",
  },
  {
    id: "kwame-mensah",
    profileHref: "/professionals/kwame-mensah",
    name: "Kwame Mensah",
    role: "Licensed Land Surveyor",
    discipline: "Land surveyors",
    location: "Tema, Greater Accra",
    avatar: "/images/professionals/kwame-mensah.png",
    badges: ["ID verified ✓", "Credential verified · GhIS ✓"],
    summary: "Site plans, boundary surveys and Lands Commission searches before you buy.",
    stats: [
      { value: "4.8 ★", label: "Rating" },
      { value: "310", label: "Surveys" },
      { value: "15", label: "Years" },
    ],
    pricing: { headline: "From GHS 900", note: "/ plot" },
    cta: "Request quote",
  },
  {
    id: "carlos-ramirez",
    profileHref: "/professionals/carlos-ramirez",
    name: "Carlos Ramirez",
    role: "Structural Engineer",
    discipline: "Structural engineers",
    location: "East Legon, Accra",
    avatar: "/images/professionals/carlos-ramirez.png",
    badges: ["ID verified ✓", "Credential verified · GhIE ✓"],
    summary: "Structural design and site inspections for 1–4 storey residential and mixed use.",
    stats: [
      { value: "4.7 ★", label: "Rating" },
      { value: "64", label: "Projects" },
      { value: "9", label: "Years" },
    ],
    pricing: { headline: "From GHS 2,000", note: "/ design" },
    cta: "Request consultation",
  },
  {
    id: "andy-ansong",
    profileHref: "/professionals/andy-ansong",
    name: "Andy Ansong",
    role: "Real Estate Consultant",
    discipline: "Real estate agents",
    location: "Airport, Accra",
    avatar: "/images/professionals/andy-ansong.png",
    badges: ["ID verified ✓", "Business verified ✓"],
    summary: "Buying and letting in Airport, Cantonments and East Legon. Viewings within 48 hours.",
    stats: [
      { value: "4.8 ★", label: "Rating" },
      { value: "120", label: "Deals" },
      { value: "7", label: "Years" },
    ],
    pricing: { headline: "Commission 3%", note: "of sale price" },
    cta: "Message",
  },
];
