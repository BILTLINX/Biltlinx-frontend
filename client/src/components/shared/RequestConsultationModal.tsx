"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ChoiceChip, FIELD_BOX, FIELD_INPUT, FormField, ReviewList, SummaryRow } from "@/components/shared/ModalFormParts";
import { NavIcon } from "@/components/shared/NavIcon";
import { RequestSentDialog } from "@/components/shared/RequestSentDialog";
import { DatePickerField, OptionSelectField, formatDateKey, todayKey } from "@/components/shared/ViewingSlotPickers";
import { WizardDialog } from "@/components/shared/WizardDialog";
import { comingSoonHref } from "@/lib/coming-soon";
import { isNonEmpty } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { ProviderCardData } from "@/types/provider";

const CONSULTATION_TYPES = [
  { label: "Video call · 30 min · GHS 250", fee: 250 },
  { label: "Site visit · 1 hr · GHS 450", fee: 450 },
  { label: "Office visit · 1 hr · GHS 350", fee: 350 },
];
const TOPICS = ["New build", "Renovation", "Permit help", "Drawings review"];
const BUDGETS = ["Under GHS 200k", "GHS 200k – 500k", "GHS 500k – 800k", "GHS 800k – 1.2m", "Over GHS 1.2m"];
const TIMES = ["9:00 am", "10:00 am", "11:00 am", "12:00 pm", "2:00 pm", "3:00 pm", "4:00 pm"];
const STEPS = ["1. Details", "2. Time", "3. Confirm"];
const HINTS = [
  "Fee is held by Biltlinx and refunded if {name} cancels.",
  "Times are Accra time. {name} may suggest another.",
  "Nothing is charged until {name} accepts the slot.",
];

export interface ConsultationProvider {
  name: string;
  /** e.g. "Architect" */
  role: string;
  avatar: string;
  /** e.g. "GIA credential verified · 4.9 ★ (86)" */
  trust: string;
}

/** The summary row of a provider card: role without the firm, the last trust badge and the rating. */
export function consultationProviderFrom(provider: ProviderCardData): ConsultationProvider {
  const credential = provider.badges[provider.badges.length - 1]?.replace(" ✓", "");
  return {
    name: provider.name,
    role: provider.role.split(" · ")[0],
    avatar: provider.avatar,
    trust: [credential, provider.stats[0]?.value].filter(Boolean).join(" · "),
  };
}

/**
 * "Request a consultation" flow: 1 Details (Figma nodes 1053:24538, 1053:24553, 1053:24612), 2 Time and 3 Confirm
 * (designed to match), then a "sent" dialog. Every step shows who the consultation is with.
 */
