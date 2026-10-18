import { apiRequest, type QueryValue } from "@/lib/api";
import type { BlockDto, ConversationDto, MessageDto, PagedOfConversationDto } from "@/types/api/schema";

export type ConversationContextType = "Direct" | "Property" | "Stay" | "Service";

export function listConversations(query: { page?: number; results?: number; archived?: boolean; contextType?: string } = {}) {
  return apiRequest<PagedOfConversationDto>("/messages/conversations", { query: query as Record<string, QueryValue> });
}

export function startConversation(input: {
  recipientAccountId: string;
  contextType?: ConversationContextType;
  contextId?: string;
  contextTitle?: string;
  message?: string;
}) {
  return apiRequest<ConversationDto>("/messages/conversations", { method: "POST", body: input });
}

export function getMessages(conversationId: string, afterSeq?: number) {
  return apiRequest<MessageDto[]>(`/messages/conversations/${conversationId}/messages`, { query: { afterSeq } });
}

export function sendMessage(
  conversationId: string,
  input: { body?: string; attachments?: { path: string; contentType: string; name?: string }[]; clientMessageId: string },
) {
  return apiRequest<MessageDto>(`/messages/conversations/${conversationId}/messages`, { method: "POST", body: input });
}

export function markDelivered(conversationId: string, seq: number) {
  return apiRequest(`/messages/conversations/${conversationId}/delivered`, { method: "POST", body: { seq } });
}

export function markRead(conversationId: string, seq: number) {
  return apiRequest(`/messages/conversations/${conversationId}/read`, { method: "POST", body: { seq } });
}

export function archiveConversation(conversationId: string, archived: boolean) {
  return apiRequest(`/messages/conversations/${conversationId}/archive`, { method: "POST", body: { archived } });
}

export function editMessage(messageId: string, body: string) {
  return apiRequest<MessageDto>(`/messages/${messageId}`, { method: "PUT", body: { body } });
}

export function deleteMessage(messageId: string) {
  return apiRequest(`/messages/${messageId}`, { method: "DELETE" });
}

export function reportMessage(messageId: string, category: string, note?: string) {
  return apiRequest(`/messages/${messageId}/report`, { method: "POST", body: { category, note } });
}

export function listBlocks() {
  return apiRequest<BlockDto[]>("/messages/blocks");
}

export function blockAccount(accountId: string) {
  return apiRequest(`/messages/blocks/${accountId}`, { method: "PUT" });
}

export function unblockAccount(accountId: string) {
  return apiRequest(`/messages/blocks/${accountId}`, { method: "DELETE" });
}
