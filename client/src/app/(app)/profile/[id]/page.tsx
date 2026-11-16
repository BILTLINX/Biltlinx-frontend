"use client";

import { use } from "react";
import { ProfileView } from "@/components/shared/ProfileView";

export default function ProfilePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ provider?: string }> }) {
  const { id } = use(params);
  const { provider } = use(searchParams);
  return <ProfileView id={id} providerId={provider} />;
}
