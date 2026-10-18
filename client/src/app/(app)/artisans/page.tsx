"use client";

import { ArtisansRail } from "@/components/shared/ArtisansRail";
import { ProviderDirectory } from "@/components/shared/ProviderDirectory";

export default function ArtisansPage() {
  return (
    <ProviderDirectory
      kind="artisan"
      title="Artisans"
      subtitle="Electricians, plumbers, masons and other skilled trades near you."
      searchPlaceholder="Search by name, trade or service"
      activeChildKey="artisans"
      rightRail={<ArtisansRail />}
    />
  );
}
