import { showErrorToast } from "@/components/shared/AppToast";
import { ApiError } from "@/lib/api";

export type ErrorKind = "network" | "invalid" | "unauthenticated" | "forbidden" | "notFound" | "conflict" | "rateLimited" | "server";

export function errorKind(error: unknown): ErrorKind {
  if (!(error instanceof ApiError)) return "server";
  switch (error.status) {
    case 0:
      return "network";
    case 400:
      return "invalid";
    case 401:
      return "unauthenticated";
    case 403:
      return "forbidden";
    case 404:
      return "notFound";
    case 409:
      return "conflict";
    case 429:
      return "rateLimited";
    default:
      return "server";
  }
}

const FALLBACKS: Partial<Record<ErrorKind, string>> = {
  forbidden: "You aren't allowed to do that.",
  notFound: "We couldn't find that. It may have been removed.",
  conflict: "That just changed. Refresh and try again.",
  rateLimited: "You're going a little fast. Wait a moment and try again.",
  network: "Unable to reach the server. Please try again.",
};

export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof ApiError && error.message) return error.message;
  return FALLBACKS[errorKind(error)] ?? fallback;
}

export function notifyError(error: unknown, fallback?: string) {
  showErrorToast(errorMessage(error, fallback));
}
