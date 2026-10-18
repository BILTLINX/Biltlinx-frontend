export interface CommentItem {
  id: string;
  authorName: string;
  avatar?: string;
  postedAt: string;
  text: string;
  likes?: number;
  /** Object URL of an attached photo. */
  image?: string;
  /** Object URL of an attached voice note. */
  audio?: string;
}

export interface CommentAttachments {
  /** Object URL of an attached photo. */
  image?: string;
  /** Object URL of a recorded voice note. */
  audio?: string;
}

/** A comment on the post detail page, which threads replies under their parent. */
export interface DetailComment extends CommentItem {
  /** e.g. "Author · Agent" shown beside the commenter's name. */
  badge?: string;
  replies?: DetailComment[];
}
