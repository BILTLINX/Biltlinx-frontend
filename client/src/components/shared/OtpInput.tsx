"use client";

import { Fragment, useRef } from "react";
import { cn } from "@/lib/utils";

const LENGTH = 4;

interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: boolean;
}

export function OtpInput({ value, onChange, error }: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  function handleChange(index: number, digit: string) {
    const nextDigit = digit.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[index] = nextDigit;
    onChange(next);

    if (nextDigit && index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(index: number, event: React.ClipboardEvent<HTMLInputElement>) {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;
    event.preventDefault();
    const next = [...value];
    const filled = digits.slice(0, LENGTH - index);
    for (let i = 0; i < filled.length; i++) next[index + i] = filled[i];
    onChange(next);
    inputRefs.current[Math.min(index + filled.length, LENGTH - 1)]?.focus();
  }

  function handleSelectExisting(event: { currentTarget: HTMLInputElement }) {
    // Select any existing digit so typing (or tapping on mobile) immediately
    // replaces it instead of being blocked by maxLength once the box is full.
    event.currentTarget.select();
  }

  return (
    <div className="flex w-full items-center gap-3" role="group" aria-label="One-time passcode">
      {Array.from({ length: LENGTH }).map((_, index) => (
        <Fragment key={index}>
          <input
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            value={value[index] ?? ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={(e) => handlePaste(index, e)}
            onFocus={handleSelectExisting}
            onClick={handleSelectExisting}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${index + 1}`}
            aria-invalid={error}
            className={cn(
              "h-12 min-w-0 flex-1 rounded-[20px] bg-surface-button text-center text-base text-ink focus:outline-none focus:ring-2 focus:ring-brand-900 dark:bg-night-800 dark:text-white lg:rounded-xl",
              error && "ring-2 ring-[#e73d1c] focus:ring-[#e73d1c]",
            )}
          />
          {index < LENGTH - 1 && (
            <span className="shrink-0 text-3xl text-muted-400 dark:text-night-700">-</span>
          )}
        </Fragment>
      ))}
    </div>
  );
}
