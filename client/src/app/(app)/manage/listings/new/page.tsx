"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { DetailAside } from "@/components/shared/DetailAside";
import { ChoiceChip, FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { DatePickerField, OptionSelectField, todayKey } from "@/components/shared/ViewingSlotPickers";
import { Button } from "@/components/ui/Button";
import { comingSoonHref } from "@/lib/coming-soon";
import { isNonEmpty } from "@/lib/validation";
import { cn } from "@/lib/utils";

const LISTING_TYPES = ["For sale", "For rent", "Short stay", "Land"] as const;
const PROPERTY_TYPES = ["Apartment", "Detached house", "Townhouse", "Commercial", "Plot"];
const COUNTS = ["Studio", "1", "2", "3", "4", "5", "6+"];
const PER: Record<string, string[]> = { "For rent": ["Month", "Year"], "Short stay": ["Night"] };
const ADVANCE = ["1 month", "3 months", "6 months", "1 year"];
const MIN_PHOTOS = 5;
const DRAFT_KEY = "biltlinx.listing-draft";
const CARD = "flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6";
const CARD_TITLE = "text-base font-bold leading-[23px] text-[#0f172a]";

type ListingType = (typeof LISTING_TYPES)[number];

interface Form {
  listingType: ListingType;
  propertyType: string;
  title: string;
  bedrooms: string;
  bathrooms: string;
  size: string;
  price: string;
  per: string;
  advance: string;
  availableFrom: string;
  address: string;
  hideAddress: boolean;
}

const EMPTY_FORM: Form = {
  listingType: "For rent",
  propertyType: "Apartment",
  title: "2-bed apartment with balcony · Adenta Heights A4",
  bedrooms: "2",
  bathrooms: "2",
  size: "94",
  price: "2,800",
  per: "Month",
  advance: "6 months",
  availableFrom: "2026-11-01",
  address: "Adenta Heights, Block A, Unit 4, Adenta",
  hideAddress: true,
};

interface Photo {
  id: string;
  src: string;
}

/** The three photos the design starts with; the rest are added from the device. */
const STARTER_PHOTOS: Photo[] = [
  { id: "p1", src: "/images/manage/listing-adenta.png" },
  { id: "p2", src: "/images/manage/wo-photo-1.png" },
  { id: "p3", src: "/images/manage/wo-photo-2.png" },
];

const DOCUMENTS = [
  { id: "ownership", label: "Proof of ownership or letting authority" },
  { id: "permit", label: "Building permit" },
];

function readDraft(): Form | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? { ...EMPTY_FORM, ...(JSON.parse(raw) as Partial<Form>) } : null;
  } catch {
    return null;
  }
}

