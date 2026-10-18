import type { CommentItem } from "@/types/comment";

export type PostActionVariant = "primary" | "outline" | "outline-brand";

export interface PostAction {
  label: string;
  variant: PostActionVariant;
}

export interface PollOption {
  label: string;
  percent: number;
  votes: string;
  leading?: boolean;
}

export interface MediaItem {
  url: string;
  isVideo?: boolean;
}

export interface PollState {
  options: { id: string; label: string; voteCount: number }[];
  totalVotes: number;
  myVoteOptionId: string | null;
  closesAt: string | null;
  isClosed: boolean;
}

export type PostVariant = "text" | "poll" | "property" | "stay" | "project" | "professional" | "artisan";

export interface PostCardData {
  id: string;
  variant?: PostVariant;
  authorName: string;
  roleLine: string;
  postedAt: string;
  avatar: string;
  avatarPlaceholder?: boolean;
  authorId?: string;
  likedByMe?: boolean;
  poll?: PollState;
  /** Id of the listing, property or service this post advertises, when the route differs from the post id. */
  linkId?: string;
  /** Published by the signed-in user, so the options menu offers owner actions. */
  isOwn?: boolean;
  verified?: "individual" | "organization";
  text?: string;
  truncated?: boolean;
  image?: string;
  images?: string[];
  video?: string;
  media?: MediaItem[];
  likes: number;
  comments: number;
  shares?: number;
  shareLabel?: string;
  showComposer?: boolean;
  // poll
  participantAvatars?: string[];
  question?: string;
  hashtags?: string;
  pollOptions?: PollOption[];
  pollFooter?: string;
  // property / stay
  priceLine?: string;
  priceSuffix?: string;
  subLine?: string;
  beds?: number;
  baths?: number;
  rating?: string;
  actions?: PostAction[];
  messageHostLabel?: string;
  commentsList?: CommentItem[];
}
