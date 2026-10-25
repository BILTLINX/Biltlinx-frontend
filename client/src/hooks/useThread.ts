import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMessagingSocket } from "@/context/MessagingContext";
import { useSession } from "@/context/SessionContext";
import { CONVERSATIONS_KEY } from "@/hooks/useMessaging";
import { notifyError } from "@/lib/errors";
import { deleteMessage, editMessage, getMessages, markDelivered, markRead, sendMessage } from "@/lib/messaging-api";
import type { MessageDto } from "@/types/api/schema";

export interface ThreadMessage extends MessageDto {
  pending?: boolean;
  failed?: boolean;
  clientId?: string;
}

function bySeq(a: ThreadMessage, b: ThreadMessage) {
  if (a.pending && !b.pending) return 1;
  if (!a.pending && b.pending) return -1;
  return a.seq - b.seq;
}

function merge(current: ThreadMessage[], incoming: MessageDto[]): ThreadMessage[] {
  const map = new Map<string, ThreadMessage>();
  for (const message of current) map.set(message.id, message);
  for (const message of incoming) {
    map.set(message.id, message);
    for (const [key, existing] of map) if (existing.pending && message.senderAccountId === existing.senderAccountId && message.body === existing.body && existing.clientId) map.delete(key);
  }
  return [...map.values()].sort(bySeq);
}

export function useThread(conversationId: string) {
  const { user } = useSession();
  const socket = useMessagingSocket();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const lastSeq = useRef(0);
  const readSeq = useRef(0);

  const acknowledge = useCallback(
    (list: MessageDto[]) => {
      const incoming = list.filter((message) => message.senderAccountId !== user?.id && message.senderAccountId !== null);
      const top = incoming.reduce((max, message) => Math.max(max, message.seq), 0);
      if (top > readSeq.current) {
        readSeq.current = top;
        socket.markDelivered(conversationId, top);
        socket.markRead(conversationId, top);
        void markDelivered(conversationId, top).catch(() => undefined);
        void markRead(conversationId, top)
          .then(() => queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }))
          .catch(() => undefined);
      }
    },
    [conversationId, socket, user?.id, queryClient],
  );

  const load = useCallback(
    async (after?: number) => {
      try {
        const fetched = await getMessages(conversationId, after);
        setMessages((current) => merge(current, fetched));
        lastSeq.current = Math.max(lastSeq.current, ...fetched.map((message) => message.seq), 0);
        acknowledge(fetched);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [conversationId, acknowledge],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => socket.onReconnect(() => void load(lastSeq.current)), [socket, load]);

  useEffect(
    () =>
      socket.onMessage((message) => {
        if (message.conversationId !== conversationId) return;
        setMessages((current) => merge(current, [message]));
        lastSeq.current = Math.max(lastSeq.current, message.seq);
        acknowledge([message]);
      }),
    [socket, conversationId, acknowledge],
  );

  useEffect(
    () =>
      socket.onReceipt((receipt) => {
        if (receipt.conversationId !== conversationId || receipt.accountId === user?.id) return;
        setMessages((current) =>
          current.map((message) =>
            message.senderAccountId === user?.id && !message.pending
              ? { ...message, status: message.seq <= receipt.readSeq ? "Read" : message.seq <= receipt.deliveredSeq ? "Delivered" : message.status }
              : message,
          ),
        );
      }),
    [socket, conversationId, user?.id],
  );

  const send = useCallback(
    async (input: { body?: string; attachments?: { path: string; contentType: string; name?: string }[]; previews?: string[] }) => {
      const clientId = crypto.randomUUID();
      const optimistic: ThreadMessage = {
        id: `pending-${clientId}`,
        conversationId,
        seq: Number.MAX_SAFE_INTEGER,
        senderAccountId: user?.id ?? null,
        type: input.attachments?.length ? "Image" : "Text",
        body: input.body ?? null,
        deleted: false,
        edited: false,
        card: { refType: null, refId: null, snapshot: null },
        attachments: (input.previews ?? []).map((url) => ({ url, contentType: "image/jpeg", name: null })),
        createdAt: new Date().toISOString(),
        status: "Sending",
        pending: true,
        clientId,
      };
      setMessages((current) => [...current, optimistic]);
      try {
        const sent = await sendMessage(conversationId, { body: input.body, attachments: input.attachments, clientMessageId: clientId });
        setMessages((current) => merge(current.filter((message) => message.id !== optimistic.id), [sent]));
        lastSeq.current = Math.max(lastSeq.current, sent.seq);
        void queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
        return true;
      } catch (err) {
        setMessages((current) => current.map((message) => (message.id === optimistic.id ? { ...message, failed: true, pending: false, status: "Failed" } : message)));
        notifyError(err, "Your message was not sent.");
        return false;
      }
    },
    [conversationId, user?.id, queryClient],
  );

  const edit = useCallback(
    async (messageId: string, body: string) => {
      try {
        const updated = await editMessage(messageId, body);
        setMessages((current) => current.map((message) => (message.id === messageId ? updated : message)));
      } catch (err) {
        notifyError(err);
      }
    },
    [],
  );

  const remove = useCallback(async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      setMessages((current) => current.map((message) => (message.id === messageId ? { ...message, deleted: true, body: null } : message)));
    } catch (err) {
      notifyError(err);
    }
  }, []);

  return { messages, loading, error, send, edit, remove, reload: () => load() };
}
