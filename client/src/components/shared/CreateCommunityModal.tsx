"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { ListingFormLayout } from "@/components/shared/ListingFormLayout";
import { ChoiceChip, FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { useCommunities } from "@/hooks/useCommunities";
import { COMMUNITY_COVERS, COMMUNITY_PRIVACY, COMMUNITY_TYPES, DEFAULT_COMMUNITY_RULES, type CommunityPrivacy } from "@/lib/dummy-communities";
import { notifyError } from "@/lib/errors";
import { uploadMedia } from "@/lib/upload";
import { cn } from "@/lib/utils";

const TEXTAREA = "resize-none rounded-[10px] border border-gray-200 px-3.5 py-2 text-sm leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none";
const COVER_BUTTON = "h-8 rounded-[10px] bg-white px-3 text-[13px] font-medium text-[#0f172a] shadow-[0_1px_3px_rgba(15,23,42,0.2)] hover:bg-gray-50 disabled:opacity-60";
const HINT = "text-xs leading-[17px] text-gray-500";

const PRIVACY_NOTES: Record<CommunityPrivacy, string> = {
  Public: "Anyone can find it, read the posts and join.",
  Private: "Anyone can find it, but people ask to join and only members see the posts.",
};

const MAX_RULES = 8;

/** The form itself, mounted only while the dialog is open so it starts empty each time. */
function CreateCommunityForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { communities, create } = useCommunities();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<CommunityPrivacy>("Public");
  const [rules, setRules] = useState(DEFAULT_COMMUNITY_RULES.join("\n"));
  const [cover, setCover] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const cleanName = name.trim();
  const taken = cleanName !== "" && communities.some((community) => community.name.toLowerCase() === cleanName.toLowerCase());
  const ruleList = rules
    .split("\n")
    .map((rule) => rule.replace(/^[\s•\-*]+/, "").trim())
    .filter(Boolean)
    .slice(0, MAX_RULES);
  // Without an uploaded picture the community gets the cover that goes with its type.
  const shownCover = cover ?? COMMUNITY_COVERS[type];
  const ready = cleanName !== "" && !taken && type !== "" && description.trim() !== "" && ruleList.length > 0;

  async function pickCover(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setCover((await uploadMedia(file, { allowVideo: false })).publicUrl);
    } catch (failure) {
      notifyError(failure, "That photo could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    const community = create({ name: cleanName, type, description: description.trim(), image: shownCover, privacy, rules: ruleList });
    showSuccessToast("Community created. You are its first member.");
    onClose();
    router.push(`/communities/${community.id}`);
  }

  return (
    <ListingFormLayout
      titleId="create-community-title"
      title="Start a community"
      subtitle="Bring neighbours, builders and owners together around what you care about."
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="h-11 shrink-0 rounded-[10px] border border-gray-200 px-5 text-sm font-medium text-[#0f172a] hover:bg-gray-50">
            Cancel
          </button>
          <Button variant="primary" onClick={submit} disabled={!ready || uploading} className="h-11 flex-1 rounded-[10px] lg:rounded-[10px]">
            {uploading ? "Uploading…" : "Create community"}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-4">
      <FormField label="Cover photo (optional)">
        <div className="relative h-[100px] w-full shrink-0 overflow-hidden rounded-xl bg-[#eef2ff]">
          {shownCover ? (
            <Image src={shownCover} alt="" fill unoptimized className="object-cover" sizes="380px" />
          ) : (
            <span className="flex size-full items-center justify-center">
              <NavIcon icon="/icons/image-01.svg" size={28} className="bg-[#94a3b8]" />
            </span>
          )}
          <div className="absolute bottom-2.5 right-2.5 flex gap-2">
            {cover && !uploading && (
              <button type="button" onClick={() => setCover(null)} className={COVER_BUTTON}>
                Remove
              </button>
            )}
            <button type="button" disabled={uploading} onClick={() => fileInput.current?.click()} className={COVER_BUTTON}>
              {uploading ? "Uploading…" : cover ? "Change photo" : "Upload a photo"}
            </button>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(event) => {
              void pickCover(event.target.files);
              event.target.value = "";
            }}
          />
        </div>
        <p className={HINT}>Without a photo, your community gets a cover that matches its type.</p>
      </FormField>

      <FormField label="Community name" error={taken ? "There is already a community with this name." : undefined}>
        <label className={cn(FIELD_BOX, taken ? "border-[#dc2626]" : "border-gray-200")}>
          <input autoFocus value={name} onChange={(event) => setName(event.target.value)} maxLength={60} aria-label="Community name" placeholder="e.g. Oyibi Land Buyers" className={FIELD_INPUT} />
        </label>
      </FormField>

      <FormField label="What kind of community is it?">
        <div role="radiogroup" aria-label="Community type" className="flex flex-wrap gap-2">
          {COMMUNITY_TYPES.map((option) => (
            <ChoiceChip key={option} role="radio" label={option} selected={type === option} onClick={() => setType(option)} />
          ))}
        </div>
      </FormField>

      </div>
      <div className="flex min-w-0 flex-col gap-4">
      <FormField label="What is it about?">
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          maxLength={140}
          aria-label="What is it about?"
          placeholder="e.g. Water, roads, security and recommendations for our estate."
          className={TEXTAREA}
        />
        <p className={HINT}>Shown on the community’s card. {140 - description.length} characters left.</p>
      </FormField>

      <FormField label="Who can join?">
        <div role="radiogroup" aria-label="Who can join?" className="flex flex-wrap gap-2">
          {COMMUNITY_PRIVACY.map((option) => (
            <ChoiceChip key={option} role="radio" label={option} selected={privacy === option} onClick={() => setPrivacy(option)} />
          ))}
        </div>
        <p className={HINT}>{PRIVACY_NOTES[privacy]}</p>
      </FormField>

      <FormField label="Community rules" error={ruleList.length === 0 ? "Add at least one rule." : undefined}>
        <textarea value={rules} onChange={(event) => setRules(event.target.value)} rows={4} aria-label="Community rules" className={TEXTAREA} />
        <p className={HINT}>One rule per line, up to {MAX_RULES}. Members see them on the community’s page.</p>
      </FormField>
      </div>
      </div>
    </ListingFormLayout>
  );
}

/** Start a community: its cover, name, type, blurb, who can join and its rules — the details a community's card and page show. */
export function CreateCommunityModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <CenteredDialog open={open} onClose={onClose} labelledBy="create-community-title" className="max-w-[780px]">
      <CreateCommunityForm onClose={onClose} />
    </CenteredDialog>
  );
}
