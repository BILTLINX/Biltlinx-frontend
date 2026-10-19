"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavIcon } from "@/components/shared/NavIcon";
import { OnboardingRadioDot } from "@/components/shared/OnboardingRadioDot";
import { OnboardingStepper } from "@/components/shared/OnboardingStepper";
import { OnboardingTopBar } from "@/components/shared/OnboardingTopBar";
import { OptionSelectField } from "@/components/shared/ViewingSlotPickers";
import { comingSoonHref } from "@/lib/coming-soon";
import { BUSINESS_STEPS, DELIVERY_OPTIONS, NEW_BUSINESS, PRODUCT_UNITS, SUPPLY_CATEGORIES } from "@/lib/dummy-onboarding";
import { initialsOf } from "@/lib/initials";
import { loadBusinessDraft, updateBusinessDraft, type BusinessDraft } from "@/lib/onboarding-draft";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6";
const INPUT = "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[13px] text-sm leading-[1.45] text-[#0f172a] focus-within:border-brand-900";
const MAX_PRODUCTS = 20;
/** What steps 1 and 2 earned when nothing was saved. */
const DEFAULT_STRENGTH = 50;

interface Product {
  id: number;
  name: string;
  price: string;
  unit: string;
}

function toggled<T>(items: T[], item: T) {
  return items.includes(item) ? items.filter((existing) => existing !== item) : [...items, item];
}

