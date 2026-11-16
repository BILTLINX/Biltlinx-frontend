"use client";

import { useSession } from "@/context/SessionContext";
import { useFeed } from "@/hooks/useFeed";
import { useMyProvider, useProvider } from "@/hooks/useServices";
import type { Capability, CurrentUserOrganization } from "@/types/api/auth";
import type { ProviderDto } from "@/types/api/schema";

/** What the profile page shows about one person. What the API gives for other people is limited to their name, photo, verification and posts, plus their provider details when known. */
export interface Profile {
  id: string;
  name: string;
  /** Their organisation, when it is not just their own name. */
  organizationName: string | null;
  avatar: string | null;
  verified: boolean;
  following: boolean;
  own: boolean;
  bio: string | null;
  location: string | null;
  /** ISO date they joined; known only for your own account. */
  memberSince: string | null;
  /** The roles you asked for on Biltlinx; your own account only. */
  capabilities: Capability[];
  /** Private to you: how you can be reached and the organisation behind the account. */
  contact: { email: string; phone: string | null; other: string | null } | null;
  organisation: CurrentUserOrganization | null;
  provider: ProviderDto | null;
}

function organizationOf(name: string | null | undefined, username: string | null | undefined) {
  return name && name !== username ? name : null;
}

/**
 * The profile of the account `id`. Your own comes from your session and your provider profile. Anyone else's comes from
 * their posts (which carry their name, photo and verification) and, when `providerId` is given, their provider profile.
 */
export function useProfile(id: string, providerId?: string) {
  const { user, status } = useSession();
  const own = user?.id === id;
  const feed = useFeed({ authorId: id }, { pageSize: 10 });
  const mine = useMyProvider(own);
  const theirs = useProvider(own ? undefined : providerId);

  const found = own ? mine.data : theirs.data;
  const provider = found && (own || found.owner.accountId === id) ? found : null;
  const author = feed.data?.pages[0]?.items[0]?.author;

  let profile: Profile | null = null;
  if (own && user) {
    const account = user.accounts[0];
    profile = {
      id,
      name: user.username,
      organizationName: organizationOf(account?.organization.name, user.username),
      avatar: user.profilePicUrl,
      verified: user.isVerified,
      following: false,
      own: true,
      bio: user.bio,
      location: user.location,
      memberSince: user.createdAt,
      capabilities: user.capabilities,
      contact: account ? { email: account.email, phone: user.primaryContact, other: user.otherContact } : null,
      organisation: account?.organization ?? null,
      provider,
    };
  } else if (author || provider) {
    const source = author ?? provider?.owner;
    profile = {
      id,
      name: source?.username ?? provider?.displayName ?? "Member",
      organizationName: author ? organizationOf(author.organizationName, author.username) : null,
      avatar: source?.profilePicUrl ?? null,
      verified: source?.isVerified ?? false,
      following: author?.isFollowedByMe ?? false,
      own: false,
      bio: provider?.bio ?? null,
      location: provider?.city ?? null,
      memberSince: null,
      capabilities: [],
      contact: null,
      organisation: null,
      provider,
    };
  }

  const loading = status === "loading" || (own ? mine.isPending : feed.isPending || (Boolean(providerId) && theirs.isPending));
  return { profile, loading, feed };
}
