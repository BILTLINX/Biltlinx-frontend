import { cn } from "@/lib/utils";

export interface KeyFact {
  value: string;
  label: string;
}

// Written out so Tailwind sees the classes. The grid answers to its own width (a container query) rather than the
// screen's, because on a detail page the column it sits in shrinks when the side panel appears beside it.
const COLUMNS: Record<number, string> = {
  4: "grid-cols-2 @[520px]:grid-cols-4",
  5: "grid-cols-2 @[420px]:grid-cols-3 @[640px]:grid-cols-5",
  6: "grid-cols-2 @[420px]:grid-cols-3 @[720px]:grid-cols-6",
};

/** The row of headline facts under a detail page's title (bedrooms, size, handover and so on). */
export function KeyFacts({ facts }: { facts: KeyFact[] }) {
  return (
    <div className="@container w-full">
      <dl
        className={cn(
          "grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200",
          COLUMNS[facts.length] ?? "grid-cols-2 @[420px]:grid-cols-3",
        )}
      >
        {facts.map((fact) => (
          <div key={fact.label} className="flex min-w-0 flex-col gap-0.5 bg-white px-4 py-3">
            <dd className="break-words text-[15px] font-bold leading-[22px] text-[#0f172a]">{fact.value}</dd>
            <dt className="text-xs leading-[17px] text-gray-500">{fact.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
