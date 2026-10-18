"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { MESSAGE_FILTERS, type Conversation, type MessageFilter } from "@/lib/dummy-messages";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

/** The Messages sidebar (Figma node 1046:23037): search, filter chips and the conversation rows. */
export function ConversationList({ conversations, activeId, onSelect, className }: ConversationListProps) {
  const [filter, setFilter] = useState<MessageFilter>("All");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return conversations.filter(
      (conversation) =>
        (filter === "All" || (filter === "Unread" ? conversation.unread : conversation.category === filter)) &&
        (!term || `${conversation.name} ${conversation.subject} ${conversation.preview}`.toLowerCase().includes(term)),
    );
  }, [conversations, filter, query]);

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
          {MESSAGE_FILTERS.map((item) => {
            const active = item === filter;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(item)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium leading-[18px]",
                  active ? "bg-brand-900 text-white" : "border border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        {visible.map((conversation) => {
          const active = conversation.id === activeId;
          return (
            <li key={conversation.id}>
              <button
                type="button"
                onClick={() => onSelect(conversation.id)}
                aria-current={active}
                className={cn("flex w-full items-start gap-3 px-4 py-3 text-left", active ? "bg-[#eff5ff]" : "hover:bg-gray-50")}
              >
                <span className="relative block size-11 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                  <Image src={conversation.avatar} alt="" fill className="object-cover" sizes="44px" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-semibold leading-5 text-[#0f172a]">{conversation.name}</span>
                    <span className="shrink-0 text-[11px] leading-4 text-gray-500">{conversation.time}</span>
                  </span>
                  <span className="truncate text-[11px] font-medium leading-4 text-brand-900">{conversation.subject}</span>
                  <span
                    className={cn(
                      "truncate text-xs leading-[17px]",
                      conversation.unread ? "font-medium text-[#0f172a]" : "text-gray-500",
                    )}
                  >
                    {conversation.preview}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
        {visible.length === 0 && <li className="p-6 text-center text-sm text-gray-500">No conversations found.</li>}
      </ul>
    </aside>
  );
}
