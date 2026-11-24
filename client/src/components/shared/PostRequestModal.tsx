"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/components/shared/AppToast";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { FormField } from "@/components/shared/ModalFormParts";
import { SelectField } from "@/components/shared/SelectField";
import { Button } from "@/components/ui/Button";
import { usePostsFeed } from "@/context/PostsContext";
import { useTaxonomy } from "@/hooks/useServices";
import { validateMediaFile } from "@/lib/upload";
import { cn } from "@/lib/utils";

const MAX_MEDIA = 4;
const MEDIA_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";
const TEXTAREA = "resize-none rounded-[10px] border px-3.5 py-2.5 text-sm leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none";

function Form({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const taxonomy = useTaxonomy();
  const { addPost } = usePostsFeed();
  const [issue, setIssue] = useState("");
  const [details, setDetails] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [posting, setPosting] = useState(false);
  const mediaInput = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map((file) => ({ url: URL.createObjectURL(file), isVideo: file.type.startsWith("video/") })), [files]);
  useEffect(() => () => previews.forEach((item) => URL.revokeObjectURL(item.url)), [previews]);

  const categories = [...(taxonomy.data?.professions ?? []), ...(taxonomy.data?.trades ?? [])];
  const safetyCritical = issue !== "" && (taxonomy.data?.safetyCritical ?? []).includes(issue);

  function addFiles(list: FileList | null) {
    const picked = Array.from(list ?? []);
    const valid = picked.filter((file) => !validateMediaFile(file));
    const problem = picked.map((file) => validateMediaFile(file)).find(Boolean) ?? (files.length + valid.length > MAX_MEDIA ? `Only ${MAX_MEDIA} files fit on a request.` : null);
    if (problem) showErrorToast(problem);
    setFiles((current) => [...current, ...valid].slice(0, MAX_MEDIA));
    if (mediaInput.current) mediaInput.current.value = "";
  }

  async function post() {
    const found: Record<string, string> = {};
    if (!issue) found.issue = "Choose the type of issue.";
    if (details.trim().length < 10) found.details = "Describe the issue in at least 10 characters.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setPosting(true);
    const posted = await addPost({ kind: "request", issue, details, files });
    setPosting(false);
    if (!posted) return; // addPost has already said why.
    showSuccessToast("Your request has been shared");
    onClose();
    router.push("/feed");
  }

  return (
    <div className="flex max-h-[90vh] flex-col">
      <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 sm:px-7">
        <div className="flex flex-col gap-1">
          <h2 id="post-request-title" className="text-xl font-bold leading-7 text-[#0f172a]">
            Post a request
          </h2>
          <p className="text-sm leading-5 text-gray-500">Share the issue on the feed. Add photos or a video if you have them.</p>
        </div>
        <button type="button" aria-label="Close" onClick={onClose} className="flex size-8 shrink-0 items-center justify-center rounded-full text-lg leading-none text-gray-500 hover:bg-gray-100">
          ×
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-4 sm:px-7">
        <FormField label="Type of issue" error={errors.issue}>
          <SelectField value={issue} onChange={setIssue} aria-label="Type of issue" placeholder="e.g. Plumbing" invalid={Boolean(errors.issue)} options={categories.map((item) => ({ value: item, label: item }))} className="h-11 rounded-[10px]" />
        </FormField>
        {safetyCritical && taxonomy.data?.safetyWarning && <p className="rounded-xl bg-[#fef3c7] p-3 text-[13px] leading-[19px] text-[#b45309]">{taxonomy.data.safetyWarning}</p>}

        <FormField label="Details" error={errors.details}>
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            rows={5}
            maxLength={1000}
            aria-label="Details"
            placeholder="What is wrong, where it is, and anything people should know"
            className={cn(TEXTAREA, errors.details ? "border-[#dc2626]" : "border-gray-200")}
          />
        </FormField>

        <FormField label="Photos or video of the issue (optional)">
          <input ref={mediaInput} type="file" multiple accept={MEDIA_ACCEPT} className="hidden" onChange={(event) => addFiles(event.target.files)} />
          <div className="flex flex-wrap gap-2.5">
            {previews.map((item, index) => (
              <div key={item.url} className="relative h-[61px] w-[97px] shrink-0 overflow-hidden rounded-md bg-gray-100">
                {item.isVideo ? <video src={item.url} className="size-full object-cover" muted /> : <Image src={item.url} alt="" fill unoptimized className="object-cover" sizes="97px" />}
                <button type="button" aria-label="Remove file" onClick={() => setFiles((current) => current.filter((_, at) => at !== index))} className="absolute left-1 top-1 flex size-4 items-center justify-center rounded-full bg-white text-[10px] leading-none text-[#0f172a]">
                  ×
                </button>
              </div>
            ))}
            {files.length < MAX_MEDIA && (
              <button type="button" aria-label="Add photos or video" onClick={() => mediaInput.current?.click()} className="flex h-[61px] w-[97px] shrink-0 items-center justify-center rounded-md border border-dashed border-[#cbd5e0] text-xs text-gray-500 hover:border-brand-900 hover:text-brand-900">
                + Add
              </button>
            )}
          </div>
        </FormField>
      </div>

      <div className="shrink-0 px-5 pb-5 pt-2 sm:px-7">
        <Button variant="primary" onClick={() => void post()} disabled={posting} className="h-11 w-full rounded-full text-[15px] font-semibold">
          {posting ? "Posting…" : "Post"}
        </Button>
      </div>
    </div>
  );
}

/** Post a request: a normal feed post with a type of issue, details and optional media. It is not a quote request or a listing. */
export function PostRequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <CenteredDialog open={open} onClose={onClose} labelledBy="post-request-title" className="max-w-[560px]">
      <Form onClose={onClose} />
    </CenteredDialog>
  );
}
