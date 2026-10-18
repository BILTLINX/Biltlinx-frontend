import Image from "next/image";
import type { PropertyDetailView } from "@/lib/property-mapper";

/** The photo grid at the top of a property (Figma node 1052:23825): one large photo with up to two stacked beside it. */
export function PropertyGallery({ gallery, title }: { gallery: PropertyDetailView["gallery"]; title: string }) {
  const [first, second] = gallery.side;
  const hasSide = Boolean(first);

  return (
    <div
      className={
        hasSide
          ? "grid h-[240px] grid-cols-[1fr_96px] gap-2 overflow-hidden rounded-2xl sm:h-[320px] sm:grid-cols-[1fr_180px] lg:h-[380px] lg:grid-cols-[1fr_260px]"
          : "grid h-[240px] grid-cols-1 overflow-hidden rounded-2xl sm:h-[320px] lg:h-[380px]"
      }
    >
      <div className="relative">
        <Image src={gallery.main} alt={title} fill priority className="object-cover" sizes="(min-width: 1024px) 70vw, 100vw" />
      </div>
      {hasSide && (
        <div className={second ? "grid grid-rows-2 gap-2" : "grid grid-rows-1"}>
          <div className="relative">
            <Image src={first as string} alt="" fill className="object-cover" sizes="260px" />
            {!second && gallery.moreLabel && (
              <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-white px-2.5 py-1 text-xs font-medium leading-4 text-[#0f172a]">
                {gallery.moreLabel}
              </span>
            )}
          </div>
          {second && (
            <div className="relative">
              <Image src={second} alt="" fill className="object-cover" sizes="260px" />
              {gallery.moreLabel && (
                <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-white px-2.5 py-1 text-xs font-medium leading-4 text-[#0f172a]">
                  {gallery.moreLabel}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
