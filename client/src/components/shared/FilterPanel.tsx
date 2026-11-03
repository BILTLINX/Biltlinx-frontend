"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { BoxIcon, type FilterOption } from "@/components/shared/FilterDropdown";
import { DatePickerField, todayKey } from "@/components/shared/ViewingSlotPickers";
import { useAnimatedSheet } from "@/hooks/useAnimatedSheet";
import { cn } from "@/lib/utils";

export type FilterValue = string | string[];
export type FilterValues = Record<string, FilterValue>;

export type FilterSection = { label: string; hidden?: boolean } & (
  | {
      type: "options";
      key: string;
      options: readonly FilterOption[];
      /** "list" is a column of checkboxes or radios, "chips" a row of pills. */
      display: "list" | "chips";
      /** Several can be picked; the value is then a list. */
      multiple?: boolean;
      /** A search box above a long list. */
      searchable?: boolean;
    }
  | { type: "range"; minKey: string; maxKey: string; prefix?: string }
  | { type: "text"; key: string; placeholder?: string; numeric?: boolean }
  | { type: "toggle"; key: string; text: string }
  /** A from / to pair of days, e.g. check in and check out. */
  | { type: "dates"; fromKey: string; toKey: string; fromLabel?: string; toLabel?: string }
  /** A whole number with minus and plus buttons; empty means "any". */
  | { type: "count"; key: string; noun: string; min?: number; max?: number }
);

export function filterText(values: FilterValues, key: string) {
  const value = values[key];
  return typeof value === "string" ? value : "";
}

export function filterList(values: FilterValues, key: string) {
  const value = values[key];
  return Array.isArray(value) ? value : [];
}

/** Every section cleared: lists become empty lists, everything else empty text. */
export function emptyFilters(sections: readonly FilterSection[]): FilterValues {
  const values: FilterValues = {};
  for (const section of sections) {
    if (section.type === "range") {
      values[section.minKey] = "";
      values[section.maxKey] = "";
    } else if (section.type === "dates") {
      values[section.fromKey] = "";
      values[section.toKey] = "";
    } else {
      values[section.key] = section.type === "options" && section.multiple ? [] : "";
    }
  }
  return values;
}

interface ActiveChip {
  id: string;
  label: string;
  /** The values that remove just this chip. */
  without: FilterValues;
}

