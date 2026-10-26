"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { showErrorToast } from "@/components/shared/AppToast";
import { PROMPT_EXAMPLE, PROMPT_STARTERS } from "@/lib/dummy-concierge";

/** The "What do you need done?" prompt (Figma node 1044:22432): a free-text request plus one-tap starters. */
export function ConciergeHero() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  function startPlan(event: FormEvent) {
    event.preventDefault();
    if (!prompt.trim()) {
      showErrorToast("Tell Concierge what you need first");
      return;
    }
    router.push(`/concierge/new?q=${encodeURIComponent(prompt.trim())}`);
  }

  return (
    <section className="flex flex-col gap-4 rounded-[20px] bg-brand-900 p-5 sm:p-8">
      <h1 className="text-2xl font-bold leading-9 text-white sm:text-[28px]">What do you need done?</h1>
      <p className="text-sm leading-5 text-[#dbeafe]">
        Describe it in your own words. Concierge turns it into a step-by-step plan with real providers and prices from
        Biltlinx. Nothing is booked or paid until you confirm.
      </p>

      <form onSubmit={startPlan} className="flex h-14 items-center gap-2.5 rounded-[14px] bg-white pl-4 pr-2">
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={PROMPT_EXAMPLE}
          aria-label="What do you need done?"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
        />
        <button
          type="submit"
          className="h-11 shrink-0 whitespace-nowrap rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white hover:bg-brand-900/90"
        >
          Start plan
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {PROMPT_STARTERS.map((starter) => (
          <button
            key={starter}
            type="button"
            onClick={() => setPrompt(starter)}
            className="whitespace-nowrap rounded-full bg-white px-3.5 py-2 text-[13px] font-medium leading-[19px] text-brand-900 hover:bg-[#eff5ff]"
          >
            {starter}
          </button>
        ))}
      </div>
    </section>
  );
}
