"use client";

import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSession } from "@/context/SessionContext";
import { CONVERSATIONS_KEY } from "@/hooks/useMessaging";
import type { MessageDto } from "@/types/api/schema";

export interface ReceiptEvent {
  conversationId: string;
  accountId: string;
  deliveredSeq: number;
  readSeq: number;
}

type MessageListener = (message: MessageDto) => void;
type ReceiptListener = (receipt: ReceiptEvent) => void;
type ReconnectListener = () => void;

export type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "offline";

interface MessagingContextValue {
  status: ConnectionStatus;
  onMessage: (listener: MessageListener) => () => void;
  onReceipt: (listener: ReceiptListener) => () => void;
  onReconnect: (listener: ReconnectListener) => () => void;
  markDelivered: (conversationId: string, seq: number) => void;
  markRead: (conversationId: string, seq: number) => void;
}

const MessagingContext = createContext<MessagingContextValue | null>(null);

function hubUrl() {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050/api";
  return `${api.replace(/\/api\/?$/, "")}/hubs/messages`;
}

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const connection = useRef<HubConnection | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("offline");
  const messageListeners = useRef(new Set<MessageListener>());
  const receiptListeners = useRef(new Set<ReceiptListener>());
  const reconnectListeners = useRef(new Set<ReconnectListener>());

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    const hub = new HubConnectionBuilder().withUrl(hubUrl(), { withCredentials: true }).withAutomaticReconnect().configureLogging(LogLevel.None).build();
    connection.current = hub;

    hub.on("message", (payload: { message: MessageDto }) => {
      messageListeners.current.forEach((listener) => listener(payload.message));
      void queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    });
    hub.on("receipt", (receipt: ReceiptEvent) => {
      receiptListeners.current.forEach((listener) => listener(receipt));
    });
    hub.onreconnecting(() => setStatus("reconnecting"));
    hub.onreconnected(() => {
      setStatus("connected");
      reconnectListeners.current.forEach((listener) => listener());
      void queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    });
    hub.onclose(() => setStatus("offline"));

    let cancelled = false;
    setStatus("connecting");
    hub
      .start()
      .then(() => {
        if (!cancelled) setStatus("connected");
      })
      .catch(() => {
        if (!cancelled) setStatus("offline");
      });

    return () => {
      cancelled = true;
      connection.current = null;
      void hub.stop();
    };
  }, [sessionStatus, queryClient]);

  const invoke = useCallback((method: string, conversationId: string, seq: number) => {
    const hub = connection.current;
    if (hub && hub.state === HubConnectionState.Connected) void hub.invoke(method, conversationId, seq).catch(() => undefined);
  }, []);

  const value = useMemo<MessagingContextValue>(
    () => ({
      status,
      onMessage: (listener) => {
        messageListeners.current.add(listener);
        return () => messageListeners.current.delete(listener);
      },
      onReceipt: (listener) => {
        receiptListeners.current.add(listener);
        return () => receiptListeners.current.delete(listener);
      },
      onReconnect: (listener) => {
        reconnectListeners.current.add(listener);
        return () => reconnectListeners.current.delete(listener);
      },
      markDelivered: (conversationId, seq) => invoke("MarkDelivered", conversationId, seq),
      markRead: (conversationId, seq) => invoke("MarkRead", conversationId, seq),
    }),
    [status, invoke],
  );

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
}

export function useMessagingSocket() {
  const value = useContext(MessagingContext);
  if (!value) throw new Error("useMessagingSocket must be used inside MessagingProvider");
  return value;
}
