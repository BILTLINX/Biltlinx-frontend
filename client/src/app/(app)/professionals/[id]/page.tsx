"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { ProfessionalActionPanel } from "@/components/shared/ProfessionalActionPanel";
import { ProfessionalProfileContent } from "@/components/shared/ProfessionalProfileContent";
import { getProfessionalProfile } from "@/lib/dummy-professional-profile";

export default function ProfessionalProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const profile = getProfessionalProfile(id);

  return (
    <AppShell activeKey="people" activeChildKey="professionals" contentFullWidth>
      <PageContainer>
        {profile ? (
          <>
            <Breadcrumbs crumbs={profile.breadcrumbs} />
            <div className="relative h-[120px] w-full overflow-hidden rounded-2xl bg-[#eef2ff] sm:h-[200px]">
              <Image src={profile.cover} alt="" fill priority className="object-cover" sizes="(min-width: 1280px) 1100px, 100vw" />
            </div>
            <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
              <ProfessionalProfileContent profile={profile} />
              <ProfessionalActionPanel profile={profile} />
            </div>
          </>
        ) : (
          <>
            <Link href="/professionals" className="self-start text-sm font-medium text-brand-900">
              ‹ Back to professionals
            </Link>
            <p className="text-sm text-gray-500">This profile is no longer available.</p>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
