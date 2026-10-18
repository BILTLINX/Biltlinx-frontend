"use client";

import { useState } from "react";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { showSuccessToast } from "@/components/shared/AppToast";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/utils";

interface ReportReason {
  label: string;
  description?: string;
}

const REPORT_REASONS: ReportReason[] = [
  { label: "Scam or fraud", description: "Asks for money upfront, fake documents, pressure to pay" },
  { label: "Listing isn’t real or is already sold" },
  { label: "Wrong price or misleading details" },
  { label: "Pretending to be someone else" },
  { label: "Harassment or hate" },
  { label: "Spam" },
  { label: "Something else" },
];

interface ReportPostModalProps {
  open: boolean;
  onClose: () => void;
  authorName: string;
}

/** Report-a-post dialog (Figma nodes 1054:29312, 1054:29317, 1054:29354). Centered over a dimmed backdrop. */
export function ReportPostModal({ open, onClose: onCloseRequest, authorName }: ReportPostModalProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0].label);
  const [details, setDetails] = useState("");
  const [blockAuthor, setBlockAuthor] = useState(true);

  function onClose() {
    setReason(REPORT_REASONS[0].label);
    setDetails("");
    setBlockAuthor(true);
    onCloseRequest();
  }

  function handleSubmit() {
    showSuccessToast("Thanks for the report. Our trust team will review it");
    onClose();
  }

  return (
    <CenteredDialog open={open} onClose={onClose} labelledBy="report-post-title">
        <div className="flex shrink-0 flex-col gap-1 px-[clamp(16px,3vw,24px)] pb-[clamp(4px,1.2vh,12px)] pt-[clamp(10px,2.4vh,20px)]">
          <div className="flex w-full items-center justify-between">
            <h2 id="report-post-title" className="text-[clamp(17px,2.6vh,20px)] font-bold leading-tight text-[#0f172a]">
              Report post
            </h2>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="text-lg font-medium leading-[26px] text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <p className="text-[clamp(11.5px,1.65vh,13px)] leading-snug text-gray-500">
            {authorName} won’t know who reported them. Our trust team reviews every report.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-[clamp(4px,1vh,8px)] overflow-y-auto px-[clamp(16px,3vw,24px)] pb-[clamp(6px,1.6vh,16px)] pt-[clamp(2px,1vh,8px)]">
          <div role="radiogroup" aria-label="Reason for reporting" className="flex flex-col gap-[clamp(4px,1vh,8px)]">
            {REPORT_REASONS.map((item) => {
              const selected = item.label === reason;
              return (
                <button
                  key={item.label}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setReason(item.label)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-[clamp(10px,1.6vw,14px)] py-[clamp(6px,1.4vh,12px)] text-left",
                    selected ? "border-brand-900 bg-[#eff5ff]" : "border-gray-200 bg-white hover:bg-gray-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-[18px] shrink-0 items-center justify-center rounded-full border",
                      selected ? "border-brand-900" : "border-[#cbd5e1]",
                    )}
                  >
                    {selected && <span className="size-2 rounded-full bg-brand-900" />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[clamp(13px,1.85vh,14px)] font-medium leading-5 text-[#0f172a]">{item.label}</span>
                    {item.description && <span className="text-[clamp(11px,1.5vh,12px)] leading-4 text-gray-500">{item.description}</span>}
                  </span>
                </button>
              );
            })}
          </div>

          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Add details (optional)"
            aria-label="Additional details"
            className="h-[clamp(48px,8vh,72px)] w-full shrink-0 resize-none rounded-[10px] border border-gray-200 px-[clamp(10px,1.6vw,14px)] py-[clamp(6px,1.4vh,12px)] text-[clamp(13px,1.85vh,14px)] leading-5 text-[#0f172a] placeholder:text-[#0f172a]/60 focus:border-brand-900 focus:outline-none"
          />

          <div className="py-[clamp(0px,0.5vh,4px)]">
            <Checkbox
              id="report-post-block"
              checked={blockAuthor}
              onChange={(event) => setBlockAuthor(event.target.checked)}
              label={<span className="text-[13px] font-medium leading-[19px] text-[#334155]">Also block {authorName}</span>}
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2.5 bg-gray-50 px-[clamp(16px,3vw,24px)] py-[clamp(8px,1.8vh,16px)]">
          <button
            type="button"
            onClick={onClose}
            className="h-[clamp(36px,5.2vh,44px)] rounded-[10px] border border-gray-200 bg-white px-[18px] text-sm font-medium text-[#0f172a] hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-[clamp(36px,5.2vh,44px)] rounded-[10px] bg-brand-900 px-[18px] text-sm font-medium text-white hover:bg-brand-900/90"
          >
            Submit report
          </button>
        </div>
    </CenteredDialog>
  );
}
