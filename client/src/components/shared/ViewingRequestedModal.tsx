"use client";

import { useRouter } from "next/navigation";
import { RequestSentDialog } from "@/components/shared/RequestSentDialog";
import { comingSoonHref } from "@/lib/coming-soon";

export interface ViewingConfirmation {
  /** e.g. "Sat 24 Oct · 10 am – 12 pm" */
  when: string;
  type: string;
  /** First name of the agent, when the listing has one. */
  agentName?: string;
}

/** Shown after a viewing request is sent (Figma node 1089:37676): what was requested and what happens next. */
export function ViewingRequestedModal({ open, onClose, confirmation }: { open: boolean; onClose: () => void; confirmation: ViewingConfirmation }) {
  const router = useRouter();
  const agent = confirmation.agentName ?? "The agent";

  return (
    <RequestSentDialog
      open={open}
      onClose={onClose}
      title="Viewing requested"
      message={`${agent} usually confirms within an hour. We’ll send the exact address once the time is confirmed.`}
      rows={[
        { label: "When", value: confirmation.when },
        { label: "Type", value: confirmation.type },
        { label: "Status", value: "Waiting for agent" },
      ]}
      secondary={{ label: "Add to calendar", onClick: () => router.push(comingSoonHref("Add to calendar")) }}
      primary={{ label: confirmation.agentName ? `Message ${confirmation.agentName}` : "Message agent", onClick: () => router.push("/messages") }}
    />
  );
}