function shortDate(key: string) {
  return new Date(`${key}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** The day after a yyyy-mm-dd day, so a check-out can't be chosen on or before its check-in. */
function nextDay(key: string) {
  const date = new Date(`${key}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function activeChips(sections: readonly FilterSection[], values: FilterValues): ActiveChip[] {
  const chips: ActiveChip[] = [];
  for (const section of sections) {
    if (section.hidden) continue;
    if (section.type === "range") {
      const min = filterText(values, section.minKey);
      const max = filterText(values, section.maxKey);
      if (!min && !max) continue;
      const prefix = section.prefix ? `${section.prefix} ` : "";
      const label = min && max ? `${prefix}${min} – ${max}` : min ? `From ${prefix}${min}` : `Up to ${prefix}${max}`;
      chips.push({ id: section.minKey, label, without: { [section.minKey]: "", [section.maxKey]: "" } });
    } else if (section.type === "dates") {
      const from = filterText(values, section.fromKey);
      const to = filterText(values, section.toKey);
      if (!from && !to) continue;
      const label = from && to ? `${shortDate(from)} – ${shortDate(to)}` : from ? `From ${shortDate(from)}` : `Until ${shortDate(to)}`;
      chips.push({ id: section.fromKey, label, without: { [section.fromKey]: "", [section.toKey]: "" } });
    } else if (section.type === "count") {
      const count = filterText(values, section.key);
      if (count) chips.push({ id: section.key, label: `${count} ${section.noun}${count === "1" ? "" : "s"}`, without: { [section.key]: "" } });
    } else if (section.type === "text" || section.type === "toggle") {
      const value = filterText(values, section.key);
      if (value) chips.push({ id: section.key, label: section.type === "toggle" ? section.text : value, without: { [section.key]: "" } });
    } else if (section.multiple) {
      const picked = filterList(values, section.key);
      for (const value of picked) {
        const label = section.options.find((option) => option.value === value)?.label ?? value;
        chips.push({ id: `${section.key}:${value}`, label, without: { [section.key]: picked.filter((item) => item !== value) } });
      }
    } else {
      const value = filterText(values, section.key);
      if (value) chips.push({ id: section.key, label: section.options.find((option) => option.value === value)?.label ?? value, without: { [section.key]: "" } });
    }
  }
  return chips;
}

const FIELD = "h-12 min-w-0 rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#0f172a] focus:border-brand-900 focus:outline-none";
const HEADING = "text-[11px] font-semibold uppercase tracking-[0.66px] text-[#94a3b8]";
const CLEAR = "text-[13px] font-semibold text-[#64748b] hover:text-[#0f172a]";
const SELECTED_PILL = "bg-[#eff5ff] font-medium text-brand-900 ring-1 ring-brand-900";

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px]", SELECTED_PILL)}>
      {label}
      <button type="button" aria-label={`Remove ${label}`} onClick={onRemove} className="hover:opacity-70">
        <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

function OptionsSection({ section, values, onChange }: { section: Extract<FilterSection, { type: "options" }>; values: FilterValues; onChange: (next: FilterValues) => void }) {
  const [term, setTerm] = useState("");
  const picked = section.multiple ? filterList(values, section.key) : filterText(values, section.key) ? [filterText(values, section.key)] : [];
  const options = section.options.filter((option) => option.label.toLowerCase().includes(term.trim().toLowerCase()));

  function pick(value: string) {
    if (section.multiple) {
      onChange({ [section.key]: picked.includes(value) ? picked.filter((item) => item !== value) : [...picked, value] });
    } else {
      onChange({ [section.key]: picked.includes(value) ? "" : value });
      setTerm("");
    }
  }

  // A searchable list stays out of the way until something is typed.
  const showList = !section.searchable || term.trim() !== "";

  if (section.display === "chips") {
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={picked.includes(option.value)}
            onClick={() => pick(option.value)}
            className={cn(
              "whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] leading-[18px]",
              picked.includes(option.value) ? SELECTED_PILL : "border border-[#e2e8f0] bg-white font-medium text-[#334155] hover:bg-gray-50",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {section.searchable && (
        <input value={term} onChange={(event) => setTerm(event.target.value)} placeholder={`Search ${section.label.toLowerCase()}`} aria-label={`Search ${section.label}`} className={cn(FIELD, "h-11")} />
      )}
      {showList && (
      <div role={section.multiple ? "group" : "radiogroup"} aria-label={section.label} className="flex max-h-[220px] flex-col gap-0.5 overflow-y-auto">
        {options.map((option) => {
          const checked = picked.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              role={section.multiple ? "checkbox" : "radio"}
              aria-checked={checked}
              onClick={() => pick(option.value)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-left text-sm",
                checked && !section.multiple ? "bg-[#eff5ff] font-semibold text-brand-900" : "font-medium text-[#334155] hover:bg-gray-50",
              )}
            >
              {section.multiple && (
                <span className={cn("relative flex size-[18px] shrink-0 items-center justify-center rounded-[5px]", checked ? "bg-brand-900" : "border-[1.5px] border-[#cbd5e1] bg-white")}>
                  {checked && <BoxIcon name="filter-tick-white" size={14} inset="27.08% 20.83%" bleed="-4.55% -3.57%" />}
                </span>
              )}
              <span className="min-w-0 flex-1">{option.label}</span>
              {checked && !section.multiple && <BoxIcon name="filter-tick" size={16} inset="27.08% 20.83%" bleed="-4.55% -3.57%" />}
            </button>
          );
        })}
        {options.length === 0 && <p className="px-2.5 py-2 text-sm text-gray-500">Nothing matches.</p>}
      </div>
      )}
    </div>
  );
}

function SectionBody({ section, values, onChange }: { section: FilterSection; values: FilterValues; onChange: (next: FilterValues) => void }) {
  if (section.type === "options") return <OptionsSection section={section} values={values} onChange={onChange} />;
  if (section.type === "range") {
    const field = "flex h-12 min-w-0 flex-1 flex-col justify-center rounded-xl border border-gray-200 bg-white px-3 text-[11px] font-medium leading-[14px] text-gray-500 focus-within:border-brand-900";
    const input = "min-w-0 bg-transparent text-sm font-medium leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none";
    return (
      <div className="flex gap-3">
        <label className={field}>
          Min
          <input value={filterText(values, section.minKey)} onChange={(event) => onChange({ [section.minKey]: event.target.value })} inputMode="numeric" placeholder={`${section.prefix ?? ""} 0`.trim()} className={input} />
        </label>
        <label className={field}>
          Max
          <input value={filterText(values, section.maxKey)} onChange={(event) => onChange({ [section.maxKey]: event.target.value })} inputMode="numeric" placeholder="Any" className={input} />
        </label>
      </div>
    );
  }
  if (section.type === "dates") {
    const from = filterText(values, section.fromKey);
    const to = filterText(values, section.toKey);
    const label = "text-[11px] font-medium leading-[14px] text-gray-500";
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <span className={label}>{section.fromLabel ?? "Check in"}</span>
          <DatePickerField value={from} onChange={(next) => onChange({ [section.fromKey]: next, [section.toKey]: to && to <= next ? "" : to })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className={label}>{section.toLabel ?? "Check out"}</span>
          <DatePickerField value={to} min={from ? nextDay(from) : todayKey()} onChange={(next) => onChange({ [section.toKey]: next })} />
        </div>
      </div>
    );
  }
  if (section.type === "count") {
    const min = section.min ?? 1;
    const count = Number(filterText(values, section.key)) || 0;
    const step = "flex size-9 items-center justify-center rounded-full border border-gray-200 bg-white text-lg leading-none text-[#334155] hover:bg-gray-50 disabled:opacity-40";
    return (
      <div className="flex items-center gap-4">
        <button type="button" aria-label={`Fewer ${section.noun}s`} disabled={count === 0} onClick={() => onChange({ [section.key]: count <= min ? "" : String(count - 1) })} className={step}>
          −
        </button>
        <span className="min-w-12 text-center text-sm font-medium text-[#0f172a]">{count === 0 ? "Any" : count}</span>
        <button type="button" aria-label={`More ${section.noun}s`} disabled={section.max !== undefined && count >= section.max} onClick={() => onChange({ [section.key]: String(Math.max(min, count + 1)) })} className={step}>
          +
        </button>
      </div>
    );
  }
  if (section.type === "text") {
    return (
      <input
        value={filterText(values, section.key)}
        onChange={(event) => onChange({ [section.key]: event.target.value })}
        inputMode={section.numeric ? "numeric" : undefined}
        placeholder={section.placeholder}
        aria-label={section.label}
        className={cn(FIELD, "w-full")}
      />
    );
  }
  const on = filterText(values, section.key) === "true";
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange({ [section.key]: on ? "" : "true" })} className="flex items-center gap-2.5 text-sm font-medium text-[#334155]">
      <span className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", on ? "bg-brand-900" : "bg-[#cbd5e1]")}>
        <span className={cn("absolute top-0.5 size-4 rounded-full bg-white transition-all", on ? "left-[18px]" : "left-0.5")} />
      </span>
      {section.text}
    </button>
  );
}

