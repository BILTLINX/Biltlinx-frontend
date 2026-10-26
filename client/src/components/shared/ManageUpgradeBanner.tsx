"use client";

import { useRouter } from "next/navigation";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { CREATE_ORGANISATION_HREF } from "@/lib/organisation-flow";

/** The dark "Business plan" banner at the bottom of an overview page. */
export function ManageUpgradeBanner({ title, text }: { title: string; text: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-[#0f172a] p-5 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <NavIcon icon="/icons/user-group.svg" size={20} className="shrink-0 bg-white" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-[15px] font-bold leading-[22px] text-white">{title}</p>
          <p className="text-[13px] leading-[19px] text-[#cbd5e1]">{text}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-3">
        <button
          type="button"
          onClick={() => router.push(CREATE_ORGANISATION_HREF)}
          className="h-10 whitespace-nowrap rounded-[10px] bg-white px-4 text-sm font-medium text-brand-900 hover:bg-gray-100"
        >
          Set up organisation
        </button>
        <Button variant="outline" onClick={() => router.push("/account-settings/plans")} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
          Compare plans
        </Button>
      </div>
    </div>
  );
}
