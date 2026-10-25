import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { notifyError } from "@/lib/errors";
import { followAccount, unfollowAccount } from "@/lib/social-api";

export function useFollowAccount(accountId: string | undefined, initiallyFollowing = false) {
  const queryClient = useQueryClient();
  const [following, setFollowing] = useState(initiallyFollowing);

  const mutation = useMutation({
    mutationFn: (next: boolean) => (next ? followAccount(accountId as string) : unfollowAccount(accountId as string)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      void queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  function toggle() {
    if (!accountId) return;
    const next = !following;
    setFollowing(next);
    mutation.mutate(next, {
      onError: (error) => {
        setFollowing(!next);
        notifyError(error);
      },
    });
  }

  return { following, toggle };
}