/** Onboarding · Business · 3 What you sell (Figma node 1073:32077): categories, delivery and the first products. */
export default function BusinessWhatYouSellPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BusinessDraft | null>(null);
  const [categoryOptions, setCategoryOptions] = useState(SUPPLY_CATEGORIES);
  const [categories, setCategories] = useState(SUPPLY_CATEGORIES.slice(0, 3));
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<(typeof DELIVERY_OPTIONS)[number]["id"]>("deliver");
  const [products, setProducts] = useState<Product[]>([]);
  // The product being typed: a new one (id 0) or an existing one being edited.
  const [editing, setEditing] = useState<Product | null>(null);
  const [formError, setFormError] = useState("");

  // Earlier steps' choices live in the tab session, so they are read after mount.
  useEffect(() => setDraft(loadBusinessDraft()), []);

  const details = draft?.details;
  const delivers = delivery === "deliver";
  const strength = (draft?.strength ?? DEFAULT_STRENGTH) + (categories.length > 0 ? 10 : 0) + (products.length > 0 ? 10 : 0);
  const deliveryPreview = DELIVERY_OPTIONS.find((option) => option.id === delivery)?.preview ?? "";
  const businessName = details?.name ?? NEW_BUSINESS.name;

  function addCategory() {
    const label = (newCategory ?? "").trim();
    setNewCategory(null);
    if (!label) return;
    const existing = categoryOptions.find((option) => option.toLowerCase() === label.toLowerCase());
    if (existing) {
      setCategories((current) => (current.includes(existing) ? current : [...current, existing]));
      return;
    }
    setCategoryOptions((current) => [...current, label]);
    setCategories((current) => [...current, label]);
  }

  function saveProduct() {
    if (!editing) return;
    if (!editing.name.trim()) return setFormError("Enter the product's name.");
    if (!editing.price) return setFormError("Enter its price.");
    const clean = { ...editing, name: editing.name.trim() };
    setProducts((current) => (clean.id === 0 ? [...current, { ...clean, id: Math.max(0, ...current.map((product) => product.id)) + 1 }] : current.map((product) => (product.id === clean.id ? clean : product))));
    setEditing(null);
    setFormError("");
  }

  function save() {
    updateBusinessDraft({ strength, sell: { categories, delivery: deliveryPreview, products: products.length } });
  }

  function handleContinue() {
    save();
    router.push("/onboarding/business/verification");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8fafc]">
      <OnboardingTopBar title="Setting up your business" actionLabel="Save and finish later" onAction={() => router.push("/home")} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pb-12 pt-8 sm:px-12 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:gap-8">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <OnboardingStepper
              title="Business setup"
              duration="About 5 minutes"
              icon="/icons/onboarding-building.svg"
              iconClass="-scale-y-100"
              steps={BUSINESS_STEPS}
              current={2}
              note="Your personal account stays separate. You manage the business from Manage once it is set up."
            />
          </div>

          <main className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-1.5 leading-[1.45]">
              <p className="text-xs font-bold uppercase tracking-[0.72px] text-brand-900">Step 3 of 5</p>
              <h1 className="text-[28px] font-bold text-[#0f172a]">What do you sell?</h1>
              <p className="text-[15px] text-gray-500">Your products appear in Marketplace with clear prices and units.</p>
            </div>

            <section className={cn(CARD, "gap-5")}>
              <div className="flex flex-col gap-2">
                <p className="text-[13px] font-medium leading-[1.45] text-[#334155]">Categories</p>
                <div role="group" aria-label="Categories" className="flex flex-wrap gap-2">
                  {categoryOptions.map((option) => {
                    const selected = categories.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setCategories((current) => toggled(current, option))}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] leading-[1.45]",
                          selected ? "border-brand-900 bg-[#eff5ff] font-semibold text-brand-900" : "border-gray-200 bg-white font-medium text-[#334155] hover:border-gray-300",
                        )}
                      >
                        {selected && <NavIcon icon="/icons/onboarding-tick.svg" size={10} className="bg-brand-900" />}
                        {option}
                      </button>
                    );
                  })}
                  {newCategory === null ? (
                    <button type="button" onClick={() => setNewCategory("")} className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-[13px] font-medium leading-[1.45] text-[#334155] hover:border-gray-300">
                      + Add category
                    </button>
                  ) : (
                    <input
                      autoFocus
                      value={newCategory}
                      maxLength={30}
                      aria-label="New category"
                      placeholder="Category name"
                      onChange={(event) => setNewCategory(event.target.value)}
                      onBlur={addCategory}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") addCategory();
                        if (event.key === "Escape") setNewCategory(null);
                      }}
                      className="w-40 rounded-full border border-brand-900 bg-white px-3.5 py-2 text-[13px] leading-[1.45] text-[#0f172a] focus:outline-none"
                    />
                  )}
                </div>
              </div>

              <div role="radiogroup" aria-label="Delivery" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {DELIVERY_OPTIONS.map((option) => {
                  const selected = option.id === delivery;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setDelivery(option.id)}
                      className={cn("flex items-center gap-3.5 rounded-xl p-4 text-left", selected ? "border-[1.5px] border-brand-900 bg-[#eff5ff] p-[15.5px]" : "border border-gray-200 bg-white hover:border-gray-300")}
                    >
                      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-[10px]", selected ? "bg-white" : "bg-[#f1f5f9]")}>
                        <NavIcon icon={option.icon} size={20} className={cn(selected ? "bg-brand-900" : "bg-[#334155]", "iconClass" in option && option.iconClass)} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                        <span className="text-sm font-semibold text-[#0f172a]">{option.title}</span>
                        <span className="text-[13px] text-gray-500">{option.note}</span>
                      </span>
                      <OnboardingRadioDot selected={selected} />
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={CARD}>
              <div className="flex items-center justify-between gap-3 leading-[1.45]">
                <div className="flex min-w-0 flex-col gap-1">
                  <h2 className="text-base font-bold text-[#0f172a]">Add your first products</h2>
                  <p className="text-[13px] text-gray-500">Two or three is enough to open your storefront</p>
                </div>
                <button type="button" onClick={() => router.push(comingSoonHref("Import products from a spreadsheet"))} className="shrink-0 whitespace-nowrap text-[13px] font-semibold text-brand-900">
                  Import from a spreadsheet
                </button>
              </div>

              {products.map((product) =>
                editing?.id === product.id ? null : (
                  <div key={product.id} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#f1f5f9]">
                      <NavIcon icon="/icons/onboarding-image-add.svg" size={22} className="bg-gray-500" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col leading-[1.45]">
                      <span className="truncate text-sm font-semibold text-[#0f172a]">{product.name}</span>
                      <span className="text-xs text-gray-500">In stock · {delivers ? "Delivery available" : "Pickup only"}</span>
                    </span>
                    <span className="flex shrink-0 items-baseline gap-1 whitespace-nowrap leading-[1.45]">
                      <span className="text-[15px] font-bold text-[#0f172a]">GHS {Number(product.price).toLocaleString("en-GB")}</span>
                      <span className="text-xs font-medium text-gray-500">{product.unit}</span>
                    </span>
                    <button type="button" aria-label={`Edit ${product.name}`} onClick={() => { setEditing(product); setFormError(""); }} className="shrink-0 rounded p-1 hover:bg-gray-50">
                      <NavIcon icon="/icons/onboarding-edit.svg" size={18} className="bg-gray-500" />
                    </button>
                    <button type="button" aria-label={`Remove ${product.name}`} onClick={() => setProducts((current) => current.filter((item) => item.id !== product.id))} className="shrink-0 rounded p-1 hover:bg-gray-50">
                      <NavIcon icon="/icons/onboarding-cancel.svg" size={12} className="bg-gray-500" />
                    </button>
                  </div>
                ),
              )}

              {products.length === 0 && !editing && <p className="rounded-xl border border-dashed border-[#94a3b8] bg-[#f8fafc] px-4 py-5 text-center text-[13px] leading-[1.45] text-gray-500">No products yet. Add one below, or do it later from Manage.</p>}

              {editing ? (
                <div className="flex flex-col gap-3 rounded-xl border border-brand-900 bg-[#f8fafc] p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_150px_150px]">
                    <label className="flex min-w-0 flex-col gap-1.5">
                      <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Product</span>
                      <span className={INPUT}>
                        <input autoFocus value={editing.name} maxLength={60} placeholder="Dangote cement 42.5R, 50 kg" onChange={(event) => setEditing({ ...editing, name: event.target.value })} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                      </span>
                    </label>
                    <label className="flex min-w-0 flex-col gap-1.5">
                      <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Price</span>
                      <span className={INPUT}>
                        <span className="text-sm font-medium text-gray-500">GHS</span>
                        <input value={editing.price} inputMode="numeric" maxLength={7} placeholder="0" onChange={(event) => setEditing({ ...editing, price: event.target.value.replace(/\D/g, "") })} className="min-w-0 flex-1 bg-transparent placeholder:text-[#94a3b8] focus:outline-none" />
                      </span>
                    </label>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <span className="text-[13px] font-medium leading-[1.45] text-[#334155]">Unit</span>
                      <OptionSelectField value={editing.unit} options={PRODUCT_UNITS} onChange={(unit) => setEditing({ ...editing, unit })} />
                    </div>
                  </div>
                  {formError && <p className="text-xs text-[#dc2626]">{formError}</p>}
                  <div className="flex gap-3">
                    <button type="button" onClick={saveProduct} className="rounded-[10px] bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
                      {editing.id === 0 ? "Add product" : "Save changes"}
                    </button>
                    <button type="button" onClick={() => { setEditing(null); setFormError(""); }} className="rounded-[10px] px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                products.length < MAX_PRODUCTS && (
                  <button type="button" onClick={() => setEditing({ id: 0, name: "", price: "", unit: PRODUCT_UNITS[0] })} className="flex w-fit items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                    <NavIcon icon="/icons/onboarding-plus.svg" size={16} className="bg-[#0f172a]" />
                    Add a product
                  </button>
                )
              )}
            </section>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => router.push("/onboarding/business/details")} className="flex items-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] hover:bg-gray-50">
                <NavIcon icon="/icons/onboarding-arrow-left.svg" size={10} className="bg-[#0f172a]" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <button type="button" onClick={handleContinue} className="whitespace-nowrap rounded-[10px] px-5 py-3 text-sm font-semibold text-brand-900">
                  Add products later
                </button>
                <button type="button" onClick={handleContinue} className="flex items-center gap-2 rounded-[10px] bg-brand-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                  Continue
                  <NavIcon icon="/icons/onboarding-arrow-right.svg" size={10} className="bg-white" />
                </button>
              </div>
            </div>
          </main>

          <aside className="flex flex-col gap-4 lg:col-start-2 xl:sticky xl:top-8 xl:col-start-3 xl:self-start">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs font-semibold leading-[1.45] text-gray-500">Preview · how others see you</p>
                <NavIcon icon="/icons/onboarding-preview-eye.svg" size={16} className="bg-gray-500" />
              </div>
              <div className="h-16 bg-gradient-to-r from-[#0a1f44] to-brand-900" />
              <div className="flex flex-col gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-xl border-[3px] border-white bg-[#eff5ff] text-lg font-bold text-brand-900">{initialsOf(businessName)}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.45]">
                    <p className="truncate text-base font-bold text-[#0f172a]">{businessName}</p>
                    <p className="truncate text-[13px] text-gray-500">
                      {details?.category ?? "Building materials"} · {details?.place ?? NEW_BUSINESS.location}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold leading-[1.45] text-gray-500">Not verified yet</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[...categories, deliveryPreview].map((tag) => (
                    <span key={tag} className="rounded-lg bg-[#f1f5f9] px-2 py-1 text-xs font-medium leading-[1.45] text-[#334155]">
                      {tag}
                    </span>
                  ))}
                </div>
                <dl className="flex flex-col gap-2 text-[13px] leading-[1.45]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Open</dt>
                    <dd className="text-right font-semibold text-[#0f172a]">{details?.hours ?? "Mon–Sat, 7:30am–5:30pm"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Products</dt>
                    <dd className={cn("font-semibold", products.length > 0 ? "text-[#0f172a]" : "text-[#94a3b8]")}>{products.length > 0 ? `${products.length} listed` : "None yet"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">Plan</dt>
                    <dd className="font-semibold text-[#0f172a]">Free</dd>
                  </div>
                </dl>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs leading-[1.45]">
                    <span className="font-medium text-gray-500">Profile strength</span>
                    <span className="font-bold text-[#16a34a]">{strength}%</span>
                  </div>
                  <div role="progressbar" aria-label="Profile strength" aria-valuemin={0} aria-valuemax={100} aria-valuenow={strength} className="h-1.5 overflow-hidden rounded-[3px] bg-[#e2e8f0]">
                    <div className="h-full rounded-[3px] bg-[#16a34a] transition-all" style={{ width: `${strength}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-[14px] bg-[#eff5ff] p-4">
              <NavIcon icon="/icons/onboarding-info-circle.svg" size={20} className="shrink-0 bg-brand-900" />
              <div className="flex min-w-0 flex-col gap-1 text-[13px] leading-[1.45]">
                <p className="font-bold text-[#0f172a]">Prices stay in sync</p>
                <p className="text-[#334155]">Change a price once in Manage and it updates everywhere: your page, Marketplace and any saved lists.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
