// Stand-ins for what the Concierge API will return until it exists.

export const PROMPT_EXAMPLE = "e.g. “I bought land in Oyibi and want to build a 3-bed house”";

export const PROMPT_STARTERS = [
  "Build on my land",
  "Fix something at home",
  "Find a home to rent",
  "Renovate or furnish",
  "Manage my rental property",
];

export type PlanStepStatus = "done" | "current" | "upcoming";

export interface PlanStep {
  id: string;
  title: string;
  detail: string;
  status: PlanStepStatus;
  /** Pill shown on a finished step, e.g. "Completed 12 Oct". */
  completedLabel?: string;
  /** Button shown on the step that needs you now. */
  action?: string;
}

export const ACTIVE_PLAN = {
  title: "Build a 3-bed house in Oyibi",
  steps: [
    {
      id: "s1",
      title: "Confirm land documents",
      detail: "Land title documents checked by Kwame Mensah (Surveyor)",
      status: "done",
      completedLabel: "Completed 12 Oct",
    },
    {
      id: "s2",
      title: "Site survey & plan",
      detail: "Boundary survey delivered · GHS 900 paid",
      status: "done",
      completedLabel: "Completed 15 Oct",
    },
    {
      id: "s3",
      title: "Choose an architect",
      detail: "3 quotes received: GHS 1,500 · GHS 2,200 · GHS 2,800",
      status: "current",
      action: "Compare quotes",
    },
    {
      id: "s4",
      title: "Structural engineer",
      detail: "Concierge will shortlist after drawings are approved",
      status: "upcoming",
    },
    {
      id: "s5",
      title: "Quantity surveyor & budget",
      detail: "Bill of quantities for contractor bids",
      status: "upcoming",
    },
    {
      id: "s6",
      title: "Contractor, artisans & materials",
      detail: "Quotes, procurement and a Project to track the build",
      status: "upcoming",
    },
  ] as PlanStep[],
};

export const OTHER_PLANS = [
  { id: "o1", title: "Fix leaking kitchen tap · Unit 1A", status: "Quote accepted · visit Thu" },
  { id: "o2", title: "Find 2-bed rental, Airport", status: "4 viewings booked" },
  { id: "o3", title: "Repaint exterior, Dzorwulu", status: "Draft" },
];
