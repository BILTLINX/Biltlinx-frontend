"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useMemo, useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { CONVERSATIONS_KEY } from "@/hooks/useMessaging";
import { errorMessage } from "@/lib/errors";
import { formatRelative } from "@/lib/format";
import { listConversations } from "@/lib/messaging-api";
import type { ConversationDto } from "@/types/api/schema";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Unread", "Enquiries", "Stays", "Jobs", "Archived"] as const;
type Filter = (typeof FILTERS)[number];

const ENQUIRY_CONTEXTS = ["Property", "Lead", "Direct"];
const JOB_CONTEXTS = ["Service", "Quote", "Request"];
const STAY_CONTEXTS = ["Stay", "Booking"];

export function conversationPreview(conversation: ConversationDto) {
  const last = conversation.last;
  if (!last) return "";
  if (last.deleted) return "This message was deleted";
  if (last.type && last.type !== "Text" && last.type !== "Image") return last.body ?? "Update";
  if (last.type === "Image" && !last.body) return "Photo";
  return last.body ?? "";
}

interface ConversationListProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

/** The Messages sidebar (Figma node 1046:23037): search, filter chips and the conversation rows. */
export function ConversationList({ activeId, onSelect, className }: ConversationListProps) {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const archived = filter === "Archived";
  const conversations = useQuery({
    queryKey: [...CONVERSATIONS_KEY, archived],
    queryFn: () => listConversations({ results: 100, archived }),
    refetchInterval: 60_000,
  });

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (conversations.data?.items ?? []).filter((conversation) => {
      const context = conversation.contextType ?? "Direct";
      const matchesFilter =
        filter === "All" || filter === "Archived" || (filter === "Unread" && conversation.unread > 0) || (filter === "Enquiries" && ENQUIRY_CONTEXTS.includes(context)) || (filter === "Stays" && STAY_CONTEXTS.includes(context)) || (filter === "Jobs" && JOB_CONTEXTS.includes(context));
      return matchesFilter && (!term || `${conversation.other.name} ${conversation.contextTitle} ${conversationPreview(conversation)}`.toLowerCase().includes(term));
    });
  }, [conversations.data, filter, query]);

  return (
    <aside className={cn("flex min-h-0 flex-col border-gray-200 bg-white lg:border-r", className)}>
      <div className="flex shrink-0 flex-col gap-3 p-4">
        <h1 className="text-xl font-bold leading-[29px] text-[#0f172a]">Messages</h1>
        <label className="flex h-11 items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4">
          <NavIcon icon="/icons/search-02.svg" size={15} className="shrink-0 bg-gray-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search messages"
            aria-label="Search messages"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
          />
        </label>
        <div role="tablist" aria-label="Message filter" className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={item === filter}
              onClick={() => setFilter(item)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium leading-[18px]",
                item === filter ? "bg-brand-900 text-white" : "border border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <ul className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        {conversations.isPending && <li className="p-6 text-center text-sm text-gray-500">Loading…</li>}
        {conversations.isError && <li className="p-6 text-center text-sm text-[#dc2626]">{errorMessage(conversations.error)}</li>}
        {visible.map((conversation) => {
          const active = conversation.id === activeId;
          const unread = conversation.unread > 0;
          return (
            <li key={conversation.id}>
              <button
                type="button"
                onClick={() => onSelect(conversation.id)}
                aria-current={active}
                className={cn("flex w-full items-start gap-3 px-4 py-3 text-left", active ? "bg-[#eff5ff]" : "hover:bg-gray-50")}
              >
                <span className="relative block size-11 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                  <Image src={conversation.other.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt="" fill className="object-cover" sizes="44px" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-semibold leading-5 text-[#0f172a]">{conversation.other.name}</span>
                    <span className="shrink-0 text-[11px] leading-4 text-gray-500">{formatRelative(conversation.lastMessageAt)}</span>
                  </span>
                  <span className="flex items-center gap-1.5 truncate text-[11px] font-medium leading-4 text-brand-900">
                    <span className="shrink-0 rounded bg-[#eff5ff] px-1.5 py-px text-[10px] font-bold uppercase text-brand-900">{conversation.contextType}</span>
                    <span className="truncate">{conversation.contextTitle}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={cn("min-w-0 flex-1 truncate text-xs leading-[17px]", unread ? "font-medium text-[#0f172a]" : "text-gray-500")}>{conversationPreview(conversation)}</span>
                    {unread && <span className="shrink-0 rounded-full bg-brand-900 px-1.5 text-[10px] font-bold leading-4 text-white">{conversation.unread}</span>}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
        {!conversations.isPending && visible.length === 0 && <li className="p-6 text-center text-sm text-gray-500">No conversations found.</li>}
      </ul>
    </aside>
  );
}
