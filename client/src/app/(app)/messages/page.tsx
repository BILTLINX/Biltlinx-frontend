"use client";

import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { ConversationList } from "@/components/shared/ConversationList";
import { MessageThread } from "@/components/shared/MessageThread";
import { CONVERSATIONS } from "@/lib/dummy-messages";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const [activeId, setActiveId] = useState(CONVERSATIONS[0].id);
  // Below lg only one pane fits: the list, or the open conversation.
  const [threadOpen, setThreadOpen] = useState(false);
  const active = CONVERSATIONS.find((conversation) => conversation.id === activeId) ?? CONVERSATIONS[0];

  return (
    <AppShell contentFullWidth contentPadding="pb-24 lg:pb-0">
      <div className="flex h-full min-h-[560px] overflow-hidden bg-white">
        <ConversationList
          conversations={CONVERSATIONS}
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id);
            setThreadOpen(true);
          }}
          className={cn("w-full lg:w-[340px] lg:shrink-0", threadOpen ? "hidden lg:flex" : "flex")}
        />
        <MessageThread
          key={active.id}
          conversation={active}
          onBack={() => setThreadOpen(false)}
          className={cn("flex-1", threadOpen ? "flex" : "hidden lg:flex")}
        />
      </div>
    </AppShell>
  );
}
