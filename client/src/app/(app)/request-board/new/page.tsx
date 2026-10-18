"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { DetailAside } from "@/components/shared/DetailAside";
import { ChoiceChip, FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { Button } from "@/components/ui/Button";
import { savePostedRequest } from "@/lib/posted-requests";
import { isNonEmpty } from "@/lib/validation";
import { cn } from "@/lib/utils";

// What the poster needs, and the categories offered once they have said.
const NEEDS: Record<string, string[]> = {
  "Artisan / trade": ["Plumbing", "Electrical", "Carpentry", "Painting", "Roofing", "Masonry & tiling", "Welding"],
  "Professional service": ["Architecture & design", "Land survey", "Structural engineering", "Legal & documents", "Valuation"],
  Materials: ["Cement & blocks", "Roofing sheets", "Steel & iron", "Paint & finishes", "Plumbing & electrical supplies"],
  "Equipment hire": ["Excavator", "Concrete mixer", "Scaffolding", "Generator"],
  "Moving & cleaning": ["Moving", "Deep cleaning", "Post-construction cleaning"],
};
const NEED_LABELS = Object.keys(NEEDS);
const WHEN = ["Today", "Within 3 days", "Within 1 week", "Within 2 weeks", "Within a month", "I’m flexible"];
const BUDGETS = ["Under 500", "500 – 800", "800 – 1,200", "1,200 – 2,000", "2,000 – 5,000", "Above 5,000", "Not sure yet"];
const MATERIALS = ["Provider supplies", "I will supply", "Not needed"];
const WHO_CAN_QUOTE = ["Verified providers only", "Anyone nearby"];
const TIPS = ["Add 2–3 clear photos", "Give a budget range", "Say who buys the materials", "Keep payment on Biltlinx so it’s protected"];
const NEXT_STEPS = ["Providers nearby are notified", "Quotes arrive, usually within a day", "Compare quotes side by side", "Hire, pay on Biltlinx, then review"];
const DRAFT_KEY = "biltlinx.request-draft";
const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5";

interface Form {
  need: string;
  category: string;
  title: string;
  description: string;
  location: string;
  when: string;
  budget: string;
  materials: string;
  whoCanQuote: string;
}

const EMPTY_FORM: Form = {
  need: NEED_LABELS[0],
  category: NEEDS[NEED_LABELS[0]][0],
  title: "",
  description: "",
  location: "",
  when: WHEN[2],
  budget: "",
  materials: MATERIALS[0],
  whoCanQuote: WHO_CAN_QUOTE[0],
};

function readDraft(): Form | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? { ...EMPTY_FORM, ...(JSON.parse(raw) as Partial<Form>) } : null;
  } catch {
    return null;
  }
}

