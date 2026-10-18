import { describe, expect, it } from "vitest";
import { mapPost } from "@/lib/post-mapper";
import type { Post } from "@/types/api/social";

const author = {
  id: "a1",
  username: "kofi",
  organizationName: "Kofi Estates",
  organizationId: "o1",
  profilePicUrl: null,
  isVerified: true,
};

function post(overrides: Partial<Post>): Post {
  return {
    id: "p1",
    kind: "Text",
    author,
    title: null,
    description: "Hello #accra",
    hashtags: ["accra"],
    metaData: null,
    media: [],
    poll: null,
    likeCount: 3,
    commentCount: 1,
    likedByMe: true,
    isOwn: false,
    createdAt: "2026-10-18T10:00:00Z",
    ...overrides,
  };
}

const now = new Date("2026-10-18T12:00:00Z");

describe("mapPost", () => {
  it("maps a text post", () => {
    const mapped = mapPost(post({}), now);
    expect(mapped).toMatchObject({
      id: "p1",
      variant: "text",
      authorName: "kofi",
      roleLine: "Kofi Estates |",
      postedAt: "2h",
      avatarPlaceholder: true,
      verified: "individual",
      text: "Hello #accra",
      likes: 3,
      comments: 1,
      likedByMe: true,
    });
  });

  it("maps media with video flags", () => {
    const mapped = mapPost(post({ media: [{ name: "a", contentType: "video/mp4", url: "u", isVideo: true }] }), now);
    expect(mapped.media).toEqual([{ url: "u", isVideo: true }]);
  });

  it("maps a poll with percentages and the leading option", () => {
    const mapped = mapPost(
      post({
        kind: "Poll",
        description: "Best area?",
        poll: {
          options: [
            { id: "o1", label: "East Legon", voteCount: 3 },
            { id: "o2", label: "Osu", voteCount: 1 },
          ],
          totalVotes: 4,
          myVoteOptionId: "o2",
          closesAt: null,
          isClosed: false,
        },
      }),
      now,
    );
    expect(mapped.variant).toBe("poll");
    expect(mapped.pollOptions).toEqual([
      { label: "East Legon", percent: 75, votes: "3", leading: true },
      { label: "Osu", percent: 25, votes: "1", leading: false },
    ]);
    expect(mapped.poll?.myVoteOptionId).toBe("o2");
  });

  it("maps a property post from its metadata", () => {
    const mapped = mapPost(
      post({
        kind: "Property",
        title: "3 bed house",
        metaData: { propertyId: "prop-9", price: 2500, currency: "GHS", listingType: "Rent", bedrooms: 3, bathrooms: 2, city: "Accra" },
      }),
      now,
    );
    expect(mapped).toMatchObject({
      variant: "property",
      linkId: "prop-9",
      priceLine: "GHS 2,500",
      priceSuffix: " / month",
      subLine: "3 bed house",
      beds: 3,
      baths: 2,
    });
  });
});
