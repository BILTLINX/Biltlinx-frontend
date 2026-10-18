"use client";

import { useRouter } from "next/navigation";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";

const FIELDS = [
  { label: "Where", value: "Accra, Ghana", icon: "/icons/post-options-location.svg" },
  { label: "Check in", value: "Fri 24 Oct", icon: "/icons/calendar-03.svg" },
  { label: "Check out", value: "Sun 26 Oct", icon: "/icons/calendar-03.svg" },
  { label: "Guests", value: "2 adults", icon: "/icons/user-circle.svg" },
];

/** Where / dates / guests search (Figma node 1042:21062). The values are fixed until the stays search exists. */
export function StaySearchBar() {
  const router = useRouter();
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-gray-200 bg-white p-2 lg:flex lg:items-center">
      {FIELDS.map((field) => (
        <button
          key={field.label}
          type="button"
          onClick={comingSoon(`${field.label} selection`)}
          className="flex min-w-0 flex-col items-start gap-0.5 rounded-xl px-4 py-2 text-left hover:bg-gray-50 lg:flex-1"
        >
          <span className="text-[11px] font-medium leading-[14px] text-gray-500">{field.label}</span>
          <span className="flex w-full items-center gap-2 text-sm font-medium leading-5 text-[#0f172a]">
            <NavIcon icon={field.icon} size={14} className="bg-[#0f172a]" />
            <span className="truncate">{field.value}</span>
          </span>
        </button>
      ))}
      <Button
        variant="primary"
        onClick={comingSoon("Stay search")}
        className="col-span-2 h-12 rounded-[10px] px-4 lg:w-auto lg:rounded-[10px] lg:px-5"
      >
        Search
      </Button>
    </div>
  );
}
