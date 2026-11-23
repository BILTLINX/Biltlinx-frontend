"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { LocationCombobox } from "@/components/shared/LocationCombobox";
import { FIELD_BOX, FIELD_INPUT, FormField, WizardSteps } from "@/components/shared/ModalFormParts";
import { RequestCard } from "@/components/shared/RequestCard";
import { SelectField } from "@/components/shared/SelectField";
import { DatePickerField } from "@/components/shared/ViewingSlotPickers";
import { Button } from "@/components/ui/Button";
import { useProviders, useServicesMutations, useTaxonomy, useTradeSuggestions } from "@/hooks/useServices";
import { errorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { QuoteRequestDto } from "@/types/api/schema";

const STEPS = ["The job", "Place & budget", "Who quotes", "Review"];
const HEADINGS = [
  { title: "What do you need done?", subtitle: "Give it a clear title, say what the job is, and pick the trade." },
  { title: "Where and how much?", subtitle: "Say where the work is and what you can spend. Both help providers quote properly." },
  { title: "Who should quote?", subtitle: "Ask up to five providers. You compare their prices side by side, then pick one." },
  { title: "Review and send", subtitle: "Check the details. Only the providers you picked can see this request." },
];
const MAX_PROVIDERS = 5;
const TITLE_MAX = 80;
const TEXTAREA = "resize-none rounded-[10px] border px-3.5 py-2.5 text-sm leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none";

function Form({ onClose, onSent }: { onClose: () => void; onSent: (sent: { id: string; title: string }) => void }) {
  const taxonomy = useTaxonomy();
  const { createRequest } = useServicesMutations();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [start, setStart] = useState("");
  const [budget, setBudget] = useState("");
  const [inspection, setInspection] = useState(false);
  const [chosen, setChosen] = useState<string[]>([]);
  const suggestions = useTradeSuggestions(!category ? description : "");
  const providers = useProviders({ category: category || undefined, city: city.trim() || undefined });

  const categories = [...(taxonomy.data?.professions ?? []), ...(taxonomy.data?.trades ?? [])];
  const safetyCritical = category !== "" && (taxonomy.data?.safetyCritical ?? []).includes(category);
  const budgetNumber = Number(budget.replace(/,/g, ""));
  const budgetValue = budget.trim() && Number.isFinite(budgetNumber) ? budgetNumber : null;

  function toggle(id: string) {
    setChosen((current) => (current.includes(id) ? current.filter((item) => item !== id) : current.length >= MAX_PROVIDERS ? current : [...current, id]));
  }

  /** The problems with one step, keyed by field. */
  function problems(at: number) {
    const found: Record<string, string> = {};
    if (at === 0) {
      if (!title.trim()) found.title = "Give the request a title.";
      if (description.trim().length < 10) found.description = "Describe the job in at least 10 characters.";
      if (!category) found.category = "Choose the trade or profession.";
    }
    if (at === 1) {
      if (!city.trim()) found.city = "Say where the work is.";
      if (budget.trim() && budgetValue === null) found.budget = "Enter the budget as a number.";
    }
    if (at === 2 && chosen.length === 0) found.providers = "Choose at least one provider to ask.";
    return found;
  }

  function next() {
    const found = problems(step);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    createRequest.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        category,
        city: city.trim(),
        preferredStart: start || null,
        budget: budgetValue,
        currency: "GHS",
        needsInspection: inspection,
        providerIds: chosen,
      },
      { onSuccess: (created) => onSent({ id: created.id, title: title.trim() }) },
    );
  }

  const preview: QuoteRequestDto = {
    id: "preview",
    title: title.trim() || "Your request title",
    description: description.trim(),
    category: category || null,
    city: city.trim() || null,
    preferredStart: start || null,
    budget: budgetValue,
    currency: "GHS",
    offeringId: null,
    requiresInspection: inspection,
    status: "Open",
    acceptedQuoteId: null,
    createdAt: new Date().toISOString(),
    requester: { accountId: "", username: null, profilePicUrl: null, isVerified: false },
    invitedProviderIds: chosen,
    quoteCount: 0,
    quotes: null,
    inspections: null,
  };
  const chosenNames = (providers.items ?? []).filter((provider) => chosen.includes(provider.id)).map((provider) => provider.displayName ?? provider.owner.username ?? "Provider");

  return (
    <div className="flex min-h-0 flex-1">
      <nav aria-label="Steps" className="hidden w-[190px] shrink-0 flex-col border-r border-gray-200 p-5 lg:flex">
        <h2 id="post-request-title" className="text-base font-bold leading-6 text-[#0f172a]">
          Post a request
        </h2>
        <ol className="mt-5 flex flex-col gap-4">
          {STEPS.map((name, index) => (
            <li key={name} aria-current={index === step ? "step" : undefined} className={cn("flex flex-col border-l-[3px] pl-3 leading-[1.35]", index === step ? "border-brand-900" : "border-transparent")}>
              <span className={cn("flex items-center gap-1.5 text-[13px]", index === step ? "text-brand-900" : index < step ? "text-[#334155]" : "text-[#94a3b8]")}>
                Step {index + 1}/{STEPS.length}
                {index < step && <Image src="/icons/checkmark-badge-01.svg" alt="Done" width={14} height={14} />}
              </span>
              <span className={cn("text-[15px] font-semibold", index === step ? "text-[#0f172a]" : index < step ? "text-[#334155]" : "text-[#94a3b8]")}>{name}</span>
            </li>
          ))}
        </ol>
        <div className="mt-auto flex flex-col gap-1 rounded-xl bg-[#f8fafc] p-3">
          <p className="text-[13px] font-semibold text-[#0f172a]">Free to post</p>
          <p className="text-xs leading-[17px] text-gray-500">Pick up to five providers and compare their quotes.</p>
        </div>
      </nav>

      <aside className="hidden w-[320px] shrink-0 flex-col justify-center gap-4 border-r border-gray-200 bg-[#f1f5f9] p-5 xl:flex">
        <div className="flex flex-col gap-0.5">
          <p className="text-[15px] font-bold text-[#0f172a]">Preview</p>
          <p className="text-[13px] text-gray-500">This is how the request will look.</p>
        </div>
        <div inert>
          <RequestCard request={preview} mine />
        </div>
        <p className="text-center text-[13px] text-gray-500">Updates as you fill in each step.</p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 flex-col px-5 pt-4 sm:px-7 sm:pt-5">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => (step === 0 ? onClose() : setStep((current) => current - 1))} className="flex items-center gap-1 text-[13px] font-medium text-[#475569] hover:text-[#0f172a]">
              ‹ {step === 0 ? "Cancel" : "Back"}
            </button>
            <button type="button" aria-label="Close" onClick={onClose} className="flex size-8 items-center justify-center rounded-full text-lg leading-none text-gray-500 hover:bg-gray-100">
              ×
            </button>
          </div>
          <div className="lg:hidden">
            <WizardSteps steps={STEPS} current={step + 1} />
          </div>
        </div>

        <div className="flex min-h-[300px] flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-3 sm:px-7">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold leading-7 text-[#0f172a]">{HEADINGS[step].title}</h2>
            <p className="text-sm leading-5 text-gray-500">{HEADINGS[step].subtitle}</p>
          </div>

          {step === 0 && (
            <>
              <FormField label="Title" error={errors.title}>
                <div className={cn(FIELD_BOX, errors.title ? "border-[#dc2626]" : "border-gray-200")}>
                  <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={TITLE_MAX} aria-label="Title" placeholder="e.g. Fix leaking kitchen tap" className={FIELD_INPUT} />
                </div>
              </FormField>
              <FormField label="Details" error={errors.description}>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  maxLength={1000}
                  aria-label="Details"
                  placeholder="Describe the job: size, materials, access, timing"
                  className={cn(TEXTAREA, errors.description ? "border-[#dc2626]" : "border-gray-200")}
                />
              </FormField>
              <FormField label="Trade or profession" error={errors.category}>
                <SelectField value={category} onChange={setCategory} aria-label="Trade or profession" placeholder="Choose one" invalid={Boolean(errors.category)} options={categories.map((item) => ({ value: item, label: item }))} className="h-11 rounded-[10px] [@media(max-height:860px)]:h-10" />
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
              </FormField>
              {safetyCritical && taxonomy.data?.safetyWarning && <p className="rounded-xl bg-[#fef3c7] p-3 text-[13px] leading-[19px] text-[#b45309]">{taxonomy.data.safetyWarning}</p>}
            </>
          )}

          {step === 1 && (
            <>
              <FormField label="City or area" error={errors.city}>
                <LocationCombobox value={city} onChange={setCity} placeholder="e.g. Kasoa" ariaLabel="City" pick="city" invalid={Boolean(errors.city)} inputClassName={FIELD_INPUT} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Start (optional)">
                  <DatePickerField value={start} onChange={setStart} />
                </FormField>
                <FormField label="Budget (optional)" error={errors.budget}>
                  <div className={cn(FIELD_BOX, errors.budget ? "border-[#dc2626]" : "border-gray-200")}>
                    <span className="text-sm text-gray-500">GHS</span>
                    <input value={budget} onChange={(event) => setBudget(event.target.value)} inputMode="numeric" aria-label="Budget" placeholder="0" className={FIELD_INPUT} />
                  </div>
                </FormField>
              </div>
              <label className="flex items-start gap-2.5 text-[13px] leading-[19px] text-[#334155]">
                <input type="checkbox" checked={inspection} onChange={(event) => setInspection(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[#1465e6]" />
                I would like a site inspection before I get a quote.
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-semibold text-[#0f172a]">{category}</span>
                <span className="text-xs text-gray-500">
                  {chosen.length} of {MAX_PROVIDERS} chosen
                </span>
              </div>
              {providers.isPending && <p className="text-[13px] text-gray-500">Looking for providers…</p>}
              {!providers.isPending && providers.items.length === 0 && <p className="text-[13px] text-gray-500">No providers found yet for that trade and city. Go back and try a nearby city.</p>}
              <div className="flex flex-col gap-2">
                {providers.items.map((provider) => {
                  const selected = chosen.includes(provider.id);
                  return (
                    <label key={provider.id} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-3", selected ? "border-brand-900 bg-[#eff5ff]" : "border-gray-200 hover:bg-gray-50")}>
                      <input type="checkbox" checked={selected} onChange={() => toggle(provider.id)} className="size-4 accent-[#1465e6]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-[#0f172a]">{provider.displayName ?? provider.owner.username}</span>
                        <span className="block truncate text-xs text-gray-500">
                          {provider.city} · {(provider.categories ?? []).slice(0, 2).join(", ")}
                        </span>
                      </span>
                      {provider.credentialVerified && <span className="shrink-0 rounded-full bg-[#dcfce7] px-2 py-[3px] text-[11px] font-medium text-[#16a34a]">Credential ✓</span>}
                    </label>
                  );
                })}
              </div>
              {errors.providers && <p className="text-xs text-[#dc2626]">{errors.providers}</p>}
            </>
          )}

          {step === 3 && (
            <>
              <dl className="flex flex-col rounded-2xl bg-[#f8fafc] px-4 py-0.5 text-[13px]">
                {[
                  { label: "Job", value: title.trim() },
                  { label: "Trade", value: category },
                  { label: "Where", value: city.trim() },
                  { label: "Start", value: start ? formatDate(start) : "Flexible" },
                  { label: "Budget", value: budgetValue !== null ? `GHS ${budgetValue.toLocaleString("en-GH")}` : "Not set" },
                  { label: "Site inspection", value: inspection ? "Before quoting" : "Not needed" },
                  { label: "Asking", value: chosenNames.join(", ") || `${chosen.length} providers` },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4 border-b border-gray-200 py-2.5 last:border-b-0">
                    <dt className="shrink-0 text-gray-500">{row.label}</dt>
                    <dd className="min-w-0 text-right font-semibold text-[#0f172a]">{row.value}</dd>
                  </div>
                ))}
              </dl>
              {createRequest.isError && <p className="text-xs text-[#dc2626]">{errorMessage(createRequest.error)}</p>}
            </>
          )}
        </div>

        <div className="shrink-0 px-5 pb-4 pt-2 sm:px-7 sm:pb-5">
          <Button variant="primary" onClick={next} disabled={createRequest.isPending} className="h-11 w-full rounded-full text-[15px] font-semibold">
            {step < STEPS.length - 1 ? "Continue" : createRequest.isPending ? "Sending…" : "Send request"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** What you see once the request is sent. */
function Sent({ title, id, onClose }: { title: string; id: string; onClose: () => void }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-3 px-6 pb-6 pt-8 text-center sm:px-8">
      <span className="flex size-16 items-center justify-center rounded-full bg-[#dcfce7]">
        <Image src="/icons/checkmark-badge-01.svg" alt="" width={30} height={30} />
      </span>
      <h2 id="post-request-title" className="text-xl font-bold leading-7 text-[#0f172a]">
        Request sent
      </h2>
      <p className="text-sm leading-5 text-[#475569]">Your “{title}” request is with the providers you picked. Their quotes will show up on the request, and you choose one.</p>
      <div className="mt-2 flex w-full flex-col gap-2.5">
        <Button
          variant="primary"
          onClick={() => {
            onClose();
            router.push(`/request-board/${id}`);
          }}
          className="h-12 w-full rounded-full text-[15px] font-semibold"
        >
          View request
        </Button>
        <Button variant="outline" onClick={onClose} className="h-12 w-full rounded-full text-[15px] font-semibold">
          Done
        </Button>
      </div>
    </div>
  );
}

/** Post a request: four steps with a live preview of the request card, then a confirmation. It replaces the old Post a request page. */
export function PostRequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [sent, setSent] = useState<{ id: string; title: string } | null>(null);

  function close() {
    setSent(null);
    onClose();
  }

  return (
    <>
      <CenteredDialog open={open && sent === null} onClose={close} labelledBy="post-request-title" className="max-w-[980px] lg:h-[600px]">
        <Form onClose={close} onSent={setSent} />
      </CenteredDialog>
      <CenteredDialog open={open && sent !== null} onClose={close} labelledBy="post-request-title" className="max-w-[480px]">
        <Sent title={sent?.title ?? ""} id={sent?.id ?? ""} onClose={close} />
      </CenteredDialog>
    </>
  );
}
