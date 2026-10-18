"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { notifyError } from "@/lib/errors";
import { enquire } from "@/lib/leads-api";
import { cn } from "@/lib/utils";

const FINANCING = ["Cash", "Mortgage", "Instalments", "Other"] as const;

const FIELD =
  "h-11 w-full rounded-[10px] border border-gray-200 bg-white px-3.5 text-[13px] leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none";

interface EnquiryModalProps {
  open: boolean;
  onClose: () => void;
  listingId: string;
  title: string;
  isRental: boolean;
  currency?: string;
}

/** "Make an enquiry" dialog: a message to the lister plus the few qualification details the transaction needs. */
export function EnquiryModal({ open, onClose, listingId, title, isRental, currency = "GHS" }: EnquiryModalProps) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [moveIn, setMoveIn] = useState("");
  const [financing, setFinancing] = useState<(typeof FINANCING)[number] | "">("");
  const [error, setError] = useState<string | undefined>();

  const send = useMutation({
    mutationFn: () => {
      const budgetMax = Number(budget);
      return enquire({
        listingId,
        message: message.trim(),
        qualification: {
          budgetMax: budget.trim() !== "" && Number.isFinite(budgetMax) ? budgetMax : null,
          currency,
          moveInDate: isRental && moveIn ? moveIn : null,
          financing: !isRental && financing ? financing : null,
        },
      });
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["leads"] });
      showSuccessToast(result.created ? "Enquiry sent" : "Your message was added to your open enquiry");
      setMessage("");
      setBudget("");
      setMoveIn("");
      setFinancing("");
      onClose();
    },
    onError: (err) => notifyError(err, "Your enquiry could not be sent."),
  });

  function submit() {
    if (!message.trim()) {
      setError("Write a short message to the lister");
      return;
    }
    setError(undefined);
    send.mutate();
  }

  return (
    <CenteredDialog open={open} onClose={onClose} labelledBy="enquiry-title" className="max-w-[520px]">
      <div className="flex flex-col gap-1 border-b border-gray-200 px-5 pb-3 pt-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="enquiry-title" className="text-lg font-bold leading-7 text-[#0f172a] sm:text-xl">
            Make an enquiry
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-1 shrink-0 p-1 text-lg text-gray-500 hover:text-[#0f172a]">
            ✕
          </button>
        </div>
        <p className="truncate text-[13px] leading-[19px] text-gray-500">{title}</p>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">Message</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            placeholder="Introduce yourself and ask what you would like to know"
            className={cn(FIELD, "h-auto resize-none py-2.5", error && "border-[#dc2626]")}
          />
          {error && <span className="text-xs text-[#dc2626]">{error}</span>}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">Your budget ({currency}, optional)</span>
          <input value={budget} onChange={(event) => setBudget(event.target.value)} inputMode="numeric" placeholder="e.g. 250000" className={FIELD} />
        </label>

        {isRental ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">Move-in date (optional)</span>
            <input type="date" value={moveIn} onChange={(event) => setMoveIn(event.target.value)} className={FIELD} />
          </label>
        ) : (
          <div role="radiogroup" aria-label="How will you pay" className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">How will you pay (optional)</span>
            <div className="flex flex-wrap gap-2">
              {FINANCING.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={financing === option}
                  onClick={() => setFinancing(financing === option ? "" : option)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[13px] font-medium",
                    financing === option ? "border-brand-900 bg-[#eff5ff] text-brand-900" : "border-gray-200 text-[#334155] hover:bg-gray-50",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2.5 border-t border-gray-200 bg-[#f8fafc] px-5 py-3 sm:px-6">
        <button type="button" onClick={onClose} className="h-10 rounded-[10px] border border-gray-200 bg-white px-[18px] text-sm font-medium text-[#0f172a] hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={send.isPending}
          className="h-10 rounded-[10px] bg-brand-900 px-[18px] text-sm font-medium text-white hover:bg-brand-900/90 disabled:opacity-60"
        >
          {send.isPending ? "Sending…" : "Send enquiry"}
        </button>
      </div>
    </CenteredDialog>
  );
}
