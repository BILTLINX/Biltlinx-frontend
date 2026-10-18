"use client";

import { ProfessionalTabs } from "@/components/shared/ManageTabs";
import { ServicesView } from "@/components/shared/ServicesView";
import { PROFESSIONAL_CREDENTIALS, PROFESSIONAL_PORTFOLIO, PROFESSIONAL_SERVICES } from "@/lib/dummy-manage";

/** Manage · Professional · Services & portfolio (Figma node 1083:35425). */
export default function ProfessionalServicesPage() {
  return <ServicesView role="Professional" tabs={<ProfessionalTabs active="services" />} services={PROFESSIONAL_SERVICES} portfolio={PROFESSIONAL_PORTFOLIO} credentials={PROFESSIONAL_CREDENTIALS} />;
}

