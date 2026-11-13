"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { ListingDocumentsField } from "@/components/shared/ListingDocumentsField";
import { ListingFormLayout, ListingPreview, PreviewToggle, WizardNav } from "@/components/shared/ListingFormLayout";
import { LocationCombobox } from "@/components/shared/LocationCombobox";
import { ChoiceChip, FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { NavIcon } from "@/components/shared/NavIcon";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAutosave, useListingDraft } from "@/hooks/useListingDraft";
import { apiRequest } from "@/lib/api";
import { errorMessage, notifyError } from "@/lib/errors";
import {
  AUTHORITY_ROLES,
  defaultsForPurpose,
  EMPTY_LISTING_FORM,
  fromProperty,
  isRentalPurpose,
  PURPOSES,
  purposeInfo,
  RENT_PERIODS,
  toUpdateRequest,
  type ListingForm,
  type Purpose,
} from "@/lib/listing-form";
import { getDraftPreview, getProperty, publishDraft, submitDraft } from "@/lib/properties-api";
import { toListingCard } from "@/lib/property-mapper";
import { uploadMedia } from "@/lib/upload";
import { classificationOptions, submitListingDocuments, type PendingDocument } from "@/lib/verification-api";
import { cn } from "@/lib/utils";

const STEPS = ["Basics", "Price and location", "Photos and review"];
const MAX_ISSUES_SHOWN = 3;
const SEVERITY_STYLE: Record<string, string> = {
  Blocking: "bg-[#fee2e2] text-[#dc2626]",
  Warning: "bg-[#fef3c7] text-[#b45309]",
  Advisory: "bg-[#eff5ff] text-brand-900",
};

// The draft id lives in the draft hook's own state here, so there is no URL to update when one is created.
const ignoreDraftCreated = () => {};

function NumberField({ label, value, onChange, suffix }: { label: string; value: string; onChange: (value: string) => void; suffix?: string }) {
  return (
    <FormField label={label}>
      <label className={cn(FIELD_BOX, "border-gray-200")}>
        <input value={value} onChange={(event) => onChange(event.target.value.replace(/[^\d.,]/g, ""))} inputMode="decimal" className={FIELD_INPUT} />
        {suffix && <span className="shrink-0 text-xs text-gray-500">{suffix}</span>}
      </label>
    </FormField>
  );
}

function TextField({ label, value, onChange, placeholder, maxLength }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; maxLength?: number }) {
  return (
    <FormField label={label}>
      <label className={cn(FIELD_BOX, "border-gray-200")}>
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} maxLength={maxLength} className={FIELD_INPUT} />
      </label>
    </FormField>
  );
}

interface PropertyListingFormProps {
  /** An unfinished draft to carry on with. */
  draftParam: string | null;
  /** A live listing to change. */
  editId: string | null;
  onClose: () => void;
}

