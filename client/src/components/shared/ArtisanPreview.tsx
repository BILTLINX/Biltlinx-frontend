import { ProfileCompletionCard, type PreviewPill } from "@/components/shared/OnboardingProfilePreview";
import { ARTISAN_COMPLETION } from "@/lib/dummy-onboarding";

const ROWS = [
  { id: "trade", label: "Your trade" },
  { id: "area", label: "Work area" },
  { id: "verification", label: "Verification" },
  { id: "profile", label: "Portfolio and prices" },
] as const;

type StepsDone = Record<(typeof ROWS)[number]["id"], boolean>;

/** How complete an artisan profile is: the weight of each finished step. */
export function artisanCompletion(done: StepsDone) {
  return ROWS.reduce((total, row) => total + (done[row.id] ? ARTISAN_COMPLETION[row.id] : 0), 0);
}

interface ArtisanPreviewProps {
  /** Which of the four steps the person has finished so far. */
  done: StepsDone;
  name: string;
  photoUrl: string | null;
  /** The services they chose, shown as tags. */
  services: string[];
}

/** The right-hand card of the artisan setup (Figma node 1071:31503). */
export function ArtisanPreview({ done, name, photoUrl, services }: ArtisanPreviewProps) {
  const pills: PreviewPill[] = [
    { label: "Phone verified", tone: "green" },
    { label: "ID not verified yet", tone: "grey" },
  ];
  const rows = ROWS.map((row) => ({ label: row.label, weight: ARTISAN_COMPLETION[row.id], done: done[row.id] }));

  return <ProfileCompletionCard percent={artisanCompletion(done)} name={name} photoUrl={photoUrl} pills={pills} tags={services} rows={rows} eye={false} align="start" />;
}
