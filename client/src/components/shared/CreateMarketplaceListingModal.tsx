"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent } from "react";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { MarketplaceCard } from "@/components/shared/MarketplaceCard";
import { SelectField } from "@/components/shared/SelectField";
import { FIELD_BOX, FIELD_INPUT, FormField, WizardSteps } from "@/components/shared/ModalFormParts";
import { Button } from "@/components/ui/Button";
import { useMarketListingMutations } from "@/hooks/useMarketplace";
import { errorMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/format";
import { CATEGORY_PLACEHOLDER, isCounted, MARKET_CATEGORIES, MARKET_UNITS, stockNoun } from "@/lib/market-listings";
import { uploadMedia, validateMediaFile, type UploadedMedia } from "@/lib/upload";
import { cn } from "@/lib/utils";
import type { MarketCategory, MarketListing, MarketOffer } from "@/types/api/marketplace";

const STEPS = ["Details", "Photos", "Price & location", "Review"];
const HEADINGS = [
  { title: "What are you listing?", subtitle: "Pick a category, then give it a clear title buyers can search for." },
  { title: "Add photos", subtitle: "Clear photos sell faster. The first one is the cover buyers see." },
  { title: "Price and location", subtitle: "Say what you are asking and where the item is." },
  { title: "Review and submit", subtitle: "Check the details. You can edit or take the listing down any time." },
];
const MAX_PHOTOS = 8;
const TITLE_MAX = 60;
const TEXTAREA = "resize-none rounded-[10px] border px-3.5 py-2.5 text-sm leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none";

/** One file picked on the Photos step: uploading, done, or refused with a reason. */
interface PhotoEntry {
  id: string;
  name: string;
  size: number;
  media?: UploadedMedia;
  uploading?: boolean;
  error?: string;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function megabytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function numberOrNull(value: string) {
  return value.trim() ? Number(value) : null;
}

function Form({ listing, onClose, onSubmitted }: { listing?: MarketListing; onClose: () => void; onSubmitted: (title: string) => void }) {
  const { create, update } = useMarketListingMutations();
  const saving = create.isPending || update.isPending;
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [category, setCategory] = useState<MarketCategory>(listing?.category ?? "Materials");
  const [title, setTitle] = useState(listing?.title ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [photos, setPhotos] = useState<PhotoEntry[]>(() =>
    (listing?.photos ?? []).map((url, index) => ({ id: `existing-${index}`, name: `Photo ${index + 1}`, size: 0, media: { path: "", contentType: "image/jpeg", name: `Photo ${index + 1}`, publicUrl: url } })),
  );
  const [dragging, setDragging] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [price, setPrice] = useState(listing ? String(listing.price) : "");
  const [unit, setUnit] = useState<string>(listing?.unit ?? MARKET_UNITS.Materials[0].value);
  const [location, setLocation] = useState(listing?.location ?? "");
  const [stock, setStock] = useState(listing?.stock != null && listing.category !== "Land" ? String(listing.stock) : "");
  const [minOrder, setMinOrder] = useState(listing?.minOrder != null ? String(listing.minOrder) : "");
  const [delivers, setDelivers] = useState(listing?.deliveryAvailable ?? false);
  const [deliveryFee, setDeliveryFee] = useState(listing?.deliveryFee != null ? String(listing.deliveryFee) : "");
  const [bulkQty, setBulkQty] = useState(listing?.bulk ? String(listing.bulk.minQuantity) : "");
  const [bulkPrice, setBulkPrice] = useState(listing?.bulk ? String(listing.bulk.price) : "");
  const [agreed, setAgreed] = useState(Boolean(listing));

  const units = MARKET_UNITS[category];
  const unitLabel = units.find((option) => option.value === unit)?.label ?? "";
  const amount = Number(price);
  const noun = stockNoun(category, unit);
  const counted = isCounted(category);
  const stockCount = numberOrNull(stock);
  const minCount = numberOrNull(minOrder);
  const bulkCount = numberOrNull(bulkQty);
  const bulkAmount = numberOrNull(bulkPrice);
  const feeAmount = numberOrNull(deliveryFee);

  function chooseCategory(next: MarketCategory) {
    setCategory(next);
    // A price can only be per something that makes sense for the category.
    if (!MARKET_UNITS[next].some((option) => option.value === unit)) setUnit(MARKET_UNITS[next][0].value);
  }

  const uploaded = photos.filter((photo) => photo.media);
  const uploading = photos.some((photo) => photo.uploading);
  const photoUrls = uploaded.map((photo) => (photo.media as UploadedMedia).publicUrl);

  function patchPhoto(id: string, change: Partial<PhotoEntry>) {
    setPhotos((current) => current.map((photo) => (photo.id === id ? { ...photo, ...change } : photo)));
  }

  async function addFiles(list: FileList | File[]) {
    let room = MAX_PHOTOS - photos.filter((photo) => !photo.error).length;
    for (const file of Array.from(list)) {
      const id = crypto.randomUUID();
      const entry: PhotoEntry = { id, name: file.name, size: file.size };
      const problem = !IMAGE_TYPES.includes(file.type) ? "Not a photo. Only JPG, PNG, WebP or GIF." : validateMediaFile(file, false) ?? (room <= 0 ? `Only ${MAX_PHOTOS} photos fit on a listing.` : null);
      if (problem) {
        setPhotos((current) => [...current, { ...entry, error: problem }]);
        continue;
      }
      room -= 1;
      setPhotos((current) => [...current, { ...entry, uploading: true }]);
      try {
        patchPhoto(id, { media: await uploadMedia(file, { allowVideo: false }), uploading: false });
      } catch (error) {
        patchPhoto(id, { uploading: false, error: errorMessage(error) });
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void addFiles(event.dataTransfer.files);
  }

  function makeCover(id: string) {
    setPhotos((current) => {
      const chosen = current.find((photo) => photo.id === id);
      return chosen ? [chosen, ...current.filter((photo) => photo.id !== id)] : current;
    });
    setMenuFor(null);
  }

  function removePhoto(id: string) {
    setPhotos((current) => current.filter((photo) => photo.id !== id));
    setMenuFor(null);
  }

  /** Checks the step being left; returns whether it can go on. */
  function validate(at: number) {
    const found: Record<string, string> = {};
    if (at === 0 && !title.trim()) found.title = "Give your listing a title";
    if (at === 2) {
      if (!(amount > 0)) found.price = "Enter a price above zero";
      if (!location.trim()) found.location = "Say where the item is";
      if (counted && stockCount !== null && !(Number.isInteger(stockCount) && stockCount > 0)) found.stock = "Use a whole number above zero";
      if (counted && minCount !== null && !(Number.isInteger(minCount) && minCount > 0)) found.minOrder = "Use a whole number above zero";
      if (counted && !found.stock && !found.minOrder && stockCount !== null && minCount !== null && minCount > stockCount) found.minOrder = "More than you have in stock";
      if (counted && delivers && feeAmount !== null && !(feeAmount >= 0)) found.deliveryFee = "Use zero or more";
      if (counted && (bulkQty.trim() || bulkPrice.trim())) {
        if (!(bulkCount !== null && Number.isInteger(bulkCount) && bulkCount >= 2)) found.bulkQty = "Use a whole number of 2 or more";
        if (!(bulkAmount !== null && bulkAmount > 0 && bulkAmount < amount)) found.bulkPrice = "Must be above zero and below the normal price";
      }
    }
    setErrors(found);
    return Object.keys(found).length === 0;
  }

  function submit() {
    const input = {
      category,
      title: title.trim(),
      description: description.trim(),
      price: amount,
      unit,
      location: location.trim(),
      stock: counted ? stockCount : null,
      minOrder: counted ? minCount : null,
      deliveryAvailable: counted && delivers,
      deliveryFee: counted && delivers ? feeAmount : null,
      bulkMinQuantity: counted && bulkQty.trim() ? bulkCount : null,
      bulkPrice: counted && bulkQty.trim() ? bulkAmount : null,
      photos: photoUrls,
    };
    const done = () => onSubmitted(input.title);
    if (listing) update.mutate({ id: listing.id, listing: input }, { onSuccess: done });
    else create.mutate(input, { onSuccess: done });
  }

  function next() {
    if (!validate(step)) return;
    if (step < STEPS.length - 1) setStep((current) => current + 1);
    else submit();
  }

  const preview: MarketOffer = {
    id: "preview",
    category,
    title: title.trim() || "Your title",
    location: location.trim() || "Add a location",
    price: amount > 0 ? amount : 0,
    currency: "GHS",
    unit,
    coverUrl: photoUrls[0] ?? null,
    deliveryAvailable: counted && delivers,
    stock: null,
    detailRoute: "",
    sellerAccountId: "",
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="flex min-h-0 flex-1">
      <nav aria-label="Steps" className="hidden w-[190px] shrink-0 flex-col border-r border-gray-200 p-5 lg:flex">
        <h2 id="list-marketplace-title" className="text-base font-bold leading-6 text-[#0f172a]">
          List on Marketplace
        </h2>
        <ol className="mt-5 flex flex-col gap-4">
          {STEPS.map((name, index) => (
            <li key={name} aria-current={index === step ? "step" : undefined} className={cn("flex flex-col border-l-[3px] pl-3 leading-[1.35]", index === step ? "border-brand-900" : "border-transparent")}>
              <span className={cn("flex items-center gap-1.5 text-[13px]", index === step ? "text-brand-900" : index < step ? "text-[#334155]" : "text-[#94a3b8]")}>
                Step {index + 1}/{STEPS.length}
                {index < step && <Image src="/icons/checkmark-badge-01.svg" alt="Done" width={14} height={14} />}
              </span>
              <span className={cn("text-[15px] font-semibold", index === step ? "text-[#0f172a]" : index < step ? "text-[#334155]" : "text-[#94a3b8]")}>{name}</span>
            </li>
          ))}
        </ol>
        <div className="mt-auto flex flex-col gap-1 rounded-xl bg-[#f8fafc] p-3">
          <p className="text-[13px] font-semibold text-[#0f172a]">Checked before it goes live</p>
          <p className="text-xs leading-[17px] text-gray-500">New listings are reviewed, usually within a few hours.</p>
        </div>
      </nav>

      <aside className="hidden w-[320px] shrink-0 flex-col justify-center gap-4 border-r border-gray-200 bg-[#f1f5f9] p-5 xl:flex">
        <div className="flex flex-col gap-0.5">
          <p className="text-[15px] font-bold text-[#0f172a]">Preview</p>
          <p className="text-[13px] text-gray-500">This is how buyers will see your listing.</p>
        </div>
        <div inert>
          <MarketplaceCard offer={preview} href={null} />
        </div>
        <p className="text-center text-[13px] text-gray-500">{step === STEPS.length - 1 ? "Shows as “Pending review” until approved." : "Updates as you fill in each step."}</p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 flex-col px-5 pt-4 sm:px-7 sm:pt-5">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => (step === 0 ? onClose() : setStep((current) => current - 1))} className="flex items-center gap-1 text-[13px] font-medium text-[#475569] hover:text-[#0f172a]">
              ‹ {step === 0 ? "Back to Marketplace" : "Back"}
            </button>
            <button type="button" aria-label="Close" onClick={onClose} className="flex size-8 items-center justify-center rounded-full text-lg leading-none text-gray-500 hover:bg-gray-100">
              ×
            </button>
          </div>
          <div className="lg:hidden">
            <WizardSteps steps={STEPS} current={step + 1} />
          </div>
        </div>

        <div className="flex min-h-[300px] flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-3 sm:px-7">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold leading-7 text-[#0f172a]">{HEADINGS[step].title}</h2>
            <p className="text-sm leading-5 text-gray-500">{HEADINGS[step].subtitle}</p>
          </div>

          {step === 0 && (
            <>
              <FormField label="Category">
                <div role="radiogroup" aria-label="Category" className="grid grid-cols-3 gap-2.5">
                  {MARKET_CATEGORIES.map((option) => (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={category === option}
                      onClick={() => chooseCategory(option)}
                      className={cn("h-11 rounded-[10px] border text-sm font-medium", category === option ? "border-brand-900 bg-[#eff5ff] text-brand-900" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50")}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </FormField>
              <FormField label="Title" error={errors.title}>
                <div className={cn(FIELD_BOX, errors.title ? "border-[#dc2626]" : "border-gray-200")}>
                  <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={TITLE_MAX} aria-label="Title" placeholder={CATEGORY_PLACEHOLDER[category]} className={FIELD_INPUT} />
                </div>
                <p className="text-xs text-gray-500">
                  {title.length} / {TITLE_MAX}
                </p>
              </FormField>
              <FormField label="Description">
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} maxLength={1000} aria-label="Description" placeholder="Condition, quantity, how to reach you" className={cn(TEXTAREA, "border-gray-200")} />
              </FormField>
            </>
          )}

          {step === 1 && (
            <>
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={cn("flex flex-col items-center gap-1 rounded-2xl border border-dashed px-4 py-5 text-center", dragging ? "border-brand-900 bg-[#eff5ff]" : "border-[#94a3b8]/70")}
              >
                <span aria-hidden className="text-2xl font-light leading-6 text-brand-900">
                  +
                </span>
                <p className="text-sm font-semibold text-[#0f172a]">Choose photos or drag them here</p>
                <p className="text-xs text-gray-500">JPG, PNG, WebP or GIF · up to 10 MB each · max {MAX_PHOTOS}</p>
                <button type="button" onClick={() => fileInput.current?.click()} className="mt-1.5 h-9 rounded-full border border-gray-200 bg-white px-4 text-[13px] font-semibold text-[#0f172a] hover:bg-gray-50">
                  Browse files
                </button>
                <input ref={fileInput} type="file" accept={IMAGE_TYPES.join(",")} multiple hidden onChange={(event) => event.target.files && void addFiles(event.target.files)} />
              </div>

              <ul className="flex flex-col gap-3">
                {photos.map((photo, index) => (
                  <li key={photo.id} className="flex items-center gap-3">
                    <span className={cn("relative block size-10 shrink-0 overflow-hidden rounded-lg", photo.error ? "bg-[#fee2e2]" : "bg-[#eef2ff]")}>
                      {photo.media && <Image src={photo.media.publicUrl} alt="" fill unoptimized className="object-cover" sizes="40px" />}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center gap-2">
                        <span className={cn("truncate text-sm font-semibold", photo.error ? "text-[#b91c1c]" : "text-[#0f172a]")}>{photo.name}</span>
                        {photo.media && index === photos.findIndex((item) => item.media) && <span className="shrink-0 rounded-full bg-[#eff5ff] px-2 py-0.5 text-[11px] font-semibold text-brand-900">★ Cover</span>}
                      </span>
                      <span className={cn("truncate text-xs", photo.error ? "text-[#b91c1c]" : "text-gray-500")}>{photo.error ?? (photo.uploading ? "Uploading…" : megabytes(photo.size))}</span>
                    </span>
                    {photo.error ? (
                      <button type="button" onClick={() => removePhoto(photo.id)} className="shrink-0 text-[13px] font-semibold text-[#b91c1c] hover:underline">
                        Remove
                      </button>
                    ) : (
                      <span className="relative shrink-0">
                        <button type="button" aria-label={`Options for ${photo.name}`} aria-expanded={menuFor === photo.id} onClick={() => setMenuFor((current) => (current === photo.id ? null : photo.id))} className="flex size-8 items-center justify-center rounded-full text-lg leading-none text-gray-500 hover:bg-gray-100">
                          ⋮
                        </button>
                        {menuFor === photo.id && (
                          <>
                            <button type="button" aria-hidden tabIndex={-1} onClick={() => setMenuFor(null)} className="fixed inset-0 z-[1] cursor-default" />
                            <span className="absolute right-0 top-9 z-[2] flex w-36 flex-col rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                              {photo.media && index !== photos.findIndex((item) => item.media) && (
                                <button type="button" onClick={() => makeCover(photo.id)} className="rounded-lg px-3 py-2 text-left text-[13px] font-medium text-[#334155] hover:bg-gray-50">
                                  Make cover
                                </button>
                              )}
                              <button type="button" onClick={() => removePhoto(photo.id)} className="rounded-lg px-3 py-2 text-left text-[13px] font-medium text-[#b91c1c] hover:bg-gray-50">
                                Remove
                              </button>
                            </span>
                          </>
                        )}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Price" error={errors.price}>
                  <div className={cn(FIELD_BOX, errors.price ? "border-[#dc2626]" : "border-gray-200")}>
                    <span className="text-sm text-gray-500">GHS</span>
                    <input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" aria-label="Price" placeholder="0" className={FIELD_INPUT} />
                  </div>
                </FormField>
                <FormField label="Unit">
                  <SelectField aria-label="Unit" value={unit} onChange={setUnit} options={units} className="h-11 rounded-[10px] [@media(max-height:860px)]:h-10" />
                </FormField>
              </div>

              {counted && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="In stock" error={errors.stock}>
                    <div className={cn(FIELD_BOX, errors.stock ? "border-[#dc2626]" : "border-gray-200")}>
                      <input value={stock} onChange={(event) => setStock(event.target.value)} inputMode="numeric" aria-label="In stock" className={FIELD_INPUT} />
                      <span className="text-sm text-gray-500">{noun}</span>
                    </div>
                  </FormField>
                  <FormField label="Minimum order" error={errors.minOrder}>
                    <div className={cn(FIELD_BOX, errors.minOrder ? "border-[#dc2626]" : "border-gray-200")}>
                      <input value={minOrder} onChange={(event) => setMinOrder(event.target.value)} inputMode="numeric" aria-label="Minimum order" className={FIELD_INPUT} />
                      <span className="text-sm text-gray-500">{noun}</span>
                    </div>
                  </FormField>
                </div>
              )}

              <FormField label="Location" error={errors.location}>
                <div className={cn(FIELD_BOX, errors.location ? "border-[#dc2626]" : "border-gray-200")}>
                  <input value={location} onChange={(event) => setLocation(event.target.value)} maxLength={100} aria-label="Location" placeholder="e.g. Spintex, Accra" className={FIELD_INPUT} />
                </div>
                <p className="text-xs text-gray-500">Only the area is shown. Your exact address is shared after you accept an order.</p>
              </FormField>

              {counted && (
                <FormField label="Delivery">
                  <div role="radiogroup" aria-label="Delivery" className="grid grid-cols-2 gap-3">
                    {[
                      { value: false, label: "Pickup only" },
                      { value: true, label: "I can deliver" },
                    ].map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        role="radio"
                        aria-checked={delivers === option.value}
                        onClick={() => setDelivers(option.value)}
                        className={cn("h-11 rounded-[10px] border text-sm font-medium", delivers === option.value ? "border-brand-900 bg-[#eff5ff] text-brand-900" : "border-gray-200 bg-white text-[#334155] hover:bg-gray-50")}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </FormField>
              )}

              {counted && delivers && (
                <FormField label="Delivery fee" error={errors.deliveryFee}>
                  <div className={cn(FIELD_BOX, errors.deliveryFee ? "border-[#dc2626]" : "border-gray-200")}>
                    <span className="text-sm text-gray-500">GHS</span>
                    <input value={deliveryFee} onChange={(event) => setDeliveryFee(event.target.value)} inputMode="decimal" aria-label="Delivery fee" placeholder="0" className={FIELD_INPUT} />
                  </div>
                  <p className="text-xs text-gray-500">Charged once per order. Leave empty for free delivery.</p>
                </FormField>
              )}

              {counted && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Bulk from (optional)" error={errors.bulkQty}>
                    <div className={cn(FIELD_BOX, errors.bulkQty ? "border-[#dc2626]" : "border-gray-200")}>
                      <input value={bulkQty} onChange={(event) => setBulkQty(event.target.value)} inputMode="numeric" aria-label="Bulk from" className={FIELD_INPUT} />
                      <span className="text-sm text-gray-500">{noun}</span>
                    </div>
                  </FormField>
                  <FormField label="Bulk price" error={errors.bulkPrice}>
                    <div className={cn(FIELD_BOX, errors.bulkPrice ? "border-[#dc2626]" : "border-gray-200")}>
                      <span className="text-sm text-gray-500">GHS</span>
                      <input value={bulkPrice} onChange={(event) => setBulkPrice(event.target.value)} inputMode="decimal" aria-label="Bulk price" className={FIELD_INPUT} />
                    </div>
                  </FormField>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <dl className="flex flex-col rounded-2xl bg-[#f8fafc] px-4 py-0.5 text-[13px]">
                {[
                  { label: "Category", value: category },
                  { label: "Price", value: [`${formatMoney(amount)} ${unitLabel}`, counted && stockCount !== null ? `${stockCount} in stock` : null].filter(Boolean).join(" · ") },
                  { label: "Location", value: [location.trim(), counted ? (delivers ? "delivers" : "pickup only") : null].filter(Boolean).join(" · ") },
                  { label: "Photos", value: `${photoUrls.length} ${photoUrls.length === 1 ? "photo" : "photos"}` },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4 border-b border-gray-200 py-2.5 last:border-b-0">
                    <dt className="shrink-0 text-gray-500">{row.label}</dt>
                    <dd className="min-w-0 text-right font-semibold text-[#0f172a]">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <label className="flex items-start gap-2.5 text-xs leading-[18px] text-[#334155]">
                <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[#1465e6]" />
                I am authorised to sell or list this item, and the details are accurate. I understand Biltlinx reviews listings but does not confirm ownership.
              </label>

              <p className="rounded-xl border border-[#fde68a] bg-[#fefce8] p-2.5 text-xs leading-[18px] text-[#b45309]">
                No stolen or counterfeit goods, no deposits outside Biltlinx and no misleading prices. Listings that break these rules are removed and the account may be suspended.
              </p>
            </>
          )}
        </div>

        <div className="shrink-0 px-5 pb-4 pt-2 sm:px-7 sm:pb-5">
          <Button variant="primary" onClick={next} disabled={uploading || saving || (step === STEPS.length - 1 && !agreed)} className="h-11 w-full rounded-full text-[15px] font-semibold">
            {step < STEPS.length - 1 ? "Continue" : saving ? "Saving…" : listing ? "Save changes" : "Submit for review"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** What you see once a listing is submitted (Figma node 1607:51092). */
function Submitted({ title, editing, onClose }: { title: string; editing: boolean; onClose: () => void }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-3 px-6 pb-6 pt-8 text-center sm:px-8">
      <span className="flex size-16 items-center justify-center rounded-full bg-[#dcfce7]">
        <Image src="/icons/checkmark-badge-01.svg" alt="" width={30} height={30} />
      </span>
      <h2 id="list-marketplace-title" className="text-xl font-bold leading-7 text-[#0f172a]">
        {editing ? "Changes saved" : "Submitted for review"}
      </h2>
      <p className="text-sm leading-5 text-[#475569]">
        {editing
          ? `Your “${title}” listing was updated. If you changed the title, category or description it goes back to review before it shows again.`
          : `Your “${title}” listing is now “Pending review”. We check new listings, usually within a few hours. You can edit, pause or take it down any time from Manage › Marketplace.`}
      </p>
      <div className="mt-2 flex w-full flex-col gap-2.5">
        <Button
          variant="primary"
          onClick={() => {
            onClose();
            router.push("/manage/marketplace");
          }}
          className="h-12 w-full rounded-full text-[15px] font-semibold"
        >
          View in Manage
        </Button>
        <Button variant="outline" onClick={onClose} className="h-12 w-full rounded-full text-[15px] font-semibold">
          Back to Marketplace
        </Button>
      </div>
    </div>
  );
}

/** List something on the marketplace (Figma nodes 1607:50286 to 1607:50963): four steps with a live preview of the card, then a confirmation (1607:51092). */
export function CreateMarketplaceListingModal({ open, onClose, listing }: { open: boolean; onClose: () => void; listing?: MarketListing }) {
  const [submitted, setSubmitted] = useState<string | null>(null);

  function close() {
    setSubmitted(null);
    onClose();
  }

  return (
    <>
      <CenteredDialog open={open && submitted === null} onClose={close} labelledBy="list-marketplace-title" className="max-w-[980px] lg:h-[600px]">
        <Form key={listing?.id ?? "new"} listing={listing} onClose={close} onSubmitted={setSubmitted} />
      </CenteredDialog>
      <CenteredDialog open={open && submitted !== null} onClose={close} labelledBy="list-marketplace-title" className="max-w-[480px]">
        <Submitted title={submitted ?? ""} editing={Boolean(listing)} onClose={close} />
      </CenteredDialog>
    </>
  );
}
