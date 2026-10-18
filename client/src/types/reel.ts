export interface DiscoverReel {
  id: string;
  authorId: string;
  isOwn: boolean;
  likedByMe: boolean;
  authorName: string;
  authorAvatar: string;
  verified: boolean;
  following: boolean;
  caption: string;
  /** Looping background clip (CC0 sample footage) — shown instead of a
   * static poster so the reel actually plays like a reel. */
  video: string;
  /** Shown while the video's first frame loads. */
  poster: string;
  likes: number;
  comments: number;
  shares: number;
  reposts: number;
  saves: number;
}

export type ReelFeedback = "interested" | "not-interested";
