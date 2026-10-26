"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageContainer } from "@/components/shared/PageContainer";
import { SelectField } from "@/components/shared/SelectField";
import { Skeleton } from "@/components/ui/Skeleton";
import { SERVICES_KEY, useIncomingQuoteRequests, useIncomingServiceBookings, useMyOfferings, useMyProvider, useServicesMutations, useTaxonomy } from "@/hooks/useServices";
import { errorMessage, notifyError } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import {
  addPortfolioItem,
  createOffering,
  offeringAction,
  publishMyProvider,
  removePortfolioItem,
  saveMyProvider,
  unpublishMyProvider,
  updateOffering,
} from "@/lib/services-api";
import { SERVICE_BOOKING_TONE } from "@/lib/services-labels";
import { uploadMedia } from "@/lib/upload";
import type { OfferingDto, ProviderDto } from "@/types/api/schema";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-3.5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6";
const TITLE = "text-base font-bold text-[#0f172a]";
const FIELD = "h-10 min-w-0 rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] text-[#0f172a] focus:border-brand-900 focus:outline-none";
const MODES = [
  { value: "FixedPrice", label: "Fixed price (customers book a date)" },
  { value: "QuoteRequired", label: "Quote required" },
  { value: "InspectionFirst", label: "Inspection first" },
] as const;
const PRICING = ["Hourly", "Daily", "PerJob", "QuoteOnly"] as const;
const UNITS = ["PerJob", "PerHour", "PerDay", "PerSqm", "PerUnit"] as const;

const list = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
const num = (value: string) => (value.trim() === "" ? null : Number(value.replace(/,/g, "")));

