import { apiRequest } from "@/lib/api";
import type { Paged } from "@/types/api/common";
import type {
  Author,
  Comment,
  CreatePostInput,
  FeedQuery,
  MediaInput,
  Post,
  StoryGroup,
  SuggestedAccount,
  TrendingHashtag,
  UploadTicket,
} from "@/types/api/social";

export function getFeed(query: FeedQuery, signal?: AbortSignal) {
  return apiRequest<Paged<Post>>("/feed/posts", { query: { ...query }, signal });
}

export function getNewPostCount(since: string, scope?: string) {
  return apiRequest<{ count: number }>("/feed/posts/new-count", { query: { since, scope } });
}

export function getPost(id: string) {
  return apiRequest<Post>(`/feed/posts/${id}`);
}

export function createPost(input: CreatePostInput) {
  return apiRequest<Post>("/feed/posts", { method: "POST", body: input });
}

export function deletePost(id: string) {
  return apiRequest(`/feed/posts/${id}`, { method: "DELETE" });
}

export function likePost(id: string) {
  return apiRequest(`/feed/posts/${id}/like`, { method: "POST" });
}

export function unlikePost(id: string) {
  return apiRequest(`/feed/posts/${id}/like`, { method: "DELETE" });
}

export function getPostLikes(postId: string, query: { page?: number; results?: number }) {
  return apiRequest<Paged<Author>>(`/feed/posts/${postId}/likes`, { query });
}

export function likeComment(id: string) {
  return apiRequest(`/feed/comments/${id}/like`, { method: "POST" });
}

export function unlikeComment(id: string) {
  return apiRequest(`/feed/comments/${id}/like`, { method: "DELETE" });
}

export function getComments(postId: string, query: { parentCommentId?: string; page?: number; results?: number }) {
  return apiRequest<Paged<Comment>>(`/feed/posts/${postId}/comments`, { query });
}

export function addComment(postId: string, input: { body: string; parentCommentId?: string }) {
  return apiRequest<Comment>(`/feed/posts/${postId}/comments`, { method: "POST", body: input });
}

export function deleteComment(id: string) {
  return apiRequest(`/feed/comments/${id}`, { method: "DELETE" });
}

export function votePoll(postId: string, optionId: string) {
  return apiRequest<Post>(`/feed/posts/${postId}/poll/vote`, { method: "POST", body: { optionId } });
}

export function unvotePoll(postId: string) {
  return apiRequest<Post>(`/feed/posts/${postId}/poll/vote`, { method: "DELETE" });
}

export function getTrendingHashtags(limit = 5) {
  return apiRequest<TrendingHashtag[]>("/feed/hashtags/trending", { query: { limit } });
}

export function getStories() {
  return apiRequest<StoryGroup[]>("/feed/stories");
}

export function createStory(input: { media: MediaInput; caption?: string }) {
  return apiRequest<{ id: string }>("/feed/stories", { method: "POST", body: input });
}

export function deleteStory(id: string) {
  return apiRequest(`/feed/stories/${id}`, { method: "DELETE" });
}

export function viewStory(id: string) {
  return apiRequest(`/feed/stories/${id}/view`, { method: "POST" });
}

export function getSuggestions(limit = 5) {
  return apiRequest<SuggestedAccount[]>("/social/suggestions", { query: { limit } });
}

export function searchPeople(q: string, page = 1, results = 10) {
  return apiRequest<Paged<SuggestedAccount>>("/social/people", { query: { q, page, results } });
}

export function followAccount(accountId: string) {
  return apiRequest(`/social/follow/${accountId}`, { method: "POST" });
}

export function unfollowAccount(accountId: string) {
  return apiRequest(`/social/follow/${accountId}`, { method: "DELETE" });
}

export function requestUploadUrl(input: { contentType: string; sizeBytes: number }) {
  return apiRequest<UploadTicket>("/media/upload-url", { method: "POST", body: input });
}
