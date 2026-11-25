"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LocationCombobox } from "@/components/shared/LocationCombobox";
import { FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { RequestSentDialog } from "@/components/shared/RequestSentDialog";
import { SelectField } from "@/components/shared/SelectField";
import { DatePickerField } from "@/components/shared/ViewingSlotPickers";
import { WizardDialog } from "@/components/shared/WizardDialog";
import { useServicesMutations, useTaxonomy, useTradeSuggestions } from "@/hooks/useServices";
import { errorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

const TEXTAREA = "resize-none rounded-[10px] border px-3.5 py-2.5 text-[13px] leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none sm:text-sm";

export interface QuoteTarget {
  providerIds?: string[];
  offeringId?: string;
  category?: string;
  city?: string;
  title?: string;
  needsInspection?: boolean;
  providerName?: string;
  /** Asking a professional for a consultation rather than an artisan for a quote. */
  consultation?: boolean;
}

/** Ask up to five providers for a quote or a consultation, in one dialog that fits the screen without scrolling. When the trade needs a site visit, the providers propose an inspection first. */
export function QuoteRequestDialog({ open, onClose, target }: { open: boolean; onClose: () => void; target: QuoteTarget }) {
  const router = useRouter();
  const { createRequest } = useServicesMutations();
  const taxonomy = useTaxonomy();
  const [title, setTitle] = useState(target.title ?? "");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(target.category ?? "");
  const [city, setCity] = useState(target.city ?? "");
  const [start, setStart] = useState("");
  const [budget, setBudget] = useState("");
  const [inspection, setInspection] = useState(target.needsInspection ?? false);
  const [sent, setSent] = useState<{ id: string; inspection: boolean } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const suggestions = useTradeSuggestions(!category ? description : "");

  const categories = [...(taxonomy.data?.professions ?? []), ...(taxonomy.data?.trades ?? [])];
  const safetyCritical = category !== "" && (taxonomy.data?.safetyCritical ?? []).includes(category);
  const budgetNumber = Number(budget.replace(/,/g, ""));
  const budgetValue = budget.trim() && Number.isFinite(budgetNumber) ? budgetNumber : null;
  const noun = target.consultation ? "consultation" : target.needsInspection ? "inspection" : "quote";

  function submit() {
    if (createRequest.isPending) return;
    const found: Record<string, string> = {};
    if (!title.trim()) found.title = "Give the job a short title";
    if (description.trim().length < 10) found.description = "Describe the job in a sentence or two";
    if (!category) found.category = "Choose a trade or profession";
    if (!city.trim()) found.city = "Where is the job?";
    if (budget.trim() && budgetValue === null) found.budget = "Enter the budget as a number";
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    createRequest.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        category,
        city: city.trim(),
        preferredStart: start || null,
        budget: budgetValue,
        currency: "GHS",
        offeringId: target.offeringId ?? null,
        needsInspection: inspection,
        providerIds: target.providerIds ?? [],
      },
      { onSuccess: (created) => setSent({ id: created.id, inspection: Boolean(created.requiresInspection) }) },
    );
  }

  if (sent) {
    return (
      <RequestSentDialog
        open={open}
        onClose={onClose}
        title="Request sent"
        message={sent.inspection ? "Providers will propose a site visit first. Their quotes appear on the request once they have looked." : "Quotes will appear on the request as providers reply, and you choose one."}
        rows={[
          ...(target.providerName ? [{ label: "To", value: target.providerName }] : []),
          { label: "Job", value: title.trim() },
          { label: "Where", value: city.trim() },
          { label: "Status", value: sent.inspection ? "Waiting for a site visit" : "Waiting for quotes" },
        ]}
        secondary={{ label: "Done", onClick: onClose }}
        primary={{
          label: "View request",
          onClick: () => {
            onClose();
            router.push(`/request-board/${sent.id}`);
          },
        }}
      />
    );
  }

  return (
    <WizardDialog
      open={open}
      onClose={onClose}
      title={target.consultation ? "Request a consultation" : target.needsInspection ? "Request an inspection" : "Request a quote"}
      subtitle={target.providerName ? `Your ${noun} request goes to ${target.providerName}.` : `Tell providers what you need and they send a ${noun}.`}
      fixedHeight={false}
      hint={createRequest.isError ? errorMessage(createRequest.error) : "A clear title and details get better answers."}
      backLabel="Cancel"
      nextLabel={createRequest.isPending ? "Sending…" : "Send request"}
      onBack={onClose}
      onNext={submit}
    >
      <FormField label="What do you need done?" error={errors.title}>
        <div className={cn(FIELD_BOX, errors.title ? "border-[#dc2626]" : "border-gray-200")}>
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} aria-label="What do you need done?" placeholder="e.g. Rewire a 3-bed house" className={FIELD_INPUT} />
        </div>
      </FormField>
      <FormField label="Details" error={errors.description}>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          aria-label="Details"
          placeholder="Size of the job, materials, timing, access"
          className={cn(TEXTAREA, errors.description ? "border-[#dc2626]" : "border-gray-200")}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Trade or profession" error={errors.category}>
          <SelectField value={category} onChange={setCategory} aria-label="Trade or profession" invalid={Boolean(errors.category)} placeholder="Choose one" options={categories.map((item) => ({ value: item, label: item }))} className="h-11 rounded-[10px] [@media(max-height:860px)]:h-10" />
        </FormField>
        <FormField label="City or area" error={errors.city}>
          <LocationCombobox value={city} onChange={setCity} placeholder="e.g. Kasoa" ariaLabel="City" pick="city" invalid={Boolean(errors.city)} icon />
        </FormField>
      </div>

      {!category && (suggestions.data?.length ?? 0) > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <span className="text-gray-500">Looks like:</span>
          {suggestions.data?.slice(0, 3).map((item) => (
            <button key={item.trade} type="button" onClick={() => setCategory(item.trade ?? "")} className="rounded-full border border-gray-200 px-3 py-1 font-medium text-brand-900 hover:bg-[#eff5ff]">
              {item.trade}
            </button>
          ))}
        </div>
      )}
      {safetyCritical && taxonomy.data?.safetyWarning && <p className="rounded-xl bg-[#fef3c7] p-3 text-[13px] leading-[19px] text-[#b45309]">{taxonomy.data.safetyWarning}</p>}

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Preferred start (optional)">
          <DatePickerField value={start} onChange={setStart} />
        </FormField>
        <FormField label="Budget (optional)" error={errors.budget}>
          <div className={cn(FIELD_BOX, errors.budget ? "border-[#dc2626]" : "border-gray-200")}>
            <span className="text-sm text-gray-500">GHS</span>
            <input value={budget} onChange={(event) => setBudget(event.target.value)} inputMode="numeric" aria-label="Budget" placeholder="0" className={FIELD_INPUT} />
          </div>
        </FormField>
      </div>

      <label className="flex items-start gap-2.5 rounded-xl bg-[#f8fafc] p-3 text-[13px] leading-[19px] text-[#334155]">
        <input type="checkbox" checked={inspection} onChange={(event) => setInspection(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[#1465e6]" />
        I would like a site inspection before I get a quote.
      </label>
    </WizardDialog>
  );
}
