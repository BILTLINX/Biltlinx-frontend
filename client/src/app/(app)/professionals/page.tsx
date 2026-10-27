"use client";

import { ProfessionalsRail } from "@/components/shared/ProfessionalsRail";
import { ProviderDirectory } from "@/components/shared/ProviderDirectory";

export default function ProfessionalsPage() {
  return (
    <ProviderDirectory
      kind="professional"
      title="Professionals"
      subtitle="Architects, surveyors, engineers, lawyers and agents for your property and build."
      activeChildKey="professionals"
      rightRail={<ProfessionalsRail />}
    />
  );
}
