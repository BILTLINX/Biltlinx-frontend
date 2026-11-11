import type { KeyFact } from "@/components/shared/KeyFacts";
import { formatDate } from "@/lib/format";
import type { MilestoneStatusKey, ProjectCardDto, ProjectDetailDto, ProjectStageKey, ProjectUpdateDto, UnitTypeDto } from "@/types/api/projects";

export const FALLBACK_PROJECT_IMAGE = "/images/marketplace/development.jpg";

export const PROJECT_STAGES: { value: ProjectStageKey; label: string }[] = [
  { value: "SellingNow", label: "Selling now" },
  { value: "UnderConstruction", label: "Under construction" },
  { value: "Planning", label: "Planning" },
  { value: "Completed", label: "Completed" },
];

export const FOLLOWING_FILTER = "Following";

export const PROJECT_STATUS_TONE: Record<string, string> = {
  Published: "bg-[#dcfce7] text-[#16a34a]",
  Draft: "bg-[#f1f5f9] text-[#334155]",
  Paused: "bg-[#fef3c7] text-[#b45309]",
};

export interface ProjectView {
  id: string;
  name: string;
  developer: string;
  area: string;
  stage: string;
  stageKey: ProjectStageKey;
  image: string;
  progress: number;
  priceFrom: string;
  summary: string;
  following: boolean;
  status: string;
  availableUnits: number;
  totalUnits: number;
}

export function toProjectView(card: ProjectCardDto): ProjectView {
  return {
    id: card.id,
    name: card.name,
    developer: card.developer.name,
    area: card.areaLabel,
    stage: card.stageLabel,
    stageKey: card.stage,
    image: card.coverUrl ?? FALLBACK_PROJECT_IMAGE,
    progress: card.progressPercent,
    priceFrom: card.priceLabel,
    summary: card.summary,
    following: card.following,
    status: card.status,
    availableUnits: card.availableUnits,
    totalUnits: card.totalUnits,
  };
}

export type MilestoneView = { id: string; title: string; label: string; status: "done" | "in-progress" | "upcoming" };

const MILESTONE_STATUS: Record<MilestoneStatusKey, MilestoneView["status"]> = {
  Done: "done",
  InProgress: "in-progress",
  Upcoming: "upcoming",
};

export interface ProjectDetailView {
  project: ProjectView;
  breadcrumbs: { label: string; href?: string }[];
  gallery: { main: string; side: [string | null, string | null]; moreLabel: string | null };
  stageLabel: string;
  badges: string[];
  paymentNote: string;
  keyFacts: KeyFact[];
  milestones: MilestoneView[];
  unitTypes: UnitTypeDto[];
  developer: { name: string; summary: string; avatar: string | null; badges: string[] };
  team: { id: string; name: string; role: string; avatar: string | null }[];
  updates: ProjectUpdateDto[];
  description: string;
  address: string | null;
  brochureUrl: string | null;
  isOwner: boolean;
  followers: number;
}

export function toProjectDetailView(detail: ProjectDetailDto): ProjectDetailView {
  const project = toProjectView(detail.card);

  const images = detail.gallery.filter((item) => item.contentType.startsWith("image/")).map((item) => item.url);
  const [main, ...rest] = images;
  const extra = images.length - 3;

  const developerBadges = detail.developer.verified ? ["Business verified ✓"] : [];
  const completed = detail.developer.completedProjects;
  const published = detail.developer.publishedProjects;
  const summary =
    completed > 0
      ? `${completed} completed ${completed === 1 ? "project" : "projects"} · ${published} on Biltlinx`
      : `${published} ${published === 1 ? "project" : "projects"} on Biltlinx · member since ${formatDate(detail.developer.memberSince)}`;

  return {
    project,
    breadcrumbs: [{ label: "Projects", href: "/projects" }, { label: detail.card.stageLabel, href: "/projects" }, { label: detail.card.name }],
    gallery: {
      main: main ?? FALLBACK_PROJECT_IMAGE,
      side: [rest[0] ?? null, rest[1] ?? null],
      moreLabel: extra > 0 ? `+ ${extra} more ${extra === 1 ? "photo" : "photos"}` : null,
    },
    stageLabel: detail.card.stage === "UnderConstruction" ? "Off-plan · under construction" : detail.card.stageLabel,
    badges: detail.badges.map((badge) => `${badge} ✓`),
    paymentNote: detail.paymentNote,
    keyFacts: detail.keyFacts,
    milestones: detail.milestones.map((m) => ({ id: m.id, title: m.title, label: m.label, status: MILESTONE_STATUS[m.status] })),
    unitTypes: detail.unitTypes,
    developer: { name: detail.developer.name, summary, avatar: detail.developer.avatarUrl, badges: developerBadges },
    team: detail.team.map((member) => ({ id: member.id, name: member.name, role: member.role, avatar: member.avatarUrl })),
    updates: detail.updates,
    description: detail.description,
    address: detail.address,
    brochureUrl: detail.brochureUrl,
    isOwner: detail.isOwner,
    followers: detail.card.followers,
  };
}
