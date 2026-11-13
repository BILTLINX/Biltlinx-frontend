"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useSession } from "@/context/SessionContext";
import { useAccountBadge } from "@/hooks/useDisplayName";
import { NONE, readList, subscribeToLists, writeList } from "@/lib/browser-list";
import {
  COMMUNITIES,
  eventSummary,
  getCommunityDetail,
  startedCommunityDetail,
  type Community,
  type StartedEvent,
} from "@/lib/dummy-communities";

export type CommunityDraft = Required<Pick<Community, "name" | "type" | "description" | "image" | "privacy" | "rules">>;
export type EventDraft = Omit<StartedEvent, "id" | "hostName">;

// There is no communities or events API yet, so what you start lives in this browser, one list of each per signed-in account.
function useStorageKeys() {
  const { user } = useSession();
  const owner = user?.id ?? "guest";
  return { communitiesKey: `biltlinx.communities.${owner}`, eventsKey: `biltlinx.community-events.${owner}` };
}

function useStartedCommunities() {
  const { communitiesKey } = useStorageKeys();
  const started = useSyncExternalStore<Community[]>(subscribeToLists, () => readList(communitiesKey), () => NONE);
  return { started, storageKey: communitiesKey };
}

function useStartedEvents() {
  const { eventsKey } = useStorageKeys();
  return useSyncExternalStore<StartedEvent[]>(subscribeToLists, () => readList(eventsKey), () => NONE);
}

/** Every community, the ones you started first, with a way to start another. */
export function useCommunities() {
  const { started, storageKey } = useStartedCommunities();
  const communities = useMemo(() => [...started, ...COMMUNITIES], [started]);

  const create = useCallback(
    (draft: CommunityDraft) => {
      const community: Community = { ...draft, id: crypto.randomUUID(), members: "1", mine: true };
      writeList(storageKey, [community, ...readList<Community>(storageKey)]);
      return community;
    },
    [storageKey],
  );

  return { communities, started, create };
}

/** A way to plan an event for a community you started. */
export function useCreateEvent() {
  const { eventsKey } = useStorageKeys();
  const { name } = useAccountBadge();

  return useCallback(
    (draft: EventDraft) => {
      const event: StartedEvent = { ...draft, id: crypto.randomUUID(), hostName: name || "You" };
      writeList(eventsKey, [...readList<StartedEvent>(eventsKey), event]);
      return event;
    },
    [eventsKey, name],
  );
}

/** One community's page, whether it is a sample one or one you started, with the events you planned for it ahead of the sample ones. */
export function useCommunityDetail(id: string) {
  const { started } = useStartedCommunities();
  const events = useStartedEvents();
  const { avatar } = useAccountBadge();
  const own = started.find((community) => community.id === id);
  const detail = own ? startedCommunityDetail(own, avatar) : getCommunityDetail(id);
  if (!detail) return undefined;

  const planned = events
    .filter((event) => event.communityId === id)
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    .map(eventSummary);
  return planned.length === 0 ? detail : { ...detail, viewerAvatar: avatar, events: [...planned, ...detail.events] };
}
