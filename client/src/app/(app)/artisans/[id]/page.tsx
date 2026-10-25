"use client";

import { use } from "react";
import { ProviderProfile } from "@/components/shared/ProviderProfile";

export default function ArtisanProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProviderProfile id={id} kind="artisan" />;
}
