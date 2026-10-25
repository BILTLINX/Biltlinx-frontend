"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { errorMessage, notifyError } from "@/lib/errors";
import { getImpact, runListingAction, type ListingAction } from "@/lib/properties-api";
import type { PropertyDto } from "@/types/api/schema";
import { cn } from "@/lib/utils";

const COPY: Record<Exclude<ListingAction, "delete">, { title: string; confirm: string; done: string }> = {
  pause: { title: "Pause this listing?", confirm: "Pause listing", done: "Listing paused" },
  resume: { title: "Resume this listing?", confirm: "Resume listing", done: "Listing resumed" },
  close: { title: "Close this listing?", confirm: "Close listing", done: "Listing closed" },
  archive: { title: "Archive this listing?", confirm: "Archive listing", done: "Listing archived" },
};

interface ListingActionDialogProps {
  property: PropertyDto | null;
  action: Exclude<ListingAction, "delete"> | null;
  onClose: () => void;
}

/** Shows what an action will do (open viewings, leads) before it is confirmed, then runs it. */
export function ListingActionDialog({ property, action, onClose }: ListingActionDialogProps) {
  const queryClient = useQueryClient();
  const [outcome, setOutcome] = useState<"Sold" | "Rented" | null>(null);
  const open = Boolean(property && action);
  const impact = useQuery({
    queryKey: ["impact", property?.id, action],
    queryFn: () => getImpact(property?.id as string, action as ListingAction),
    enabled: open,
    staleTime: 0,
  });

  const run = useMutation({
    mutationFn: () => runListingAction(property?.id as string, action as Exclude<ListingAction, "delete">, outcome ?? undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["properties"] });
      void queryClient.invalidateQueries({ queryKey: ["viewings"] });
      void queryClient.invalidateQueries({ queryKey: ["action-needed"] });
      showSuccessToast(COPY[action as Exclude<ListingAction, "delete">].done);
      onClose();
    },
    onError: (error) => notifyError(error),
  });

  if (!property || !action) return null;
  const copy = COPY[action];
  const rental = property.listingType === "Rent";
  const defaultOutcome = rental ? "Rented" : "Sold";
  const chosen = outcome ?? defaultOutcome;

  return (
    <CenteredDialog open={open} onClose={onClose} labelledBy="listing-action-title" className="max-w-[460px]">
      <div className="flex flex-col gap-3 p-6">
        <h2 id="listing-action-title" className="text-lg font-bold text-[#0f172a]">
          {copy.title}
        </h2>
        <p className="text-sm font-medium text-[#334155]">{property.name}</p>
        {impact.isPending && <p className="text-sm text-gray-500">Checking what this will affect…</p>}
        {impact.isError && <p className="text-sm text-[#dc2626]">{errorMessage(impact.error)}</p>}
        {impact.data && (
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-5 text-[#334155]">
            {(impact.data.effects ?? []).map((effect) => (
              <li key={effect}>{effect}</li>
            ))}
            {(impact.data.effects ?? []).length === 0 && <li>Nothing else is affected.</li>}
          </ul>
        )}
        {action === "close" && (
          <div role="radiogroup" aria-label="Outcome" className="flex gap-2">
            {(["Sold", "Rented"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={chosen === option}
                onClick={() => setOutcome(option)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[13px] font-medium",
                  chosen === option ? "border-brand-900 bg-[#eff5ff] text-brand-900" : "border-gray-200 text-[#334155] hover:bg-gray-50",
                )}
              >
                {option === "Sold" ? "Sold" : "Rented out"}
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2.5 pt-1">
          <button type="button" onClick={onClose} className="h-10 rounded-[10px] border border-gray-200 px-4 text-sm font-medium text-[#0f172a] hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="button"
            disabled={impact.isPending || run.isPending}
            onClick={() => {
              if (action === "close") setOutcome(chosen);
              run.mutate();
            }}
            className="h-10 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white hover:bg-brand-900/90 disabled:opacity-60"
          >
            {run.isPending ? "Working…" : copy.confirm}
          </button>
        </div>
      </div>
    </CenteredDialog>
  );
}
