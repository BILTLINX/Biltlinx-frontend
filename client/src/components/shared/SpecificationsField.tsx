"use client";

import { useState } from "react";
import { OnboardingChip } from "@/components/shared/OnboardingChip";
import type { OfferedService } from "@/lib/dummy-onboarding";

interface SpecificationsFieldProps {
  services: OfferedService[];
  /** The labels of the chosen services. */
  chosen: string[];
  onToggle: (label: string) => void;
  /** Called with a name the person typed, whether or not it is in the list already. */
  onAdd: (name: string) => void;
  /** Shown in red when nothing is chosen and they tried to continue. */
  error?: string;
}

/** "Specifications (pick at least one)": the services to choose from, and a chip to type in another. */
export function SpecificationsField({ services, chosen, onToggle, onAdd, error }: SpecificationsFieldProps) {
  const [newService, setNewService] = useState<string | null>(null);

  function commit() {
    const name = (newService ?? "").trim();
    setNewService(null);
    if (name) onAdd(name);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] font-medium leading-[1.45] text-[#334155]">Specifications (pick at least one)</p>
      <div role="group" aria-label="Specifications" className="flex flex-wrap gap-2">
        {services.map((service) => (
          <OnboardingChip key={service.label} label={service.label} selected={chosen.includes(service.label)} onClick={() => onToggle(service.label)} />
        ))}
        {newService === null ? (
          <button type="button" onClick={() => setNewService("")} className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-[13px] font-medium leading-[1.45] text-[#334155] hover:border-gray-300">
            + Add a service
          </button>
        ) : (
          <input
            autoFocus
            value={newService}
            maxLength={50}
            aria-label="New service"
            placeholder="Service name"
            onChange={(event) => setNewService(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") commit();
              if (event.key === "Escape") setNewService(null);
            }}
            className="w-44 rounded-full border border-brand-900 bg-white px-3.5 py-2 text-[13px] leading-[1.45] text-[#0f172a] focus:outline-none"
          />
        )}
      </div>
      {error && <p className="text-xs text-[#dc2626]">{error}</p>}
    </div>
  );
}
