"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingRadioDot } from "@/components/shared/OnboardingRadioDot";
import { CREATE_ORGANISATION_HREF } from "@/lib/dummy-manage";
import { ACCOUNT_TYPES, NEW_ACCOUNT_NAME, type AccountTypeId } from "@/lib/dummy-onboarding";
import { cn } from "@/lib/utils";

/** The roles that can be added on top of the personal account. */
const ADDABLE_ROLES = ACCOUNT_TYPES.filter((type) => type.id !== "personal");
/** Mock: the signed-in person's full name, as shown in the top bar. */
const CURRENT_ROLE_NAME = "Madeline Price";

interface AddRoleModalProps {
  open: boolean;
  onClose: () => void;
}

/** Add a role (Figma node 1075:33474): pick another account type to set up next to the personal one. */
export function AddRoleModal({ open, onClose }: AddRoleModalProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<AccountTypeId>("business");
  const selected = ADDABLE_ROLES.find((type) => type.id === selectedId) ?? ADDABLE_ROLES[0];

  function handleContinue() {
    onClose();
    if (selected.id === "organization") router.push(CREATE_ORGANISATION_HREF);
    else if (selected.setupHref) router.push(selected.setupHref);
  }

  return (
    <CenteredDialog open={open} onClose={onClose} labelledBy="add-role-title" className="max-w-[580px] gap-5 rounded-[20px] p-5 sm:p-7 [@media(max-height:800px)]:gap-3 [@media(max-height:800px)]:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="add-role-title" className="text-[22px] font-bold leading-[1.45] text-[#0f172a]">
          Add a role
        </h2>
        <button type="button" onClick={onClose} aria-label="Close" className="flex size-[22px] items-center justify-center">
          <NavIcon icon="/icons/onboarding-cancel.svg" size={12} className="bg-gray-500" />
        </button>
      </div>

      <p className="text-sm leading-[1.45] text-gray-500">Your personal account stays the same. Each role gets its own profile and tools, and you switch between them from your name in the top bar.</p>

      <div className="flex items-center gap-3 rounded-xl bg-[#f8fafc] px-3.5 py-3 [@media(max-height:800px)]:py-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#eff5ff]">
          <NavIcon icon="/icons/onboarding-user.svg" size={18} className="bg-brand-900" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-[1.45]">
          <span className="truncate text-sm font-semibold text-[#0f172a]">Personal · {CURRENT_ROLE_NAME}</span>
          <span className="text-xs text-gray-500">Your current role</span>
        </span>
        <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-[#16a34a]">Active</span>
      </div>

      <p className="text-[13px] font-bold leading-[1.45] text-[#334155]">Add another role</p>

      <div role="radiogroup" aria-label="Role to add" className="flex flex-col gap-2.5 [@media(max-height:800px)]:gap-2">
        {ADDABLE_ROLES.map((type) => {
          const isSelected = type.id === selectedId;
          return (
            <button
              key={type.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelectedId(type.id)}
              className={cn("flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-left [@media(max-height:800px)]:py-2.5", isSelected ? "border-[1.5px] border-brand-900 bg-[#eff5ff] px-[15.5px] py-[13.5px] [@media(max-height:800px)]:py-[9.5px]" : "border border-gray-200 bg-white hover:border-gray-300")}
            >
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-[10px]", isSelected ? "bg-white" : "bg-[#f1f5f9]")}>
                <NavIcon icon={type.icon} size={20} className={cn(isSelected ? "bg-brand-900" : "bg-[#334155]", type.iconFlipped && "-scale-y-100")} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                <span className="text-sm font-semibold text-[#0f172a]">{type.title}</span>
                <span className="text-[13px] text-gray-500">{type.tagline ?? type.description}</span>
              </span>
              <span className="shrink-0 rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-gray-500">{type.duration.replace("About ", "")}</span>
              <OnboardingRadioDot selected={isSelected} />
            </button>
          );
        })}
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
          Cancel
        </button>
        <button type="button" onClick={handleContinue} className="flex items-center gap-2 whitespace-nowrap rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
          Set up {selected.title}
          <NavIcon icon="/icons/onboarding-arrow-right.svg" size={10} className="bg-white" />
        </button>
      </div>
    </CenteredDialog>
  );
}