export default function PostRequestPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ title?: string; location?: string }>({});

  // A saved draft is only known in the browser, so it is restored after mount.
  useEffect(() => {
    const draft = readDraft();
    if (draft) setForm(draft);
  }, []);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }));

  function chooseNeed(need: string) {
    setForm((current) => ({ ...current, need, category: NEEDS[need][0] }));
  }

  function saveDraft() {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      toast.success("Draft saved on this device");
    } catch {
      toast.error("Couldn’t save the draft");
    }
  }

  function post() {
    const found = {
      title: isNonEmpty(form.title) ? undefined : "Give your request a title",
      location: isNonEmpty(form.location) ? undefined : "Enter where the job is",
    };
    setErrors(found);
    if (found.title || found.location) return;

    const saved = savePostedRequest({
      id: `mine-${Date.now()}`,
      category: form.category,
      timing: form.when,
      quotes: 0,
      title: form.title.trim(),
      location: form.location.trim(),
      budget: form.budget ? `GHS ${form.budget}` : "Budget not set",
      poster: "You",
      postedAgo: "just now",
      posterAvatar: "/images/requests/andy.png",
      owner: "me",
    });
    if (!saved) {
      toast.error("Couldn’t post your request. Try again.");
      return;
    }
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Nothing to clear.
    }
    toast.success("Request posted");
    router.push("/request-board?tab=mine");
  }

  return (
    <AppShell activeKey="services" activeChildKey="request-board" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Request Board", href: "/request-board" }, { label: "Post a request" }]} />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Post a request</h1>
          <p className="text-sm leading-5 text-gray-500">Describe the job once. Verified professionals and artisans nearby send you quotes in GHS.</p>
        </div>

        <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
          <section className="flex w-full min-w-0 flex-1 flex-col gap-[18px] rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <FormField label="What do you need?">
              <div role="radiogroup" aria-label="What do you need?" className="flex flex-wrap gap-2">
                {NEED_LABELS.map((need) => (
                  <ChoiceChip key={need} role="radio" label={need} selected={need === form.need} onClick={() => chooseNeed(need)} />
                ))}
              </div>
            </FormField>

            <FormField label="Category">
              <OptionSelectField value={form.category} options={NEEDS[form.need]} onChange={(value) => set("category", value)} />
            </FormField>

            <FormField label="Title" error={errors.title}>
              <label className={cn(FIELD_BOX, errors.title ? "border-[#dc2626]" : "border-gray-200")}>
                <input
                  value={form.title}
                  onChange={(event) => set("title", event.target.value)}
                  placeholder="e.g. Fix leaking pipes and replace kitchen sink"
                  maxLength={90}
                  className={FIELD_INPUT}
                />
              </label>
            </FormField>

            <FormField label="Describe the job">
              <textarea
                value={form.description}
                onChange={(event) => set("description", event.target.value)}
                rows={4}
                placeholder="What needs doing, what you already have, and anything a provider should know"
                className="h-24 resize-none rounded-[10px] border border-gray-200 px-3.5 py-3 text-[13px] leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none sm:text-sm"
              />
            </FormField>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Location" error={errors.location}>
                <label className={cn(FIELD_BOX, errors.location ? "border-[#dc2626]" : "border-gray-200")}>
                  <NavIcon icon="/icons/post-options-location.svg" size={16} className="bg-gray-500" />
                  <input value={form.location} onChange={(event) => set("location", event.target.value)} placeholder="e.g. Adenta, Accra" className={FIELD_INPUT} />
                </label>
                <span className="text-xs leading-[17px] text-gray-500">Only your area is public. Exact address goes to the provider you hire.</span>
              </FormField>
              <FormField label="When do you need it?">
                <OptionSelectField value={form.when} options={WHEN} onChange={(value) => set("when", value)} icon="/icons/calendar-03.svg" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Budget (GHS)">
                <OptionSelectField value={form.budget} options={BUDGETS} onChange={(value) => set("budget", value)} placeholder="Select a range" />
              </FormField>
              <FormField label="Who supplies materials?">
                <OptionSelectField value={form.materials} options={MATERIALS} onChange={(value) => set("materials", value)} />
              </FormField>
            </div>

            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-2.5 rounded-xl border border-dashed border-[#cbd5e1] p-4 text-[13px] font-medium leading-[19px] text-[#334155] hover:bg-gray-50"
            >
              <NavIcon icon="/icons/attachment-01.svg" size={18} className="shrink-0 bg-[#334155]" />
              <span className="min-w-0 truncate">
                {files.length ? files.map((file) => file.name).join(", ") : "Add photos or a video · helps providers quote accurately"}
              </span>
            </button>

            <FormField label="Who can quote?">
              <div role="radiogroup" aria-label="Who can quote?" className="flex flex-wrap gap-2">
                {WHO_CAN_QUOTE.map((option) => (
                  <ChoiceChip key={option} role="radio" label={option} selected={option === form.whoCanQuote} onClick={() => set("whoCanQuote", option)} />
                ))}
              </div>
            </FormField>

            <div className="flex flex-wrap justify-end gap-2.5">
              <Button variant="outline" onClick={saveDraft} className="h-11 w-auto rounded-[10px] px-4 lg:rounded-[10px]">
                Save draft
              </Button>
              <Button variant="primary" onClick={post} className="h-11 w-auto rounded-[10px] px-4 lg:rounded-[10px]">
                Post request
              </Button>
            </div>
          </section>

          <DetailAside className="xl:w-[360px]">
            <section className={CARD}>
              <h2 className="text-[15px] font-bold leading-[22px] text-[#0f172a]">Get better quotes</h2>
              {TIPS.map((tip) => (
                <p key={tip} className="flex gap-2 text-[13px] leading-[19px] text-[#334155]">
                  <span className="font-bold text-[#16a34a]">✓</span>
                  {tip}
                </p>
              ))}
            </section>

            <section className={`${CARD} gap-2`}>
              <h2 className="text-[15px] font-bold leading-[22px] text-[#0f172a]">What happens next</h2>
              {NEXT_STEPS.map((step, index) => (
                <p key={step} className="flex items-center gap-2.5 text-[13px] leading-[19px] text-[#334155]">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#eff5ff] text-[11px] font-bold leading-4 text-brand-900">{index + 1}</span>
                  {step}
                </p>
              ))}
            </section>

            <section className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-[#f8fafc] p-5">
              <h2 className="text-[15px] font-bold leading-[22px] text-[#0f172a]">Bigger job?</h2>
              <p className="text-xs leading-[17px] text-gray-500">Concierge can scope a renovation, find 3 vetted contractors and manage the work.</p>
              <Button variant="outline" onClick={() => router.push("/concierge/new")} className="h-[38px] rounded-[10px] lg:rounded-[10px]">
                Start with Concierge
              </Button>
            </section>
          </DetailAside>
        </div>
      </PageContainer>
    </AppShell>
  );
}
