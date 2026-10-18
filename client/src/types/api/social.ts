export type PostKind = "Text" | "Poll" | "Property" | "Stay" | "Service";
export type FeedScope = "all" | "following";

export interface Author {
  id: string;
  username: string;
  organizationName: string;
  organizationId: string;
  profilePicUrl: string | null;
  isVerified: boolean;
  isFollowedByMe: boolean;
}

export interface Media {
  name: string;
  contentType: string;
  url: string;
  isVideo: boolean;
}

export interface PollOption {
  id: string;
  label: string;
  voteCount: number;
}

export interface Poll {
  options: PollOption[];
  totalVotes: number;
  myVoteOptionId: string | null;
  closesAt: string | null;
  isClosed: boolean;
}

export interface Post {
  id: string;
  kind: PostKind;
  author: Author;
  title: string | null;
  description: string;
  hashtags: string[];
  metaData: Record<string, unknown> | null;
  media: Media[];
  poll: Poll | null;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  isOwn: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  parentCommentId: string | null;
  author: Author;
  body: string;
  likeCount: number;
  replyCount: number;
  likedByMe: boolean;
  isOwn: boolean;
  createdAt: string;
}

export interface StoryItem {
  id: string;
  media: Media;
  caption: string | null;
  seen: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface StoryGroup {
  author: Author;
  isOwn: boolean;
  hasUnseen: boolean;
  stories: StoryItem[];
}

export interface SuggestedAccount {
  account: Author;
  bio: string | null;
  followerCount: number;
}

export interface TrendingHashtag {
  tag: string;
  postCount: number;
}

export interface UploadTicket {
  path: string;
  token: string;
  uploadUrl: string;
  publicUrl: string;
  bucket: string;
}

export interface MediaInput {
  path: string;
  contentType: string;
  name?: string;
}

export interface CreatePostInput {
  kind: PostKind;
  title?: string;
  description?: string;
  metaData?: Record<string, unknown>;
  media?: MediaInput[];
  pollOptions?: string[];
  pollDurationHours?: number;
}

export interface FeedQuery {
  page?: number;
  results?: number;
  scope?: FeedScope;
  kind?: PostKind;
  authorId?: string;
  hashtag?: string;
  hasVideo?: boolean;
  q?: string;
}
