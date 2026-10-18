"use client";

import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { Button } from "@/components/ui/Button";

const ROUNDED = "rounded-[10px] lg:rounded-[10px]";

interface RequestSentDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  rows: { label: string; value: string }[];
  secondary: { label: string; onClick: () => void };
  primary: { label: string; onClick: () => void };
}

/** The "it's sent" dialog shared by the viewing, consultation and quote requests (Figma node 1089:37676): a tick, what happens next, a summary and two actions. */
export function RequestSentDialog({ open, onClose, title, message, rows, secondary, primary }: RequestSentDialogProps) {
  return (
    <CenteredDialog open={open} onClose={onClose} labelledBy="request-sent-title" className="max-w-[460px]">
      <div className="flex flex-col items-center gap-3.5 px-6 pb-6 pt-8 sm:px-8">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-[28px] font-bold leading-8 text-[#16a34a]">
          ✓
        </span>
        <h2 id="request-sent-title" className="text-xl font-bold leading-7 text-[#0f172a]">
          {title}
        </h2>
        <p className="text-center text-sm leading-5 text-gray-500">{message}</p>
        <dl className="flex w-full flex-col gap-2 rounded-xl bg-[#f8fafc] p-3.5 text-[13px] leading-[19px]">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4">
              <dt className="shrink-0 text-gray-500">{row.label}</dt>
              <dd className="text-right font-medium text-[#0f172a]">{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex w-full gap-2.5">
          <Button variant="outline" onClick={secondary.onClick} className={`h-11 min-w-0 flex-1 whitespace-nowrap px-3 ${ROUNDED}`}>
            {secondary.label}
          </Button>
          <Button variant="primary" onClick={primary.onClick} className={`h-11 min-w-0 flex-1 whitespace-nowrap px-3 ${ROUNDED}`}>
            {primary.label}
          </Button>
        </div>
      </div>
    </CenteredDialog>
  );
}
