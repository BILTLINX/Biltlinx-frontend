import { useState } from "react";
import { useSession } from "@/context/SessionContext";

/** What signup already collected, split into the kinds of field onboarding asks for again. */
export function useAccountPrefill() {
  const { user } = useSession();
  const contacts = [user?.primaryContact, user?.otherContact].filter((value): value is string => Boolean(value));
  return {
    email: contacts.find((value) => value.includes("@")) ?? "",
    phone: contacts.find((value) => !value.includes("@")) ?? "",
    location: user?.location ?? "",
  };
}

/** Form state that shows `prefill` until the person types; the account may finish loading after the page mounts. */
export function usePrefilledState(prefill: string) {
  const [edited, setEdited] = useState<string | null>(null);
  return [edited ?? prefill, setEdited] as const;
}
