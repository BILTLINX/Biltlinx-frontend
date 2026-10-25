import { useSession } from "@/context/SessionContext";

export function useDisplayName() {
  const { user } = useSession();
  return user?.username ?? "";
}

export function useAccountBadge() {
  const { user } = useSession();
  const approved = user?.capabilities.find((item) => item.status === "Approved")?.capability;
  const role = approved ? approved.replace(/[_-]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2") : "Member";
  return { name: user?.username ?? "", role, avatar: user?.profilePicUrl ?? "/icons/avatar-placeholder-user.svg" };
}
