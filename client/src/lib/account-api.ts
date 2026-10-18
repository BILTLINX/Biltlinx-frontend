import { apiRequest } from "@/lib/api";
import type { ActionNeededItem } from "@/types/api/common";

export function getActionNeeded() {
  return apiRequest<ActionNeededItem[]>("/account/action-needed");
}
