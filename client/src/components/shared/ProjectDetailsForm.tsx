"use client";

import Image from "next/image";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { Button } from "@/components/ui/Button";
import { PROJECTS_KEY } from "@/hooks/useProjects";
import { requestCapability } from "@/lib/account-api";
import { ApiError } from "@/lib/api";
import { errorMessage, notifyError } from "@/lib/errors";
import { PROJECT_STAGES } from "@/lib/project-mapper";
import { createProject, updateProject } from "@/lib/projects-api";
import { uploadMedia, type UploadedMedia } from "@/lib/upload";
import { cn } from "@/lib/utils";
import type { ProjectDetailDto, ProjectInput, ProjectStageKey } from "@/types/api/projects";

const MAX_PHOTOS = 12;

interface ProjectDetailsFormProps {
  initial?: ProjectDetailDto;
}

function text(value: string | null | undefined) {
  return value ?? "";
}

export function ProjectDetailsForm({ initial }: ProjectDetailsFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(initial?.card.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [city, setCity] = useState(initial?.card.city ?? "");
  const [area, setArea] = useState(text(initial?.card.area));
  const [address, setAddress] = useState(text(initial?.address));
  const [stage, setStage] = useState<ProjectStageKey>(initial?.card.stage ?? "Planning");
  const [progress, setProgress] = useState(String(initial?.card.progressPercent ?? 0));
  const [handoverOn, setHandoverOn] = useState(text(initial?.handoverOn));
  const [tenure, setTenure] = useState(text(initial?.tenure));
  const [floorsNote, setFloorsNote] = useState(text(initial?.floorsNote));
  const [brochureUrl, setBrochureUrl] = useState(text(initial?.brochureUrl));
  const [photos, setPhotos] = useState<UploadedMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [needsRole, setNeedsRole] = useState(false);

  const save = useMutation({
    mutationFn: async (input: ProjectInput) => {
      if (initial) {
        await updateProject(initial.card.id, input);
        return initial.card.id;
      }
      return createProject(input);
    },
    onSuccess: (id) => {
      void queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      showSuccessToast(initial ? "Project saved" : "Draft created. Add unit types and photos, then publish.");
      if (!initial) router.push(`/manage/projects/${id}`);
      else setPhotos([]);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 403) setNeedsRole(true);
      else notifyError(error, "We could not save the project.");
    },
  });

  const requestRole = useMutation({
    mutationFn: () => requestCapability("Developer", "I want to list development projects on Biltlinx."),
    onSuccess: () => showSuccessToast("Developer role requested. We will let you know when it is approved."),
    onError: (error) => notifyError(error),
  });

  async function pickFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const next: UploadedMedia[] = [];
      for (const file of Array.from(files).slice(0, MAX_PHOTOS - photos.length)) {
        next.push(await uploadMedia(file, { allowVideo: false }));
      }
      setPhotos((current) => [...current, ...next]);
    } catch (error) {
      notifyError(error, "That photo could not be uploaded.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function submit() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Give the project a name";
    if (!description.trim()) next.description = "Describe the project";
    if (!city.trim()) next.city = "Enter the city";
    const percent = Number(progress);
    if (!Number.isInteger(percent) || percent < 0 || percent > 100) next.progress = "Use a whole number from 0 to 100";
    if (brochureUrl.trim() && !/^https:\/\//i.test(brochureUrl.trim())) next.brochure = "The link must start with https://";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    save.mutate({
      name: name.trim(),
      description: description.trim(),
      city: city.trim(),
      area: area.trim() || undefined,
      address: address.trim() || undefined,
      stage,
      progressPercent: percent,
      handoverOn: handoverOn || undefined,
      tenure: tenure.trim() || undefined,
      floorsNote: floorsNote.trim() || undefined,
      brochureUrl: brochureUrl.trim() || undefined,
      media: photos.length > 0 ? photos.map((photo) => ({ path: photo.path, contentType: photo.contentType, name: photo.name })) : undefined,
    });
  }

  const box = (key?: string) => cn(FIELD_BOX, key && errors[key] ? "border-[#dc2626]" : "border-gray-200");

  if (needsRole) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5">
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

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5">
      <FormField label="Project name" error={errors.name}>
        <div className={box("name")}>
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={150} className={FIELD_INPUT} placeholder="e.g. Adenta Heights, Phase 2" />
        </div>
      </FormField>

      <FormField label="Description" error={errors.description}>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          maxLength={3000}
          placeholder="What is being built, for whom, and what makes it different"
          className={cn("resize-none rounded-[10px] border px-3.5 py-2.5 text-sm leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none", errors.description ? "border-[#dc2626]" : "border-gray-200")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="City" error={errors.city}>
          <div className={box("city")}>
            <input value={city} onChange={(event) => setCity(event.target.value)} maxLength={100} className={FIELD_INPUT} placeholder="Accra" />
          </div>
        </FormField>
        <FormField label="Area (optional)">
          <div className={box()}>
            <input value={area} onChange={(event) => setArea(event.target.value)} maxLength={100} className={FIELD_INPUT} placeholder="Adenta" />
          </div>
        </FormField>
      </div>

      <FormField label="Address (optional)">
        <div className={box()}>
          <input value={address} onChange={(event) => setAddress(event.target.value)} maxLength={250} className={FIELD_INPUT} />
        </div>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Stage">
          <div className={box()}>
            <select value={stage} onChange={(event) => setStage(event.target.value as ProjectStageKey)} className={FIELD_INPUT}>
              {PROJECT_STAGES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </FormField>
        <FormField label="Construction progress (%)" error={errors.progress}>
          <div className={box("progress")}>
            <input value={progress} onChange={(event) => setProgress(event.target.value)} inputMode="numeric" className={FIELD_INPUT} />
          </div>
        </FormField>
        <FormField label="Expected handover">
          <div className={box()}>
            <input type="date" value={handoverOn} onChange={(event) => setHandoverOn(event.target.value)} className={FIELD_INPUT} />
          </div>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Title (optional)">
          <div className={box()}>
            <input value={tenure} onChange={(event) => setTenure(event.target.value)} maxLength={60} className={FIELD_INPUT} placeholder="Leasehold, 99 years" />
          </div>
        </FormField>
        <FormField label="Floors (optional)">
          <div className={box()}>
            <input value={floorsNote} onChange={(event) => setFloorsNote(event.target.value)} maxLength={60} className={FIELD_INPUT} placeholder="6 floors + roof terrace" />
          </div>
        </FormField>
      </div>

      <FormField label="Brochure link (optional)" error={errors.brochure}>
        <div className={box("brochure")}>
          <input value={brochureUrl} onChange={(event) => setBrochureUrl(event.target.value)} className={FIELD_INPUT} placeholder="https://" />
        </div>
      </FormField>

      <FormField label={initial ? "Photos (new photos replace the current gallery)" : "Photos"}>
        <div className="flex flex-wrap gap-2.5">
          {(photos.length > 0 ? photos.map((photo) => photo.publicUrl) : (initial?.gallery ?? []).map((item) => item.url)).map((url, index) => (
            <span key={`${url}-${index}`} className="relative block size-20 overflow-hidden rounded-lg bg-[#eef2ff]">
              <Image src={url} alt="" fill className="object-cover" sizes="80px" />
              {photos.length > 0 && (
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => setPhotos((current) => current.filter((_, position) => position !== index))}
                  className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-[10px] text-white"
                >
                  ✕
                </button>
              )}
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
      </FormField>

      <div className="flex justify-end">
        <Button variant="primary" onClick={submit} disabled={save.isPending || uploading} className="w-auto px-6">
          {save.isPending ? "Saving…" : initial ? "Save changes" : "Create draft"}
        </Button>
      </div>
    </section>
  );
}
