"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { DeveloperRoleNotice } from "@/components/shared/DeveloperRoleNotice";
import { ListingFormLayout, WizardNav } from "@/components/shared/ListingFormLayout";
import { ChoiceChip, FIELD_BOX, FIELD_INPUT, FormField, ReviewList } from "@/components/shared/ModalFormParts";
import { DatePickerField } from "@/components/shared/ViewingSlotPickers";
import { Button } from "@/components/ui/Button";
import { PROJECTS_KEY } from "@/hooks/useProjects";
import { ApiError } from "@/lib/api";
import { notifyError } from "@/lib/errors";
import { formatDate, formatMoney } from "@/lib/format";
import { PROJECT_STAGES } from "@/lib/project-mapper";
import { addUnitType, createProject } from "@/lib/projects-api";
import { uploadMedia, type UploadedMedia } from "@/lib/upload";
import { cn } from "@/lib/utils";
import type { ProjectInput, ProjectStageKey, UnitTypeInput } from "@/types/api/projects";

const STEPS = ["Basics", "Details", "Units", "Review"];
const MAX_PHOTOS = 12;
const TEXTAREA = "resize-none rounded-[10px] border px-3.5 py-2 text-sm leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none";
const HINT = "text-xs leading-[17px] text-gray-500";
const SECONDARY = "h-9 rounded-[10px] border border-gray-200 bg-white px-4 text-[13px] font-medium text-[#0f172a] hover:bg-gray-50 disabled:opacity-60";

interface UnitDraft {
  name: string;
  price: string;
  totalUnits: string;
  bedrooms: string;
  sizeSqm: string;
  depositPercent: string;
  installments: string;
  handoverPercent: string;
}

const EMPTY_UNIT: UnitDraft = { name: "", price: "", totalUnits: "1", bedrooms: "", sizeSqm: "", depositPercent: "10", installments: "0", handoverPercent: "10" };

function Input({ label, value, onChange, error, placeholder, inputMode, maxLength }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  inputMode?: "numeric" | "decimal";
  maxLength?: number;
}) {
  return (
    <FormField label={label} error={error}>
      <label className={cn(FIELD_BOX, error ? "border-[#dc2626]" : "border-gray-200")}>
        <input value={value} onChange={(event) => onChange(event.target.value)} inputMode={inputMode} maxLength={maxLength} placeholder={placeholder} aria-label={label} className={FIELD_INPUT} />
      </label>
    </FormField>
  );
}

