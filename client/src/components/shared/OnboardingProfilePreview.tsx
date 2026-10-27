import Image from "next/image";
import { NavIcon } from "@/components/shared/NavIcon";
import { PROFILE_COMPLETION } from "@/lib/dummy-onboarding";
import { initialsOf } from "@/lib/initials";
import { cn } from "@/lib/utils";

export interface PreviewPill {
  label: string;
  tone: "green" | "amber" | "grey";
}

export interface PreviewRow {
  label: string;
  weight: number;
  done: boolean;
}

const PILL_TONE: Record<PreviewPill["tone"], string> = {
  green: "bg-[#dcfce7] text-[#16a34a]",
  amber: "bg-[#fef3c7] text-[#b45309]",
  grey: "bg-[#f1f5f9] text-[#64748a] ring-1 ring-[#e2e8f0]",
};

interface ProfileCompletionCardProps {
  percent: number;
  name: string;
  /** Their photo, or null to show initials. */
  photoUrl: string | null;
  pills: PreviewPill[];
  /** Short labels under the pills, such as the services offered. */
  tags?: string[];
  rows: PreviewRow[];
  /** The eye icon in the header; the professional setup leaves it out. */
  eye?: boolean;
  /** Where the pills and tags line up; the professional setup starts them at the left. */
  align?: "center" | "start";
}

/** The right-hand card of the setup flows: how the profile looks to others, how complete it is, and what is left. */
export function ProfileCompletionCard({ percent, name, photoUrl, pills, tags = [], rows, eye = true, align = "center" }: ProfileCompletionCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-xs font-semibold leading-[1.45] text-[#64748a]">Preview · how others see you</p>
        {eye && <NavIcon icon="/icons/onboarding-preview-eye.svg" size={16} className="bg-gray-500" />}
      </div>
      <div className="h-16 bg-gradient-to-r from-[#0a1f44] to-brand-900" />

      <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-[#f1f5f9] py-4">
        <div className="flex w-[286px] max-w-full flex-col items-center gap-4 px-5">
          <p className="w-full text-center text-[11px] font-medium capitalize text-[#121c2d]">Profile is {percent}% complete.</p>

          <div
            role="progressbar"
            aria-label="Profile completeness"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="flex size-20 items-center justify-center rounded-full"
            style={{ background: `conic-gradient(#1465e6 ${percent * 3.6}deg, #dbe6fb 0)` }}
          >
            <span className="relative flex size-[66px] items-center justify-center overflow-hidden rounded-full bg-white p-[3px]">
              <span className="relative flex size-full items-center justify-center overflow-hidden rounded-full bg-[#eff5ff] text-lg font-bold text-brand-900">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a local object URL or the account's own photo
                  <img src={photoUrl} alt="" className="size-full object-cover" />
                ) : name.trim() ? (
                  initialsOf(name)
                ) : (
                  <NavIcon icon="/icons/onboarding-user.svg" size={26} className="bg-brand-900" />
                )}
              </span>
            </span>
          </div>

          <div className={cn("flex w-full flex-wrap gap-1.5", align === "center" && "justify-center")}>
            {pills.map((pill) => (
              <span key={pill.label} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold leading-[1.45]", PILL_TONE[pill.tone])}>
                {pill.label}
              </span>
            ))}
          </div>

          {tags.length > 0 && (
            <div className="flex w-full flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="rounded-lg border border-gray-200 bg-[#f1f5f9] px-2 py-1 text-xs font-medium leading-[1.45] text-[#334155]">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <ul className="flex w-[286px] max-w-full flex-col gap-2.5 border-t border-gray-200 pt-2">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center justify-between text-xs leading-4 text-[#121c2d]">
              <span className="flex items-center gap-2">
                {row.done ? (
                  <Image src="/onboarding-personal/check.svg" alt="" width={14} height={14} />
                ) : (
                  <span aria-hidden className="size-3.5 rounded-full border border-[#cbd5e1]" />
                )}
                <span className={cn(!row.done && "text-[#64748a]")}>{row.label}</span>
              </span>
              <span className={cn("font-medium", !row.done && "text-[#94a3b8]")}>{row.weight}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface OnboardingProfilePreviewProps {
  /** Which of the setup steps the person has finished so far. */
  done: { interests: boolean; location: boolean; profile: boolean };
  name: string;
  photoUrl: string | null;
}

const ROWS = [
  { id: "interests", label: "Interest", weight: PROFILE_COMPLETION.interests },
  { id: "location", label: "Location", weight: PROFILE_COMPLETION.location },
  { id: "profile", label: "Profile", weight: PROFILE_COMPLETION.profile },
] as const;

/** How complete a profile is: what a new account starts with, plus the weight of each finished step. */
export function profileCompletion(done: OnboardingProfilePreviewProps["done"]) {
  return PROFILE_COMPLETION.base + ROWS.reduce((total, row) => total + (done[row.id] ? row.weight : 0), 0);
}

/** The personal setup's card (Figma node 1266:120724). */
export function OnboardingProfilePreview({ done, name, photoUrl }: OnboardingProfilePreviewProps) {
  return (
    <ProfileCompletionCard
      percent={profileCompletion(done)}
      name={name}
      photoUrl={photoUrl}
      pills={[
        { label: "Phone verified", tone: "green" },
        { label: "ID not verified yet", tone: "grey" },
      ]}
      rows={ROWS.map((row) => ({ label: row.label, weight: row.weight, done: done[row.id] }))}
    />
  );
}
