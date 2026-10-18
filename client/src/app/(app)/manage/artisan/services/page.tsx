"use client";

import { ArtisanTabs } from "@/components/shared/ManageTabs";
import { ServicesView } from "@/components/shared/ServicesView";
import { ARTISAN_CREDENTIALS, ARTISAN_PORTFOLIO, ARTISAN_SERVICES } from "@/lib/dummy-manage";

/** Manage · Artisan · Services & portfolio (Figma node 1082:34009). */
export default function ArtisanServicesPage() {
  return <ServicesView role="Artisan" tabs={<ArtisanTabs active="services" />} services={ARTISAN_SERVICES} portfolio={ARTISAN_PORTFOLIO} credentials={ARTISAN_CREDENTIALS} />;
}
