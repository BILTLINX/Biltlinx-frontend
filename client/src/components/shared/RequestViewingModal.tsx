"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { DatePickerField, TIME_SLOTS, TimeSelectField } from "@/components/shared/ViewingSlotPickers";
import {
  ViewingRequestedModal,
  type ViewingConfirmation,
} from "@/components/shared/ViewingRequestedModal";
import { isNonEmpty, isValidPhone } from "@/lib/validation";
import { cn } from "@/lib/utils";

const VIEWING_TYPES = ["In person", "Video call"] as const;

const FIELD_BOX =
  "flex h-11 items-center gap-2 rounded-[10px] border bg-white px-3.5 focus-within:border-brand-900";
const INPUT =
  "min-w-0 flex-1 bg-transparent text-[13px] leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none";

export interface ViewingProperty {
  title: string;
  /** e.g. "East Legon Hills · GHS 1,850,000" */
  summary: string;
  image: string;
  /** First name of the listing agent, shown in the confirmation. */
  agentName?: string;
}

interface Slot {
  date: string;
  time: string;
}

const EMPTY_SLOT: Slot = { date: "", time: TIME_SLOTS[1] };

/** "2026-10-24" + "10:00 am – 12:00 pm" → "Sat 24 Oct · 10 am – 12 pm" */
function describeSlot({ date, time }: Slot) {
  const day = new Date(`${date}T00:00:00`)
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
    .replace(",", "");
  return `${day} · ${time.replaceAll(":00", "")}`;
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">
        {label}
      </span>
      {children}
      {error && (
        <span className="text-xs leading-[17px] text-[#dc2626]">{error}</span>
      )}
    </label>
  );
}

function SlotFields({
  slot,
  onChange,
  label,
  dateError,
  minDate,
}: {
  slot: Slot;
  onChange: (slot: Slot) => void;
  label: string;
  dateError?: string;
  minDate: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={`Preferred date${label}`} error={dateError}>
        <DatePickerField value={slot.date} min={minDate} invalid={Boolean(dateError)} onChange={(date) => onChange({ ...slot, date })} />
      </Field>
      <Field label={`Time${label}`}>
        <TimeSelectField value={slot.time} onChange={(time) => onChange({ ...slot, time })} />
      </Field>
    </div>
  );
}

