import { formatMoney, formatRelative } from "@/lib/format";
import type { Author, Post } from "@/types/api/social";
import type { PostCardData, PostVariant } from "@/types/post";

const VARIANTS: Record<Post["kind"], PostVariant> = {
  Text: "text",
  Poll: "poll",
  Property: "property",
  Stay: "stay",
  Service: "artisan",
};

export function authorDisplay(author: Author) {
  const name = author.username;
  const role = author.organizationName && author.organizationName !== author.username ? author.organizationName : "";
  return { name, role };
}

function meta<T>(post: Post, key: string): T | undefined {
  return post.metaData ? (post.metaData[key] as T | undefined) : undefined;
}

function pollPercent(votes: number, total: number) {
  return total > 0 ? Math.round((votes / total) * 100) : 0;
}

export function mapPost(post: Post, now: Date = new Date()): PostCardData {
  const { name, role } = authorDisplay(post.author);
  const variant = VARIANTS[post.kind];
  const base: PostCardData = {
    id: post.id,
    variant,
    authorId: post.author.id,
    authorName: name,
    roleLine: role ? `${role} |` : "",
    postedAt: formatRelative(post.createdAt, now),
    avatar: post.author.profilePicUrl ?? "",
    avatarPlaceholder: !post.author.profilePicUrl,
    isOwn: post.isOwn,
    verified: post.author.isVerified ? "individual" : undefined,
    likes: post.likeCount,
    comments: post.commentCount,
    likedByMe: post.likedByMe,
    showComposer: true,
    media: post.media.length > 0 ? post.media.map((m) => ({ url: m.url, isVideo: m.isVideo })) : undefined,
  };

  if (post.kind === "Poll" && post.poll) {
    const poll = post.poll;
    const leading = poll.options.reduce((best, option) => (option.voteCount > best ? option.voteCount : best), 0);
    return {
      ...base,
      question: post.description,
      poll,
      pollOptions: poll.options.map((option) => ({
        label: option.label,
        percent: pollPercent(option.voteCount, poll.totalVotes),
        votes: String(option.voteCount),
        leading: leading > 0 && option.voteCount === leading,
      })),
      pollFooter: `${poll.isClosed ? "Closed" : poll.closesAt ? "Open" : "Poll"} — ${poll.totalVotes} votes total`,
    };
  }

  if (post.kind === "Property") {
    const price = meta<number>(post, "price");
    const currency = meta<string>(post, "currency") ?? "GHS";
    const listingType = meta<string>(post, "listingType");
    return {
      ...base,
      text: post.description || undefined,
      linkId: meta<string>(post, "propertyId") ?? post.id,
      priceLine: price !== undefined ? formatMoney(price, currency) : undefined,
      priceSuffix: listingType === "Rent" ? " / month" : undefined,
      subLine: post.title ?? meta<string>(post, "city"),
      beds: meta<number>(post, "bedrooms") ?? undefined,
      baths: meta<number>(post, "bathrooms") ?? undefined,
      actions: [
        { label: "Request viewing", variant: "primary" },
        { label: "View Property", variant: "outline" },
      ],
      messageHostLabel: "Message Host",
    };
  }

  if (post.kind === "Stay") {
    return {
      ...base,
      text: post.description || undefined,
      subLine: post.title ?? undefined,
      actions: [
        { label: "Book Now", variant: "primary" },
        { label: "Check Availability", variant: "outline" },
      ],
    };
  }

  if (post.kind === "Service") {
    return {
      ...base,
      text: post.description || undefined,
      subLine: post.title ?? undefined,
      actions: [
        { label: "Request Quote", variant: "primary" },
        { label: "View Listing", variant: "outline" },
      ],
      messageHostLabel: "Message Provider",
    };
  }

  return { ...base, text: [post.title, post.description].filter(Boolean).join("\n\n") || undefined };
}
