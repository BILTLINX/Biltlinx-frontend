import { cn } from "@/lib/utils";

interface BookmarkIconProps {
  saved: boolean;
  size?: number;
  className?: string;
}

/** The save bookmark: outlined when unsaved, filled brand blue when saved. */
export function BookmarkIcon({ saved, size = 23, className }: BookmarkIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn(saved ? "text-brand-600" : "text-night-700", className)}
    >
      <path
        d="M5 4.6C5 3.84575 5 3.46863 5.23431 3.23431C5.46863 3 5.84575 3 6.6 3H17.4C18.1542 3 18.5314 3 18.7657 3.23431C19 3.46863 19 3.84575 19 4.6V19.4454C19 20.1263 19 20.4667 18.783 20.5784C18.5661 20.69 18.289 20.4922 17.735 20.0964L12.93 16.6643C12.4809 16.3435 12.2564 16.1831 12 16.1831C11.7436 16.1831 11.5191 16.3435 11.07 16.6643L6.26499 20.0964C5.71095 20.4922 5.43393 20.69 5.21697 20.5784C5 20.4667 5 20.1263 5 19.4454V4.6Z"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