function ProfileSection({ provider }: { provider: ProviderDto | null }) {
  const queryClient = useQueryClient();
  const taxonomy = useTaxonomy();
  const [form, setForm] = useState({
    displayName: "",
    headline: "",
    bio: "",
    city: "",
    areas: "",
    radius: "",
    urgent: false,
    isProfessional: false,
    profession: "",
    specialisations: "",
    body: "",
    regNumber: "",
    firm: "",
    profYears: "",
    isArtisan: false,
    trade: "",
    skills: "",
    pricing: "PerJob",
    business: false,
    crew: "",
    artYears: "",
  });
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current || !provider) return;
    seeded.current = true;
    setForm({
      displayName: provider.displayName ?? "",
      headline: provider.headline ?? "",
      bio: provider.bio ?? "",
      city: provider.city ?? "",
      areas: (provider.serviceAreas ?? []).join(", "),
      radius: provider.serviceRadiusKm?.toString() ?? "",
      urgent: provider.urgentAvailable,
      isProfessional: Boolean(provider.professional.profession),
      profession: provider.professional.profession ?? "",
      specialisations: (provider.professional.specialisations ?? []).join(", "),
      body: provider.professional.registrationBody ?? "",
      regNumber: provider.professional.registrationNumber ?? "",
      firm: provider.professional.firmName ?? "",
      profYears: provider.professional.yearsExperience?.toString() ?? "",
      isArtisan: Boolean(provider.artisan.trade),
      trade: provider.artisan.trade ?? "",
      skills: (provider.artisan.skills ?? []).join(", "),
      pricing: provider.artisan.pricing ?? "PerJob",
      business: provider.artisan.isBusiness,
      crew: provider.artisan.crewSize?.toString() ?? "",
      artYears: provider.artisan.yearsExperience?.toString() ?? "",
    });
  }, [provider]);

  const save = useMutation({
    mutationFn: () =>
      saveMyProvider({
        displayName: form.displayName.trim(),
        headline: form.headline.trim() || null,
        bio: form.bio.trim() || null,
        city: form.city.trim(),
        serviceAreas: list(form.areas),
        serviceRadiusKm: num(form.radius),
        urgentAvailable: form.urgent,
        professional: form.isProfessional
          ? { profession: form.profession, specialisations: list(form.specialisations), registrationBody: form.body.trim() || null, registrationNumber: form.regNumber.trim() || null, firmName: form.firm.trim() || null, yearsExperience: num(form.profYears) }
          : (null as never),
        artisan: form.isArtisan
          ? { trade: form.trade, skills: list(form.skills), pricing: form.pricing, isBusiness: form.business, crewSize: num(form.crew), yearsExperience: num(form.artYears) }
          : (null as never),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
      showSuccessToast("Profile saved");
    },
    onError: (error) => notifyError(error, "The profile could not be saved."),
  });

  const publish = useMutation({
    mutationFn: () => (provider?.isPublished ? unpublishMyProvider() : publishMyProvider()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
      showSuccessToast(provider?.isPublished ? "Your profile is hidden" : "Your profile is live");
    },
    onError: (error) => notifyError(error),
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));
  const canSave = form.displayName.trim() !== "" && form.city.trim() !== "" && (form.isProfessional || form.isArtisan);

  return (
    <section className={CARD}>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className={cn(TITLE, "flex-1")}>Your provider profile</h2>
        {provider && (
          <button type="button" disabled={publish.isPending} onClick={() => publish.mutate()} className="h-9 rounded-[10px] border border-gray-200 px-4 text-[13px] font-medium text-[#0f172a] hover:bg-gray-50 disabled:opacity-60">
            {provider.isPublished ? "Hide profile" : "Publish profile"}
          </button>
        )}
      </div>
      {provider?.credentialWarning && <p className="rounded-xl bg-[#fef3c7] p-3 text-[13px] text-[#b45309]">{provider.credentialWarning}</p>}
      <div className="grid gap-2.5 sm:grid-cols-2">
        <input className={FIELD} placeholder="Display name" value={form.displayName} onChange={(event) => set("displayName", event.target.value)} />
        <input className={FIELD} placeholder="Headline (one line)" value={form.headline} onChange={(event) => set("headline", event.target.value)} />
        <input className={FIELD} placeholder="City" value={form.city} onChange={(event) => set("city", event.target.value)} />
        <input className={FIELD} placeholder="Other areas you serve (comma separated)" value={form.areas} onChange={(event) => set("areas", event.target.value)} />
        <input className={FIELD} placeholder="Service radius (km)" inputMode="numeric" value={form.radius} onChange={(event) => set("radius", event.target.value)} />
        <label className="flex items-center gap-2 text-[13px] text-[#334155]">
          <input type="checkbox" checked={form.urgent} onChange={(event) => set("urgent", event.target.checked)} className="size-4 accent-[#1465e6]" />
          I take urgent jobs
        </label>
      </div>
      <textarea className="rounded-[10px] border border-gray-200 px-3 py-2 text-[13px] focus:border-brand-900 focus:outline-none" rows={3} placeholder="About you" value={form.bio} onChange={(event) => set("bio", event.target.value)} />

      <label className="flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
        <input type="checkbox" checked={form.isProfessional} onChange={(event) => set("isProfessional", event.target.checked)} className="size-4 accent-[#1465e6]" />
        I am a professional (architect, surveyor, engineer, lawyer…)
      </label>
      {form.isProfessional && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          <SelectField value={form.profession} onChange={(value) => set("profession", value)} aria-label="Profession" placeholder="Profession" options={(taxonomy.data?.professions ?? []).map((item) => ({ value: item, label: item }))} />
          <input className={FIELD} placeholder="Specialisations (comma separated)" value={form.specialisations} onChange={(event) => set("specialisations", event.target.value)} />
          <input className={FIELD} placeholder="Registration body (e.g. GhIS)" value={form.body} onChange={(event) => set("body", event.target.value)} />
          <input className={FIELD} placeholder="Registration number" value={form.regNumber} onChange={(event) => set("regNumber", event.target.value)} />
          <input className={FIELD} placeholder="Firm name" value={form.firm} onChange={(event) => set("firm", event.target.value)} />
          <input className={FIELD} placeholder="Years of experience" inputMode="numeric" value={form.profYears} onChange={(event) => set("profYears", event.target.value)} />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
        <input type="checkbox" checked={form.isArtisan} onChange={(event) => set("isArtisan", event.target.checked)} className="size-4 accent-[#1465e6]" />
        I am an artisan (electrician, plumber, mason…)
      </label>
      {form.isArtisan && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          <SelectField value={form.trade} onChange={(value) => set("trade", value)} aria-label="Trade" placeholder="Trade" options={(taxonomy.data?.trades ?? []).map((item) => ({ value: item, label: item }))} />
          <input className={FIELD} placeholder="Skills (comma separated)" value={form.skills} onChange={(event) => set("skills", event.target.value)} />
          <SelectField value={form.pricing} onChange={(value) => set("pricing", value)} aria-label="Pricing style" options={PRICING.map((item) => ({ value: item, label: item }))} />
          <label className="flex items-center gap-2 text-[13px] text-[#334155]">
            <input type="checkbox" checked={form.business} onChange={(event) => set("business", event.target.checked)} className="size-4 accent-[#1465e6]" />
            I run a business or crew
          </label>
          <input className={FIELD} placeholder="Crew size" inputMode="numeric" value={form.crew} onChange={(event) => set("crew", event.target.value)} />
          <input className={FIELD} placeholder="Years of experience" inputMode="numeric" value={form.artYears} onChange={(event) => set("artYears", event.target.value)} />
        </div>
      )}
      <p className="text-xs text-gray-500">
        Get your credential checked in the{" "}
        <Link href="/verification" className="font-medium text-brand-900">
          Verification centre
        </Link>
        . Urgent jobs for electrical and gas work need a verified credential.
      </p>
      <button type="button" disabled={!canSave || save.isPending} onClick={() => save.mutate()} className="h-10 w-fit rounded-[10px] bg-brand-900 px-5 text-sm font-medium text-white disabled:opacity-50">
        {save.isPending ? "Saving…" : "Save profile"}
      </button>
    </section>
  );
}

