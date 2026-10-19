import { useSession } from "@/context/SessionContext";

export function useDisplayName() {
  const { user } = useSession();
  return user?.username ?? "";
}
