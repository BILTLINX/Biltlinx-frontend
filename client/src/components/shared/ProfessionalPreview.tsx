import { ProfileCompletionCard, type PreviewPill } from "@/components/shared/OnboardingProfilePreview";
import { PROFESSIONAL_COMPLETION } from "@/lib/dummy-onboarding";

const ROWS = [
  { id: "profession", label: "Profession" },
  { id: "firm", label: "Company/Firm" },
  { id: "credentials", label: "Credentials" },
  { id: "public", label: "Public profile" },
] as const;

/** The rows to show; someone working independently has no company/firm step. */
function rowsFor(independent: boolean) {
  return independent ? ROWS.filter((row) => row.id !== "firm") : ROWS;
}

type StepsDone = Record<(typeof ROWS)[number]["id"], boolean>;

/** How complete a professional profile is: the weight of each finished step. */
export function professionalCompletion(done: StepsDone, independent = false) {
  const rows = rowsFor(independent);
  const possible = rows.reduce((total, row) => total + PROFESSIONAL_COMPLETION[row.id], 0);
  const earned = rows.reduce((total, row) => total + (done[row.id] ? PROFESSIONAL_COMPLETION[row.id] : 0), 0);
  return Math.round((earned / possible) * 100);
}

interface ProfessionalPreviewProps {
  /** Which of the four steps the person has finished so far. */
  done: StepsDone;
  name: string;
  photoUrl: string | null;
  services: string[];
  /** The registration body's short name when they entered a number, such as "ARC". */
  registration: string | null;
  independent?: boolean;
}

/** The right-hand card of the professional setup (Figma node 1265:119736). */
export function ProfessionalPreview({ done, name, photoUrl, services, registration, independent = false }: ProfessionalPreviewProps) {
  const rows = rowsFor(independent).map((row) => ({ label: row.label, weight: PROFESSIONAL_COMPLETION[row.id], done: done[row.id] }));
  const pills: PreviewPill[] = [
    { label: "Phone verified", tone: "green" },
    registration ? { label: `${registration} registration in review`, tone: "amber" } : { label: "ID not verified yet", tone: "grey" },
  ];

  return <ProfileCompletionCard percent={professionalCompletion(done, independent)} name={name} photoUrl={photoUrl} pills={pills} tags={services} rows={rows} eye={false} align="start" />;
}
