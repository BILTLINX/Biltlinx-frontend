"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { ConversationList } from "@/components/shared/ConversationList";
import { EmptyState } from "@/components/shared/EmptyState";
import { MessageThread } from "@/components/shared/MessageThread";
import { CONVERSATIONS_KEY, useConversations } from "@/hooks/useMessaging";
import { listConversations } from "@/lib/messaging-api";
import { cn } from "@/lib/utils";

function Messages() {
  const router = useRouter();
  const activeId = useSearchParams().get("c");

  const all = useQuery({ queryKey: [...CONVERSATIONS_KEY, "lookup", activeId], queryFn: async () => {
    const [inbox, archived] = await Promise.all([listConversations({ results: 100 }), listConversations({ results: 100, archived: true })]);
    return [...(inbox.items ?? []), ...(archived.items ?? [])];
  }, enabled: activeId !== null });
  const inbox = useConversations(false);
  const inboxEmpty = !inbox.isPending && !inbox.isError && (inbox.data?.items?.length ?? 0) === 0;
  const active = all.data?.find((conversation) => conversation.id === activeId) ?? null;
  const threadOpen = activeId !== null;

  function select(id: string) {
    router.replace(`/messages?c=${id}`);
  }

  return (
    <AppShell contentFullWidth contentPadding="pb-24 lg:pb-0">
      <div className="flex h-full min-h-[560px] overflow-hidden bg-white">
        <ConversationList activeId={activeId} onSelect={select} className={cn("w-full lg:w-[340px] lg:shrink-0", threadOpen ? "hidden lg:flex" : "flex")} />
        {active ? (
          <MessageThread key={active.id} conversation={active} onBack={() => router.replace("/messages")} className={cn("flex-1", threadOpen ? "flex" : "hidden lg:flex")} />
        ) : (
          <section className={cn("flex-1 items-center justify-center bg-gray-50 p-8 text-center", threadOpen ? "flex" : "hidden lg:flex")}>
            {inboxEmpty && !activeId ? (
              <EmptyState
                icon="chat"
                title="Start a conversation"
                body="Enquire about a listing, request a viewing or ask for a quote, and the chat starts here. Your messages stay private."
                primary={{ label: "Browse Marketplace", href: "/marketplace" }}
                secondary={{ label: "Find a professional", href: "/professionals" }}
                className="border-0 bg-transparent"
              />
            ) : (
              <p className="text-sm text-gray-500">{activeId && all.isPending ? "Loading…" : "Choose a conversation, or message someone from a property, stay or service page."}</p>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <Messages />
    </Suspense>
  );
}
