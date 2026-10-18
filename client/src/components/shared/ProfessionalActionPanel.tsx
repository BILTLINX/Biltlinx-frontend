"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import type { ProfessionalProfile } from "@/lib/dummy-professional-profile";
import { DetailAside } from "@/components/shared/DetailAside";
import { RequestConsultationModal, consultationProviderFrom } from "@/components/shared/RequestConsultationModal";
import { RequestQuoteModal, quoteServiceFromProfile } from "@/components/shared/RequestQuoteModal";

const CARD = "flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-4";
const ROUNDED = "rounded-[10px] lg:rounded-[10px]";

/** The right column of a professional's profile (Figma node 1052:24177): price and contact actions, availability and the practice's details. */
export function ProfessionalActionPanel({ profile }: { profile: ProfessionalProfile }) {
  const router = useRouter();
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const { professional, availability, contact } = profile;
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  return (
    <DetailAside className="xl:w-[360px]">
      <section className={`${CARD} gap-3.5 p-5`}>
        <p className="text-[22px] font-bold leading-[30px] text-[#0f172a]">{professional.pricing.headline}</p>
        <p className="text-xs leading-[17px] text-gray-500">
          {professional.pricing.note.replace("/", "per")} · final price in your quote
        </p>
        <Button variant="primary" onClick={() => setConsultationOpen(true)} className={`h-12 ${ROUNDED}`}>
          Request consultation
        </Button>
        <Button variant="outline" onClick={() => setQuoteOpen(true)} className={`h-11 ${ROUNDED}`}>
          Request quote
        </Button>
        <button
          type="button"
          onClick={() => router.push("/messages")}
          className="h-10 w-full rounded-[10px] bg-[#eff5ff] px-4 text-sm font-medium text-brand-900 hover:bg-[#e2edff]"
        >
          Message
        </button>
      </section>

      <section className={CARD}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Availability</h2>
        <span className="self-start rounded-full bg-[#dcfce7] px-2.5 py-1 text-[11px] font-medium leading-4 text-[#16a34a]">
          {availability.status}
        </span>
        <p className="text-xs leading-[17px] text-gray-500">{availability.note}</p>
      </section>

      <section className={CARD}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">{contact.firm}</h2>
        <p className="text-xs leading-[17px] text-gray-500">{contact.address}</p>
        <p className="text-xs leading-[17px] text-gray-500">{contact.phoneNote}</p>
        <button type="button" onClick={comingSoon("Report profile")} className="self-start text-[13px] font-medium leading-[19px] text-[#dc2626]">
          Report profile
        </button>
      </section>
      <RequestConsultationModal
        open={consultationOpen}
        onClose={() => setConsultationOpen(false)}
        provider={consultationProviderFrom(professional)}
      />
      {quoteOpen && <RequestQuoteModal open onClose={() => setQuoteOpen(false)} service={quoteServiceFromProfile(profile)} />}
    </DetailAside>
  );
}
