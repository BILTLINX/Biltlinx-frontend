import type { KeyFact } from "@/components/shared/KeyFacts";
import { PROJECTS, type Project } from "@/lib/dummy-projects";

// Stand-ins for the richer data a project's own API record will carry. Until it exists, every project shares these
// placeholder details and only the headline fields (name, developer, area, stage, progress, price, photo) come
// from the project itself.

export type MilestoneStatus = "done" | "in-progress" | "upcoming";

export interface Milestone {
  id: string;
  title: string;
  /** e.g. "Done · Mar 2026" */
  label: string;
  status: MilestoneStatus;
}

export interface UnitType {
  id: string;
  name: string;
  /** e.g. "62 m² · 4 left" */
  summary: string;
  price: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface ProjectDetail {
  project: Project;
  breadcrumbs: { label: string; href?: string }[];
  gallery: { main: string; side: [string, string]; moreLabel: string };
  stageLabel: string;
  badges: string[];
  paymentNote: string;
  keyFacts: KeyFact[];
  milestones: Milestone[];
  unitTypes: UnitType[];
  paymentPlan: { title: string; lines: { label: string; amount: string }[]; note: string };
  developer: { name: string; summary: string; avatar: string; badges: string[] };
  team: TeamMember[];
}

export function getProjectDetail(id: string): ProjectDetail | undefined {
  const project = PROJECTS.find((candidate) => candidate.id === id);
  if (!project) return undefined;

  return {
    project,
    breadcrumbs: [{ label: "Projects", href: "/projects" }, { label: "Off-plan", href: "/projects" }, { label: project.name }],
    gallery: {
      main: project.image,
      side: ["/images/marketplace/property-tower.jpg", "/images/marketplace/property-curved.jpg"],
      moreLabel: "+ 9 photos · Site updates",
    },
    stageLabel: project.stage === "Under construction" ? "Off-plan · under construction" : project.stage,
    badges: ["Developer verified ✓", "Building permit checked ✓"],
    paymentNote: "2-bed · payment plan over 24 months",
    keyFacts: [
      { value: "48 apartments", label: "Units" },
      { value: "17 left", label: "Available" },
      { value: "Q3 2027", label: "Completion" },
      { value: "6 + roof terrace", label: "Floors" },
      { value: "Leasehold · 99 yrs", label: "Title" },
    ],
    milestones: [
      { id: "ms1", title: "Foundation & ground floor", label: "Done · Mar 2026", status: "done" },
      { id: "ms2", title: "Structure to roof", label: "Done · Sep 2026", status: "done" },
      { id: "ms3", title: "Blockwork & services", label: "In progress · 40%", status: "in-progress" },
      { id: "ms4", title: "Finishes & handover", label: "Starts Mar 2027", status: "upcoming" },
    ],
    unitTypes: [
      { id: "u1", name: "1-bed apartment", summary: "62 m² · 4 left", price: "GHS 520,000" },
      { id: "u2", name: "2-bed apartment", summary: "94 m² · 9 left", price: "GHS 780,000" },
      { id: "u3", name: "3-bed penthouse", summary: "160 m² · 4 left", price: "GHS 1,450,000" },
    ],
    paymentPlan: {
      title: "Payment plan · 2-bed",
      lines: [
        { label: "Deposit to reserve (10%)", amount: "GHS 78,000" },
        { label: "During construction · 20 monthly payments", amount: "GHS 31,200 / month" },
        { label: "On handover (10%)", amount: "GHS 78,000" },
      ],
      note: "Payments go to an escrow account and are released to the developer at each milestone checked by an independent surveyor.",
    },
    developer: {
      name: "Horizon Developments",
      summary: "7 completed projects since 2012",
      avatar: "/images/projects/horizon.png",
      badges: ["Business verified ✓", "GREDA member ✓"],
    },
    team: [
      { id: "t1", name: "Ama Boatengmaa", role: "Architect", avatar: "/images/projects/ama.png" },
      { id: "t2", name: "BuildRight Ltd", role: "Main contractor", avatar: "/images/projects/buildright.png" },
      { id: "t3", name: "Kojo Mensah", role: "Quantity surveyor", avatar: "/images/projects/kojo.png" },
    ],
  };
}
