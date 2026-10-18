"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { VerificationDialog } from "@/components/shared/VerificationDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSession } from "@/context/SessionContext";
import { errorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { listVerifications, VERIFICATION_TYPES, type VerificationType } from "@/lib/verification-api";
import type { VerificationDto } from "@/types/api/schema";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<string, { tile: string; pill: string; icon: string; label: string }> = {
  Verified: { tile: "bg-[#dcfce7]", pill: "bg-[#dcfce7] text-[#16a34a]", icon: "bg-[#16a34a]", label: "Verified" },
  Pending: { tile: "bg-[#fef3c7]", pill: "bg-[#fef3c7] text-[#b45309]", icon: "bg-[#d97706]", label: "In review" },
  MoreInformationRequired: { tile: "bg-[#fef3c7]", pill: "bg-[#fef3c7] text-[#b45309]", icon: "bg-[#d97706]", label: "More information needed" },
  Rejected: { tile: "bg-[#fee2e2]", pill: "bg-[#fee2e2] text-[#dc2626]", icon: "bg-[#dc2626]", label: "Rejected" },
  Expired: { tile: "bg-[#fee2e2]", pill: "bg-[#fee2e2] text-[#dc2626]", icon: "bg-[#dc2626]", label: "Expired" },
  Revoked: { tile: "bg-[#fee2e2]", pill: "bg-[#fee2e2] text-[#dc2626]", icon: "bg-[#dc2626]", label: "Revoked" },
  None: { tile: "bg-[#f1f5f9]", pill: "bg-[#f1f5f9] text-[#334155]", icon: "bg-[#64748a]", label: "Not started" },
};

const STATUS_RANK: Record<string, number> = { Verified: 5, MoreInformationRequired: 4, Pending: 3, Expired: 2, Rejected: 1, Revoked: 0 };

function latestByType(items: VerificationDto[], type: string): VerificationDto | null {
  const matching = items.filter((item) => item.type === type);
  if (matching.length === 0) return null;
  return matching.reduce((best, item) => {
    const rank = STATUS_RANK[item.status ?? ""] ?? 0;
    const bestRank = STATUS_RANK[best.status ?? ""] ?? 0;
    if (rank !== bestRank) return rank > bestRank ? item : best;
    return item.submittedAt > best.submittedAt ? item : best;
  });
}

function actionLabel(verification: VerificationDto | null) {
  if (!verification) return "Start";
  if (verification.status === "MoreInformationRequired") return "Respond";
  if (["Rejected", "Expired", "Revoked"].includes(verification.status ?? "")) return "Submit again";
  return "View";
}

/** You · Verification centre (Figma node 1087:37138): what Biltlinx has checked for the account, and where each check stands. */
export default function VerificationCentrePage() {
  const { user } = useSession();
  const verifications = useQuery({ queryKey: ["verifications"], queryFn: listVerifications });
  const [open, setOpen] = useState<{ type: VerificationType; verification: VerificationDto | null } | null>(null);

  return (
    <AppShell contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "You" }, { label: "Verification centre" }]} />

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Verification centre</h1>
          <p className="text-sm leading-5 text-gray-500">Each badge says exactly what Biltlinx checked. Plans never add badges.</p>
        </div>

        {verifications.isError && <p className="text-sm text-[#dc2626]">{errorMessage(verifications.error)}</p>}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {verifications.isPending &&
            [0, 1, 2].map((n) => <Skeleton key={n} className="h-[150px] rounded-2xl" />)}

          {!verifications.isPending &&
            VERIFICATION_TYPES.map((config) => {
              const verification = latestByType(verifications.data ?? [], config.type);
              const tone = STATUS_TONE[verification?.status ?? "None"] ?? STATUS_TONE.None;
              const action = actionLabel(verification);
              return (
                <div key={config.type} className="flex flex-col items-start gap-2.5 rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone.tile)}>
                      <NavIcon icon={config.icon} size={20} className={tone.icon} />
                    </span>
                    <div className="flex flex-col items-start gap-0.5">
                      <h2 className="text-[15px] font-bold leading-[22px] text-[#0f172a]">{config.title}</h2>
                      <span className={cn("rounded-full px-2.5 py-[3px] text-[11px] font-medium leading-4", tone.pill)}>{tone.label}</span>
                    </div>
                  </div>
                  <p className="text-[13px] leading-[19px] text-gray-500">{config.description}</p>
                  {verification?.status === "Verified" && verification.expiresAt && (
                    <p className="text-xs text-gray-500">Valid until {formatDate(verification.expiresAt)}</p>
                  )}
                  {verification?.reviewNote && verification.status !== "Verified" && <p className="text-xs text-[#b45309]">{verification.reviewNote}</p>}
                  <button
                    type="button"
                    onClick={() => setOpen({ type: config.type, verification })}
                    className={cn(
                      "h-9 whitespace-nowrap rounded-[10px] px-4 text-sm font-medium",
                      action === "View" ? "border border-gray-200 bg-white text-[#0f172a] hover:bg-gray-50" : "bg-brand-900 text-white hover:opacity-90",
                    )}
                  >
                    {action}
                  </button>
                </div>
              );
            })}

          {!verifications.isPending && (
            <div className="flex flex-col items-start gap-2.5 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#dcfce7]">
                  <NavIcon icon="/icons/message-lock-02.svg" size={20} className="bg-[#16a34a]" />
                </span>
                <div className="flex flex-col items-start gap-0.5">
                  <h2 className="text-[15px] font-bold leading-[22px] text-[#0f172a]">Phone &amp; email</h2>
                  <span className="rounded-full bg-[#dcfce7] px-2.5 py-[3px] text-[11px] font-medium leading-4 text-[#16a34a]">Confirmed with one-time codes</span>
                </div>
              </div>
              <p className="text-[13px] leading-[19px] text-gray-500">{user?.primaryContact}</p>
            </div>
          )}
        </div>
      </PageContainer>

      {open && <VerificationDialog key={open.type} type={open.type} verification={open.verification} onClose={() => setOpen(null)} />}
    </AppShell>
  );
}
