import { apiRequest, apiRequestWithMeta, type QueryValue } from "@/lib/api";
import type {
  MilestoneInput,
  PagedProjects,
  ProjectCardDto,
  ProjectDetailDto,
  ProjectInput,
  ProjectMediaInput,
  ProjectUpdateDto,
  ReservationDto,
  TeamInput,
  UnitTypeInput,
  VisitDto,
} from "@/types/api/projects";

export interface ProjectQuery {
  page?: number;
  results?: number;
  q?: string;
  stage?: string;
  city?: string;
  followed?: boolean;
  sort?: "newest" | "progress" | "priceAsc" | "priceDesc";
}

export function listProjects(query: ProjectQuery, signal?: AbortSignal) {
  return apiRequest<PagedProjects>("/projects", { query: query as Record<string, QueryValue>, signal });
}

export function listMyProjects() {
  return apiRequest<ProjectCardDto[]>("/projects/mine");
}

export function getProject(id: string) {
  return apiRequest<ProjectDetailDto>(`/projects/${id}`);
}

export function listProjectUpdates(query: { limit?: number; followed?: boolean } = {}) {
  return apiRequest<ProjectUpdateDto[]>("/projects/updates", { query: query as Record<string, QueryValue> });
}

export function followProject(id: string) {
  return apiRequest(`/projects/${id}/follow`, { method: "POST" });
}

export function unfollowProject(id: string) {
  return apiRequest(`/projects/${id}/follow`, { method: "DELETE" });
}

export function requestVisit(id: string, input: { preferredAt: string; message?: string }) {
  return apiRequest(`/projects/${id}/visits`, { method: "POST", body: input });
}

export function listMyVisits() {
  return apiRequest<VisitDto[]>("/projects/visits/mine");
}

export function cancelVisit(id: string) {
  return apiRequest(`/projects/visits/${id}/cancel`, { method: "POST" });
}

export function reserveUnit(projectId: string, unitId: string, email: string, idempotencyKey: string) {
  return apiRequest<ReservationDto>(`/projects/${projectId}/units/${unitId}/reserve`, {
    method: "POST",
    body: { email },
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

export function listMyReservations() {
  return apiRequest<ReservationDto[]>("/projects/reservations/mine");
}

export function getReservation(id: string) {
  return apiRequest<ReservationDto>(`/projects/reservations/${id}`);
}

export function payReservation(id: string, email: string) {
  return apiRequest<ReservationDto>(`/projects/reservations/${id}/pay`, { method: "POST", body: { email } });
}

export function cancelReservation(id: string) {
  return apiRequest(`/projects/reservations/${id}/cancel`, { method: "POST" });
}

export async function createProject(input: ProjectInput) {
  const response = await apiRequestWithMeta("/projects", { method: "POST", body: input });
  return response.headers.get("Resource-ID") as string;
}

export function updateProject(id: string, input: ProjectInput) {
  return apiRequest(`/projects/${id}`, { method: "PUT", body: input });
}

export function publishProject(id: string) {
  return apiRequest(`/projects/${id}/publish`, { method: "POST" });
}

export function pauseProject(id: string) {
  return apiRequest(`/projects/${id}/pause`, { method: "POST" });
}

export function deleteProject(id: string) {
  return apiRequest(`/projects/${id}`, { method: "DELETE" });
}

export function addUnitType(id: string, input: UnitTypeInput) {
  return apiRequest(`/projects/${id}/units`, { method: "POST", body: input });
}

export function updateUnitType(id: string, unitId: string, input: UnitTypeInput) {
  return apiRequest(`/projects/${id}/units/${unitId}`, { method: "PUT", body: input });
}

export function removeUnitType(id: string, unitId: string) {
  return apiRequest(`/projects/${id}/units/${unitId}`, { method: "DELETE" });
}

export function replaceMilestones(id: string, milestones: MilestoneInput[]) {
  return apiRequest(`/projects/${id}/milestones`, { method: "PUT", body: milestones });
}

export function replaceTeam(id: string, team: TeamInput[]) {
  return apiRequest(`/projects/${id}/team`, { method: "PUT", body: team });
}

export function postProjectUpdate(id: string, input: { note: string; photo?: ProjectMediaInput }) {
  return apiRequest(`/projects/${id}/updates`, { method: "POST", body: input });
}

export function deleteProjectUpdate(id: string, updateId: string) {
  return apiRequest(`/projects/${id}/updates/${updateId}`, { method: "DELETE" });
}

export function listProjectReservations(id: string) {
  return apiRequest<ReservationDto[]>(`/projects/${id}/reservations`);
}

export function releaseReservation(id: string, reason?: string) {
  return apiRequest(`/projects/reservations/${id}/release`, { method: "POST", body: { reason } });
}

export function listIncomingVisits(projectId?: string) {
  return apiRequest<VisitDto[]>("/projects/visits/incoming", { query: { projectId } });
}

export function respondToVisit(id: string, action: "confirm" | "decline", input: { at?: string; note?: string } = {}) {
  return apiRequest(`/projects/visits/${id}/${action}`, { method: "POST", body: input });
}
