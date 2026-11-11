export type ProjectStageKey = "Planning" | "UnderConstruction" | "SellingNow" | "Completed";
export type ProjectStatusKey = "Draft" | "Published" | "Paused";
export type MilestoneStatusKey = "Upcoming" | "InProgress" | "Done";

export interface ProjectDeveloperDto {
  accountId: string;
  name: string;
  avatarUrl: string | null;
  verified: boolean;
  completedProjects: number;
  publishedProjects: number;
  memberSince: string;
}

export interface ProjectCardDto {
  id: string;
  name: string;
  developer: ProjectDeveloperDto;
  city: string;
  area: string | null;
  areaLabel: string;
  stage: ProjectStageKey;
  stageLabel: string;
  progressPercent: number;
  priceFrom: number | null;
  currency: string;
  priceLabel: string;
  summary: string;
  coverUrl: string | null;
  totalUnits: number;
  availableUnits: number;
  following: boolean;
  followers: number;
  status: ProjectStatusKey;
  createdAt: string;
}

export interface PaymentPlanDto {
  title: string;
  depositPercent: number;
  deposit: number;
  installments: number;
  installmentAmount: number;
  handoverPercent: number;
  handover: number;
}

export interface UnitTypeDto {
  id: string;
  name: string;
  description: string | null;
  sizeSqm: number | null;
  bedrooms: number | null;
  totalUnits: number;
  available: number;
  price: number;
  currency: string;
  summary: string;
  isActive: boolean;
  paymentPlan: PaymentPlanDto;
}

export interface MilestoneDto {
  id: string;
  title: string;
  status: MilestoneStatusKey;
  label: string;
  progressPercent: number | null;
  dueOn: string | null;
  completedOn: string | null;
}

export interface TeamMemberDto {
  id: string;
  name: string;
  role: string;
  accountId: string | null;
  avatarUrl: string | null;
}

export interface ProjectUpdateDto {
  id: string;
  projectId: string;
  projectName: string;
  note: string;
  photoUrl: string | null;
  createdAt: string;
}

export interface KeyFactDto {
  value: string;
  label: string;
}

export interface ProjectMediaDto {
  url: string;
  contentType: string;
  name: string;
}

export interface ProjectDetailDto {
  card: ProjectCardDto;
  description: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  tenure: string | null;
  floorsNote: string | null;
  handoverOn: string | null;
  brochureUrl: string | null;
  permitVerified: boolean;
  isOwner: boolean;
  badges: string[];
  keyFacts: KeyFactDto[];
  gallery: ProjectMediaDto[];
  unitTypes: UnitTypeDto[];
  milestones: MilestoneDto[];
  team: TeamMemberDto[];
  updates: ProjectUpdateDto[];
  paymentNote: string;
  developer: ProjectDeveloperDto;
}

export interface ProjectPartyDto {
  accountId: string;
  name: string;
  avatarUrl: string | null;
}

export type ReservationStatusKey = "PendingPayment" | "Reserved" | "Cancelled" | "Expired";

export interface ReservationDto {
  id: string;
  reference: string;
  projectId: string;
  projectName: string;
  unitTypeId: string;
  unitName: string;
  price: number;
  deposit: number;
  currency: string;
  status: ReservationStatusKey;
  holdExpiresAt: string;
  paidAt: string | null;
  createdAt: string;
  paymentReference: string | null;
  authorizationUrl: string | null;
  buyer: ProjectPartyDto | null;
}

export type VisitStatusKey = "Requested" | "Confirmed" | "Declined" | "Cancelled";

export interface VisitDto {
  id: string;
  projectId: string;
  projectName: string;
  requester: ProjectPartyDto;
  preferredAt: string;
  message: string | null;
  status: VisitStatusKey;
  scheduledAt: string | null;
  developerNote: string | null;
  createdAt: string;
}

export interface PagedProjects {
  items: ProjectCardDto[];
  currentPage: number;
  resultsPerPage: number;
  totalPages: number;
  totalResults: number;
}

export interface ProjectMediaInput {
  path: string;
  contentType: string;
  name?: string;
}

export interface ProjectInput {
  name: string;
  description: string;
  city: string;
  area?: string;
  address?: string;
  stage: ProjectStageKey;
  progressPercent: number;
  handoverOn?: string;
  tenure?: string;
  floorsNote?: string;
  brochureUrl?: string;
  media?: ProjectMediaInput[];
}

export interface UnitTypeInput {
  name: string;
  description?: string;
  sizeSqm?: number;
  bedrooms?: number;
  totalUnits: number;
  price: number;
  depositPercent: number;
  installments: number;
  handoverPercent: number;
}

export interface MilestoneInput {
  title: string;
  status: MilestoneStatusKey;
  progressPercent?: number;
  dueOn?: string;
  completedOn?: string;
}

export interface TeamInput {
  name: string;
  role: string;
  accountId?: string;
}
