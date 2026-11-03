"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SearchSelectProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Names the field for screen readers, and the thing that has no match, such as "profession". */
  noun: string;
  icon: ReactNode;
}

/** The search box that picks one option from a list as you type. */
export function SearchSelect({ options, value, onChange, placeholder, noun, icon }: SearchSelectProps) {
  const listId = useId();
  const root = useRef<HTMLDivElement | null>(null);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const matches = options.filter((option) => option.toLowerCase().includes(text.trim().toLowerCase()));

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div ref={root} className="relative">
      <div className={cn("flex h-12 items-center gap-2 rounded-2xl border bg-white px-3 py-2.5", open ? "border-brand-900" : "border-gray-200")}>
        {icon}
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={noun}
          value={open ? text : value}
          placeholder={placeholder}
          onFocus={() => {
            setText("");
            setOpen(true);
          }}
          onChange={(event) => {
            setText(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-[#0f172a] placeholder:text-[#53575a] focus:outline-none"
        />
      </div>
      {open && (
        <ul id={listId} role="listbox" className="absolute inset-x-0 top-[calc(100%+4px)] z-20 flex max-h-64 flex-col overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)]">
          {matches.length === 0 && <li className="px-3 py-2.5 text-sm text-gray-500">No {noun} matches “{text.trim()}”.</li>}
          {matches.map((option) => (
            <li key={option} role="option" aria-selected={option === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={cn("w-full rounded-xl px-3 py-2.5 text-left text-sm", option === value ? "bg-[#eff5ff] font-semibold text-brand-900" : "font-medium text-[#334155] hover:bg-gray-50")}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
