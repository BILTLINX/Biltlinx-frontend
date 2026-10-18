import Image from "next/image";
import Link from "next/link";

/** Right-rail promo card pointing to the (not-yet-built) concierge flow. */
export function ConciergeCard() {
  return (
    <div className="flex w-full flex-col gap-[15px] rounded-[15px] border border-gray-200 bg-white p-[15px]">
      <div>
        <p className="text-[17px] font-bold text-night-900">Start with a Concierge</p>
        <p className="text-[13px] text-gray-500">
          Concierge turns a need into a plan with real providers and prices. You confirm every step.
        </p>
      </div>

      <div className="relative h-[114px] w-full overflow-hidden rounded-xl">
        <Image src="/images/post-building-01.jpg" alt="" fill className="object-cover" sizes="318px" />
      </div>

      <Link
        href="/concierge/new"
        className="flex h-[38px] w-full items-center justify-center rounded-lg bg-brand-900 text-[13px] font-medium text-white hover:bg-brand-900/90"
      >
        Start with a Concierge
      </Link>
    </div>
  );
}
