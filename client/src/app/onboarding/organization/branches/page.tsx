"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { BRANCH_TYPES, NEW_ORGANIZATION, ORGANIZATION_STEPS, ORGANIZATION_TYPES } from "@/lib/dummy-onboarding";
import { initialsOf } from "@/lib/initials";
import { loadOrganizationDraft, updateOrganizationDraft, type OrganizationDraft } from "@/lib/onboarding-draft";
import { cn } from "@/lib/utils";

const INPUT = "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900";
/** What step 1 earned when nothing was saved. */
const DEFAULT_STRENGTH = 25;
const MAX_BRANCHES = 20;

interface Branch {
  id: number;
  name: string;
  type: string;
  address: string;
}

/** Project sites get the crane; every other kind of location is a building. */
function branchIcon(type: string) {
  return type === "Project site" ? { icon: "/icons/onboarding-crane.svg", flip: false } : { icon: "/icons/onboarding-building.svg", flip: true };
}

/** Onboarding · Organization · 2 Branches (Figma node 1074:32193): the head office and any other offices or sites. */
export default function OrganizationBranchesPage() {
  const router = useRouter();
  const nameInput = useRef<HTMLInputElement | null>(null);
  const [draft, setDraft] = useState<OrganizationDraft | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState(BRANCH_TYPES[1]);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  // Step 1's choices live in the tab session, so they are read after mount.
  useEffect(() => {
    const saved = loadOrganizationDraft();
    setDraft(saved);
    if (saved?.branches) setBranches(saved.branches.map((branch, index) => ({ ...branch, id: index + 1 })));
  }, []);

  const orgName = draft?.name ?? NEW_ORGANIZATION.name;
  const typeTitle = ORGANIZATION_TYPES.find((option) => option.id === draft?.typeId)?.title ?? ORGANIZATION_TYPES[0].title;
  const headOffice = draft?.headOffice ?? "";
  const locations = 1 + branches.length;
  const strength = (draft?.strength ?? DEFAULT_STRENGTH) + Math.min(20, branches.length * 10);

  function resetForm() {
    setEditingId(null);
    setName("");
    setType(BRANCH_TYPES[1]);
    setAddress("");
    setError("");
  }

  function submitBranch() {
    if (!name.trim() || !address.trim()) {
      setError("Give the branch a name and an address.");
      nameInput.current?.focus();
      return;
    }
    const clean = { name: name.trim(), type, address: address.trim() };
    if (editingId !== null) setBranches((current) => current.map((branch) => (branch.id === editingId ? { ...branch, ...clean } : branch)));
    else setBranches((current) => [...current, { id: Math.max(0, ...current.map((branch) => branch.id)) + 1, ...clean }]);
    resetForm();
  }

  function editBranch(branch: Branch) {
    setEditingId(branch.id);
    setName(branch.name);
    setType(branch.type);
    setAddress(branch.address);
    setError("");
    nameInput.current?.focus();
  }

  function save() {
    updateOrganizationDraft({ branches: branches.map(({ name: branchName, type: branchType, address: branchAddress }) => ({ name: branchName, type: branchType, address: branchAddress })), strength });
  }

  function handleContinue() {
    save();
    router.push("/onboarding/organization/team");
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
              current={1}
              note="You become the first Admin. Your personal account stays separate from the organization."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 2 of 5</p>
              <h1 className="text-[28px] font-bold text-[#0f172a]">Add your branches and sites</h1>
              <p className="text-[15px] text-gray-500">Branches let you split listings, leads and staff by location. Start with your head office and add more anytime.</p>
            </div>

            <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3.5 rounded-xl border border-gray-200 px-4 py-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#eff5ff]">
                  <NavIcon icon="/icons/onboarding-building-01.svg" size={20} className="-scale-y-100 bg-brand-900" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                  <span className="text-sm font-semibold text-[#0f172a]">Head office</span>
                  <span className="truncate text-xs text-gray-500">{headOffice || NEW_ORGANIZATION.headOffice}</span>
                </span>
                <span className="shrink-0 rounded-full bg-[#eff5ff] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-brand-900">Main</span>
                <button type="button" aria-label="Edit head office" onClick={() => router.push("/onboarding/organization")} className="shrink-0 rounded p-1 hover:bg-gray-50">
                  <NavIcon icon="/icons/onboarding-edit.svg" size={18} className="bg-gray-500" />
                </button>
              </div>

              {branches.map((branch) => {
                const { icon, flip } = branchIcon(branch.type);
                return (
                  <div key={branch.id} className={cn("flex items-center gap-3.5 rounded-xl border px-4 py-3.5", editingId === branch.id ? "border-brand-900" : "border-gray-200")}>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#eff5ff]">
                      <NavIcon icon={icon} size={20} className={cn("bg-brand-900", flip && "-scale-y-100")} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                      <span className="truncate text-sm font-semibold text-[#0f172a]">{branch.name}</span>
                      <span className="truncate text-xs text-gray-500">
                        {branch.address} · {branch.type}
                      </span>
                    </span>
                    <button type="button" aria-label={`Edit ${branch.name}`} onClick={() => editBranch(branch)} className="shrink-0 rounded p-1 hover:bg-gray-50">
                      <NavIcon icon="/icons/onboarding-edit.svg" size={18} className="bg-gray-500" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${branch.name}`}
                      onClick={() => {
                        setBranches((current) => current.filter((item) => item.id !== branch.id));
                        if (editingId === branch.id) resetForm();
                      }}
                      className="shrink-0 rounded p-1 hover:bg-gray-50"
                    >
                      <NavIcon icon="/icons/onboarding-cancel.svg" size={12} className="bg-gray-500" />
                    </button>
                  </div>
                );
              })}

              {branches.length < MAX_BRANCHES && (
                <button type="button" onClick={editingId === null ? submitBranch : () => nameInput.current?.focus()} className="flex w-fit items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                  <NavIcon icon="/icons/onboarding-plus.svg" size={16} className="bg-[#0f172a]" />
                  Add a branch or site
                </button>
              )}
            </section>

            <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex flex-col gap-1 leading-[1.45]">
                <h2 className="text-base font-bold text-[#0f172a]">{editingId === null ? "New branch" : "Edit branch"}</h2>
                <p className="text-[13px] text-gray-500">{editingId === null ? "Fill this in to add another location" : "Change the details, then save"}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Branch name</span>
                  <span className={INPUT}>
                    <input ref={nameInput} value={name} maxLength={60} placeholder="Takoradi showroom" onChange={(event) => { setName(event.target.value); setError(""); }} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                  </span>
                </label>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Type</span>
                  <OptionSelectField value={type} options={BRANCH_TYPES} onChange={setType} />
                </div>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Address</span>
                <span className={INPUT}>
                  <NavIcon icon="/icons/location-01.svg" size={18} className="bg-gray-500" />
                  <input value={address} maxLength={100} placeholder="Market Circle, Takoradi" onChange={(event) => { setAddress(event.target.value); setError(""); }} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                </span>
              </label>
              {error && <p className="text-xs text-[#dc2626]">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={submitBranch} className="rounded-[10px] bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
                  {editingId === null ? "Add branch" : "Save changes"}
                </button>
                {editingId !== null && (
                  <button type="button" onClick={resetForm} className="rounded-[10px] px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                    Cancel
                  </button>
                )}
              </div>
            </section>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding/organization")} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <button type="button" onClick={handleContinue} className="whitespace-nowrap rounded-[10px] px-5 py-3 text-sm font-semibold text-brand-900">
                  Only head office for now
                </button>
                <button type="button" onClick={handleContinue} className="flex items-center gap-2 rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                  Continue
                  <NavIcon icon="/icons/onboarding-arrow-right.svg" size={10} className="bg-white" />
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
                    <dd className={cn("font-semibold", branches.length > 0 ? "text-[#0f172a]" : "text-[#94a3b8]")}>{branches.length > 0 ? `${locations} locations` : "Head office only"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Team</dt>
                    <dd className="font-semibold text-[#94a3b8]">Just you</dd>
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
              <NavIcon icon="/icons/onboarding-info-circle.svg" size={20} className="shrink-0 bg-brand-900" />
              <div className="flex min-w-0 flex-col gap-1 text-[13px] leading-[1.45]">
                <p className="font-bold text-[#0f172a]">Included on Business and Enterprise</p>
                <p className="text-[#334155]">Free and Pro organizations have one location. You will pick a plan in the last step.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