interface FilterPanelProps {
  sections: readonly FilterSection[];
  /** The filters that are applied right now. */
  values: FilterValues;
  /** Called with the full set when Apply is pressed, a chip is removed or everything is cleared. */
  onChange: (next: FilterValues) => void;
  className?: string;
}

/**
 * The filter button, the chips for what is applied, and the panel that edits them: active filters with Clear all,
 * then each section, and an Apply button. Changes only take effect on Apply.
 */
export function FilterPanel({ sections, values, onChange, className }: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterValues>(values);
  const { mounted, closing } = useAnimatedSheet(open);
  const applied = useMemo(() => activeChips(sections, values), [sections, values]);
  const drafted = useMemo(() => activeChips(sections, draft), [sections, draft]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  function openPanel() {
    setDraft(values);
    setOpen(true);
  }

  function apply() {
    onChange(draft);
    setOpen(false);
  }

  const clearDraft = () => setDraft((current) => ({ ...current, ...emptyFilters(sections) }));
  const visible = sections.filter((section) => !section.hidden);

  return (
    <>
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={openPanel}
          className="flex items-center gap-2 rounded-[10px] border border-[#e2e8f0] bg-white py-2.5 pl-3.5 pr-3 text-sm hover:border-[#cbd5e1] hover:bg-[#f8fafc]"
        >
          <BoxIcon name="filter-list" size={18} inset="20.83% 16.67% 16.67%" bleed="-3.33% -3.13% 0" />
          <span className="font-medium text-[#64748b]">Filters</span>
          {applied.length > 0 && <span className="rounded-full bg-brand-900 px-[7px] py-px text-[11px] font-semibold text-white">{applied.length}</span>}
        </button>
        {applied.map((chip) => (
          <Chip key={chip.id} label={chip.label} onRemove={() => onChange({ ...values, ...chip.without })} />
        ))}
        {applied.length > 1 && (
          <button type="button" onClick={() => onChange({ ...values, ...emptyFilters(sections) })} className={CLEAR}>
            Clear all
          </button>
        )}
      </div>

      {mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-end sm:items-stretch sm:justify-end" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="Filters">
            <div aria-hidden className={cn("absolute inset-0 bg-black/50", closing ? "animate-backdrop-out" : "animate-backdrop-in")} />
            <div
              onClick={(event) => event.stopPropagation()}
              className={cn(
                "relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0px_24px_60px_-15px_rgba(0,0,0,0.15)] sm:max-h-none sm:max-w-[400px] sm:rounded-l-2xl sm:rounded-tr-none",
                closing ? "animate-sheet-slide-down sm:animate-panel-out" : "animate-sheet-slide-up sm:animate-panel-in",
              )}
            >
              <div className="mx-auto mt-3 h-[3px] w-[152px] shrink-0 rounded-[20px] bg-[#334154] sm:hidden" />
              <div className="flex items-center justify-between px-6 pb-4 pt-5">
                <h2 className="text-lg font-bold tracking-[-0.54px] text-black sm:font-semibold sm:tracking-[-0.36px] sm:text-[#111826]">Filters</h2>
                <button type="button" aria-label="Close filters" onClick={() => setOpen(false)} className="flex size-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-1 flex-col overflow-y-auto">
                {drafted.length > 0 && (
                  <div className="flex flex-col gap-2.5 border-t border-[#f1f5f9] px-6 py-4">
                    <div className="flex items-center justify-between">
                      <p className={HEADING}>Active filters</p>
                      <button type="button" onClick={clearDraft} className={CLEAR}>
                        Clear all
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {drafted.map((chip) => (
                        <Chip key={chip.id} label={chip.label} onRemove={() => setDraft((current) => ({ ...current, ...chip.without }))} />
                      ))}
                    </div>
                  </div>
                )}

                {visible.map((section) => (
                  <div key={section.label} className="flex flex-col gap-3 border-t border-[#f1f5f9] px-6 py-4">
                    {section.type !== "toggle" && <p className={HEADING}>{section.label}</p>}
                    <SectionBody section={section} values={draft} onChange={(next) => setDraft((current) => ({ ...current, ...next }))} />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[#f1f5f9] px-6 py-4">
                <button type="button" onClick={clearDraft} className={CLEAR}>
                  Clear
                </button>
                <button type="button" onClick={apply} className="rounded-lg bg-brand-900 px-6 py-2.5 text-[13px] font-semibold text-white hover:opacity-90">
                  Apply filters
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
