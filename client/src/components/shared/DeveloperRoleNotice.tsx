"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { showSuccessToast } from "@/components/shared/AppToast";
import { Button } from "@/components/ui/Button";
import { requestCapability } from "@/lib/account-api";
import { errorMessage, notifyError } from "@/lib/errors";
import { cn } from "@/lib/utils";

/** Shown when the server refuses a new project because the account has no approved Developer role: explains it and lets them ask for it. */
export function DeveloperRoleNotice({ className }: { className?: string }) {
  const requestRole = useMutation({
    mutationFn: () => requestCapability("Developer", "I want to list development projects on Biltlinx."),
    onSuccess: () => showSuccessToast("Developer role requested. We will let you know when it is approved."),
    onError: (error) => notifyError(error),
  });

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <h2 className="text-base font-bold text-[#0f172a]">The Developer role is needed</h2>
      <p className="text-sm leading-5 text-gray-500">
        Only approved developers can create projects. Request the role and we will review it, or manage your roles from your account settings.
      </p>
      <div className="flex flex-wrap gap-2.5">
        <Button variant="primary" onClick={() => requestRole.mutate()} disabled={requestRole.isPending || requestRole.isSuccess} className="w-auto px-5">
          {requestRole.isSuccess ? "Role requested" : "Request the Developer role"}
        </Button>
        <Link href="/account-settings?tab=teams" className="flex h-10 items-center rounded-lg border border-gray-200 px-5 text-sm font-medium text-[#0f172a] hover:bg-gray-50">
          Roles and teams
        </Link>
      </div>
      {requestRole.isError && <p className="text-xs text-[#dc2626]">{errorMessage(requestRole.error)}</p>}
    </section>
  );
}
