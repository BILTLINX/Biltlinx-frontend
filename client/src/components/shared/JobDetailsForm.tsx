"use client";

import type { ReactNode } from "react";
import { ChoiceChip, FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { NavIcon } from "@/components/shared/NavIcon";
import { DatePickerField, OptionSelectField, formatDateKey, todayKey } from "@/components/shared/ViewingSlotPickers";
import { isNonEmpty } from "@/lib/validation";
import { cn } from "@/lib/utils";

const BUILDING_TYPES = ["Detached house", "Townhouse", "Apartment block", "Commercial"];
const BEDROOMS = ["1", "2", "3", "4", "5", "6+"];
const FLOORS = ["1", "2", "3", "4+"];
const HAVE = ["Site plan", "Land title / indenture", "Survey", "Existing drawings"];
const BUDGETS = ["Under GHS 1,500", "GHS 1,500 – 2,000", "GHS 2,000 – 3,000", "Above GHS 3,000", "Not sure yet"];

export interface JobDetails {
  buildingType: string;
  bedrooms: string;
  floors: string;
  location: string;
  have: string[];
  budget: string;
  neededBy: string;
  notes: string;
}

export const EMPTY_JOB_DETAILS: JobDetails = {
  buildingType: BUILDING_TYPES[0],
  bedrooms: "3",
  floors: "2",
  location: "",
  have: [],
  budget: "",
  neededBy: "",
  notes: "",
};

export interface JobDetailsErrors {
  location?: string;
  neededBy?: string;
}

export function validateJobDetails(details: JobDetails): JobDetailsErrors {
  return {
    location: isNonEmpty(details.location) ? undefined : "Enter the site location",
    neededBy: details.neededBy ? undefined : "Choose a date",
  };
}

/** The label/value rows that describe a job on a review step. */
export function jobDetailsRows(details: JobDetails) {
  return [
    { label: "Building", value: `${details.buildingType} · ${details.bedrooms} bed · ${details.floors} ${details.floors === "1" ? "floor" : "floors"}` },
    { label: "Site", value: details.location },
    ...(details.have.length ? [{ label: "Already have", value: details.have.join(", ") }] : []),
    ...(details.budget ? [{ label: "Budget", value: details.budget }] : []),
    { label: "Needed by", value: formatDateKey(details.neededBy) },
    ...(details.notes.trim() ? [{ label: "Notes", value: details.notes.trim() }] : []),
  ];
}

interface JobDetailsFormProps {
  value: JobDetails;
  onChange: (value: JobDetails) => void;
  errors: JobDetailsErrors;
  /** Rendered under the form, e.g. the "also send to similar providers" switch. */
  footer?: ReactNode;
}

/** The "Job details" step shared by requesting a quote and posting a request (Figma node 1053:24803). */
export function JobDetailsForm({ value, onChange, errors, footer }: JobDetailsFormProps) {
  const set = <K extends keyof JobDetails>(key: K, next: JobDetails[K]) => onChange({ ...value, [key]: next });
  const toggleHave = (item: string) => set("have", value.have.includes(item) ? value.have.filter((entry) => entry !== item) : [...value.have, item]);

  return (
    <>
      <FormField label="Building type">
        <div role="radiogroup" aria-label="Building type" className="flex flex-wrap gap-2">
          {BUILDING_TYPES.map((item) => (
            <ChoiceChip key={item} role="radio" label={item} selected={item === value.buildingType} onClick={() => set("buildingType", item)} />
          ))}
        </div>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Bedrooms">
          <OptionSelectField value={value.bedrooms} options={BEDROOMS} onChange={(next) => set("bedrooms", next)} />
        </FormField>
        <FormField label="Floors">
          <OptionSelectField value={value.floors} options={FLOORS} onChange={(next) => set("floors", next)} />
        </FormField>
      </div>

      <FormField label="Site location" error={errors.location}>
        <label className={cn(FIELD_BOX, errors.location ? "border-[#dc2626]" : "border-gray-200")}>
          <NavIcon icon="/icons/post-options-location.svg" size={16} className="bg-gray-500" />
          <input value={value.location} onChange={(event) => set("location", event.target.value)} placeholder="e.g. Oyarifa, Accra" className={FIELD_INPUT} />
        </label>
      </FormField>

      <FormField label="What do you already have?">
        <div role="group" aria-label="Documents you have" className="flex flex-wrap gap-2">
          {HAVE.map((item) => (
            <ChoiceChip key={item} role="checkbox" label={item} selected={value.have.includes(item)} onClick={() => toggleHave(item)} />
          ))}
        </div>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Budget for this service">
          <OptionSelectField value={value.budget} options={BUDGETS} onChange={(next) => set("budget", next)} placeholder="Select a range" minPanelWidth={200} />
        </FormField>
        <FormField label="Needed by" error={errors.neededBy}>
          <DatePickerField value={value.neededBy} min={todayKey()} invalid={Boolean(errors.neededBy)} onChange={(next) => set("neededBy", next)} />
        </FormField>
      </div>

      <FormField label="Anything else?" className="min-h-[65px] flex-1">
        <textarea
          value={value.notes}
          onChange={(event) => set("notes", event.target.value)}
          rows={2}
          placeholder="Anything the provider should know"
          className="min-h-[40px] flex-1 resize-none rounded-[10px] border border-gray-200 px-3.5 py-2.5 text-[13px] leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none sm:text-sm"
        />
      </FormField>

      {footer}
    </>
  );
}
