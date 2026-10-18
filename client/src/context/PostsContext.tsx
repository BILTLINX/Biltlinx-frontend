"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { PropertyListing, ServiceListing, StayListing } from "@/lib/dummy-listings";
import type { PostCardData } from "@/types/post";

export type NewPostInput =
  | { kind: "media"; text: string; files: File[] }
  | { kind: "poll"; question: string; options: string[] }
  | { kind: "article"; headline: string; body: string; files?: File[] }
  | { kind: "property"; note: string; listing: PropertyListing }
  | { kind: "stay"; note: string; listing: StayListing }
  | { kind: "service"; note: string; files: File[]; listing?: ServiceListing };

const CURRENT_USER = {
  authorName: "Madeline Price",
  roleLine: "Researcher |",
  avatar: "/icons/avatar-sample.jpg",
} as const;

const TODAY = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function buildPost(input: NewPostInput): PostCardData {
  const base = {
    id: `local-${Date.now()}`,
    authorName: CURRENT_USER.authorName,
    roleLine: CURRENT_USER.roleLine,
    postedAt: "Just now",
    avatar: CURRENT_USER.avatar,
    verified: "individual" as const,
    isOwn: true,
    likes: 0,
    comments: 0,
    showComposer: true,
  };

  if (input.kind === "poll") {
    return {
      ...base,
      variant: "poll",
      question: input.question.trim(),
      pollOptions: input.options
        .map((option) => option.trim())
        .filter(Boolean)
        .map((label) => ({ label, percent: 0, votes: "0" })),
      pollFooter: `${TODAY} — 0 votes total`,
    };
  }

  if (input.kind === "property") {
    const { listing } = input;
    return {
      ...base,
      variant: "property",
      text: input.note.trim() || undefined,
      images: listing.images,
      priceLine: listing.priceLine,
      priceSuffix: listing.priceSuffix,
      subLine: listing.subLine,
      beds: listing.beds,
      baths: listing.baths,
      actions: [
        { label: "Request viewing", variant: "primary" },
        { label: "View Property", variant: "outline" },
      ],
      messageHostLabel: "Message Host",
    };
  }

  if (input.kind === "stay") {
    const { listing } = input;
    return {
      ...base,
      variant: "stay",
      text: input.note.trim() || undefined,
      image: listing.image,
      priceLine: listing.priceLine,
      priceSuffix: listing.priceSuffix,
      subLine: listing.subLine,
      rating: listing.rating,
      actions: [
        { label: "Book Now", variant: "primary" },
        { label: "Check Availability", variant: "outline" },
      ],
    };
  }

  if (input.kind === "service") {
    const { listing } = input;
    if (listing) {
      return {
        ...base,
        variant: "artisan",
        text: input.note.trim() || undefined,
        media: buildMedia(input.files),
        priceLine: listing.rate,
        subLine: listing.title,
        actions: [
          { label: "Request Quote", variant: "primary" },
          { label: "View Listing", variant: "outline" },
        ],
        messageHostLabel: "Message Provider",
      };
    }
    return {
      ...base,
      variant: "text",
      text: input.note.trim() || undefined,
      media: buildMedia(input.files),
    };
  }

  if (input.kind === "article") {
    const articleFiles = input.files ?? [];
    return {
      ...base,
      variant: "text",
      text: [input.headline.trim(), input.body.trim()].filter(Boolean).join("\n\n"),
      truncated: true,
      media: buildMedia(articleFiles),
    };
  }

  return {
    ...base,
    variant: "text",
    text: input.text.trim() || undefined,
    media: buildMedia(input.files),
  };
}

function buildMedia(files: File[]) {
  if (files.length === 0) return undefined;
  return files.map((file) => ({
    url: URL.createObjectURL(file),
    isVideo: file.type.startsWith("video/"),
  }));
}

/** Other people's posts arriving in the background — not yet merged into the visible feed. */
function buildIncomingPosts(): PostCardData[] {
  const stamp = Date.now();
  return [
    {
      id: `incoming-${stamp}-1`,
      variant: "text",
      authorName: "Nana Kwabena",
      roleLine: "Property Investor |",
      postedAt: "Just now",
      avatar: "/images/avatar-generic.png",
      verified: "individual",
      text: "Cap rates on serviced apartments in Airport Residential are finally starting to look attractive again.",
      likes: 0,
      comments: 0,
      showComposer: true,
    },
    {
      id: `incoming-${stamp}-2`,
      variant: "property",
      authorName: "Villagio Estates",
      roleLine: "Listed by agent |",
      postedAt: "Just now",
      avatar: "/images/avatar-kasapa.png",
      verified: "organization",
      text: "New release: 3-bedroom townhomes in East Airport, ready for viewing this weekend.",
      images: ["/images/post-property-exterior.jpg"],
      priceLine: "GHS 2,200,000.00",
      subLine: "3 bedroom Townhouse",
      beds: 3,
      baths: 3,
      actions: [
        { label: "Request viewing", variant: "primary" },
        { label: "View Property", variant: "outline" },
      ],
      messageHostLabel: "Message Host",
      likes: 0,
      comments: 0,
    },
  ];
}

interface PostsContextValue {
  posts: PostCardData[];
  addPost: (input: NewPostInput) => void;
  removePost: (id: string) => void;
  /** Posts that have arrived but are held back until the user asks to see them. */
  newPostsCount: number;
  showNewPosts: () => void;
}

const PostsContext = createContext<PostsContextValue | null>(null);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [incoming, setIncoming] = useState<PostCardData[]>([]);

  const addPost = useCallback((input: NewPostInput) => {
    setPosts((current) => [buildPost(input), ...current]);
  }, []);

  const removePost = useCallback((id: string) => {
    setPosts((current) => current.filter((post) => post.id !== id));
  }, []);

  // Demo stand-in for a real-time feed push (websocket/poll) until the backend feed API lands.
  useEffect(() => {
    const timer = setTimeout(() => setIncoming(buildIncomingPosts()), 6000);
    return () => clearTimeout(timer);
  }, []);

  const showNewPosts = useCallback(() => {
    if (incoming.length === 0) return;
    setPosts((current) => [...incoming, ...current]);
    setIncoming([]);
  }, [incoming]);

  return (
    <PostsContext.Provider value={{ posts, addPost, removePost, newPostsCount: incoming.length, showNewPosts }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePostsFeed() {
  const context = useContext(PostsContext);
  if (!context) throw new Error("usePostsFeed must be used within a PostsProvider");
  return context;
}
