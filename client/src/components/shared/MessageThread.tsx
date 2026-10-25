"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { NavIcon } from "@/components/shared/NavIcon";
import { useMessagingSocket } from "@/context/MessagingContext";
import { useSession } from "@/context/SessionContext";
import { CONVERSATIONS_KEY } from "@/hooks/useMessaging";
import { useThread, type ThreadMessage } from "@/hooks/useThread";
import { notifyError } from "@/lib/errors";
import { formatDateTime, formatMoney } from "@/lib/format";
import { archiveConversation, blockAccount, reportMessage } from "@/lib/messaging-api";
import { uploadMedia, type UploadedMedia } from "@/lib/upload";
import type { ConversationDto } from "@/types/api/schema";
import { cn } from "@/lib/utils";

const EDIT_WINDOW_MS = 15 * 60_000;
const MAX_PHOTOS = 4;
const REPORT_CATEGORIES = ["Spam", "Abuse", "Scam", "Discrimination", "Other"] as const;

interface CardInfo {
  title: string;
  lines: string[];
  href?: string;
}

function describeCard(message: ThreadMessage): CardInfo {
  const card = message.card;
  const snapshot = (card.snapshot ?? {}) as Record<string, unknown>;
  const text = (key: string) => (typeof snapshot[key] === "string" ? (snapshot[key] as string) : undefined);
  switch (card.refType) {
    case "Booking":
      return {
        title: message.body ?? "Booking update",
        lines: [text("property") ?? "", [text("checkIn"), text("checkOut")].filter(Boolean).join(" to "), typeof snapshot.total === "number" ? formatMoney(snapshot.total, text("currency") ?? "GHS") : ""].filter(Boolean),
        href: card.refId ? `/stay/bookings/${card.refId}` : undefined,
      };
    case "Viewing":
      return {
        title: message.body ?? "Viewing update",
        lines: [text("scheduledAt") ? `Scheduled ${formatDateTime(text("scheduledAt") as string)}` : "Time to be confirmed"],
        href: "/manage/enquiries",
      };
    case "Lead":
      return {
        title: text("listing") ?? "Enquiry",
        lines: [text("message") ?? "", typeof snapshot.priceAtEnquiry === "number" ? `Price when asked: ${formatMoney(snapshot.priceAtEnquiry, text("currency") ?? "GHS")}` : ""].filter(Boolean),
        href: text("listingId") ? `/properties/${text("listingId")}` : undefined,
      };
    default:
      return { title: message.body ?? "Update", lines: [] };
  }
}

function Ticks({ status }: { status: string | null }) {
  const label = status === "Read" ? "Read" : status === "Delivered" ? "Delivered" : status === "Sent" ? "Sent" : status === "Failed" ? "Not sent" : "Sending";
  return <span className={cn("text-[10px]", status === "Read" ? "text-[#bfdbfe]" : "text-[#dbeafe]/80")}>{label}</span>;
}

interface MessageThreadProps {
  conversation: ConversationDto;
  onBack: () => void;
  className?: string;
}

