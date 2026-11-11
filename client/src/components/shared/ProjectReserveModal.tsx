"use client";

import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { PlanLines } from "@/components/shared/ProjectDetailContent";
import { FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { useAccountPrefill, usePrefilledState } from "@/hooks/useAccountPrefill";
import { notifyError } from "@/lib/errors";
import { formatMoney } from "@/lib/format";
import { newIdempotencyKey } from "@/lib/idempotency";
import { reserveUnit } from "@/lib/projects-api";
import type { UnitTypeDto } from "@/types/api/projects";
import { cn } from "@/lib/utils";

interface ProjectReserveModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  units: UnitTypeDto[];
  initialUnitId?: string | null;
}

/** "Reserve a unit" dialog: pick a unit type, review the deposit and plan, then pay the deposit on Paystack. */
export function ProjectReserveModal({ open, onClose, projectId, projectName, units, initialUnitId }: ProjectReserveModalProps) {
  const prefill = useAccountPrefill();
  const [email, setEmail] = usePrefilledState(prefill.email);
  const [picked, setPicked] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const keys = useRef<Record<string, string>>({});

  const available = units.filter((unit) => unit.isActive && unit.available > 0);
  const unit = available.find((candidate) => candidate.id === (picked ?? initialUnitId)) ?? available[0];

  const reserve = useMutation({
    mutationFn: () => {
      keys.current[unit.id] ??= newIdempotencyKey();
      return reserveUnit(projectId, unit.id, email.trim(), keys.current[unit.id]);
    },
    onSuccess: (reservation) => {
      if (reservation.authorizationUrl) window.location.assign(reservation.authorizationUrl);
      else setError("We could not open the payment page. Try again from My reservations.");
    },
    onError: (failure) => notifyError(failure, "We could not reserve that unit."),
  });

  function submit() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address for the receipt");
      return;
    }
    setError(undefined);
    reserve.mutate();
  }

  return (
    <CenteredDialog open={open} onClose={onClose} labelledBy="project-reserve-title" className="max-w-[560px]">
      <div className="flex flex-col gap-0.5 border-b border-gray-200 px-5 pb-3 pt-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="project-reserve-title" className="text-lg font-bold leading-7 text-[#0f172a] sm:text-xl">
            Reserve a unit
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-1 shrink-0 p-1 text-lg leading-[26px] text-gray-500 hover:text-[#0f172a]">
            ✕
          </button>
        </div>
        <p className="text-[13px] leading-[19px] text-gray-500">{projectName}. The unit is held for 30 minutes while you pay the deposit.</p>
      </div>

      {unit ? (
        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6">
          <FormField label="Unit type">
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Unit type">
              {available.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  role="radio"
                  aria-checked={candidate.id === unit.id}
                  onClick={() => setPicked(candidate.id)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border p-3 text-left",
                    candidate.id === unit.id ? "border-brand-900 bg-[#eff5ff]" : "border-gray-200 bg-white hover:bg-gray-50",
                  )}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-[#0f172a]">{candidate.name}</span>
                    <span className="text-xs text-gray-500">{candidate.summary}</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-[#0f172a]">{formatMoney(candidate.price, candidate.currency)}</span>
                </button>
              ))}
            </div>
          </FormField>

          <div className="flex flex-col gap-2 rounded-xl bg-[#f8fafc] p-3.5">
            <p className="text-[13px] font-semibold text-[#0f172a]">{unit.paymentPlan.title}</p>
            <PlanLines unit={unit} />
          </div>

          <FormField label="Email for the receipt" error={error}>
            <div className={cn(FIELD_BOX, error ? "border-[#dc2626]" : "border-gray-200")}>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className={FIELD_INPUT} />
            </div>
          </FormField>
        </div>
      ) : (
        <p className="px-5 py-8 text-center text-sm text-gray-500 sm:px-6">Every unit type in this project is reserved right now.</p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 bg-[#f8fafc] px-5 py-3 sm:px-6">
        <p className="min-w-[180px] flex-1 text-xs leading-[17px] text-gray-500">
          {unit ? `Pay ${formatMoney(unit.paymentPlan.deposit, unit.currency)} now to secure this unit.` : ""}
        </p>
        <div className="ml-auto flex gap-2.5">
          <button type="button" onClick={onClose} className="h-10 rounded-[10px] border border-gray-200 bg-white px-[18px] text-sm font-medium text-[#0f172a] hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!unit || reserve.isPending}
            className="h-10 whitespace-nowrap rounded-[10px] bg-brand-900 px-[18px] text-sm font-medium text-white hover:bg-brand-900/90 disabled:opacity-60"
          >
            {reserve.isPending ? "Opening payment…" : "Pay deposit"}
          </button>
        </div>
      </div>
    </CenteredDialog>
  );
}
