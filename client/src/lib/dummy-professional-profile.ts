import type { KeyFact } from "@/components/shared/KeyFacts";
import { PROFESSIONALS, type Professional } from "@/lib/dummy-professionals";

// Stand-ins for the richer data a professional's own API record will carry. Until it exists, every profile shares
// these placeholder details and only the headline fields (name, role, area, badges, stats, price, photo) come from
// the professional.

export interface Credential {
  id: string;
  title: string;
  note: string;
  /** Checked by Biltlinx, or just claimed by the professional. */
  verified: boolean;
}

export interface ProfileService {
  id: string;
  title: string;
  unit: string;
  price: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  image: string;
}

export interface ProfileReview {
  id: string;
  author: string;
  avatar: string;
  context: string;
  text: string;
}

export const PROFILE_TABS = [
  { key: "overview", label: "Overview" },
  { key: "services", label: "Services" },
  { key: "portfolio", label: "Portfolio" },
  { key: "reviews", label: "Reviews" },
  { key: "posts", label: "Posts" },
] as const;

export type ProfileTabKey = (typeof PROFILE_TABS)[number]["key"];

export interface ProfessionalProfile {
  professional: Professional;
  breadcrumbs: { label: string; href?: string }[];
  cover: string;
  subtitle: string;
  keyFacts: KeyFact[];
  about: string;
  credentials: Credential[];
  services: ProfileService[];
  servicesTotal: number;
  portfolio: PortfolioItem[];
  portfolioTotal: number;
  reviewsHeading: string;
  reviews: ProfileReview[];
  availability: { status: string; note: string };
  contact: { firm: string; address: string; phoneNote: string };
}

export function getProfessionalProfile(id: string): ProfessionalProfile | undefined {
  const professional = PROFESSIONALS.find((candidate) => candidate.id === id);
  if (!professional) return undefined;

  const [rating, projects, years] = professional.stats;

  return {
    professional,
    breadcrumbs: [
      { label: "Professionals", href: "/professionals" },
      { label: professional.discipline, href: "/professionals" },
      { label: professional.name },
    ],
    cover: "/images/marketplace/property-sale.jpg",
    subtitle: `${professional.role.split(" · ")[0]} · Principal at Studio Horizon`,
    keyFacts: [
      { value: `${rating.value} (86)`, label: "Rating" },
      { value: projects.value, label: "Completed projects" },
      { value: `${years.value} years`, label: "Experience" },
      { value: "within 2 hrs", label: "Responds" },
    ],
    about:
      "I design climate-smart homes for Ghanaian families: courtyards for airflow, deep overhangs and materials that hold up in the rains. I handle drawings, permit submission at the Assembly and site visits during the build.",
    credentials: [
      { id: "c1", title: "Ghana Institute of Architects · Full member", note: "Reg. no. GIA/1187 · checked 2 Sep 2026", verified: true },
      { id: "c2", title: "Architects Registration Council", note: "Licence valid to Dec 2027 · checked 2 Sep 2026", verified: true },
      { id: "c3", title: "BSc Architecture, KNUST", note: "Self-reported", verified: false },
    ],
    services: [
      { id: "s1", title: "Architectural drawings & permit pack", unit: "per drawing set · 3 weeks", price: "From GHS 1,500" },
      { id: "s2", title: "Site visit & design consultation", unit: "per 1-hour visit", price: "GHS 450" },
      { id: "s3", title: "Renovation design", unit: "per room", price: "From GHS 900" },
    ],
    servicesTotal: 5,
    portfolio: [
      { id: "p1", title: "Legon Courtyard House", image: "/images/marketplace/property-sale.jpg" },
      { id: "p2", title: "Adenta Heights units", image: "/images/marketplace/development.jpg" },
      { id: "p3", title: "Trasacco Villa", image: "/images/marketplace/property-tower.jpg" },
    ],
    portfolioTotal: 42,
    reviewsHeading: "Reviews · 4.9 ★ from 86 clients",
    reviews: [
      {
        id: "r1",
        author: "Andy A.",
        avatar: "/images/profile-reviews/andy.png",
        context: "Verified client · Permit pack",
        text: "Clear drawings, permit approved first time. Ama visited site twice during foundation.",
      },
      {
        id: "r2",
        author: "Abena O.",
        avatar: "/images/profile-reviews/abena.png",
        context: "Verified client · Renovation",
        text: "Great ideas for a small budget. Delivered a week early.",
      },
    ],
    availability: {
      status: "Taking new projects from Nov",
      note: "Consultations Mon–Fri, 9 am – 4 pm. Site visits in Greater Accra.",
    },
    contact: {
      firm: "Studio Horizon",
      address: "14 Oxford St, Osu, Accra",
      phoneNote: "Phone shown after your first enquiry",
    },
  };
}
