"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListingFormLayout } from "@/components/shared/ListingFormLayout";
import { ChoiceChip, FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { SelectField } from "@/components/shared/SelectField";
import { DateTimeField } from "@/components/shared/ViewingSlotPickers";
import { Button } from "@/components/ui/Button";
import { useCommunities, useCreateEvent } from "@/hooks/useCommunities";
import { EVENT_KINDS } from "@/lib/dummy-communities";
import { cn } from "@/lib/utils";

const TEXTAREA = "resize-none rounded-[10px] border border-gray-200 px-3.5 py-2 text-sm leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none";
const HINT = "text-xs leading-[17px] text-gray-500";

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
    <ListingFormLayout
      titleId="create-event-title"
      title="Create an event"
      subtitle={community ? `For ${community.name}. Members see it on the community’s page.` : "Plan a meetup, tour or webinar for your community."}
      onClose={onClose}
      footer={
        started.length > 0 && (
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="h-11 shrink-0 rounded-[10px] border border-gray-200 px-5 text-sm font-medium text-[#0f172a] hover:bg-gray-50">
              Cancel
            </button>
            <Button variant="primary" onClick={submit} disabled={!ready} className="h-11 flex-1 rounded-[10px] lg:rounded-[10px]">
              Create event
            </Button>
          </div>
        )
      }
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
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-4">
            {!communityId && (
              <FormField label="Community">
                <SelectField value={chosen} onChange={setChosen} aria-label="Community" options={started.map((entry) => ({ value: entry.id, label: entry.name }))} />
              </FormField>
            )}
            <FormField label="Event title">
              <label className={cn(FIELD_BOX, "border-gray-200")}>
                <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} aria-label="Event title" placeholder="e.g. Estate homeowners meeting" className={FIELD_INPUT} />
              </label>
            </FormField>
            <FormField label="What kind of event is it?">
              <div role="radiogroup" aria-label="Event type" className="flex flex-wrap gap-2">
                {EVENT_KINDS.map((option) => (
                  <ChoiceChip key={option} role="radio" label={option} selected={kind === option} onClick={() => setKind(option)} />
                ))}
              </div>
            </FormField>
            <FormField label="When does it start?">
              <DateTimeField value={start} onChange={setStart} />
            </FormField>
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <FormField label="Where is it?">
              <label className={cn(FIELD_BOX, "border-gray-200")}>
                <input value={place} onChange={(event) => setPlace(event.target.value)} maxLength={80} aria-label="Where is it?" placeholder="e.g. Lizzie’s Place, East Legon, or an online link" className={FIELD_INPUT} />
              </label>
            </FormField>
            <FormField label="About the event (optional)">
              <textarea value={about} onChange={(event) => setAbout(event.target.value)} rows={4} maxLength={400} aria-label="About the event" placeholder="What will happen, who should come and what to bring" className={TEXTAREA} />
            </FormField>
            <FormField label="Number of spots (optional)">
              <label className={cn(FIELD_BOX, "border-gray-200")}>
                <input value={capacity} onChange={(event) => setCapacity(event.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" aria-label="Number of spots" placeholder="Leave empty for no limit" className={FIELD_INPUT} />
              </label>
              <p className={HINT}>People RSVP on the event’s page.</p>
            </FormField>
          </div>
        </div>
      )}
    </ListingFormLayout>
  );
}

/** Plan an event for a community you started: what it is, when and where, and how many can come. Pass `communityId` from a community's own page; from the Create menu you pick one. */
export function CreateEventModal({ open, communityId, onClose, onStartCommunity }: { open: boolean; communityId?: string; onClose: () => void; onStartCommunity?: () => void }) {
  return (
    <CenteredDialog open={open} onClose={onClose} labelledBy="create-event-title" className="max-w-[780px]">
      <CreateEventForm communityId={communityId} onClose={onClose} onStartCommunity={onStartCommunity} />
    </CenteredDialog>
  );
}
