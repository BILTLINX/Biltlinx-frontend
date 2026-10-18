import Image from "next/image";
import type { PropertyDetail } from "@/lib/dummy-property-detail";

/** The photo grid at the top of a property (Figma node 1052:23825): one large photo with two stacked beside it. */
export function PropertyGallery({ gallery, title }: { gallery: PropertyDetail["gallery"]; title: string }) {
  return (
    <div className="grid h-[240px] grid-cols-[1fr_96px] gap-2 overflow-hidden rounded-2xl sm:h-[320px] sm:grid-cols-[1fr_180px] lg:h-[380px] lg:grid-cols-[1fr_260px]">
      <div className="relative">
        <Image src={gallery.main} alt={title} fill priority className="object-cover" sizes="(min-width: 1024px) 70vw, 100vw" />
      </div>
      <div className="grid grid-rows-2 gap-2">
        <div className="relative">
          <Image src={gallery.side[0]} alt="" fill className="object-cover" sizes="260px" />
        </div>
        <div className="relative">
          <Image src={gallery.side[1]} alt="" fill className="object-cover" sizes="260px" />
          <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-white px-2.5 py-1 text-xs font-medium leading-4 text-[#0f172a]">
            {gallery.moreLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