/** The open conversation (Figma node 1046:23096): header, context, live messages, cards and the composer. */
export function MessageThread({ conversation, onBack, className }: MessageThreadProps) {
  const { user } = useSession();
  const socket = useMessagingSocket();
  const queryClient = useQueryClient();
  const thread = useThread(conversation.id);
  const [draft, setDraft] = useState("");
  const [photos, setPhotos] = useState<UploadedMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<{ id: string; body: string } | null>(null);
  const [reportFor, setReportFor] = useState<ThreadMessage | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const endRef = useRef<HTMLDivElement | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [thread.messages.length]);

  const block = useMutation({
    mutationFn: () => blockAccount(conversation.other.accountId),
    onSuccess: () => showSuccessToast(`${conversation.other.name} is blocked. Neither of you can message the other.`),
    onError: (error) => notifyError(error),
  });
  const archive = useMutation({
    mutationFn: () => archiveConversation(conversation.id, !conversation.archived),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
      onBack();
    },
    onError: (error) => notifyError(error),
  });
  const report = useMutation({
    mutationFn: (category: string) => reportMessage((reportFor as ThreadMessage).id, category),
    onSuccess: () => {
      showSuccessToast("Reported. Our team will review it.");
      setReportFor(null);
    },
    onError: (error) => notifyError(error),
  });

  async function addPhotos(files: FileList | null) {
    const list = Array.from(files ?? []).slice(0, MAX_PHOTOS - photos.length);
    if (list.length === 0) return;
    setUploading(true);
    for (const file of list) {
      try {
        const media = await uploadMedia(file, { allowVideo: false });
        setPhotos((current) => (current.length >= MAX_PHOTOS ? current : [...current, media]));
      } catch (error) {
        notifyError(error);
      }
    }
    setUploading(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body && photos.length === 0) return;
    const attachments = photos.map(({ path, contentType, name }) => ({ path, contentType, name }));
    const previews = photos.map((photo) => photo.publicUrl);
    setDraft("");
    setPhotos([]);
    const ok = await thread.send({ body: body || undefined, attachments: attachments.length > 0 ? attachments : undefined, previews });
    if (!ok) {
      setDraft(body);
    }
  }

  function saveEdit() {
    if (!editing || !editing.body.trim()) return;
    void thread.edit(editing.id, editing.body.trim());
    setEditing(null);
  }

  return (
    <section className={cn("flex min-h-0 min-w-0 flex-col bg-gray-50", className)}>
      <header className="relative flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-5">
        <button type="button" onClick={onBack} aria-label="Back to conversations" className="-ml-1 shrink-0 text-xl leading-none text-brand-900 lg:hidden">
          ‹
        </button>
        <span className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
          <Image src={conversation.other.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt="" fill className="object-cover" sizes="40px" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="truncate text-[15px] font-bold leading-[22px] text-[#0f172a]">
            {conversation.other.name}
            {conversation.other.isVerified && <span className="ml-1.5 text-xs font-medium text-[#16a34a]">Verified ✓</span>}
          </h2>
          <p className="truncate text-xs leading-[17px] text-gray-500">
            {conversation.contextType} · {conversation.contextTitle}
          </p>
        </div>
        <span className={cn("hidden size-2 rounded-full sm:block", socket.status === "connected" ? "bg-[#22c55e]" : "bg-[#f59e0b]")} title={socket.status === "connected" ? "Live" : "Reconnecting"} />
        <button type="button" aria-label="Conversation options" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)} className="px-2 text-xl leading-none text-gray-500">
          ⋯
        </button>
        {menuOpen && (
          <div className="absolute right-4 top-14 z-20 flex w-48 flex-col rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
            <button type="button" onClick={() => archive.mutate()} className="h-9 rounded-lg px-3 text-left text-[13px] text-[#334155] hover:bg-gray-50">
              {conversation.archived ? "Move to inbox" : "Archive"}
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); block.mutate(); }} className="h-9 rounded-lg px-3 text-left text-[13px] text-[#dc2626] hover:bg-gray-50">
              Block {conversation.other.name}
            </button>
          </div>
        )}
      </header>

      <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-2 text-xs text-gray-500">
        Never share card numbers, PINs or one-time codes in chat.
      </div>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-5">
        {thread.loading && <p className="self-center text-sm text-gray-500">Loading…</p>}
        {thread.error != null && (
          <button type="button" onClick={() => void thread.reload()} className="self-center text-sm font-medium text-brand-900">
            Could not load messages. Try again
          </button>
        )}
        {thread.messages.map((message) => {
          const mine = message.senderAccountId === user?.id;
          const isCard = message.card.refType !== null;
          const canEdit = mine && !isCard && !message.deleted && !message.pending && message.attachments?.length === 0 && now - new Date(message.createdAt.endsWith("Z") ? message.createdAt : `${message.createdAt}Z`).getTime() < EDIT_WINDOW_MS;

          if (isCard) {
            const info = describeCard(message);
            const body = (
              <div className="flex max-w-[85%] flex-col gap-1 self-center rounded-xl border border-gray-200 bg-white p-3.5 sm:max-w-[70%]">
                <p className="text-[13px] font-semibold text-[#0f172a]">{info.title}</p>
                {info.lines.map((line) => (
                  <p key={line} className="text-xs text-gray-500">
                    {line}
                  </p>
                ))}
                <p className="text-[10px] text-[#94a3b8]">{formatDateTime(message.createdAt)}</p>
              </div>
            );
            return info.href ? (
              <Link key={message.id} href={info.href} className="flex justify-center">
                {body}
              </Link>
            ) : (
              <div key={message.id} className="flex justify-center">
                {body}
              </div>
            );
          }

          return (
            <div key={message.id} className={cn("group flex items-end gap-1.5", mine && "justify-end")}>
              {mine && !message.deleted && !message.pending && (
                <span className="hidden gap-1.5 text-[11px] text-gray-400 group-hover:flex">
                  {canEdit && (
                    <button type="button" onClick={() => setEditing({ id: message.id, body: message.body ?? "" })} className="hover:text-brand-900">
                      Edit
                    </button>
                  )}
                  <button type="button" onClick={() => void thread.remove(message.id)} className="hover:text-[#dc2626]">
                    Delete
                  </button>
                </span>
              )}
              <div className={cn("flex max-w-[85%] flex-col gap-1 rounded-[14px] px-3.5 py-2.5 sm:max-w-[70%]", mine ? "bg-brand-900 text-white" : "border border-gray-200 bg-white text-[#0f172a]", message.failed && "opacity-70 ring-1 ring-[#dc2626]")}>
                {message.deleted ? (
                  <p className="text-sm italic opacity-70">This message was deleted</p>
                ) : editing?.id === message.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea value={editing.body} onChange={(event) => setEditing({ id: message.id, body: event.target.value })} rows={2} className="rounded-lg border border-white/30 bg-white/10 p-2 text-sm text-white focus:outline-none" />
                    <div className="flex gap-3 text-xs font-medium">
                      <button type="button" onClick={saveEdit}>Save</button>
                      <button type="button" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {(message.attachments ?? []).map((attachment, index) => (
                      <span key={`${attachment.url}-${index}`} className="relative block h-40 w-52 overflow-hidden rounded-lg bg-black/10">
                        {attachment.url && <Image src={attachment.url} alt={attachment.name ?? "Photo"} fill unoptimized className="object-cover" sizes="208px" />}
                      </span>
                    ))}
                    {message.body && <p className="whitespace-pre-line text-sm leading-5">{message.body}</p>}
                  </>
                )}
                <p className={cn("flex items-center justify-between gap-2 text-[10px] leading-[15px]", mine ? "text-[#dbeafe]" : "text-[#94a3b8]")}>
                  <span>
                    {formatDateTime(message.createdAt)}
                    {message.edited ? " · edited" : ""}
                  </span>
                  {mine && <Ticks status={message.status} />}
                </p>
              </div>
              {!mine && !message.deleted && (
                <button type="button" onClick={() => setReportFor(message)} aria-label="Report message" className="hidden text-[11px] text-gray-400 hover:text-[#dc2626] group-hover:block">
                  Report
                </button>
              )}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {photos.length > 0 && (
        <div className="flex shrink-0 gap-2 border-t border-gray-200 bg-white px-4 pt-3 sm:px-5">
          {photos.map((photo) => (
            <span key={photo.path} className="relative block size-14 overflow-hidden rounded-lg bg-[#eef2ff]">
              <Image src={photo.publicUrl} alt="" fill unoptimized className="object-cover" sizes="56px" />
              <button type="button" aria-label="Remove photo" onClick={() => setPhotos((current) => current.filter((item) => item.path !== photo.path))} className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-[#0f172a]/70 text-xs text-white">
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="flex shrink-0 items-center gap-2.5 border-t border-gray-200 bg-white px-4 py-3 sm:px-5">
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={(event) => { void addPhotos(event.target.files); event.target.value = ""; }} />
        <button type="button" disabled={uploading || photos.length >= MAX_PHOTOS} onClick={() => fileInput.current?.click()} aria-label="Attach a photo" className="flex size-5 shrink-0 items-center justify-center disabled:opacity-40">
          <NavIcon icon="/icons/attachment-01.svg" size={18} className="bg-gray-500" />
        </button>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a message…"
          aria-label="Write a message"
          maxLength={2000}
          className="min-w-0 flex-1 rounded-xl bg-gray-50 px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
        />
        <button type="submit" disabled={(!draft.trim() && photos.length === 0) || uploading} className="h-11 shrink-0 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white hover:bg-brand-900/90 disabled:opacity-60">
          Send
        </button>
      </form>

      <CenteredDialog open={reportFor !== null} onClose={() => setReportFor(null)} labelledBy="report-title" className="max-w-[400px]">
        <div className="flex flex-col gap-3 p-6">
          <h2 id="report-title" className="text-lg font-bold text-[#0f172a]">
            Report this message
          </h2>
          <div className="flex flex-wrap gap-2">
            {REPORT_CATEGORIES.map((category) => (
              <button key={category} type="button" disabled={report.isPending} onClick={() => report.mutate(category)} className="rounded-full border border-gray-200 px-3.5 py-1.5 text-[13px] font-medium text-[#334155] hover:bg-gray-50 disabled:opacity-60">
                {category}
              </button>
            ))}
          </div>
        </div>
      </CenteredDialog>
    </section>
  );
}