/** Create a property listing, carry on with a draft or edit a live one: autosaved drafts, a readiness check, then submit for review or publish now. */
export function PropertyListingForm({ draftParam, editId, onClose }: PropertyListingFormProps) {
  const queryClient = useQueryClient();
  const photoInput = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<ListingForm>(EMPTY_LISTING_FORM);
  const [hydrated, setHydrated] = useState(!draftParam && !editId);
  const [uploading, setUploading] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const [step, setStep] = useState(0);
  const [documents, setDocuments] = useState<PendingDocument[]>([]);

  const { draftId, draft, readiness, saveState, flush, markLoaded } = useListingDraft(draftParam, ignoreDraftCreated);

  const editing = useQuery({
    queryKey: ["property-edit", editId],
    queryFn: async () => fromProperty(await getProperty(editId as string)),
    enabled: Boolean(editId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const editingProperty = useQuery({ queryKey: ["properties", "one", editId], queryFn: () => getProperty(editId as string), enabled: Boolean(editId) });

  useEffect(() => {
    const loaded = editId ? editing.data : draft.data;
    if (!hydrated && loaded) {
      setForm(loaded);
      if (!editId) markLoaded(loaded);
      setHydrated(true);
    }
  }, [draft.data, editing.data, editId, hydrated, markLoaded]);

  const preview = useQuery({
    queryKey: ["draft-preview", draftParam],
    queryFn: () => getDraftPreview(draftParam as string),
    enabled: Boolean(draftParam) && hydrated && form.media.some((item) => !item.url),
    staleTime: Infinity,
  });
  useEffect(() => {
    const urls = preview.data?.media;
    if (!urls) return;
    setForm((current) => {
      if (!current.media.some((item) => !item.url)) return current;
      return { ...current, media: current.media.map((item, index) => ({ ...item, url: item.url || urls[index]?.url || "" })) };
    });
  }, [preview.data]);

  useAutosave(form, hydrated && !editId, flush);

  const set = <K extends keyof ListingForm>(key: K, value: ListingForm[K]) => setForm((current) => ({ ...current, [key]: value }));

  const rental = isRentalPurpose(form.purpose);
  const info = purposeInfo(form.purpose);
  const isHome = form.propertyType !== "Land" && form.propertyType !== "Commercial";

  function choosePurpose(purpose: Purpose) {
    setForm((current) => ({ ...current, ...defaultsForPurpose(purpose) }));
  }

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const media = await uploadMedia(file);
        setForm((current) => ({ ...current, media: [...current.media, { path: media.path, contentType: media.contentType, name: media.name ?? file.name, url: media.publicUrl }] }));
      } catch (error) {
        notifyError(error, `${file.name} could not be uploaded.`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  const refreshLists = () => {
    void queryClient.invalidateQueries({ queryKey: ["properties"] });
    void queryClient.invalidateQueries({ queryKey: ["drafts"] });
    void queryClient.invalidateQueries({ queryKey: ["action-needed"] });
  };

  /** Ownership proof can only be sent once the listing exists. A failure here never undoes the listing. */
  async function sendDocuments(subjectId: string) {
    if (documents.length === 0) return;
    try {
      await submitListingDocuments({ type: "PropertyAuthority", subjectId, title: form.name.trim() || "Property listing", documents });
      setDocuments([]);
    } catch (error) {
      notifyError(error, "The listing was saved, but its documents could not be sent. You can add them from Verification.");
    }
  }

  const finish = useMutation({
    mutationFn: async (mode: "submit" | "publish") => {
      const id = await flush(form);
      if (!id) throw new Error("Add some details before submitting.");
      const property = await (mode === "publish" ? publishDraft(id) : submitDraft(id));
      await sendDocuments(property.id);
      return property;
    },
    onSuccess: (_property, mode) => {
      refreshLists();
      showSuccessToast(mode === "publish" ? "Your listing is live" : "Sent for review. We will tell you when it is approved.");
      onClose();
    },
    onError: (error) => notifyError(error, "The listing could not be submitted."),
  });

  const saveEdit = useMutation({
    mutationFn: async () => {
      await apiRequest(`/properties/${editId}`, {
        method: "PUT",
        body: toUpdateRequest(form, editingProperty.data?.availability ?? null, true),
      });
      await sendDocuments(editId as string);
    },
    onSuccess: () => {
      refreshLists();
      showSuccessToast("Changes saved");
      onClose();
    },
    onError: (error) => notifyError(error, "The changes could not be saved."),
  });

  const issues = readiness.data?.issues ?? [];
  const blocking = issues.filter((issue) => issue.severity === "Blocking");
  const canSubmit = Boolean(draftId) && readiness.data?.ready === true && blocking.length === 0;
  const loading = !hydrated && (draft.isPending || editing.isPending) && (draftParam !== null || editId !== null);
  const previewCard = {
    ...toListingCard({
      id: "preview",
      propertyId: "preview",
      name: form.name || "Your listing",
      description: form.description,
      price: Number(form.price.replace(/,/g, "")) || 0,
      currency: "GHS",
      pricePeriod: form.pricePeriod,
      deposit: null,
      serviceCharge: null,
      serviceChargePeriod: null,
      isNegotiable: form.isNegotiable,
      paymentPlanNote: null,
      leaseTermMonths: null,
      address: form.address,
      addressVisibility: form.hideAddress ? "Hidden" : "Public",
      city: form.city,
      latitude: null,
      longitude: null,
      listingType: info.listingType,
      propertyType: form.propertyType,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      floorAreaSqm: form.floorAreaSqm ? Number(form.floorAreaSqm) : null,
      landSizeSqm: form.landSizeSqm ? Number(form.landSizeSqm) : null,
      useClass: null,
      powerCapacityKva: null,
      status: "PendingReview",
      availability: "Available",
      approvedAt: null,
      lastConfirmedAt: new Date().toISOString(),
      isStale: false,
      unavailableReports: null,
      owner: { id: "", username: "You", organizationName: null, organizationId: "", profilePicUrl: null, isVerified: false },
      media: form.media.filter((item) => item.url).map((item) => ({ name: item.name, contentType: item.contentType, url: item.url })),
      documents: null,
      isOwn: true,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      postedAt: null,
    }),
    href: undefined,
    cta: "Request viewing",
    secondaryCta: undefined,
  };

  const saveLabel = editId ? "Material changes send the listing back for review." : saveState === "saving" ? "Saving…" : saveState === "saved" ? "Draft saved" : saveState === "error" ? "Not saved" : "Autosaves as you type";

  const steps = STEPS;
  const lastStep = steps.length - 1;
  const footer = (
    <WizardNav step={step} onBack={() => setStep((current) => current - 1)}>
      {step < lastStep ? (
        <Button variant="primary" onClick={() => setStep((current) => current + 1)} className="h-11 flex-1 rounded-[10px] lg:rounded-[10px]">
          Next
        </Button>
      ) : editId ? (
        <Button variant="primary" onClick={() => saveEdit.mutate()} disabled={saveEdit.isPending} className="h-11 flex-1 rounded-[10px] lg:rounded-[10px]">
          {saveEdit.isPending ? "Saving…" : "Save changes"}
        </Button>
      ) : (
        <>
          <Button variant="primary" onClick={() => finish.mutate("submit")} disabled={!canSubmit || finish.isPending} className="h-11 flex-1 rounded-[10px] disabled:bg-[#e2e8f0] disabled:text-[#94a3b8] lg:rounded-[10px]">
            {finish.isPending ? "Sending…" : "Submit for review"}
          </Button>
          <Button variant="outline" onClick={() => finish.mutate("publish")} disabled={!canSubmit || readiness.data?.canPublishNow !== true || finish.isPending} className="h-11 flex-1 rounded-[10px] lg:rounded-[10px]">
            Publish now
          </Button>
        </>
      )}
    </WizardNav>
  );

  return (
    <ListingFormLayout
      titleId="listing-dialog-title"
      title={editId ? "Edit property" : "List a property"}
      subtitle={saveLabel}
      steps={steps}
      step={step}
      onClose={onClose}
      headerAction={
        <PreviewToggle previewing={previewing} onToggle={() => setPreviewing((current) => !current)} />
      }
      footer={loading ? null : footer}
    >
      {loading ? (
        <>
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </>
      ) : previewing ? (
        <ListingPreview listing={previewCard} />
      ) : (
        <>
          {step === 0 && (
            <div className="flex flex-col gap-3.5">
              <FormField label="Listing type">
                <div role="radiogroup" aria-label="Listing type" className="flex flex-wrap gap-2">
                  {PURPOSES.map((item) => (
                    <ChoiceChip key={item.value} role="radio" label={item.label} selected={item.value === form.purpose} onClick={() => !editId && choosePurpose(item.value)} />
                  ))}
                </div>
              </FormField>
              {info.propertyType.length > 1 && (
                <FormField label="Property type">
                  <div role="radiogroup" aria-label="Property type" className="flex flex-wrap gap-2">
                    {info.propertyType.map((type) => (
                      <ChoiceChip key={type} role="radio" label={type} selected={type === form.propertyType} onClick={() => set("propertyType", type)} />
                    ))}
                  </div>
                </FormField>
              )}
              <TextField label="Title" value={form.name} onChange={(value) => set("name", value)} maxLength={90} placeholder="e.g. 2-bed apartment with balcony" />
              <FormField label="Description">
                <textarea
                  value={form.description}
                  onChange={(event) => set("description", event.target.value)}
                  rows={2}
                  placeholder="What makes this property worth a visit?"
                  className="resize-none rounded-[10px] border border-gray-200 px-3.5 py-2 text-sm leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none"
                />
              </FormField>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {isHome && <NumberField label="Bedrooms" value={form.bedrooms} onChange={(value) => set("bedrooms", value)} />}
                {isHome && <NumberField label="Bathrooms" value={form.bathrooms} onChange={(value) => set("bathrooms", value)} />}
                {form.propertyType === "Land" ? (
                  <NumberField label="Plot size" value={form.landSizeSqm} onChange={(value) => set("landSizeSqm", value)} suffix="m²" />
                ) : (
                  <NumberField label="Floor area" value={form.floorAreaSqm} onChange={(value) => set("floorAreaSqm", value)} suffix="m²" />
                )}
                {form.propertyType === "Commercial" && <TextField label="Use class" value={form.useClass} onChange={(value) => set("useClass", value)} placeholder="e.g. Retail, Office" />}
                {form.propertyType === "Commercial" && <NumberField label="Power capacity" value={form.powerCapacityKva} onChange={(value) => set("powerCapacityKva", value)} suffix="kVA" />}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <NumberField label={rental ? "Rent (GHS)" : "Price (GHS)"} value={form.price} onChange={(value) => set("price", value)} />
                {rental ? (
                  <FormField label="Per">
                    <div role="radiogroup" aria-label="Rent period" className="flex gap-2">
                      {RENT_PERIODS.map((period) => (
                        <ChoiceChip key={period.value} role="radio" label={period.label} selected={form.pricePeriod === period.value} onClick={() => set("pricePeriod", period.value)} />
                      ))}
                    </div>
                  </FormField>
                ) : (
                  <TextField label="Payment plan (optional)" value={form.paymentPlanNote} onChange={(value) => set("paymentPlanNote", value)} placeholder="e.g. 50% down, balance over 12 months" />
                )}
              </div>
              {rental && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <NumberField label="Deposit (GHS)" value={form.deposit} onChange={(value) => set("deposit", value)} />
                  <NumberField label="Lease term" value={form.leaseTermMonths} onChange={(value) => set("leaseTermMonths", value)} suffix="months" />
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <NumberField label="Service charge (GHS)" value={form.serviceCharge} onChange={(value) => set("serviceCharge", value)} />
                <FormField label="Service charge per">
                  <div role="radiogroup" aria-label="Service charge period" className="flex gap-2">
                    {RENT_PERIODS.map((period) => (
                      <ChoiceChip key={period.value} role="radio" label={period.label} selected={form.serviceChargePeriod === period.value} onClick={() => set("serviceChargePeriod", period.value)} />
                    ))}
                  </div>
                </FormField>
                <label className="flex items-center gap-2.5 self-end pb-2.5 text-sm font-medium text-[#0f172a]">
                  <input type="checkbox" checked={form.isNegotiable} onChange={(event) => set("isNegotiable", event.target.checked)} className="size-4 accent-[#1465e6]" />
                  Price is negotiable
                </label>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="City or area">
                  <LocationCombobox value={form.city} onChange={(value) => set("city", value)} placeholder="e.g. East Legon, Accra" ariaLabel="City or area" icon />
                </FormField>
                <FormField label="Address">
                  <label className={cn(FIELD_BOX, "border-gray-200")}>
                    <NavIcon icon="/icons/post-options-location.svg" size={16} className="shrink-0 bg-gray-500" />
                    <input value={form.address} onChange={(event) => set("address", event.target.value)} placeholder="Street, area and town" className={FIELD_INPUT} />
                  </label>
                </FormField>
              </div>
              <button type="button" role="switch" aria-checked={form.hideAddress} onClick={() => set("hideAddress", !form.hideAddress)} className="flex items-center gap-3 rounded-xl bg-[#f8fafc] px-3.5 py-2.5 text-left">
                <span className={cn("flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors", form.hideAddress ? "bg-brand-900" : "bg-[#cbd5e1]")}>
                  <span className={cn("size-4 rounded-full bg-white transition-transform", form.hideAddress && "translate-x-4")} />
                </span>
                <span className="text-[13px] leading-[19px] text-[#334155]">
                  <span className="font-semibold text-[#0f172a]">Hide exact address.</span> Show the area only until a viewing is confirmed.
                </span>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3.5">
              <input
                ref={photoInput}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) => {
                  void addPhotos(event.target.files);
                  event.target.value = "";
                }}
              />
              <FormField label="Photos">
                <div className="no-scrollbar flex gap-2.5 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => photoInput.current?.click()}
                    className="flex h-[84px] w-[112px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-[10px] border border-dashed border-[#cbd5e1] text-gray-500 hover:bg-gray-50"
                  >
                    <span className="text-xl font-medium leading-6">+</span>
                    <span className="text-xs font-medium leading-[17px]">Add photos</span>
                  </button>
                  {form.media.map((photo, index) => (
                    <div key={photo.path} className="group relative h-[84px] w-[112px] shrink-0 overflow-hidden rounded-[10px] bg-[#eef2ff]">
                      {photo.url ? <Image src={photo.url} alt={`Listing photo ${index + 1}`} fill unoptimized className="object-cover" sizes="112px" /> : null}
                      <button
                        type="button"
                        aria-label={`Remove photo ${index + 1}`}
                        onClick={() => set("media", form.media.filter((item) => item.path !== photo.path))}
                        className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-[#0f172a]/70 text-xs font-bold text-white opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {uploading > 0 && <Skeleton className="h-[84px] w-[112px] shrink-0 rounded-[10px]" />}
                </div>
                <span className="text-xs leading-[17px] text-gray-500">Listings without a photo do not appear in the feed.</span>
              </FormField>
              <ListingDocumentsField
                label="Proof of ownership or authority"
                hint="A title deed, indenture or letting authority. Reviewed privately and never shown on the listing. PDF or image, up to 10 MB."
                options={classificationOptions("PropertyAuthority")}
                documents={documents}
                onChange={setDocuments}
              />

              {!editId && (
                <>
                  <FormField label="You are the">
                    <div role="radiogroup" aria-label="Your role" className="flex flex-wrap gap-2">
                      {AUTHORITY_ROLES.map((role) => (
                        <ChoiceChip key={role} role="radio" label={role === "PropertyManager" ? "Property manager" : role} selected={form.authorityRole === role} onClick={() => set("authorityRole", role)} />
                      ))}
                    </div>
                  </FormField>
                  <label className="flex items-start gap-2.5 text-sm text-[#334155]">
                    <input type="checkbox" checked={form.authorityDeclared} onChange={(event) => set("authorityDeclared", event.target.checked)} className="mt-0.5 size-4 accent-[#1465e6]" />
                    I confirm I have the authority to list this property.
                  </label>
                  <div className="flex flex-col gap-1.5 rounded-xl bg-[#f8fafc] p-3">
                    {!draftId && <p className="text-xs leading-[17px] text-gray-500">Fill in the earlier steps. We check the listing as you go.</p>}
                    {readiness.data && issues.length === 0 && <p className="text-[13px] font-medium text-[#16a34a]">Everything needed is filled in.</p>}
                    {issues.slice(0, MAX_ISSUES_SHOWN).map((issue, index) => (
                      <p key={`${issue.field}-${index}`} className="flex items-start gap-2 text-[13px] leading-[19px]">
                        <span className={cn("mt-0.5 shrink-0 rounded-full px-2 py-[1px] text-[10px] font-bold", SEVERITY_STYLE[issue.severity ?? "Advisory"])}>{issue.severity}</span>
                        <span className="text-[#334155]">{issue.message}</span>
                      </p>
                    ))}
                    {issues.length > MAX_ISSUES_SHOWN && <p className="text-xs text-gray-500">and {issues.length - MAX_ISSUES_SHOWN} more to fix</p>}
                    {readiness.isError && <p className="text-xs text-[#dc2626]">{errorMessage(readiness.error)}</p>}
                    {readiness.data && !readiness.data.canPublishNow && readiness.data.publishNowReason && (
                      <p className="text-xs leading-[17px] text-gray-500">
                        {readiness.data.publishNowReason}{" "}
                        <Link href="/verification" onClick={onClose} className="font-medium text-brand-900">
                          Get verified
                        </Link>
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </ListingFormLayout>
  );
}
