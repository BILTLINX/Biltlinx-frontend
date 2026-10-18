"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import type { Conversation, ThreadMessage } from "@/lib/dummy-messages";
import { cn } from "@/lib/utils";

interface MessageThreadProps {
  conversation: Conversation;
  onBack: () => void;
  className?: string;
}

function currentTimeLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
}

/** The open conversation (Figma node 1046:23096): header, listing context, messages, an action card and the composer. */
export function MessageThread({ conversation, onBack, className }: MessageThreadProps) {
  const router = useRouter();
  const [sent, setSent] = useState<ThreadMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [actionDone, setActionDone] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));
  const messages = [...conversation.messages, ...sent];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, conversation.id]);

  function send(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setSent((current) => [...current, { id: `local-${Date.now()}`, from: "me", text, time: currentTimeLabel() }]);
    setDraft("");
  }

  return (
    <section className={cn("flex min-h-0 min-w-0 flex-col bg-gray-50", className)}>
      <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="-ml-1 shrink-0 text-xl leading-none text-brand-900 lg:hidden"
        >
          ‹
        </button>
        <span className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
          <Image src={conversation.avatar} alt="" fill className="object-cover" sizes="40px" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="truncate text-[15px] font-bold leading-[22px] text-[#0f172a]">{conversation.name}</h2>
          <p className="truncate text-xs leading-[17px] text-gray-500">{conversation.roleLine}</p>
        </div>
        <Button
          variant="outline"
          onClick={comingSoon("View profile")}
          className="h-9 w-auto shrink-0 whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]"
        >
          View profile
        </Button>
      </header>

      {conversation.listing && (
        <div className="flex shrink-0 items-center gap-3 rounded-b-xl bg-white p-3">
          <span className="relative block h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[#eef2ff]">
            <Image src={conversation.listing.image} alt="" fill className="object-cover" sizes="64px" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="truncate text-[13px] font-semibold leading-[19px] text-[#0f172a]">{conversation.listing.title}</p>
            <p className="truncate text-xs leading-[17px] text-gray-500">{conversation.listing.summary}</p>
          </div>
          <button
            type="button"
            onClick={comingSoon("View listing")}
            className="h-8 shrink-0 whitespace-nowrap rounded-[10px] bg-[#eff5ff] px-4 text-sm font-medium text-brand-900 hover:bg-[#e2edff]"
          >
            View listing
          </button>
        </div>
      )}

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-5">
        <span className="self-start rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-medium leading-4 text-[#334155]">
          {conversation.dayLabel}
        </span>
        {messages.map((message) => (
          <div key={message.id} className={cn("flex", message.from === "me" && "justify-end")}>
            <div
              className={cn(
                "flex max-w-[85%] flex-col gap-1 rounded-[14px] px-3.5 py-2.5 sm:max-w-[70%]",
                message.from === "me" ? "bg-brand-900 text-white" : "border border-gray-200 bg-white text-[#0f172a]",
              )}
            >
              <p className="whitespace-pre-line text-sm leading-5">{message.text}</p>
              <p className={cn("text-[10px] leading-[15px]", message.from === "me" ? "text-[#dbeafe]" : "text-[#94a3b8]")}>
                {message.time}
              </p>
            </div>
          </div>
        ))}

        {conversation.action && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eff5ff]">
              <NavIcon icon="/icons/calendar-03.svg" size={17} className="bg-brand-900" />
            </span>
            <div className="flex min-w-[180px] flex-1 flex-col gap-0.5">
              <p className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">{conversation.action.title}</p>
              <p className="text-xs leading-[17px] text-gray-500">
                {actionDone ? conversation.action.confirmedStatus : conversation.action.status}
              </p>
            </div>
            {!actionDone && (
              <Button
                variant="primary"
                onClick={() => setActionDone(true)}
                className="h-9 w-auto shrink-0 whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]"
              >
                {conversation.action.action}
              </Button>
            )}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex shrink-0 items-center gap-2.5 border-t border-gray-200 bg-white px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={comingSoon("Attachments")}
          aria-label="Attach a file"
          className="flex size-5 shrink-0 items-center justify-center"
        >
          <NavIcon icon="/icons/attachment-01.svg" size={18} className="bg-gray-500" />
        </button>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message…"
          aria-label="Write a message"
          className="min-w-0 flex-1 rounded-xl bg-gray-50 px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="h-11 shrink-0 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white hover:bg-brand-900/90 disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </section>
  );
}
