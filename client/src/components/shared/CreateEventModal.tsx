"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { SelectField } from "@/components/shared/SelectField";
import { START_HINT, START_INPUT_BOX, START_TEXTAREA, StartDialogFrame, TickChip } from "@/components/shared/StartDialogFrame";
import { DateTimeField } from "@/components/shared/ViewingSlotPickers";
import { useCommunities, useCreateEvent } from "@/hooks/useCommunities";
import { EVENT_KINDS } from "@/lib/dummy-communities";
import { cn } from "@/lib/utils";

const ABOUT_MAX = 400;

/** The form itself, mounted only while the dialog is open so it starts empty each time. */
function CreateEventForm({ communityId, onClose, onStartCommunity }: { communityId?: string; onClose: () => void; onStartCommunity?: () => void }) {
  const router = useRouter();
  const { started } = useCommunities();
  const createEvent = useCreateEvent();
  const [chosen, setChosen] = useState(communityId ?? started[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("");
  const [start, setStart] = useState("");
  const [place, setPlace] = useState("");
  const [about, setAbout] = useState("");
  const [capacity, setCapacity] = useState("");

  const community = started.find((entry) => entry.id === chosen);
  const [date = "", time = ""] = start.split("T");
  const ready = Boolean(community) && title.trim() !== "" && kind !== "" && date !== "" && time !== "" && place.trim() !== "";

  function submit() {
    if (!community) return;
    const limit = Number(capacity);
    const event = createEvent({
      communityId: community.id,
      title: title.trim(),
      kind,
      date,
      time,
      place: place.trim(),
      about: about.trim(),
      capacity: limit > 0 ? limit : undefined,
    });
    showSuccessToast("Event created. It is on your community’s page.");
    onClose();
    router.push(`/communities/${community.id}/events/${event.id}`);
  }

  return (
    <StartDialogFrame
      titleId="create-event-title"
      title="Create an event"
      subtitle={community ? `For ${community.name}. Members see it on the community’s page.` : "Plan a meetup, tour or webinar for your community."}
      onClose={onClose}
      primary={started.length > 0 ? { label: "Create event", onClick: submit, disabled: !ready } : undefined}
    >
      {started.length === 0 ? (
        <EmptyState
          size="compact"
          icon="communities"
          title="You have no community yet"
          body="Events belong to a community you started. Start one first, then plan events for it."
          primary={{ label: "Start a community", onClick: () => (onStartCommunity ? onStartCommunity() : router.push("/communities")) }}
          className="my-auto border-0 bg-transparent"
        />
      ) : (
        <>
          {!communityId && (
            <FormField label="Community" className="gap-2">
              <SelectField value={chosen} onChange={setChosen} aria-label="Community" options={started.map((entry) => ({ value: entry.id, label: entry.name }))} className="h-11 rounded-[10px]" />
            </FormField>
          )}

          <FormField label="Event title" className="gap-2">
            <label className={cn(FIELD_BOX, START_INPUT_BOX, "border-[#e2e8f0]")}>
              <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} aria-label="Event title" placeholder="e.g. Estate homeowners meeting" className={FIELD_INPUT} />
            </label>
          </FormField>

          <FormField label="What kind of event is it?" className="gap-2">
            <div role="radiogroup" aria-label="Event type" className="flex flex-wrap gap-2">
              {EVENT_KINDS.map((option) => (
                <TickChip key={option} label={option} selected={kind === option} onClick={() => setKind(option)} />
              ))}
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="When does it start?" className="gap-2">
              <DateTimeField value={start} onChange={setStart} />
            </FormField>
            <FormField label="Number of spots (optional)" className="gap-2">
              <label className={cn(FIELD_BOX, START_INPUT_BOX, "border-[#e2e8f0]")}>
                <input value={capacity} onChange={(event) => setCapacity(event.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" aria-label="Number of spots" placeholder="No limit" className={FIELD_INPUT} />
              </label>
            </FormField>
          </div>

          <FormField label="Where is it?" className="gap-2">
            <label className={cn(FIELD_BOX, START_INPUT_BOX, "border-[#e2e8f0]")}>
              <input value={place} onChange={(event) => setPlace(event.target.value)} maxLength={80} aria-label="Where is it?" placeholder="e.g. Lizzie’s Place, East Legon, or an online link" className={FIELD_INPUT} />
            </label>
          </FormField>

          <FormField label="About the event (optional)" className="gap-2">
            <textarea value={about} onChange={(event) => setAbout(event.target.value)} maxLength={ABOUT_MAX} aria-label="About the event" placeholder="What will happen, who should come and what to bring" className={cn(START_TEXTAREA, "h-[72px]")} />
            <div className="flex items-start gap-4">
              <p className={cn(START_HINT, "min-w-0 flex-1")}>People RSVP on the event’s page.</p>
              <p className="shrink-0 whitespace-nowrap text-xs leading-[17px] text-[#94a3b8]">{ABOUT_MAX - about.length} characters left</p>
            </div>
          </FormField>
        </>
      )}
    </StartDialogFrame>
  );
}

/** Plan an event for a community you started: what it is, when and where, and how many can come. Pass `communityId` from a community's own page; from the Create menu you pick one. Same look as Start a community. */
export function CreateEventModal({ open, communityId, onClose, onStartCommunity }: { open: boolean; communityId?: string; onClose: () => void; onStartCommunity?: () => void }) {
  return (
    <CenteredDialog open={open} onClose={onClose} labelledBy="create-event-title" className="max-w-[560px]">
      <CreateEventForm communityId={communityId} onClose={onClose} onStartCommunity={onStartCommunity} />
    </CenteredDialog>
  );
}
