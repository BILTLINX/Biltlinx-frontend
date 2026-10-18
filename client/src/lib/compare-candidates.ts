import type { CompareItem, CompareKind } from "@/context/CompareContext";
import { ARTISANS } from "@/lib/dummy-artisans";
import { PROFESSIONALS } from "@/lib/dummy-professionals";
import { PROJECTS } from "@/lib/dummy-projects";
import { PROPERTY_LISTINGS } from "@/lib/dummy-properties";
import { STAY_LISTINGS } from "@/lib/dummy-stays";
import type { ProviderCardData } from "@/types/provider";
import type { ListingCardData } from "@/types/listing";

function fromListing(kind: CompareKind, listing: ListingCardData): CompareItem {
  return {
    id: listing.id,
    kind,
    title: listing.title,
    price: listing.priceUnit ? `${listing.price} / ${listing.priceUnit}` : listing.price,
    subtitle: listing.location,
    image: listing.image,
    href: listing.href,
  };
}

function fromProvider(kind: CompareKind, provider: ProviderCardData): CompareItem {
  return {
    id: provider.id,
    kind,
    title: provider.name,
    price: provider.pricing.headline,
    subtitle: `${provider.role} · ${provider.location}`,
    image: provider.avatar,
    href: provider.profileHref,
  };
}

/** Other things of the same kind that can be added to the compare tray; stand-ins until the listings API exists. */
export function getCompareCandidates(kind: CompareKind): CompareItem[] {
  switch (kind) {
    case "home":
      return PROPERTY_LISTINGS.map((listing) => fromListing("home", listing));
    case "stay":
      return STAY_LISTINGS.map((listing) => fromListing("stay", listing));
    case "project":
      return PROJECTS.map((project) => ({
        id: project.id,
        kind: "project" as const,
        title: project.name,
        price: project.priceFrom,
        subtitle: `${project.area} · ${project.developer}`,
        image: project.image,
        href: `/projects/${project.id}`,
      }));
    case "professional":
      return PROFESSIONALS.map((professional) => fromProvider("professional", professional));
    case "artisan":
      return ARTISANS.map((artisan) => fromProvider("artisan", artisan));
  }
}
