"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/components/shared/AppToast";
import { useSession } from "@/context/SessionContext";
import { ApiError, safeNextPath } from "@/lib/api";
import { googleLogin } from "@/lib/auth-api";
import { saveMfaChallenge } from "@/lib/mfa-challenge";

export function useGoogleSignIn() {
  const router = useRouter();
  const { refresh } = useSession();
  const [pending, setPending] = useState(false);

  const signIn = useCallback(
    async (idToken: string) => {
      const nextPath = safeNextPath(new URLSearchParams(window.location.search).get("next")) ?? "/home";
      setPending(true);
      try {
        const result = await googleLogin({ idToken, rememberMe: true });
        if (result.mfaRequired) {
          saveMfaChallenge(result);
          const params = new URLSearchParams({ method: "email", mfa: "1", next: nextPath });
          router.replace(`/auth/sign-in?${params.toString()}`);
          return;
        }
        await refresh();
        showSuccessToast("Signed in! Welcome to Biltlinx");
        router.replace(nextPath);
      } catch (error) {
        showErrorToast(error instanceof ApiError ? error.message : "Unable to sign in with Google");
        setPending(false);
      }
    },
    [refresh, router],
  );

  return { pending, signIn };
}
