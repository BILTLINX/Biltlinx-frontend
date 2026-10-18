import type { JobRequest } from "@/lib/dummy-requests";

// Requests the visitor posts from the "Post a request" page. There is no backend yet, so they are kept in this
// browser's local storage and merged into the Request Board.

const STORAGE_KEY = "biltlinx.posted-requests";

export function loadPostedRequests(): JobRequest[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as JobRequest[]) : [];
  } catch {
    return [];
  }
}

/** Saves a new request at the front of the list; returns false when storage is unavailable. */
export function savePostedRequest(request: JobRequest): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([request, ...loadPostedRequests()]));
    return true;
  } catch {
    return false;
  }
}
