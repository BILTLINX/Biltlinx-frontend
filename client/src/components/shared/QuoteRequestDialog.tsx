"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { SelectField } from "@/components/shared/SelectField";
import { useServicesMutations, useTaxonomy, useTradeSuggestions } from "@/hooks/useServices";
import { cn } from "@/lib/utils";

const FIELD = "h-11 w-full rounded-[10px] border border-gray-200 bg-white px-3.5 text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none";

export interface QuoteTarget {
  providerIds?: string[];
  offeringId?: string;
  category?: string;
  city?: string;
  title?: string;
  needsInspection?: boolean;
  providerName?: string;
}

/** Ask up to five providers for a quote. When the trade needs a site visit, the providers propose an inspection first. */
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
  const [errors, setErrors] = useState<{ title?: string; description?: string; category?: string; city?: string }>({});
  const suggestions = useTradeSuggestions(!category ? description : "");

  const categories = [...(taxonomy.data?.professions ?? []), ...(taxonomy.data?.trades ?? [])];
  const safetyCritical = category !== "" && (taxonomy.data?.safetyCritical ?? []).includes(category);

  function submit() {
    const found = {
      title: title.trim() ? undefined : "Give the job a short title",
      description: description.trim().length >= 10 ? undefined : "Describe the job in a sentence or two",
      category: category ? undefined : "Choose a trade or profession",
      city: city.trim() ? undefined : "Where is the job?",
    };
    setErrors(found);
    if (found.title || found.description || found.category || found.city) return;
    const budgetNumber = Number(budget.replace(/,/g, ""));
    createRequest.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        category,
        city: city.trim(),
        preferredStart: start || null,
        budget: budget.trim() && Number.isFinite(budgetNumber) ? budgetNumber : null,
        currency: "GHS",
        offeringId: target.offeringId ?? null,
        needsInspection: inspection,
        providerIds: target.providerIds ?? [],
      },
      {
        onSuccess: (created) => {
          showSuccessToast(created.requiresInspection ? "Request sent. Providers will propose a site visit first." : "Request sent. Quotes will appear here.");
          onClose();
          router.push(`/request-board/${created.id}`);
        },
      },
    );
  }

  return (
    <CenteredDialog open={open} onClose={onClose} labelledBy="quote-title" className="max-w-[560px]">
      <div className="flex max-h-[85vh] flex-col gap-3.5 overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="quote-title" className="text-lg font-bold text-[#0f172a]">
              {target.needsInspection ? "Request an inspection" : "Request a quote"}
            </h2>
            {target.providerName && <p className="text-sm text-gray-500">From {target.providerName}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-lg text-gray-500 hover:text-[#0f172a]">
            ✕
          </button>
        </div>

        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#0f172a]">
          What do you need done?
          <input value={title} onChange={(event) => setTitle(event.target.value)} className={cn(FIELD, errors.title && "border-[#dc2626]")} placeholder="e.g. Rewire a 3-bed house" />
          {errors.title && <span className="text-xs font-normal text-[#dc2626]">{errors.title}</span>}
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#0f172a]">
          Details
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className={cn("rounded-[10px] border border-gray-200 px-3.5 py-2.5 text-sm font-normal focus:border-brand-900 focus:outline-none", errors.description && "border-[#dc2626]")}
            placeholder="Size of the job, materials, timing, access"
          />
          {errors.description && <span className="text-xs font-normal text-[#dc2626]">{errors.description}</span>}
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#0f172a]">
            Trade or profession
            <SelectField value={category} onChange={setCategory} invalid={Boolean(errors.category)} placeholder="Choose one" options={categories.map((item) => ({ value: item, label: item }))} />
            {errors.category && <span className="text-xs font-normal text-[#dc2626]">{errors.category}</span>}
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#0f172a]">
            City or area
            <input value={city} onChange={(event) => setCity(event.target.value)} className={cn(FIELD, errors.city && "border-[#dc2626]")} />
            {errors.city && <span className="text-xs font-normal text-[#dc2626]">{errors.city}</span>}
          </label>
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

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#0f172a]">
            Preferred start (optional)
            <input type="date" value={start} onChange={(event) => setStart(event.target.value)} className={FIELD} />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-[#0f172a]">
            Budget in GHS (optional)
            <input value={budget} onChange={(event) => setBudget(event.target.value)} inputMode="numeric" className={FIELD} />
          </label>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-[#334155]">
          <input type="checkbox" checked={inspection} onChange={(event) => setInspection(event.target.checked)} className="mt-0.5 size-4 accent-[#1465e6]" />
          I would like a site inspection before I get a quote.
        </label>

        <div className="flex justify-end gap-2.5 pt-1">
          <button type="button" onClick={onClose} className="h-10 rounded-[10px] border border-gray-200 px-4 text-sm font-medium text-[#0f172a] hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" disabled={createRequest.isPending} onClick={submit} className="h-10 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white disabled:opacity-60">
            {createRequest.isPending ? "Sending…" : "Send request"}
          </button>
        </div>
      </div>
    </CenteredDialog>
  );
}