export function RequestConsultationModal({ open, onClose, provider }: { open: boolean; onClose: () => void; provider: ConsultationProvider }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [step, setStep] = useState(1);
  const [sent, setSent] = useState(false);
  const [type, setType] = useState(CONSULTATION_TYPES[1]);
  const [topics, setTopics] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [plotSize, setPlotSize] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState<{ topics?: string; location?: string; date?: string; time?: string }>({});

  const firstName = provider.name.split(" ")[0];
  const summary = <SummaryRow image={provider.avatar} round title={`${provider.name} · ${provider.role}`} subtitle={provider.trust} />;

  function toggleTopic(topic: string) {
    setTopics((current) => (current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic]));
  }

  function reset() {
    setStep(1);
    setSent(false);
    setTopics([]);
    setLocation("");
    setPlotSize("");
    setBudget("");
    setDescription("");
    setFiles([]);
    setDate("");
    setTime("");
    setErrors({});
  }

  function close() {
    reset();
    onClose();
  }

  function back() {
    setErrors({});
    if (step === 1) close();
    else setStep(step - 1);
  }

  function next() {
    if (step === 1) {
      const found = {
        topics: topics.length ? undefined : "Pick at least one topic",
        location: isNonEmpty(location) ? undefined : "Enter the project location",
      };
      setErrors(found);
      if (!found.topics && !found.location) setStep(2);
    } else if (step === 2) {
      const found = { date: date ? undefined : "Choose a date", time: time ? undefined : "Choose a time" };
      setErrors(found);
      if (!found.date && !found.time) setStep(3);
    } else {
      setSent(true);
    }
  }

  const when = date && time ? `${formatDateKey(date)} · ${time}` : "";

  return (
    <>
      <WizardDialog
        open={open && !sent}
        onClose={close}
        title="Request a consultation"
        subtitle={`Pick a slot. ${firstName} confirms within 2 hours or suggests another time.`}
        steps={STEPS}
        current={step}
        hint={HINTS[step - 1].replace("{name}", firstName)}
        backLabel={step === 1 ? "Cancel" : "Back"}
        nextLabel={step === 1 ? "Choose a time" : step === 2 ? "Review" : "Confirm request"}
        onBack={back}
        onNext={next}
      >
        {summary}

        {step === 1 && (
          <>
            <FormField label="Consultation type">
              <div role="radiogroup" aria-label="Consultation type" className="flex flex-wrap gap-2">
                {CONSULTATION_TYPES.map((option) => (
                  <ChoiceChip key={option.label} role="radio" label={option.label} selected={option === type} onClick={() => setType(option)} />
                ))}
              </div>
            </FormField>

            <FormField label="What is it about?" error={errors.topics}>
              <div role="group" aria-label="Topics" className="flex flex-wrap gap-2">
                {TOPICS.map((topic) => (
                  <ChoiceChip key={topic} role="checkbox" label={topic} selected={topics.includes(topic)} onClick={() => toggleTopic(topic)} />
                ))}
              </div>
            </FormField>

            <FormField label="Project location" error={errors.location}>
              <label className={cn(FIELD_BOX, errors.location ? "border-[#dc2626]" : "border-gray-200")}>
                <NavIcon icon="/icons/post-options-location.svg" size={16} className="bg-gray-500" />
                <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. East Legon Hills, Accra" className={FIELD_INPUT} />
              </label>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Plot size">
                <label className={cn(FIELD_BOX, "border-gray-200")}>
                  <input value={plotSize} onChange={(event) => setPlotSize(event.target.value)} placeholder="e.g. 0.25 acre" className={FIELD_INPUT} />
                </label>
              </FormField>
              <FormField label="Budget range">
                <OptionSelectField value={budget} options={BUDGETS} onChange={setBudget} placeholder="Select a range" minPanelWidth={200} />
              </FormField>
            </div>

            <FormField label="Describe your project" className="min-h-[65px] flex-1">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                placeholder="What do you want built, and what do you already have?"
                className="min-h-[40px] flex-1 resize-none rounded-[10px] border border-gray-200 px-3.5 py-2.5 text-[13px] leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none sm:text-sm"
              />
            </FormField>

            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              className="hidden"
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex shrink-0 items-center gap-2 rounded-[10px] border border-dashed border-[#cbd5e1] p-3 text-left text-[13px] font-medium leading-[19px] text-[#334155] hover:bg-gray-50 [@media(max-height:860px)]:p-2.5"
            >
              <NavIcon icon="/icons/attachment-01.svg" size={16} className="bg-[#334155]" />
              <span className="min-w-0 flex-1 truncate">{files.length ? files.map((file) => file.name).join(", ") : "Attach site plan or photos (optional)"}</span>
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <FormField label="Preferred date" error={errors.date}>
              <DatePickerField value={date} min={todayKey()} invalid={Boolean(errors.date)} onChange={setDate} />
            </FormField>
            <FormField label="Time" error={errors.time}>
              <div role="radiogroup" aria-label="Time" className="flex flex-wrap gap-2">
                {TIMES.map((slot) => (
                  <ChoiceChip key={slot} role="radio" label={slot} selected={slot === time} onClick={() => setTime(slot)} />
                ))}
              </div>
            </FormField>
            <p className="rounded-[10px] bg-[#eff5ff] p-3 text-[13px] font-medium leading-[19px] text-brand-900">
              {firstName} confirms within 2 hours or suggests another time. You’ll see the answer in Messages.
            </p>
          </>
        )}

        {step === 3 && (
          <ReviewList
            rows={[
              { label: "Consultation", value: type.label.split(" · ")[0] },
              { label: "When", value: when },
              { label: "About", value: topics.join(", ") },
              { label: "Location", value: location },
              ...(plotSize ? [{ label: "Plot size", value: plotSize }] : []),
              ...(budget ? [{ label: "Budget", value: budget }] : []),
              ...(files.length ? [{ label: "Attachments", value: `${files.length} file${files.length === 1 ? "" : "s"}` }] : []),
              { label: "Fee", value: `GHS ${type.fee}` },
            ]}
          />
        )}
      </WizardDialog>

      <RequestSentDialog
        open={open && sent}
        onClose={close}
        title="Consultation requested"
        message={`${firstName} usually confirms within 2 hours. If the slot doesn’t work, you’ll get a suggested time in Messages.`}
        rows={[
          { label: "When", value: when },
          { label: "Type", value: type.label.split(" · ")[0] },
          { label: "Status", value: `Waiting for ${firstName}` },
        ]}
        secondary={{ label: "Add to calendar", onClick: () => router.push(comingSoonHref("Add to calendar")) }}
        primary={{ label: `Message ${firstName}`, onClick: () => router.push("/messages") }}
      />
    </>
  );
}
