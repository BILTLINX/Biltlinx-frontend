"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EMPTY_JOB_DETAILS, JobDetailsForm, jobDetailsRows, validateJobDetails, type JobDetails, type JobDetailsErrors } from "@/components/shared/JobDetailsForm";
import { FormField, ReviewList, SummaryRow, SwitchStrip } from "@/components/shared/ModalFormParts";
import { RequestSentDialog } from "@/components/shared/RequestSentDialog";
import { formatDateKey } from "@/components/shared/ViewingSlotPickers";
import { WizardDialog } from "@/components/shared/WizardDialog";
import type { ProfessionalProfile } from "@/lib/dummy-professional-profile";
import type { ServiceDetail } from "@/lib/dummy-service-detail";
import type { ProviderCardData } from "@/types/provider";
import { cn } from "@/lib/utils";

const STEPS = ["1. Service", "2. Job details", "3. Review & send"];
const HINTS = [
  "Step 1 of 3 · pick what you need quoted",
  "Step 2 of 3 · no charge until you accept a quote",
  "Step 3 of 3 · no charge until you accept a quote",
];

export interface QuoteOption {
  id: string;
  label: string;
  /** Fixed price in GHS, or null when the provider has to quote. */
  price: number | null;
}

export interface QuoteService {
  title: string;
  image: string;
  /** Who will quote, e.g. "Ama Boatengmaa". */
  providerName: string;
  options: QuoteOption[];
  /** Option to start on; the first one when omitted. */
  initialOptionId?: string;
}

/** A service page's own options, starting on the one the visitor has chosen there. */
export function quoteServiceFromDetail(detail: ServiceDetail, optionId?: string): QuoteService {
  return {
    title: detail.service.title,
    image: detail.service.image,
    providerName: detail.providerName.split(" · ")[0],
    options: detail.options,
    initialOptionId: optionId,
  };
}

/** A professional's profile: their listed services are the options to quote. */
export function quoteServiceFromProfile(profile: ProfessionalProfile): QuoteService {
  return {
    title: `Work with ${profile.professional.name}`,
    image: profile.cover,
    providerName: profile.professional.name,
    options: profile.services.map((service) => {
      const amount = Number(service.price.replace(/[^\d]/g, ""));
      return { id: service.id, label: service.title, price: amount > 0 ? amount : null };
    }),
  };
}

/** A professional or artisan card, which lists one headline price rather than separate services. */
export function quoteServiceFromProvider(provider: ProviderCardData): QuoteService {
  const amount = Number(provider.pricing.headline.replace(/[^\d]/g, ""));
  return {
    title: `Work with ${provider.name}`,
    image: provider.avatar,
    providerName: provider.name,
    options: [{ id: "standard", label: `${provider.role.split(" · ")[0]} services`, price: amount > 0 ? amount : null }],
  };
}

function priceNote(option: QuoteOption) {
  return option.price === null ? "quote required" : `from GHS ${option.price.toLocaleString("en-US")}`;
}

/**
 * "Request a quote" flow: 1 Service, 2 Job details (Figma nodes 1053:24788, 1053:24803, 1053:24888) and 3 Review & send
 * (designed to match), then a "sent" dialog. Every step shows the service being quoted.
 */
export function RequestQuoteModal({ open, onClose, service }: { open: boolean; onClose: () => void; service: QuoteService }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [sent, setSent] = useState(false);
  const [optionId, setOptionId] = useState(service.initialOptionId ?? service.options[0].id);
  const [details, setDetails] = useState<JobDetails>(EMPTY_JOB_DETAILS);
  const [alsoSimilar, setAlsoSimilar] = useState(false);
  const [errors, setErrors] = useState<JobDetailsErrors>({});

  const option = service.options.find((candidate) => candidate.id === optionId) ?? service.options[0];
  const firstName = service.providerName.split(" ")[0];
  const summary = (
    <SummaryRow
      image={service.image}
      title={service.title}
      subtitle={step === 1 ? `${service.providerName} · ${service.options.length} options` : `${service.providerName} · ${option.label} · ${priceNote(option)}`}
    />
  );

  function close() {
    setStep(1);
    setSent(false);
    setDetails(EMPTY_JOB_DETAILS);
    setAlsoSimilar(false);
    setErrors({});
    onClose();
  }

  function back() {
    setErrors({});
    if (step === 1) close();
    else setStep(step - 1);
  }

  function next() {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const found = validateJobDetails(details);
      setErrors(found);
      if (!found.location && !found.neededBy) setStep(3);
    } else {
      setSent(true);
    }
  }

  const similarToggle = (
    <SwitchStrip label="Also send to up to 2 similar providers so you can compare quotes" checked={alsoSimilar} onToggle={() => setAlsoSimilar((value) => !value)} />
  );

  return (
    <>
      <WizardDialog
        open={open && !sent}
        onClose={close}
        title="Request a quote"
        subtitle="Describe the job once. You get an itemised quote in GHS to accept, ask about or decline."
        steps={STEPS}
        current={step}
        hint={HINTS[step - 1]}
        backLabel={step === 1 ? "Cancel" : "Back"}
        nextLabel={step === 3 ? "Send request" : "Continue"}
        onBack={back}
        onNext={next}
      >
        {summary}

        {step === 1 && (
          <FormField label="What do you need quoted?">
            <div role="radiogroup" aria-label="Service option" className="flex flex-col gap-2">
              {service.options.map((candidate) => {
                const selected = candidate.id === optionId;
                return (
                  <button
                    key={candidate.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setOptionId(candidate.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left",
                      selected ? "border-brand-900 bg-[#eff5ff]" : "border-gray-200 hover:bg-gray-50",
                    )}
                  >
                    <span className={cn("flex size-[18px] shrink-0 items-center justify-center rounded-full border", selected ? "border-brand-900" : "border-[#cbd5e1]")}>
                      {selected && <span className="size-2.5 rounded-full bg-brand-900" />}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium leading-5 text-[#0f172a]">{candidate.label}</span>
                    <span className="shrink-0 whitespace-nowrap text-sm font-bold leading-5 text-[#0f172a]">
                      {candidate.price === null ? "Quote required" : `GHS ${candidate.price.toLocaleString("en-US")}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </FormField>
        )}

        {step === 2 && <JobDetailsForm value={details} onChange={setDetails} errors={errors} footer={similarToggle} />}

        {step === 3 && (
          <>
            <ReviewList rows={[{ label: "Service", value: option.label }, ...jobDetailsRows(details)]} />
            {similarToggle}
          </>
        )}
      </WizardDialog>

      <RequestSentDialog
        open={open && sent}
        onClose={close}
        title="Quote requested"
        message={`${firstName} usually replies within a day with an itemised quote in GHS. You can accept it, ask about it or decline.`}
        rows={[
          { label: "Service", value: service.title },
          { label: "Needed by", value: details.neededBy ? formatDateKey(details.neededBy) : "" },
          { label: "Sent to", value: alsoSimilar ? `${firstName} + 2 similar providers` : firstName },
          { label: "Status", value: "Waiting for quote" },
        ]}
        secondary={{ label: "Done", onClick: close }}
        primary={{ label: `Message ${firstName}`, onClick: () => router.push("/messages") }}
      />
    </>
  );
}