/** The form itself, mounted only while the dialog is open so it starts empty each time. */
function CreateProjectForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [needsRole, setNeedsRole] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [stage, setStage] = useState<ProjectStageKey>("Planning");
  const [progress, setProgress] = useState("0");
  const [address, setAddress] = useState("");
  const [handoverOn, setHandoverOn] = useState("");
  const [tenure, setTenure] = useState("");
  const [floorsNote, setFloorsNote] = useState("");
  const [brochureUrl, setBrochureUrl] = useState("");
  const [photos, setPhotos] = useState<UploadedMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [units, setUnits] = useState<UnitTypeInput[]>([]);
  const [unit, setUnit] = useState<UnitDraft>(EMPTY_UNIT);
  const [unitError, setUnitError] = useState<string | undefined>();

  const create = useMutation({
    mutationFn: async () => {
      const input: ProjectInput = {
        name: name.trim(),
        description: description.trim(),
        city: city.trim(),
        area: area.trim() || undefined,
        address: address.trim() || undefined,
        stage,
        progressPercent: Number(progress),
        handoverOn: handoverOn || undefined,
        tenure: tenure.trim() || undefined,
        floorsNote: floorsNote.trim() || undefined,
        brochureUrl: brochureUrl.trim() || undefined,
        media: photos.length > 0 ? photos.map((photo) => ({ path: photo.path, contentType: photo.contentType, name: photo.name })) : undefined,
      };
      const id = await createProject(input);
      // The draft exists now; a unit type that fails to save can be added again from the project's page.
      const failed: string[] = [];
      for (const item of units) {
        try {
          await addUnitType(id, item);
        } catch {
          failed.push(item.name);
        }
      }
      return { id, failed };
    },
    onSuccess: ({ id, failed }) => {
      void queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      showSuccessToast(failed.length > 0 ? `Draft created, but ${failed.join(", ")} could not be added. Add it from the project page.` : "Draft created. Add milestones and the team, then publish.");
      onClose();
      router.push(`/manage/projects/${id}`);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 403) setNeedsRole(true);
      else notifyError(error, "We could not save the project.");
    },
  });

  async function pickFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const next: UploadedMedia[] = [];
      for (const file of Array.from(files).slice(0, MAX_PHOTOS - photos.length)) next.push(await uploadMedia(file, { allowVideo: false }));
      setPhotos((current) => [...current, ...next]);
    } catch (error) {
      notifyError(error, "That photo could not be uploaded.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function setUnitField<K extends keyof UnitDraft>(key: K, value: string) {
    setUnit((current) => ({ ...current, [key]: value }));
  }

  function addUnit() {
    const price = Number(unit.price);
    const totalUnits = Number(unit.totalUnits);
    const deposit = Number(unit.depositPercent);
    const handover = Number(unit.handoverPercent);
    const installments = Number(unit.installments);
    if (!unit.name.trim() || !(price > 0) || !Number.isInteger(totalUnits) || totalUnits < 1) return setUnitError("Add a name, a price above zero and at least one unit");
    if (!(deposit >= 0) || !(handover >= 0) || deposit + handover > 100) return setUnitError("The deposit and the handover payment together can't be more than 100%");
    if (!Number.isInteger(installments) || installments < 0) return setUnitError("Monthly payments must be a whole number");
    setUnitError(undefined);
    setUnits((current) => [
      ...current,
      {
        name: unit.name.trim(),
        sizeSqm: unit.sizeSqm ? Number(unit.sizeSqm) : undefined,
        bedrooms: unit.bedrooms ? Number(unit.bedrooms) : undefined,
        totalUnits,
        price,
        depositPercent: deposit,
        installments,
        handoverPercent: handover,
      },
    ]);
    setUnit(EMPTY_UNIT);
  }

  /** Checks the step being left; returns whether it can go on. */
  function validate(at: number) {
    const found: Record<string, string> = {};
    if (at === 0) {
      if (!name.trim()) found.name = "Give the project a name";
      if (!description.trim()) found.description = "Describe the project";
      if (!city.trim()) found.city = "Enter the city";
      const percent = Number(progress);
      if (!Number.isInteger(percent) || percent < 0 || percent > 100) found.progress = "Use a whole number from 0 to 100";
    }
    if (at === 1 && brochureUrl.trim() && !/^https:\/\//i.test(brochureUrl.trim())) found.brochure = "The link must start with https://";
    setErrors(found);
    return Object.keys(found).length === 0;
  }

  function next() {
    if (validate(step)) setStep((current) => current + 1);
  }

  const stageLabel = PROJECT_STAGES.find((option) => option.value === stage)?.label ?? stage;

  return (
    <ListingFormLayout
      titleId="create-project-title"
      title="Post a project"
      subtitle="Start a draft of your development. You add milestones and the team next, then publish."
      onClose={onClose}
      steps={STEPS}
      step={step}
      footer={
        needsRole ? undefined : (
          <WizardNav step={step} onBack={() => setStep((current) => current - 1)}>
            {step < STEPS.length - 1 ? (
              <Button variant="primary" onClick={next} className="h-11 flex-1 rounded-[10px] lg:rounded-[10px]">
                Next
              </Button>
            ) : (
              <Button variant="primary" onClick={() => create.mutate()} disabled={create.isPending || uploading} className="h-11 flex-1 rounded-[10px] lg:rounded-[10px]">
                {create.isPending ? "Creating…" : "Create draft"}
              </Button>
            )}
          </WizardNav>
        )
      }
    >
      {needsRole && <DeveloperRoleNotice />}

      {!needsRole && step === 0 && (
        <>
          <Input label="Project name" value={name} onChange={setName} error={errors.name} maxLength={150} placeholder="e.g. Adenta Heights, Phase 2" />
          <FormField label="Description" error={errors.description}>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={3000}
              aria-label="Description"
              placeholder="What is being built, for whom, and what makes it different"
              className={cn(TEXTAREA, errors.description ? "border-[#dc2626]" : "border-gray-200")}
            />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="City" value={city} onChange={setCity} error={errors.city} maxLength={100} placeholder="Accra" />
            <Input label="Area (optional)" value={area} onChange={setArea} maxLength={100} placeholder="Adenta" />
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <FormField label="Stage">
              <div role="radiogroup" aria-label="Stage" className="flex flex-wrap gap-2">
                {PROJECT_STAGES.map((option) => (
                  <ChoiceChip key={option.value} role="radio" label={option.label} selected={stage === option.value} onClick={() => setStage(option.value)} />
                ))}
              </div>
            </FormField>
            <Input label="Construction progress (%)" value={progress} onChange={setProgress} error={errors.progress} inputMode="numeric" />
          </div>
        </>
      )}

      {!needsRole && step === 1 && (
        <>
          <Input label="Address (optional)" value={address} onChange={setAddress} maxLength={250} />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Expected handover (optional)">
              <DatePickerField value={handoverOn} onChange={setHandoverOn} />
            </FormField>
            <Input label="Tenure (optional)" value={tenure} onChange={setTenure} maxLength={60} placeholder="Leasehold, 99 years" />
            <Input label="Floors (optional)" value={floorsNote} onChange={setFloorsNote} maxLength={60} placeholder="6 floors + roof terrace" />
            <Input label="Brochure link (optional)" value={brochureUrl} onChange={setBrochureUrl} error={errors.brochure} placeholder="https://" />
          </div>
          <FormField label="Photos">
            <div className="flex flex-wrap gap-2.5">
              {photos.map((photo, index) => (
                <span key={photo.path} className="relative block size-20 overflow-hidden rounded-lg bg-[#eef2ff]">
                  <Image src={photo.publicUrl} alt="" fill unoptimized className="object-cover" sizes="80px" />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => setPhotos((current) => current.filter((_, position) => position !== index))}
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-[10px] text-white"
                  >
                    ✕
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading || photos.length >= MAX_PHOTOS}
                className="flex size-20 items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs font-medium text-brand-900 hover:bg-gray-50 disabled:opacity-60"
              >
                {uploading ? "Uploading…" : "+ Add"}
              </button>
              <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={(event) => void pickFiles(event.target.files)} />
            </div>
            <p className={HINT}>The first photo is the cover people see on the Projects page.</p>
          </FormField>
        </>
      )}

      {!needsRole && step === 2 && (
        <>
          <p className={HINT}>Add the homes you are selling, such as “2-bedroom apartment”, each with a price and a payment plan. You can also add them later from the project’s page.</p>
          {units.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate text-sm font-semibold text-[#0f172a]">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.totalUnits} {item.totalUnits === 1 ? "unit" : "units"} · {item.depositPercent}% deposit
                  {item.bedrooms !== undefined ? ` · ${item.bedrooms} bed` : ""}
                </p>
              </div>
              <p className="text-sm font-bold text-[#0f172a]">{formatMoney(item.price)}</p>
              <button type="button" aria-label={`Remove ${item.name}`} onClick={() => setUnits((current) => current.filter((_, position) => position !== index))} className="p-1 text-gray-500 hover:text-[#dc2626]">
                ✕
              </button>
            </div>
          ))}
          <div className="flex flex-col gap-3 rounded-xl bg-[#f8fafc] p-3.5">
            <div className="grid gap-3 sm:grid-cols-3">
              <Input label="Name" value={unit.name} onChange={(value) => setUnitField("name", value)} placeholder="2-bedroom apartment" />
              <Input label="Price (GHS)" value={unit.price} onChange={(value) => setUnitField("price", value)} inputMode="decimal" />
              <Input label="Number of units" value={unit.totalUnits} onChange={(value) => setUnitField("totalUnits", value)} inputMode="numeric" />
              <Input label="Bedrooms (optional)" value={unit.bedrooms} onChange={(value) => setUnitField("bedrooms", value)} inputMode="numeric" />
              <Input label="Size, sqm (optional)" value={unit.sizeSqm} onChange={(value) => setUnitField("sizeSqm", value)} inputMode="decimal" />
              <Input label="Deposit to reserve (%)" value={unit.depositPercent} onChange={(value) => setUnitField("depositPercent", value)} inputMode="decimal" />
              <Input label="Monthly payments" value={unit.installments} onChange={(value) => setUnitField("installments", value)} inputMode="numeric" />
              <Input label="On handover (%)" value={unit.handoverPercent} onChange={(value) => setUnitField("handoverPercent", value)} inputMode="decimal" />
              <div className="flex items-end">
                <button type="button" onClick={addUnit} className={cn(SECONDARY, "h-11 w-full")}>
                  Add unit type
                </button>
              </div>
            </div>
            {unitError && <p className="text-xs text-[#dc2626]">{unitError}</p>}
          </div>
        </>
      )}

      {!needsRole && step === 3 && (
        <>
          <ReviewList
            rows={[
              { label: "Project", value: name.trim() },
              { label: "Where", value: [area.trim(), city.trim()].filter(Boolean).join(", ") },
              { label: "Stage", value: `${stageLabel} · ${progress}% built` },
              ...(handoverOn ? [{ label: "Expected handover", value: formatDate(handoverOn) }] : []),
              ...(tenure.trim() ? [{ label: "Tenure", value: tenure.trim() }] : []),
              { label: "Photos", value: photos.length > 0 ? String(photos.length) : "None yet" },
              { label: "Unit types", value: units.length > 0 ? units.map((item) => item.name).join(", ") : "None yet" },
            ]}
          />
          <p className={HINT}>This creates a draft that only you can see. Add milestones and your team on the project’s page, then publish it when it is ready.</p>
        </>
      )}
    </ListingFormLayout>
  );
}

/** Start a project from the same details the Projects page and a project's own page show: where and what stage it is at, handover, photos and the unit types for sale. It is saved as a draft. */
export function CreateProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <CenteredDialog open={open} onClose={onClose} labelledBy="create-project-title" className="max-w-[680px]">
      <CreateProjectForm onClose={onClose} />
    </CenteredDialog>
  );
}