function PortfolioSection({ provider }: { provider: ProviderDto }) {
  const queryClient = useQueryClient();
  const input = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [photos, setPhotos] = useState<{ path: string; contentType: string; name: string; stage: string; url: string }[]>([]);
  const [stage, setStage] = useState("Work");
  const refresh = () => void queryClient.invalidateQueries({ queryKey: SERVICES_KEY });

  const add = useMutation({
    mutationFn: () =>
      addPortfolioItem({ title: title.trim(), description: description.trim() || null, completedYear: num(year), media: photos.map(({ path, contentType, name, stage: s }) => ({ path, contentType, name, stage: s, caption: null })) }),
    onSuccess: () => {
      refresh();
      setTitle("");
      setDescription("");
      setYear("");
      setPhotos([]);
      showSuccessToast("Added to your portfolio");
    },
    onError: (error) => notifyError(error, "It could not be added. A Before photo needs an After photo."),
  });
  const remove = useMutation({ mutationFn: removePortfolioItem, onSuccess: refresh, onError: (error) => notifyError(error) });

  async function upload(files: FileList | null) {
    for (const file of Array.from(files ?? [])) {
      try {
        const media = await uploadMedia(file, { allowVideo: false });
        setPhotos((current) => [...current, { path: media.path, contentType: media.contentType, name: media.name ?? file.name, stage, url: media.publicUrl }]);
      } catch (error) {
        notifyError(error);
      }
    }
  }

  return (
    <section className={CARD}>
      <h2 className={TITLE}>Portfolio</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {(provider.portfolio ?? []).map((item) => (
          <div key={item.id} className="flex gap-3 rounded-xl border border-gray-200 p-3">
            <span className="relative block size-16 shrink-0 overflow-hidden rounded-lg bg-[#eef2ff]">
              {item.media?.[0]?.url && <Image src={item.media[0].url} alt="" fill unoptimized className="object-cover" sizes="64px" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#0f172a]">{item.title}</p>
              <p className="text-xs text-gray-500">{item.completedYear}</p>
              <button type="button" onClick={() => remove.mutate(item.id)} className="text-xs font-medium text-[#dc2626]">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2.5 rounded-xl bg-[#f8fafc] p-4">
        <p className="text-[13px] font-semibold text-[#0f172a]">Add past work</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <input className={FIELD} placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <input className={FIELD} placeholder="Year completed" inputMode="numeric" value={year} onChange={(event) => setYear(event.target.value)} />
        </div>
        <input className={FIELD} placeholder="Short description" value={description} onChange={(event) => setDescription(event.target.value)} />
        <div className="flex flex-wrap items-center gap-2">
          <SelectField value={stage} onChange={setStage} aria-label="Photo type" options={["Work", "Before", "After"].map((item) => ({ value: item, label: item }))} />
          <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { void upload(event.target.files); event.target.value = ""; }} />
          <button type="button" onClick={() => input.current?.click()} className="h-10 rounded-[10px] border border-gray-200 bg-white px-4 text-sm font-medium">
            Add photos
          </button>
          <span className="text-xs text-gray-500">{photos.length} added</span>
        </div>
        <button type="button" disabled={!title.trim() || photos.length === 0 || add.isPending} onClick={() => add.mutate()} className="h-10 w-fit rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white disabled:opacity-50">
          Add to portfolio
        </button>
      </div>
    </section>
  );
}

function OfferingsSection() {
  const queryClient = useQueryClient();
  const offerings = useMyOfferings();
  const taxonomy = useTaxonomy();
  const [editing, setEditing] = useState<OfferingDto | "new" | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "", mode: "QuoteRequired", price: "", unit: "PerJob", perDay: "", terms: "" });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
  const categories = [...(taxonomy.data?.professions ?? []), ...(taxonomy.data?.trades ?? [])];

  function open(target: OfferingDto | "new") {
    setEditing(target);
    if (target === "new") setForm({ title: "", description: "", category: "", mode: "QuoteRequired", price: "", unit: "PerJob", perDay: "", terms: "" });
    else setForm({ title: target.title ?? "", description: target.description ?? "", category: target.category ?? "", mode: target.mode ?? "QuoteRequired", price: target.price?.toString() ?? "", unit: target.priceUnit ?? "PerJob", perDay: target.maxBookingsPerDay?.toString() ?? "", terms: target.terms ?? "" });
  }

  const save = useMutation({
    mutationFn: async () => {
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
      };
      if (editing === "new") await createOffering(body);
      else if (editing) await updateOffering(editing.id, body);
    },
    onSuccess: () => {
      refresh();
      setEditing(null);
      showSuccessToast("Saved as a draft. Publish it when you are ready.");
    },
    onError: (error) => notifyError(error, "The service could not be saved."),
  });
  const act = useMutation({ mutationFn: ({ id, action }: { id: string; action: "publish" | "pause" | "archive" }) => offeringAction(id, action), onSuccess: refresh, onError: (error) => notifyError(error) });

  return (
    <section className={CARD}>
      <div className="flex items-center gap-3">
        <h2 className={cn(TITLE, "flex-1")}>Your services</h2>
        <button type="button" onClick={() => open("new")} className="h-9 rounded-[10px] bg-brand-900 px-4 text-[13px] font-medium text-white">
          + Add a service
        </button>
      </div>
      {offerings.isPending && <Skeleton className="h-16 w-full" />}
      {offerings.data?.map((offering) => (
        <div key={offering.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-gray-200 p-3.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#0f172a]">{offering.title}</p>
            <p className="text-xs text-gray-500">
              {offering.category} · {offering.priceLabel ?? "No price"} · {offering.status}
            </p>
          </div>
          <div className="flex gap-3 text-[13px] font-medium">
            <button type="button" onClick={() => open(offering)} className="text-brand-900">
              Edit
            </button>
            {offering.status === "Published" ? (
              <button type="button" onClick={() => act.mutate({ id: offering.id, action: "pause" })} className="text-[#b45309]">
                Pause
              </button>
            ) : (
              <button type="button" onClick={() => act.mutate({ id: offering.id, action: "publish" })} className="text-[#16a34a]">
                Publish
              </button>
            )}
            <button type="button" onClick={() => act.mutate({ id: offering.id, action: "archive" })} className="text-[#dc2626]">
              Archive
            </button>
          </div>
        </div>
      ))}
      {offerings.data?.length === 0 && <p className="text-[13px] text-gray-500">No services yet.</p>}

      {editing && (
        <div className="flex flex-col gap-2.5 rounded-xl bg-[#f8fafc] p-4">
          <input className={FIELD} placeholder="Service title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <textarea className="rounded-[10px] border border-gray-200 px-3 py-2 text-[13px] focus:border-brand-900 focus:outline-none" rows={3} placeholder="What is included" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <div className="grid gap-2.5 sm:grid-cols-2">
            <SelectField value={form.category} onChange={(value) => setForm({ ...form, category: value })} aria-label="Category" placeholder="Category" options={categories.map((item) => ({ value: item, label: item }))} />
            <SelectField value={form.mode} onChange={(value) => setForm({ ...form, mode: value })} aria-label="How it sells" options={MODES} />
            <input className={FIELD} placeholder="Price in GHS (optional)" inputMode="decimal" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
            <SelectField value={form.unit} onChange={(value) => setForm({ ...form, unit: value })} aria-label="Price unit" options={UNITS.map((unit) => ({ value: unit, label: unit }))} />
            {form.mode === "FixedPrice" && <input className={FIELD} placeholder="Max bookings per day" inputMode="numeric" value={form.perDay} onChange={(event) => setForm({ ...form, perDay: event.target.value })} />}
          </div>
          <textarea className="rounded-[10px] border border-gray-200 px-3 py-2 text-[13px] focus:border-brand-900 focus:outline-none" rows={2} placeholder="Terms (optional)" value={form.terms} onChange={(event) => setForm({ ...form, terms: event.target.value })} />
          <div className="flex gap-2">
            <button type="button" disabled={!form.title.trim() || !form.category || save.isPending} onClick={() => save.mutate()} className="h-10 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white disabled:opacity-50">
              {save.isPending ? "Saving…" : "Save service"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="h-10 rounded-[10px] border border-gray-200 px-4 text-sm font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function IncomingSection() {
  const bookings = useIncomingServiceBookings();
  const requests = useIncomingQuoteRequests();
  const { bookingAction } = useServicesMutations();

  return (
    <section className={CARD}>
      <h2 className={TITLE}>Bookings and requests for you</h2>
      {requests.data && requests.data.length > 0 && (
        <Link href="/request-board" className="rounded-xl bg-[#eff5ff] p-3.5 text-[13px] font-medium text-brand-900">
          {requests.data.length} {requests.data.length === 1 ? "request is" : "requests are"} waiting for your quote ›
        </Link>
      )}
      {bookings.isPending && <Skeleton className="h-12 w-full" />}
      {bookings.isError && <p className="text-sm text-[#dc2626]">{errorMessage(bookings.error)}</p>}
      {bookings.data?.length === 0 && <p className="text-[13px] text-gray-500">No bookings yet.</p>}
      {bookings.data?.map((booking) => (
        <div key={booking.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-gray-200 p-3.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#0f172a]">
              {booking.offeringTitle} · {formatDate(booking.date)}
            </p>
            <p className="text-xs text-gray-500">
              {booking.requester.username}
              {booking.notes ? ` — ${booking.notes}` : ""}
            </p>
          </div>
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", SERVICE_BOOKING_TONE[booking.status ?? ""])}>{booking.status}</span>
          <div className="flex gap-3 text-[13px] font-medium">
            {booking.status === "Requested" && (
              <>
                <button type="button" onClick={() => bookingAction.mutate({ id: booking.id, action: "confirm" })} className="text-[#16a34a]">
                  Confirm
                </button>
                <button type="button" onClick={() => bookingAction.mutate({ id: booking.id, action: "decline" })} className="text-[#dc2626]">
                  Decline
                </button>
              </>
            )}
            {booking.status === "Confirmed" && (
              <>
                <button type="button" onClick={() => bookingAction.mutate({ id: booking.id, action: "complete" })} className="text-brand-900">
                  Mark done
                </button>
                <button type="button" onClick={() => bookingAction.mutate({ id: booking.id, action: "cancel" })} className="text-[#dc2626]">
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}

/** Manage · Provider: profile, portfolio, services and incoming work for professionals and artisans. */
export default function ManageProviderPage() {
  const provider = useMyProvider();

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Provider" }]} />
        <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Sell your services</h1>
        {provider.isPending && <Skeleton className="h-64 w-full rounded-2xl" />}
        {provider.isError && <p className="text-sm text-[#dc2626]">{errorMessage(provider.error)}</p>}
        {!provider.isPending && !provider.isError && (
          <div className="flex w-full max-w-[860px] flex-col gap-5">
            <ProfileSection provider={provider.data ?? null} />
            {provider.data && (
              <>
                <IncomingSection />
                <OfferingsSection />
                <PortfolioSection provider={provider.data} />
              </>
            )}
            {!provider.data && <p className="text-sm text-gray-500">Save your profile first, then add services and a portfolio.</p>}
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
