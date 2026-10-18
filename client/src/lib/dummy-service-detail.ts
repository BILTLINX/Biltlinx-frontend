import type { KeyFact } from "@/components/shared/KeyFacts";
import { SERVICES, type ServiceListing } from "@/lib/dummy-services";

// Stand-ins for the richer data a service's own API record will carry. Until it exists, every service shares these
// placeholder details and only the headline fields (title, provider, price, category, badge, photo) come from the listing.

export const SERVICE_FEE_RATE = 0.03;
export const CONSULTATION_PRICE = 450;

export interface ServiceOption {
  id: string;
  label: string;
  /** Fixed price in GHS, or null when the provider has to quote. */
  price: number | null;
}

export interface ProcessStep {
  id: string;
  title: string;
  note: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SimilarProvider {
  id: string;
  name: string;
  from: string;
  avatar: string;
}

export interface ServiceDetail {
  service: ServiceListing;
  breadcrumbs: { label: string; href?: string }[];
  gallery: { main: string; side: [string, string]; moreLabel: string };
  providerName: string;
  providerAvatar: string;
  providerRating: string;
  keyFacts: KeyFact[];
  options: ServiceOption[];
  included: string[];
  notIncluded: string[];
  process: ProcessStep[];
  prepare: string;
  faq: FaqItem[];
  similar: SimilarProvider[];
}

export function getServiceDetail(id: string): ServiceDetail | undefined {
  const service = SERVICES.find((candidate) => candidate.id === id);
  if (!service) return undefined;

  return {
    service,
    breadcrumbs: [{ label: "Services", href: "/services" }, { label: service.category, href: "/services" }, { label: service.title }],
    gallery: {
      main: service.image,
      side: ["/images/marketplace/property-curved.jpg", "/images/marketplace/property-tower.jpg"],
      moreLabel: "+ 6 photos",
    },
    providerName: "Ama Boatengmaa · Studio Horizon",
    providerAvatar: "/images/professionals/ama-boatengmaa.png",
    providerRating: "4.9 ★ (86)",
    keyFacts: [
      { value: "Fixed, from GHS 1,500", label: "Price model" },
      { value: "3 weeks", label: "Turnaround" },
      { value: "Greater Accra, Eastern", label: "Service area" },
      { value: "2 included", label: "Revisions" },
    ],
    options: [
      { id: "o1", label: "Up to 3 bedrooms", price: 1500 },
      { id: "o2", label: "4–5 bedrooms", price: 2200 },
      { id: "o3", label: "Multi-unit / commercial", price: null },
    ],
    included: [
      "Floor plans, elevations and sections",
      "Site plan to Assembly format",
      "3D exterior view",
      "Permit submission and follow-up",
      "2 rounds of revisions",
    ],
    notIncluded: ["Structural engineering drawings", "Assembly permit fees", "Land survey", "Interior design"],
    process: [
      { id: "p1", title: "Request a quote", note: "Share your plot size, rooms and budget" },
      { id: "p2", title: "Consultation", note: "A call or site visit to agree the brief" },
      { id: "p3", title: "Drawings", note: "First draft in 10 days, then revisions" },
      { id: "p4", title: "Permit", note: "Ama submits and follows up at the Assembly" },
      { id: "p5", title: "Payment & review", note: "Pay through Biltlinx on delivery, then review" },
    ],
    prepare:
      "Site plan or survey, land title or indenture, and a rough budget. No survey yet? Add one from a licensed surveyor in the quote form.",
    faq: [
      {
        id: "f1",
        question: "Can you work with my existing drawings?",
        answer: "Yes. Upload them with your quote request and Ama will tell you what can be reused and what needs redrawing.",
      },
      {
        id: "f2",
        question: "Do you supervise construction?",
        answer: "Site visits during the build can be added as a separate service. This pack covers design and permitting only.",
      },
      {
        id: "f3",
        question: "How long does permit approval take in Accra?",
        answer: "It depends on the Assembly, but most residential permits take 4 to 8 weeks once submitted.",
      },
    ],
    similar: [
      { id: "a1", name: "Kojo Design Lab", from: "From GHS 1,800", avatar: "/images/projects/kojo.png" },
      { id: "a2", name: "BuildRight Studio", from: "From GHS 1,350", avatar: "/images/projects/buildright.png" },
    ],
  };
}
