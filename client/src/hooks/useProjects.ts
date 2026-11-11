import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { notifyError } from "@/lib/errors";
import { toProjectDetailView, toProjectView } from "@/lib/project-mapper";
import {
  cancelReservation,
  followProject,
  getProject,
  getReservation,
  listIncomingVisits,
  listMyProjects,
  listMyReservations,
  listMyVisits,
  listProjects,
  listProjectReservations,
  listProjectUpdates,
  requestVisit,
  unfollowProject,
  type ProjectQuery,
} from "@/lib/projects-api";

export const PROJECTS_KEY = ["projects"] as const;

const PAGE_SIZE = 10;

export function useProjectsList(query: Omit<ProjectQuery, "page" | "results">) {
  const result = useInfiniteQuery({
    queryKey: [...PROJECTS_KEY, "list", query],
    queryFn: ({ pageParam, signal }) => listProjects({ ...query, page: pageParam, results: PAGE_SIZE }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.currentPage < last.totalPages ? last.currentPage + 1 : undefined),
    placeholderData: keepPreviousData,
  });
  const projects = useMemo(() => (result.data?.pages.flatMap((page) => page.items ?? []) ?? []).map(toProjectView), [result.data]);
  return { ...result, projects, total: result.data?.pages[0]?.totalResults ?? 0 };
}

export function useMyProjects() {
  return useQuery({ queryKey: [...PROJECTS_KEY, "mine"], queryFn: listMyProjects });
}

export function useProjectDetail(id: string) {
  const result = useQuery({ queryKey: [...PROJECTS_KEY, "one", id], queryFn: () => getProject(id), retry: false });
  const detail = useMemo(() => (result.data ? toProjectDetailView(result.data) : null), [result.data]);
  return { ...result, detail };
}

export function useProjectUpdates(followed: boolean, limit = 5) {
  return useQuery({ queryKey: [...PROJECTS_KEY, "updates", followed, limit], queryFn: () => listProjectUpdates({ followed, limit }) });
}

export function useProjectFollow(projectId: string, serverFollowing: boolean) {
  const queryClient = useQueryClient();
  const [override, setOverride] = useState<{ server: boolean; value: boolean } | null>(null);
  const following = override && override.server === serverFollowing ? override.value : serverFollowing;

  const mutation = useMutation({
    mutationFn: (next: boolean) => (next ? followProject(projectId) : unfollowProject(projectId)),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: PROJECTS_KEY }),
    onError: (error) => {
      setOverride(null);
      notifyError(error, "We could not update that follow.");
    },
  });

  function toggle() {
    const next = !following;
    setOverride({ server: serverFollowing, value: next });
    mutation.mutate(next);
  }

  return { following, toggle, pending: mutation.isPending };
}

export function useRequestVisit(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { preferredAt: string; message?: string }) => requestVisit(projectId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...PROJECTS_KEY, "visits"] });
      showSuccessToast("Site visit requested. The developer will confirm a time.");
    },
    onError: (error) => notifyError(error, "We could not send that request."),
  });
}

export function useMyVisits() {
  return useQuery({ queryKey: [...PROJECTS_KEY, "visits", "mine"], queryFn: listMyVisits });
}

export function useIncomingVisits(projectId?: string) {
  return useQuery({ queryKey: [...PROJECTS_KEY, "visits", "incoming", projectId ?? "all"], queryFn: () => listIncomingVisits(projectId) });
}

export function useMyReservations() {
  return useQuery({ queryKey: [...PROJECTS_KEY, "reservations", "mine"], queryFn: listMyReservations });
}

export function useProjectReservations(projectId: string) {
  return useQuery({ queryKey: [...PROJECTS_KEY, "reservations", "project", projectId], queryFn: () => listProjectReservations(projectId) });
}

export function useReservation(id: string | undefined, options: { pollWhile?: (status: string | null) => boolean } = {}) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, "reservations", "one", id],
    queryFn: () => getReservation(id as string),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status ?? null;
      return options.pollWhile && options.pollWhile(status) ? 2000 : false;
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelReservation(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: PROJECTS_KEY }),
    onError: (error) => notifyError(error),
  });
}
