import Link from "next/link";
import type { ReactNode } from "react";

interface ProfileLinkProps {
  /** The person's account id; without one there is no profile to open, so the children render as plain text. */
  accountId?: string;
  /** Lets the profile show a provider's professional or artisan details when it is opened from their provider page. */
  providerId?: string;
  className?: string;
  children: ReactNode;
}

/** A person's name or picture that opens their profile page. */
export function ProfileLink({ accountId, providerId, className, children }: ProfileLinkProps) {
  if (!accountId) return <span className={className}>{children}</span>;
  const href = `/profile/${accountId}${providerId ? `?provider=${providerId}` : ""}`;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
