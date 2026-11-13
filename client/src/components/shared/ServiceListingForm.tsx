"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRef, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/components/shared/AppToast";
import { ListingFormLayout, ListingPreview, PreviewToggle, WizardNav } from "@/components/shared/ListingFormLayout";
import { FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { SelectField } from "@/components/shared/SelectField";
import { ListingDocumentsField } from "@/components/shared/ListingDocumentsField";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { SERVICES_KEY, useTaxonomy } from "@/hooks/useServices";
import { errorMessage, notifyError } from "@/lib/errors";
import { formatPrice } from "@/lib/format";
import { createOffering, offeringAction, updateOffering } from "@/lib/services-api";
import { uploadMedia } from "@/lib/upload";
import { classificationOptions, submitListingDocuments, type PendingDocument } from "@/lib/verification-api";
import type { OfferingDto } from "@/types/api/schema";
import { cn } from "@/lib/utils";

const SERVICE_STEPS = ["Basics", "Pricing", "Areas, photos and proof"];
const SERVICE_MODES = [
  { value: "FixedPrice", label: "Fixed price (customers book a date)" },
  { value: "QuoteRequired", label: "Quote required" },
  { value: "InspectionFirst", label: "Inspection first" },
] as const;
/** The button a customer sees on the card for each way of selling. */
const MODE_CTA: Record<string, string> = { FixedPrice: "Book", QuoteRequired: "Request a quote", InspectionFirst: "Request an inspection" };
/** Shown on the preview card until a photo is added. */
const PLACEHOLDER_IMAGE = "/images/marketplace-equipment.jpg";
const UNITS = ["PerJob", "PerHour", "PerDay", "PerSqm", "PerUnit"] as const;
const TEXTAREA = "resize-none rounded-[10px] border border-gray-200 px-3.5 py-2 text-sm leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none";

const num = (value: string) => (value.trim() === "" ? null : Number(value.replace(/,/g, "")));
const list = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

interface ServiceListingFormProps {
  /** The service being changed; omit to create one. */
  offering: OfferingDto | null;
  onClose: () => void;
}

/** Create or edit a service listing. Saving keeps it as a draft; "Save and publish" also asks to take it live. */
export function ServiceListingForm({ offering, onClose }: ServiceListingFormProps) {
  const queryClient = useQueryClient();
  const taxonomy = useTaxonomy();
  const categories = [...(taxonomy.data?.professions ?? []), ...(taxonomy.data?.trades ?? [])];
  const [form, setForm] = useState({
    title: offering?.title ?? "",
    description: offering?.description ?? "",
    category: offering?.category ?? "",
    mode: offering?.mode ?? "QuoteRequired",
    price: offering?.price?.toString() ?? "",
    unit: offering?.priceUnit ?? "PerJob",
    perDay: offering?.maxBookingsPerDay?.toString() ?? "",
    terms: offering?.terms ?? "",
    areas: (offering?.serviceAreas ?? []).join(", "),
  });
  const set = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));
  const [photos, setPhotos] = useState<{ path: string; contentType: string; name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(0);
  const [documents, setDocuments] = useState<PendingDocument[]>([]);
  const [previewing, setPreviewing] = useState(false);
  const photoInput = useRef<HTMLInputElement | null>(null);
  const existingPhotos = (offering?.media ?? []).map((item) => item.url).filter((url): url is string => Boolean(url));

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const media = await uploadMedia(file, { allowVideo: false });
        setPhotos((current) => [...current, { path: media.path, contentType: media.contentType, name: media.name ?? file.name, url: media.publicUrl }]);
      } catch (error) {
        notifyError(error, `${file.name} could not be uploaded.`);
      }
    }
    setUploading(false);
  }

  /** The certificate is reviewed against the provider's profile. A failure here never undoes the save. */
  async function sendDocuments() {
    if (documents.length === 0) return;
    try {
      await submitListingDocuments({ type: "Professional", title: form.title.trim() || "Service", documents });
      setDocuments([]);
    } catch (error) {
      notifyError(error, "The service was saved, but its certificate could not be sent. You can add it from Verification.");
    }
  }

  const save = useMutation({
    mutationFn: async (publish: boolean) => {
      const body = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        mode: form.mode,
        price: num(form.price),
        currency: "GHS",
        priceUnit: form.price.trim() ? form.unit : null,
        maxBookingsPerDay: form.mode === "FixedPrice" ? num(form.perDay) : null,
        terms: form.terms.trim() || null,
        serviceAreas: list(form.areas),
        media: photos.length > 0 ? photos.map(({ path, contentType, name }) => ({ path, contentType, name, stage: "Work", caption: null })) : null,
      };
      const id = offering ? offering.id : await createOffering(body);
      if (offering) await updateOffering(offering.id, body);
      await sendDocuments();
      if (!publish) return { published: false as const };
      try {
        await offeringAction(id, "publish");
        return { published: true as const };
      } catch (error) {
        return { published: false as const, publishError: errorMessage(error) };
      }
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
      if (result.published) showSuccessToast("Your service is live");
      else if ("publishError" in result) showErrorToast(`Saved as a draft, but it could not be published yet: ${result.publishError}`);
      else showSuccessToast("Saved as a draft. Publish it when you are ready.");
      onClose();
    },
    onError: (error) => notifyError(error, "The service could not be saved."),
  });

  const canSave = form.title.trim() !== "" && form.category !== "";
  const cover = photos[0]?.url ?? existingPhotos[0];
  const amount = num(form.price);
  const previewCard = {
    id: offering?.id ?? "preview",
    kind: form.category || "Service",
    image: cover ?? PLACEHOLDER_IMAGE,
    price: amount !== null && Number.isFinite(amount) ? formatPrice(amount, "GHS", form.unit) : "Price on request",
    title: form.title.trim() || "Your service",
    location: list(form.areas).join(", ") || "Ghana",
    cta: MODE_CTA[form.mode] ?? "View",
  };

  const footer = (
    <WizardNav step={step} onBack={() => setStep((current) => current - 1)}>
      {step < SERVICE_STEPS.length - 1 ? (
        <Button variant="primary" onClick={() => setStep((current) => current + 1)} disabled={step === 0 && !canSave} className="h-11 flex-1 rounded-[10px] lg:rounded-[10px]">
          Next
        </Button>
      ) : (
        <>
          <Button variant="outline" onClick={() => save.mutate(false)} disabled={!canSave || save.isPending || uploading} className="h-11 flex-1 rounded-[10px] lg:rounded-[10px]">
            Save as draft
          </Button>
          <Button variant="primary" onClick={() => save.mutate(true)} disabled={!canSave || save.isPending || uploading} className="h-11 flex-1 rounded-[10px] lg:rounded-[10px]">
            {save.isPending ? "Saving…" : "Save and publish"}
          </Button>
        </>
      )}
    </WizardNav>
  );

  return (
    <ListingFormLayout
      titleId="listing-dialog-title"
      title={offering ? "Edit service" : "List a service"}
      subtitle="Set your price and what is included so people can book or request a quote."
      onClose={onClose}
      steps={SERVICE_STEPS}
      step={step}
      headerAction={<PreviewToggle previewing={previewing} onToggle={() => setPreviewing((current) => !current)} />}
      footer={footer}
    >
      {previewing && <ListingPreview listing={previewCard} note={cover ? undefined : "Add a photo of your work. The picture shown here is only a stand-in."} />}
      {!previewing && step === 0 && (
        <>
      <FormField label="Service title">
        <label className={cn(FIELD_BOX, "border-gray-200")}>
          <input value={form.title} onChange={(event) => set({ title: event.target.value })} placeholder="e.g. Interior painting" className={FIELD_INPUT} />
        </label>
      </FormField>
      <FormField label="What is included">
        <textarea value={form.description} onChange={(event) => set({ description: event.target.value })} rows={2} placeholder="Describe the work, materials and timelines" className={TEXTAREA} />
      </FormField>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Category">
          <SelectField value={form.category} onChange={(value) => set({ category: value })} aria-label="Category" placeholder="Choose a category" options={categories.map((item) => ({ value: item, label: item }))} />
        </FormField>
        <FormField label="How it sells">
          <SelectField value={form.mode} onChange={(value) => set({ mode: value })} aria-label="How it sells" options={SERVICE_MODES} />
        </FormField>
      </div>
        </>
      )}
      {!previewing && step === 1 && (
        <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Price in GHS (optional)">
          <label className={cn(FIELD_BOX, "border-gray-200")}>
            <input value={form.price} onChange={(event) => set({ price: event.target.value.replace(/[^\d.,]/g, "") })} inputMode="decimal" className={FIELD_INPUT} />
          </label>
        </FormField>
        <FormField label="Price unit">
          <SelectField value={form.unit} onChange={(value) => set({ unit: value })} aria-label="Price unit" options={UNITS.map((unit) => ({ value: unit, label: unit }))} />
        </FormField>
        {form.mode === "FixedPrice" && (
          <FormField label="Max bookings per day">
            <label className={cn(FIELD_BOX, "border-gray-200")}>
              <input value={form.perDay} onChange={(event) => set({ perDay: event.target.value.replace(/\D/g, "") })} inputMode="numeric" className={FIELD_INPUT} />
            </label>
          </FormField>
        )}
      </div>
      <FormField label="Terms (optional)">
        <textarea value={form.terms} onChange={(event) => set({ terms: event.target.value })} rows={2} className={TEXTAREA} />
      </FormField>
        </>
      )}
      {!previewing && step === 2 && (
        <>
      <FormField label="Areas you serve (comma separated)">
        <label className={cn(FIELD_BOX, "border-gray-200")}>
          <input value={form.areas} onChange={(event) => set({ areas: event.target.value })} placeholder="e.g. Accra, Tema, Kumasi" className={FIELD_INPUT} />
        </label>
      </FormField>
      <FormField label="Photos of your work">
        <input
          ref={photoInput}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            void addPhotos(event.target.files);
            event.target.value = "";
          }}
        />
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto">
          <button
            type="button"
            disabled={uploading}
            onClick={() => photoInput.current?.click()}
            className="flex h-[84px] w-[112px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-[10px] border border-dashed border-[#cbd5e1] text-gray-500 hover:bg-gray-50 disabled:opacity-60"
          >
            <span className="text-xl font-medium leading-6">+</span>
            <span className="text-xs font-medium leading-[17px]">{uploading ? "Uploading…" : "Add photos"}</span>
          </button>
          {(photos.length > 0 ? photos.map((photo) => photo.url) : existingPhotos).map((url) => (
            <span key={url} className="relative block h-[84px] w-[112px] shrink-0 overflow-hidden rounded-[10px] bg-[#eef2ff]">
              <Image src={url} alt="" fill unoptimized className="object-cover" sizes="120px" />
            </span>
          ))}
          {uploading && <Skeleton className="h-[84px] w-[112px] shrink-0 rounded-[10px]" />}
        </div>
        {existingPhotos.length > 0 && photos.length === 0 && <p className="text-xs text-gray-500">New photos replace the current set when you save.</p>}
      </FormField>
          <ListingDocumentsField
            label="Certification or licence"
            hint="A trade certificate, professional licence or registration. Reviewed privately by our team. PDF or image, up to 10 MB."
            options={classificationOptions("Professional", ["ProfessionalCertificate", "Other"])}
            documents={documents}
            onChange={setDocuments}
          />
        </>
      )}
    </ListingFormLayout>
  );
}
