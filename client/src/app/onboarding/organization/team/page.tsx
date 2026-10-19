"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { NEW_ORGANIZATION, ORGANIZATION_STEPS, ORGANIZATION_TYPES, TEAM_ROLES } from "@/lib/dummy-onboarding";
import { initialsOf } from "@/lib/initials";
import { loadOrganizationDraft, updateOrganizationDraft, type OrganizationDraft } from "@/lib/onboarding-draft";
import { cn } from "@/lib/utils";

const INPUT = "flex items-center gap-2.5 rounded-[10px] border bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900";
/** What steps 1 and 2 earned when nothing was saved. */
const DEFAULT_STRENGTH = 25;
const MAX_INVITES = 20;
const ALL_BRANCHES = "All branches";
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const ROLE_NAMES = TEAM_ROLES.map((role) => role.id);

interface Invite {
  id: number;
  email: string;
  role: string;
  branch: string;
}

/** Onboarding · Organization · 3 Team (Figma node 1074:32399): who to invite, with what role and for which branch. */
export default function OrganizationTeamPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<OrganizationDraft | null>(null);
  const [invites, setInvites] = useState<Invite[]>([{ id: 1, email: "", role: "Manager", branch: ALL_BRANCHES }]);
  const [showErrors, setShowErrors] = useState(false);

  // Earlier steps' choices live in the tab session, so they are read after mount.
  useEffect(() => setDraft(loadOrganizationDraft()), []);

  const orgName = draft?.name ?? NEW_ORGANIZATION.name;
  const typeTitle = ORGANIZATION_TYPES.find((option) => option.id === draft?.typeId)?.title ?? ORGANIZATION_TYPES[0].title;
  const headOffice = draft?.headOffice ?? "";
  const extraBranches = draft?.branches ?? [];
  const branchOptions = [ALL_BRANCHES, "Head office", ...extraBranches.map((branch) => branch.name)];
  const filled = invites.filter((invite) => invite.email.trim());
  const valid = filled.filter((invite) => EMAIL_PATTERN.test(invite.email.trim()));
  const strength = (draft?.strength ?? DEFAULT_STRENGTH) + Math.min(20, valid.length * 10);
  const tip =
    extraBranches.length >= 2
      ? `A Manager in ${extraBranches[0].name.split(" ")[0]} cannot see ${extraBranches[1].name.split(" ")[0]} leads unless you give them both branches.`
      : "Pick the branch each person works in. Admins see every branch.";

  function update(id: number, changes: Partial<Invite>) {
    setInvites((current) => current.map((invite) => (invite.id === id ? { ...invite, ...changes } : invite)));
  }

  function send() {
    setShowErrors(true);
    if (valid.length === 0 || valid.length !== filled.length) return;
    updateOrganizationDraft({ invited: valid.length, strength });
    router.push("/onboarding/organization/verification");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar title="Setting up your organization" actionLabel="Save and finish later" onAction={() => router.push("/home")} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pb-12 pt-8 sm:px-12 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:gap-8">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <OnboardingStepper
              title="Organization setup"
              duration="About 6 minutes"
              icon="/icons/onboarding-city.svg"
              iconClass="-scale-y-100"
              steps={ORGANIZATION_STEPS}
              current={2}
              note="You become the first Admin. Your personal account stays separate from the organization."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 3 of 5</p>
              <h1 className="text-[28px] font-bold text-[#0f172a]">Invite your team</h1>
              <p className="text-[15px] text-gray-500">Each person joins with their own Biltlinx account. You decide what they can see and do.</p>
            </div>

            <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6">
              {invites.map((invite, index) => {
                const bad = showErrors && invite.email.trim() !== "" && !EMAIL_PATTERN.test(invite.email.trim());
                return (
                  <div key={invite.id} className={cn("grid grid-cols-1 gap-3 sm:items-end", invites.length > 1 ? "sm:grid-cols-[minmax(0,1fr)_150px_220px_auto]" : "sm:grid-cols-[minmax(0,1fr)_150px_220px]")}>
                    <label className="flex min-w-0 flex-col gap-1.5">
                      <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Email</span>
                      <span className={cn(INPUT, bad ? "border-[#dc2626]" : "border-gray-200")}>
                        <NavIcon icon="/icons/onboarding-mail.svg" size={18} className="bg-gray-500" />
                        <input
                          type="email"
                          value={invite.email}
                          maxLength={80}
                          placeholder={index === 0 ? "esi@kharisdev.com" : "name@yourorganization.com"}
                          onChange={(event) => update(invite.id, { email: event.target.value })}
                          className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none"
                        />
                      </span>
                      {bad && <span className="text-xs text-[#dc2626]">That email address does not look right.</span>}
                    </label>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Role</span>
                      <OptionSelectField value={invite.role} options={ROLE_NAMES} onChange={(role) => update(invite.id, { role })} />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Branch</span>
                      <OptionSelectField value={invite.branch} options={branchOptions} onChange={(branch) => update(invite.id, { branch })} />
                    </div>
                    {invites.length > 1 && (
                      <button type="button" aria-label="Remove this person" onClick={() => setInvites((current) => current.filter((item) => item.id !== invite.id))} className="flex size-11 items-center justify-center self-end rounded-lg hover:bg-gray-50">
                        <NavIcon icon="/icons/onboarding-cancel.svg" size={12} className="bg-gray-500" />
                      </button>
                    )}
                  </div>
                );
              })}
              {invites.length < MAX_INVITES && (
                <button type="button" onClick={() => setInvites((current) => [...current, { id: Math.max(0, ...current.map((invite) => invite.id)) + 1, email: "", role: "Staff", branch: ALL_BRANCHES }])} className="w-fit text-[13px] font-semibold leading-[1.45] text-brand-900">
                  + Add another person
                </button>
              )}
            </section>

            <section className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="pb-3 text-base font-bold leading-[1.45] text-[#0f172a]">What each role can do</h2>
              {TEAM_ROLES.map((role) => (
                <div key={role.id} className="flex flex-col gap-1 border-t border-gray-200 py-3 leading-[1.45] sm:flex-row sm:gap-4">
                  <span className="text-sm font-semibold text-[#0f172a] sm:w-[100px] sm:shrink-0">{role.id}</span>
                  <span className="text-[13px] text-[#334155]">{role.can}</span>
                </div>
              ))}
            </section>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding/organization/branches")} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => router.push("/onboarding/organization/verification")} className="whitespace-nowrap rounded-[10px] px-5 py-3 text-sm font-semibold text-brand-900">
                  Invite later
                </button>
                <button type="button" onClick={send} className="whitespace-nowrap rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                  {valid.length > 0 ? `Send ${valid.length} ${valid.length === 1 ? "invite" : "invites"}` : "Send invites"}
                </button>
              </div>
            </div>
          </main>

          <aside className="flex flex-col gap-4 lg:col-start-2 xl:sticky xl:top-8 xl:col-start-3 xl:self-start">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs font-semibold leading-[1.45] text-gray-500">Preview · how others see you</p>
                <NavIcon icon="/icons/onboarding-preview-eye.svg" size={16} className="bg-gray-500" />
              </div>
              <div className="h-16 bg-gradient-to-r from-[#0a1f44] to-brand-900" />
              <div className="flex flex-col gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-xl border-[3px] border-white bg-[#eff5ff] text-lg font-bold text-brand-900">{initialsOf(orgName)}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                    <p className="truncate text-base font-bold text-[#0f172a]">{orgName}</p>
                    <p className="text-[13px] text-gray-500">{[typeTitle, headOffice].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-gray-500">Not verified yet</span>
                </div>
                <dl className="flex flex-col gap-2 text-[13px] leading-[1.45]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Branches</dt>
                    <dd className={cn("font-semibold", extraBranches.length > 0 ? "text-[#0f172a]" : "text-[#94a3b8]")}>{extraBranches.length > 0 ? `${extraBranches.length + 1} locations` : "Head office only"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Team</dt>
                    <dd className={cn("font-semibold", valid.length > 0 ? "text-[#0f172a]" : "text-[#94a3b8]")}>{valid.length > 0 ? `You + ${valid.length} invited` : "Just you"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Plan</dt>
                    <dd className="font-semibold text-[#0f172a]">Free</dd>
                  </div>
                </dl>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs leading-[1.45]">
                    <span className="font-medium text-gray-500">Profile strength</span>
                    <span className="font-bold text-[#16a34a]">{strength}%</span>
                  </div>
                  <div role="progressbar" aria-label="Profile strength" aria-valuemin={0} aria-valuemax={100} aria-valuenow={strength} className="h-1.5 overflow-hidden rounded-[3px] bg-[#e2e8f0]">
                    <div className="h-full rounded-[3px] bg-[#16a34a] transition-all" style={{ width: `${strength}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-[14px] bg-[#eff5ff] p-4">
              <NavIcon icon="/icons/onboarding-lock.svg" size={20} className="shrink-0 bg-brand-900" />
              <div className="flex min-w-0 flex-col gap-1 text-[13px] leading-[1.45]">
                <p className="font-bold text-[#0f172a]">Access is per branch</p>
                <p className="text-[#334155]">{tip}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

