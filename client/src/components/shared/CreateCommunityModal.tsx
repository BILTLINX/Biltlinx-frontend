"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { CommunityInvitePanel } from "@/components/shared/CommunityInvitePanel";
import { FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { NavIcon } from "@/components/shared/NavIcon";
import { START_HINT, START_INPUT_BOX, START_TEXTAREA, StartDialogFrame, TickChip } from "@/components/shared/StartDialogFrame";
import { useCommunities } from "@/hooks/useCommunities";
import { COMMUNITY_COVERS, COMMUNITY_PRIVACY, COMMUNITY_TYPES, DEFAULT_COMMUNITY_COVER, type CommunityInvite, type CommunityPrivacy } from "@/lib/dummy-communities";
import { notifyError } from "@/lib/errors";
import { uploadMedia } from "@/lib/upload";
import { cn } from "@/lib/utils";

const ABOUT_MAX = 140;
const OTHER_TYPE_MAX = 30;
/** The "Other" chip: not a type itself, it asks for one. */
const OTHER = "__other";

const PRIVACY_ICON: Record<CommunityPrivacy, string> = { Public: "/icons/community-globe.svg", Private: "/icons/community-lock.svg" };
const PRIVACY_NOTES: Record<CommunityPrivacy, string> = {
  Public: "Anyone can find it, read the posts and join.",
  Private: "Anyone can find it, but people ask to join and only members see the posts.",
};

/** The form itself, mounted only while the dialog is open so it starts empty each time. */
function CreateCommunityForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { communities, create } = useCommunities();
  const fileInput = useRef<HTMLInputElement | null>(null);
  // Chosen now so a private community can show its link before it exists.
  const [id] = useState(() => crypto.randomUUID());
  const [name, setName] = useState("");
  const [picked, setPicked] = useState("");
  const [otherType, setOtherType] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<CommunityPrivacy>("Public");
  const [invited, setInvited] = useState<CommunityInvite[]>([]);
  const [cover, setCover] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // The types people have already made up for their own communities can be picked again.
  const ownTypes = [...new Set(communities.map((community) => community.type))].filter((type) => !COMMUNITY_TYPES.includes(type));
  const chosenType = picked === OTHER ? otherType.trim() : picked;
  const cleanName = name.trim();
  const taken = cleanName !== "" && communities.some((community) => community.name.toLowerCase() === cleanName.toLowerCase());
  // Without an uploaded picture the community gets the cover that goes with its type.
  const shownCover = cover ?? COMMUNITY_COVERS[chosenType] ?? DEFAULT_COMMUNITY_COVER;
  const ready = cleanName !== "" && !taken && chosenType !== "" && description.trim() !== "";
  const link = `${typeof window === "undefined" ? "" : window.location.origin}/communities/${id}`;

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
    const community = create({ id, name: cleanName, type: chosenType, description: description.trim(), image: shownCover, privacy, invited: privacy === "Private" ? invited : undefined });
    showSuccessToast("Community created. You are its first member.");
    onClose();
    router.push(`/communities/${community.id}`);
  }

  return (
    <StartDialogFrame
      titleId="create-community-title"
      title="Start a community"
      subtitle="Bring neighbours, builders and owners together around what you care about."
      onClose={onClose}
      primary={{ label: uploading ? "Uploading…" : "Create community", onClick: submit, disabled: !ready || uploading }}
    >
      <FormField label="Who can join?" className="gap-2">
        <div role="radiogroup" aria-label="Who can join?" className="flex gap-1 rounded-[10px] bg-[#f1f5f9] p-1">
          {COMMUNITY_PRIVACY.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={privacy === option}
              onClick={() => setPrivacy(option)}
              className={cn(
                "flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold leading-5",
                privacy === option ? "bg-white text-[#0f172a] shadow-[0_1px_3px_rgba(15,23,41,0.12)]" : "text-[#64748a]",
              )}
            >
              <NavIcon icon={PRIVACY_ICON[option]} size={16} className={privacy === option ? "bg-[#1465e6]" : "bg-[#64748a]"} />
              {option}
            </button>
          ))}
        </div>
        <p className={START_HINT}>{PRIVACY_NOTES[privacy]}</p>
      </FormField>

      <div className="flex items-start gap-2.5">
        <button type="button" aria-label="Upload a community photo" disabled={uploading} onClick={() => fileInput.current?.click()} className="relative block size-[72px] shrink-0 rounded-[23px] disabled:opacity-60">
          <span className="absolute inset-0 overflow-hidden rounded-[23px] bg-[#eef2ff]">
            <Image src={shownCover} alt="" fill unoptimized className="object-cover" sizes="72px" />
          </span>
          <span className="absolute -bottom-[1.67px] -right-[2.17px] flex items-center rounded-[29px] border border-dashed border-[#ff8d28] bg-gradient-to-r from-[#ff8d28] via-[#e24bb9] to-[#983fe0] p-1 shadow-[0_4px_4px_rgba(0,0,0,0.1)] backdrop-blur-[13.5px]">
            <NavIcon icon="/icons/community-upload.svg" size={11.67} className="bg-[#f8fafc]" />
          </span>
        </button>
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
        <FormField label="Community name" error={taken ? "There is already a community with this name." : undefined} className="flex-1 gap-2">
          <label className={cn(FIELD_BOX, START_INPUT_BOX, "px-3.5", taken ? "border-[#dc2626]" : "border-[#e2e8f0]")}>
            <input autoFocus value={name} onChange={(event) => setName(event.target.value)} maxLength={60} aria-label="Community name" placeholder="e.g. Oyibi Land Buyers" className={FIELD_INPUT} />
          </label>
        </FormField>
      </div>

      <FormField label="What kind of community is it?" className="gap-2">
        <div role="radiogroup" aria-label="Community type" className="flex flex-wrap gap-2">
          {[...COMMUNITY_TYPES, ...ownTypes].map((option) => (
            <TickChip key={option} label={option} selected={picked === option} onClick={() => setPicked(option)} />
          ))}
          <TickChip label="Other" selected={picked === OTHER} onClick={() => setPicked(OTHER)} />
        </div>
        {picked === OTHER && (
          <label className={cn(FIELD_BOX, START_INPUT_BOX, "mt-1 border-[#e2e8f0]")}>
            <input autoFocus value={otherType} onChange={(event) => setOtherType(event.target.value)} maxLength={OTHER_TYPE_MAX} aria-label="Your community type" placeholder="Name your own type, e.g. Estate security" className={FIELD_INPUT} />
          </label>
        )}
      </FormField>

      <FormField label="What is it about?" className="gap-2">
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={ABOUT_MAX}
          aria-label="What is it about?"
          placeholder="e.g. Water, roads, security and recommendations for our estate."
          className={START_TEXTAREA}
        />
        <div className="flex items-start gap-4">
          <p className={cn(START_HINT, "min-w-0 flex-1")}>Shown on the community’s card.</p>
          <p className="shrink-0 whitespace-nowrap text-xs leading-[17px] text-[#94a3b8]">{ABOUT_MAX - description.length} characters left</p>
        </div>
      </FormField>

      {privacy === "Private" && <CommunityInvitePanel link={link} invited={invited} onChange={setInvited} />}
    </StartDialogFrame>
  );
}

/** Start a community (Figma nodes 1684:54058, 1684:54066 and 1684:54110): who can join, its photo and name, its type (or your own), what it is about, and for a private one the people you invite. */
export function CreateCommunityModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <CenteredDialog open={open} onClose={onClose} labelledBy="create-community-title" className="max-w-[560px]">
      <CreateCommunityForm onClose={onClose} />
    </CenteredDialog>
  );
}