/** Manage · Create listing (Figma node 1087:36818): list a property from the Manage workspace. */
export default function CreateListingPage() {
  const router = useRouter();
  const photoInput = useRef<HTMLInputElement | null>(null);
  const documentInput = useRef<HTMLInputElement | null>(null);
  const pendingDocument = useRef<string>("");
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [photos, setPhotos] = useState<Photo[]>(STARTER_PHOTOS);
  const [uploaded, setUploaded] = useState<string[]>(["ownership"]);

  // A saved draft is only known in the browser, so it is restored after mount.
  useEffect(() => {
    const draft = readDraft();
    if (draft) setForm(draft);
  }, []);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((current) => ({ ...current, [key]: value }));

  const isRent = form.listingType === "For rent";
  const perOptions = PER[form.listingType];
  const needsHomeDetails = form.listingType !== "Land";

  function chooseListingType(listingType: ListingType) {
    setForm((current) => ({ ...current, listingType, per: PER[listingType]?.[0] ?? current.per }));
  }

  function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    const added = Array.from(files).map((file) => ({ id: `${file.name}-${file.size}-${file.lastModified}`, src: URL.createObjectURL(file) }));
    setPhotos((current) => [...current, ...added]);
  }

  function removePhoto(id: string) {
    setPhotos((current) => current.filter((photo) => photo.id !== id));
  }

  function chooseDocument(id: string) {
    pendingDocument.current = id;
    documentInput.current?.click();
  }

  function saveDraft() {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      toast.success("Draft saved on this device");
    } catch {
      toast.error("Couldn’t save the draft");
    }
  }

  const steps = [
    { label: "Basics", done: isNonEmpty(form.title) },
    { label: "Price", done: isNonEmpty(form.price) },
    { label: "Location", done: isNonEmpty(form.address) },
    { label: `${MIN_PHOTOS}+ photos`, done: photos.length >= MIN_PHOTOS },
    { label: "Documents (optional)", done: uploaded.length > 0, optional: true },
  ];
  const canPublish = steps.every((step) => step.done || step.optional);
  const missingPhotos = Math.max(0, MIN_PHOTOS - photos.length);
  const publishHint = canPublish
    ? "Everything needed is filled in."
    : missingPhotos
      ? `Add ${missingPhotos} more photo${missingPhotos === 1 ? "" : "s"} to publish.`
      : "Fill in the sections above to publish.";

  function publish() {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Nothing to clear.
    }
    toast.success("Listing published");
    router.push("/manage/listings");
  }

  const priceLabel = isRent || form.listingType === "Short stay" ? (isRent ? "Rent (GHS)" : "Rate (GHS)") : "Price (GHS)";
  const priceLine = `GHS ${form.price || "—"}${perOptions ? ` / ${form.per.toLowerCase()}` : ""}`;
  const bedrooms = form.bedrooms === "Studio" ? "Studio" : `${form.bedrooms}-bed`;
  const previewLine = needsHomeDetails ? `${bedrooms} ${form.propertyType.toLowerCase()}` : "Land";

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Listings", href: "/manage/listings" }, { label: "Create listing" }]} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">List a property</h1>
            <p className="text-sm leading-5 text-gray-500">Listings with checked documents get 2.3× more enquiries.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={saveDraft} className="h-10 w-auto whitespace-nowrap rounded-[10px] px-4 lg:rounded-[10px]">
              Save draft
            </Button>
            <button
              type="button"
              onClick={() => router.push(comingSoonHref("Listing preview"))}
              className="h-10 whitespace-nowrap rounded-[10px] bg-[#eff5ff] px-4 text-sm font-medium text-brand-900 hover:bg-[#e2edff]"
            >
              Preview
            </button>
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
          <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
            <section className={CARD}>
              <h2 className={CARD_TITLE}>1 · Basics</h2>
              <FormField label="Listing type">
                <div role="radiogroup" aria-label="Listing type" className="flex flex-wrap gap-2">
                  {LISTING_TYPES.map((type) => (
                    <ChoiceChip key={type} role="radio" label={type} selected={type === form.listingType} onClick={() => chooseListingType(type)} />
                  ))}
                </div>
              </FormField>
              <FormField label="Property type">
                <div role="radiogroup" aria-label="Property type" className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((type) => (
                    <ChoiceChip key={type} role="radio" label={type} selected={type === form.propertyType} onClick={() => set("propertyType", type)} />
                  ))}
                </div>
              </FormField>
              <FormField label="Title">
                <label className={cn(FIELD_BOX, "border-gray-200")}>
                  <input value={form.title} onChange={(event) => set("title", event.target.value)} maxLength={90} placeholder="e.g. 2-bed apartment with balcony" className={FIELD_INPUT} />
                </label>
              </FormField>
              <div className={cn("grid grid-cols-1 gap-3", needsHomeDetails ? "sm:grid-cols-3" : "sm:grid-cols-1")}>
                {needsHomeDetails && (
                  <>
                    <FormField label="Bedrooms">
                      <OptionSelectField value={form.bedrooms} options={COUNTS} onChange={(value) => set("bedrooms", value)} />
                    </FormField>
                    <FormField label="Bathrooms">
                      <OptionSelectField value={form.bathrooms} options={COUNTS} onChange={(value) => set("bathrooms", value)} />
                    </FormField>
                  </>
                )}
                <FormField label="Size (m²)">
                  <label className={cn(FIELD_BOX, "border-gray-200")}>
                    <input value={form.size} onChange={(event) => set("size", event.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className={FIELD_INPUT} />
                  </label>
                </FormField>
              </div>
            </section>

            <section className={CARD}>
              <h2 className={CARD_TITLE}>2 · Price</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label={priceLabel}>
                  <label className={cn(FIELD_BOX, "border-gray-200")}>
                    <input value={form.price} onChange={(event) => set("price", event.target.value.replace(/[^\d,]/g, ""))} inputMode="numeric" className={FIELD_INPUT} />
                  </label>
                  {isRent && <span className="text-xs font-medium leading-[17px] text-gray-500">Similar 2-beds in Adenta: GHS 2,500 – 3,200</span>}
                </FormField>
                {perOptions && (
                  <FormField label="Per">
                    <OptionSelectField value={form.per} options={perOptions} onChange={(value) => set("per", value)} />
                  </FormField>
                )}
              </div>
              {isRent && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField label="Advance required">
                    <OptionSelectField value={form.advance} options={ADVANCE} onChange={(value) => set("advance", value)} />
                    <span className="text-xs font-medium leading-[17px] text-gray-500">The Rent Act caps advance rent at 6 months.</span>
                  </FormField>
                  <FormField label="Available from">
                    <DatePickerField value={form.availableFrom} onChange={(value) => set("availableFrom", value)} min={todayKey()} />
                  </FormField>
                </div>
              )}
            </section>

            <section className={CARD}>
              <h2 className={CARD_TITLE}>3 · Location</h2>
              <FormField label="Address">
                <label className={cn(FIELD_BOX, "border-gray-200")}>
                  <NavIcon icon="/icons/post-options-location.svg" size={16} className="shrink-0 bg-gray-500" />
                  <input value={form.address} onChange={(event) => set("address", event.target.value)} placeholder="Street, area and town" className={FIELD_INPUT} />
                </label>
              </FormField>
              <button
                type="button"
                role="switch"
                aria-checked={form.hideAddress}
                onClick={() => set("hideAddress", !form.hideAddress)}
                className="flex items-center gap-3 rounded-xl bg-[#f8fafc] p-3.5 text-left"
              >
                <span className={cn("flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors", form.hideAddress ? "bg-brand-900" : "bg-[#cbd5e1]")}>
                  <span className={cn("size-4 rounded-full bg-white transition-transform", form.hideAddress && "translate-x-4")} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">Hide exact address</span>
                  <span className="text-xs leading-[17px] text-gray-500">Show the area only. The address is shared after a viewing is confirmed.</span>
                </span>
              </button>
            </section>

            <section className={CARD}>
              <h2 className={CARD_TITLE}>4 · Photos &amp; video</h2>
              <input ref={photoInput} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(event) => { addPhotos(event.target.files); event.target.value = ""; }} />
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-[repeat(auto-fill,140px)]">
                {photos.map((photo, index) => (
                  <div key={photo.id} className="group relative h-[105px] overflow-hidden rounded-[10px] bg-[#eef2ff]">
                    <Image src={photo.src} alt={`Listing photo ${index + 1}`} fill unoptimized={photo.src.startsWith("blob:")} className="object-cover" sizes="140px" />
                    <button
                      type="button"
                      aria-label={`Remove photo ${index + 1}`}
                      onClick={() => removePhoto(photo.id)}
                      className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-[#0f172a]/70 text-xs font-bold text-white opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => photoInput.current?.click()}
                  className="flex h-[105px] flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed border-[#cbd5e1] text-gray-500 hover:bg-gray-50"
                >
                  <span className="text-[22px] font-medium leading-8">+</span>
                  <span className="text-xs font-medium leading-[17px]">Add photos</span>
                </button>
              </div>
              <p className={cn("text-xs font-medium leading-[17px]", photos.length >= MIN_PHOTOS ? "text-[#16a34a]" : "text-[#b45309]")}>
                {photos.length >= MIN_PHOTOS
                  ? `${photos.length} photos added.`
                  : `${photos.length} of at least ${MIN_PHOTOS} photos. Add the kitchen and bathroom.`}
              </p>
            </section>

            <section className={cn(CARD, "gap-3")}>
              <h2 className={CARD_TITLE}>5 · Documents (optional, recommended)</h2>
              <input
                ref={documentInput}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(event) => {
                  const id = pendingDocument.current;
                  if (event.target.files?.length && id) setUploaded((current) => (current.includes(id) ? current : [...current, id]));
                  event.target.value = "";
                }}
              />
              {DOCUMENTS.map((doc) => {
                const done = uploaded.includes(doc.id);
                return (
                  <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3.5">
                    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", done ? "bg-[#dcfce7]" : "bg-[#f1f5f9]")}>
                      <NavIcon icon="/icons/layers-01.svg" size={18} className={done ? "bg-[#16a34a]" : "bg-gray-500"} />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-semibold leading-5 text-[#0f172a]">{doc.label}</span>
                    {done ? (
                      <span className="shrink-0 whitespace-nowrap rounded-full bg-[#fef3c7] px-2.5 py-[3px] text-[11px] font-medium leading-4 text-[#b45309]">Uploaded · checking</span>
                    ) : (
                      <Button variant="outline" onClick={() => chooseDocument(doc.id)} className="h-9 w-auto shrink-0 rounded-[10px] px-4 lg:rounded-[10px]">
                        Upload
                      </Button>
                    )}
                  </div>
                );
              })}
            </section>
          </div>

          <DetailAside single className="xl:w-[340px]">
            <section className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-[15px] font-bold leading-[22px] text-[#0f172a]">Ready to publish?</h2>
              {steps.map((step) => (
                <p key={step.label} className="flex items-center gap-2.5 text-[13px] leading-[19px]">
                  <span
                    className={cn(
                      "flex size-[18px] shrink-0 items-center justify-center rounded text-[11px] font-bold leading-3",
                      step.done ? "bg-brand-900 text-white" : "border border-[#cbd5e1] text-transparent",
                    )}
                  >
                    ✓
                  </span>
                  <span className={step.done ? "text-gray-500" : "font-medium text-[#0f172a]"}>{step.label}</span>
                </p>
              ))}
              <Button variant="primary" onClick={publish} disabled={!canPublish} className="h-11 w-full rounded-[10px] disabled:bg-[#e2e8f0] disabled:text-[#94a3b8] lg:rounded-[10px]">
                Publish listing
              </Button>
              <p className="text-xs leading-[17px] text-gray-500">{publishHint}</p>
            </section>

            <section className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-[13px] font-semibold leading-[19px] text-gray-500">How it will look</h2>
              <div className="relative h-40 overflow-hidden rounded-[10px] bg-[#eef2ff]">
                {photos[0] ? <Image src={photos[0].src} alt="" fill unoptimized={photos[0].src.startsWith("blob:")} className="object-cover" sizes="340px" /> : null}
              </div>
              <p className="text-base font-bold leading-[23px] text-[#0f172a]">{priceLine}</p>
              <p className="text-xs leading-[17px] text-gray-500">
                {previewLine} · {form.address.split(",").pop()?.trim() || "Add an address"}
              </p>
            </section>
          </DetailAside>
        </div>
      </PageContainer>
    </AppShell>
  );
}

