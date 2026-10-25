"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { CreateOrganisationStepper } from "@/components/shared/CreateOrganisationStepper";
import { FIELD_BOX, FIELD_INPUT } from "@/components/shared/ModalFormParts";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingRadioDot } from "@/components/shared/OnboardingRadioDot";
import { PageContainer } from "@/components/shared/PageContainer";
import { loadOrganisationDraft, updateOrganisationDraft } from "@/lib/organisation-draft";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-[18px] rounded-2xl border border-gray-200 bg-white p-5 sm:p-6";
const MAX_BRANCHES = 20;

type Layout = "single" | "branches";

const LAYOUTS: { id: Layout; title: string; note: string }[] = [
  { id: "single", title: "Just one location", note: "Everything sits under the head office" },
  { id: "branches", title: "Several branches", note: "Each branch has its own listings, staff and reports" },
];

/** Create organisation · step 3 (Figma node 1084:35103): branches and locations, all optional. */
export default function CreateOrganisationStructurePage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("Your organisation");
  const [layout, setLayout] = useState<Layout>("branches");
  const [branches, setBranches] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [draftBranch, setDraftBranch] = useState("");

  // Step 1's name lives in the tab session, so it is read after mount.
  useEffect(() => {
    const draft = loadOrganisationDraft();
    if (draft?.name) setOrgName(draft.name);
  }, []);

  function addBranch() {
    const name = draftBranch.trim();
    if (!name) return;
    setBranches((current) => [...current, name]);
    setDraftBranch("");
    setAdding(false);
  }

  function handleContinue() {
    updateOrganisationDraft({ branches: layout === "branches" ? branches : [] });
    router.push("/manage/organisation/new/plan");
  }

  function removeBranch(index: number) {
    setBranches((current) => current.filter((_, position) => position !== index));
  }

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Create organisation" }]} />

        <div className="flex w-full flex-col items-start gap-6 lg:flex-row lg:gap-8">
          <CreateOrganisationStepper current={2} />

          <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold leading-[17px] text-brand-900">Step 3 of 4</p>
              <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Structure</h1>
            </div>

            <section className={CARD}>
              <p className="text-sm leading-5 text-[#334155]">Add branches if you work from more than one office. Staff can then be limited to their branch. Small teams can skip this.</p>

              <div role="radiogroup" aria-label="Locations" className="flex flex-col gap-[18px]">
                {LAYOUTS.map((option) => {
                  const selected = option.id === layout;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setLayout(option.id)}
                      className={cn("flex items-center gap-3 rounded-xl p-3.5 text-left", selected ? "border border-brand-900 bg-[#eff5ff]" : "border border-gray-200 bg-white hover:border-gray-300")}
                    >
                      <OnboardingRadioDot selected={selected} />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-sm font-semibold leading-5 text-[#0f172a]">{option.title}</span>
                        <span className="text-xs leading-[17px] text-gray-500">{option.note}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {layout === "branches" && (
                <div className="flex flex-col gap-2 rounded-xl bg-[#f8fafc] p-4">
                  <div className="flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3 py-2.5">
                    <NavIcon icon="/icons/onboarding-building.svg" size={18} className="shrink-0 -scale-y-100 bg-brand-900" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-semibold leading-5 text-[#0f172a]">{orgName}</span>
                      <span className="text-xs leading-[17px] text-gray-500">Organisation</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-[#eff5ff] px-2.5 py-[3px] text-[11px] font-medium leading-4 text-brand-900">Head office</span>
                  </div>

                  {branches.map((branch, index) => (
                    <div key={`${branch}-${index}`} className="flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white py-2.5 pl-10 pr-3">
                      <NavIcon icon="/icons/location-01.svg" size={18} className="shrink-0 bg-brand-900" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-semibold leading-5 text-[#0f172a]">{branch}</span>
                        <span className="text-xs leading-[17px] text-gray-500">Branch · new</span>
                      </span>
                      <button type="button" onClick={() => removeBranch(index)} className="shrink-0 text-xs font-medium leading-5 text-[#94a3b8] hover:text-[#dc2626]">
                        Remove
                      </button>
                    </div>
                  ))}

                  {adding ? (
                    <div className="flex items-center gap-2 pl-10">
                      <label className={cn(FIELD_BOX, "flex-1 border-gray-200")}>
                        <input
                          autoFocus
                          value={draftBranch}
                          maxLength={60}
                          placeholder="e.g. Kumasi · Ahodwo"
                          onChange={(event) => setDraftBranch(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") addBranch();
                            if (event.key === "Escape") setAdding(false);
                          }}
                          className={FIELD_INPUT}
                        />
                      </label>
                      <button type="button" onClick={addBranch} disabled={!draftBranch.trim()} className="h-10 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
                        Add
                      </button>
                      <button type="button" onClick={() => { setAdding(false); setDraftBranch(""); }} className="h-10 rounded-[10px] px-2 text-sm font-medium text-gray-500 hover:text-[#0f172a]">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    branches.length < MAX_BRANCHES && (
                      <button type="button" onClick={() => setAdding(true)} className="h-[38px] rounded-[10px] bg-[#eff5ff] px-4 text-sm font-medium text-brand-900 hover:bg-[#e2edff]">
                        + Add branch
                      </button>
                    )
                  )}
                </div>
              )}
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2.5">
              <p className="flex-1 text-xs leading-[17px] text-gray-500">You can add brands, regions and buildings later.</p>
              <div className="flex gap-2.5">
                <button type="button" onClick={() => router.push("/manage/organisation/new/verification")} className="h-11 rounded-[10px] border border-gray-200 bg-white px-4 text-sm font-medium text-[#0f172a] hover:bg-gray-50">
                  Back
                </button>
                <button type="button" onClick={handleContinue} className="h-11 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white hover:opacity-90">
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