/** "Request a viewing" dialog (Figma nodes 1053:24312, 1053:24317, 1053:24371): viewing type, one or two preferred slots, contact details and a note to the agent. */
export function RequestViewingModal({
  open,
  onClose,
  property,
}: {
  open: boolean;
  onClose: () => void;
  property: ViewingProperty;
}) {
  const [type, setType] = useState<(typeof VIEWING_TYPES)[number]>("In person");
  const [first, setFirst] = useState<Slot>(EMPTY_SLOT);
  const [second, setSecond] = useState<Slot | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState<ViewingConfirmation | null>(
    null,
  );
  const [errors, setErrors] = useState<{
    date?: string;
    name?: string;
    phone?: string;
  }>({});

  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  function close() {
    setErrors({});
    onClose();
  }

  function submit() {
    const next = {
      date: first.date ? undefined : "Choose a date",
      name: isNonEmpty(name) ? undefined : "Enter your name",
      phone: isValidPhone(phone) ? undefined : "Enter a valid phone number",
    };
    setErrors(next);
    if (next.date || next.name || next.phone) return;

    setConfirmation({
      when: describeSlot(first),
      type,
      agentName: property.agentName,
    });
    setFirst(EMPTY_SLOT);
    setSecond(null);
    setMessage("");
  }

  function closeConfirmation() {
    setConfirmation(null);
    onClose();
  }

  return (
    <>
      <CenteredDialog
        open={open && !confirmation}
        onClose={close}
        labelledBy="request-viewing-title"
        className="h-[min(calc(100dvh-2rem),760px)] max-w-[560px]"
      >
        <div className="flex flex-col gap-0.5 border-b border-gray-200 px-5 pb-3 pt-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <h2
              id="request-viewing-title"
              className="text-lg font-bold leading-7 text-[#0f172a] sm:text-xl"
            >
              Request a viewing
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="-mr-1 shrink-0 p-1 text-lg leading-[26px] text-gray-500 hover:text-[#0f172a]"
            >
              ✕
            </button>
          </div>
          <p className="[@media(max-height:640px)]:hidden text-[13px] leading-[19px] text-gray-500">
            The agent confirms a time. The exact address is shared once the
            viewing is confirmed.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-5 py-5 sm:px-6 [@media(max-height:700px)]:gap-2.5 [@media(max-height:700px)]:py-3 [@media(max-height:720px)_and_(min-height:661px)]:[zoom:0.88] [@media(max-height:660px)_and_(min-height:601px)]:[zoom:0.8] [@media(max-height:600px)]:[zoom:0.72]">
          <div className="flex items-center gap-3 rounded-xl bg-[#f8fafc] p-2.5">
            <span className="relative block h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-[#eef2ff]">
              <Image
                src={property.image}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-sm font-semibold leading-5 text-[#0f172a]">
                {property.title}
              </p>
              <p className="truncate text-xs leading-[17px] text-gray-500">
                {property.summary}
              </p>
            </div>
          </div>

          <div
            role="radiogroup"
            aria-label="Viewing type"
            className="flex flex-col gap-1.5"
          >
            <p className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">
              Viewing type
            </p>
            <div className="flex flex-wrap gap-2">
              {VIEWING_TYPES.map((option) => {
                const selected = option === type;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setType(option)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-[13px] font-medium leading-[19px]",
                      selected
                        ? "border-brand-900 bg-[#eff5ff] text-brand-900"
                        : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <SlotFields
            slot={first}
            onChange={setFirst}
            label=""
            dateError={errors.date}
            minDate={minDate}
          />
          {second && (
            <SlotFields
              slot={second}
              onChange={setSecond}
              label=" (2nd option)"
              minDate={minDate}
            />
          )}
          <button
            type="button"
            onClick={() => setSecond(second ? null : { ...EMPTY_SLOT })}
            className="self-start text-[13px] font-medium leading-[19px] text-brand-900"
          >
            {second ? "− Remove second option" : "+ Add a second option"}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Full name" error={errors.name}>
              <span
                className={cn(
                  FIELD_BOX,
                  errors.name ? "border-[#dc2626]" : "border-gray-200",
                )}
              >
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  placeholder="Your full name"
                  className={INPUT}
                />
              </span>
            </Field>
            <Field label="Phone" error={errors.phone}>
              <span
                className={cn(
                  FIELD_BOX,
                  errors.phone ? "border-[#dc2626]" : "border-gray-200",
                )}
              >
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  type="tel"
                  autoComplete="tel"
                  placeholder="+233 24 555 0192"
                  className={INPUT}
                />
              </span>
            </Field>
          </div>

          <Field
            label="Message to the agent (optional)"
            className="min-h-0 flex-1"
          >
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={2}
              placeholder="Anything the agent should know before the viewing"
              className="min-h-[40px] flex-1 resize-none rounded-[10px] border border-gray-200 px-3.5 py-2.5 text-sm leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none"
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-3 border-t border-gray-200 bg-[#f8fafc] px-5 py-3 sm:px-6">
          <p className="min-w-[200px] flex-1 text-xs leading-[17px] text-gray-500">
            Free to request. Never pay before you’ve seen the property.
          </p>
          <div className="ml-auto flex gap-2.5">
            <button
              type="button"
              onClick={close}
              className="h-10 rounded-[10px] border border-gray-200 bg-white px-[18px] text-sm font-medium text-[#0f172a] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              className="h-10 whitespace-nowrap rounded-[10px] bg-brand-900 px-[18px] text-sm font-medium text-white hover:bg-brand-900/90"
            >
              Send request
            </button>
          </div>
        </div>
      </CenteredDialog>
      {confirmation && (
        <ViewingRequestedModal
          open
          onClose={closeConfirmation}
          confirmation={confirmation}
        />
      )}
    </>
  );
}
