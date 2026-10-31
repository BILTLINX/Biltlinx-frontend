"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FIELD_BOX, FIELD_INPUT } from "@/components/shared/ModalFormParts";
import { NavIcon } from "@/components/shared/NavIcon";
import { searchPlaces, type PlaceSuggestion } from "@/lib/places";
import { cn } from "@/lib/utils";

const MIN_CHARS = 2;

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  pick?: "label" | "city";
  invalid?: boolean;
  maxLength?: number;
  inputClassName?: string;
  icon?: boolean;
};

export function LocationCombobox({ value, onChange, placeholder, ariaLabel, pick = "label", invalid, maxLength, inputClassName, icon }: Props) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loaded, setLoaded] = useState<{ query: string; items: PlaceSuggestion[]; failed: boolean } | null>(null);
  const query = value.trim();
  const searchable = query.length >= MIN_CHARS;
  const skipNext = useRef(false);

  useEffect(() => {
    if (!searchable) return;
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchPlaces(query, controller.signal)
        .then((items) => setLoaded({ query, items, failed: false }))
        .catch((error) => {
          if (error?.name !== "AbortError") setLoaded({ query, items: [], failed: true });
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, searchable]);

  const ready = loaded?.query === query ? loaded : null;
  const items = ready?.items ?? [];
  const showList = open && searchable && ready !== null;

  function choose(item: PlaceSuggestion) {
    skipNext.current = true;
    onChange(pick === "city" ? item.city : item.label);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList || items.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (current + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (current <= 0 ? items.length - 1 : current - 1));
    } else if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      choose(items[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const input = (
    <input
      role="combobox"
      aria-expanded={showList}
      aria-controls={listId}
      aria-autocomplete="list"
      aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
      aria-label={ariaLabel}
      autoComplete="off"
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(event) => {
        onChange(event.target.value);
        setOpen(true);
        setActive(-1);
      }}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={onKeyDown}
      className={inputClassName ?? FIELD_INPUT}
    />
  );

  return (
    <div className="relative min-w-0 flex-1">
      {icon ? (
        <div className={cn(FIELD_BOX, invalid ? "border-[#dc2626]" : "border-gray-200")}>
          <NavIcon icon="/icons/post-options-location.svg" size={16} className="bg-gray-500" />
          {input}
        </div>
      ) : (
        input
      )}
      {showList && (
        <ul id={listId} role="listbox" className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-auto rounded-[10px] border border-gray-200 bg-white py-1 shadow-lg">
          {items.length === 0 ? (
            <li className="px-3.5 py-2 text-[13px] text-gray-500">{ready?.failed ? "Couldn’t load places. Keep typing your own." : "No matches. Your text will be used as typed."}</li>
          ) : (
            items.map((item, index) => (
              <li
                key={item.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(event) => {
                  event.preventDefault();
                  choose(item);
                }}
                onMouseEnter={() => setActive(index)}
                className={cn("flex cursor-pointer items-center gap-2 px-3.5 py-2 text-[13px] text-[#0f172a]", index === active && "bg-[#eff5ff]")}
              >
                <NavIcon icon="/icons/post-options-location.svg" size={14} className="shrink-0 bg-gray-500" />
                <span className="truncate">{item.label}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
