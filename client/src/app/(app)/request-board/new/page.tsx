"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { SelectField } from "@/components/shared/SelectField";
import { useProviders, useServicesMutations, useTaxonomy, useTradeSuggestions } from "@/hooks/useServices";
import { cn } from "@/lib/utils";

const FIELD = "h-11 w-full rounded-[10px] border border-gray-200 bg-white px-3.5 text-[13px] text-[#0f172a] focus:border-brand-900 focus:outline-none";
const MAX_PROVIDERS = 5;

export default function NewRequestPage() {
  const router = useRouter();
  const taxonomy = useTaxonomy();
  const { createRequest } = useServicesMutations();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [start, setStart] = useState("");
  const [budget, setBudget] = useState("");
  const [inspection, setInspection] = useState(false);
  const [chosen, setChosen] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>();
  const suggestions = useTradeSuggestions(!category ? description : "");
  const providers = useProviders({ category: category || undefined, city: city.trim() || undefined });

  const categories = [...(taxonomy.data?.professions ?? []), ...(taxonomy.data?.trades ?? [])];
  const safetyCritical = category !== "" && (taxonomy.data?.safetyCritical ?? []).includes(category);

  function toggle(id: string) {
    setChosen((current) => (current.includes(id) ? current.filter((item) => item !== id) : current.length >= MAX_PROVIDERS ? current : [...current, id]));
  }

  function submit() {
    if (!title.trim() || description.trim().length < 10 || !category || !city.trim()) {
      setError("Fill in the title, details, trade and city.");
      return;
    }
    if (chosen.length === 0) {
      setError("Choose at least one provider to ask.");
      return;
    }
    setError(undefined);
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
        needsInspection: inspection,
        providerIds: chosen,
      },
      {
        onSuccess: (created) => {
          showSuccessToast("Request sent");
          router.push(`/request-board/${created.id}`);
        },
      },
    );
  }

  return (
    <AppShell activeKey="services" activeChildKey="request-board" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Requests", href: "/request-board" }, { label: "Post a request" }]} />
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Post a request</h1>

        <div className="flex w-full max-w-[760px] flex-col gap-5">
          <section className="flex flex-col gap-3.5 rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-base font-bold text-[#0f172a]">The job</h2>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Short title, e.g. Fix leaking kitchen tap" className={FIELD} aria-label="Title" />
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="Describe the job: size, materials, access, timing" className="rounded-[10px] border border-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-900 focus:outline-none" aria-label="Details" />
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField value={category} onChange={setCategory} aria-label="Trade or profession" placeholder="Trade or profession" options={categories.map((item) => ({ value: item, label: item }))} />
              <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City or area" className={FIELD} aria-label="City" />
              <input type="date" value={start} onChange={(event) => setStart(event.target.value)} className={FIELD} aria-label="Preferred start" />
              <input value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Budget in GHS (optional)" inputMode="numeric" className={FIELD} aria-label="Budget" />
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
            <label className="flex items-start gap-2.5 text-sm text-[#334155]">
              <input type="checkbox" checked={inspection} onChange={(event) => setInspection(event.target.checked)} className="mt-0.5 size-4 accent-[#1465e6]" />
              I would like a site inspection before I get a quote.
            </label>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-[#0f172a]">Who should quote?</h2>
              <span className="text-xs text-gray-500">
                {chosen.length} of {MAX_PROVIDERS} chosen
              </span>
            </div>
            {!category && <p className="text-[13px] text-gray-500">Choose a trade first to see providers.</p>}
            {category && providers.isPending && <p className="text-[13px] text-gray-500">Looking for providers…</p>}
            {category && providers.items.length === 0 && !providers.isPending && <p className="text-[13px] text-gray-500">No providers found yet for that trade and city.</p>}
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
          </section>

          {error && <p className="text-sm text-[#dc2626]">{error}</p>}
          <button type="button" disabled={createRequest.isPending} onClick={submit} className="h-12 w-fit rounded-[10px] bg-brand-900 px-6 text-sm font-medium text-white disabled:opacity-60">
            {createRequest.isPending ? "Sending…" : "Send request"}
          </button>
        </div>
      </PageContainer>
    </AppShell>
  );
}
