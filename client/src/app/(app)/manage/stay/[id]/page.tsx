"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ChoiceChip, FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { STAY_KEY } from "@/hooks/useStay";
import { errorMessage, notifyError } from "@/lib/errors";
import { formatMoney } from "@/lib/format";
import {
  addRate,
  addRoom,
  blockUnits,
  createOperatorProperty,
  getStay,
  publishOperatorProperty,
  retireRate,
  retireRoom,
  STAY_AMENITIES,
  STAY_TYPES,
  updateOperatorProperty,
} from "@/lib/stay-api";
import { SHAPE_LABEL, STAY_TYPE_LABEL } from "@/lib/stay-mapper";
import { uploadMedia } from "@/lib/upload";
import type { SaveStayInput, StayDetailDto } from "@/types/api/schema";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6";
const TITLE = "text-base font-bold leading-[23px] text-[#0f172a]";
const POLICIES = ["Flexible", "Moderate", "Strict"] as const;
const SHAPES = ["HotelRoom", "PrivateRoom", "DormBed", "WholeUnit"] as const;
const MINI = "h-10 min-w-0 rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] text-[#0f172a] focus:border-brand-900 focus:outline-none";

interface StayForm {
  name: string;
  description: string;
  type: string;
  city: string;
  area: string;
  address: string;
  amenities: string[];
  cleaningFee: string;
  taxPercent: string;
  securityDeposit: string;
  cancellationPolicy: string;
  checkInFrom: string;
  checkOutBy: string;
  houseRules: string;
  accessibility: string;
  opensOn: string;
  periods: { name: string; startsOn: string; endsOn: string }[];
  newPhotos: { path: string; contentType: string; name: string; url: string }[];
}

const EMPTY: StayForm = {
  name: "",
  description: "",
  type: "GuestHouse",
  city: "",
  area: "",
  address: "",
  amenities: [],
  cleaningFee: "",
  taxPercent: "",
  securityDeposit: "",
  cancellationPolicy: "Moderate",
  checkInFrom: "14:00",
  checkOutBy: "11:00",
  houseRules: "",
  accessibility: "",
  opensOn: "",
  periods: [],
  newPhotos: [],
};

function fromDetail(stay: StayDetailDto): StayForm {
  return {
    ...EMPTY,
    name: stay.name ?? "",
    description: stay.description ?? "",
    type: stay.type ?? "GuestHouse",
    city: stay.city ?? "",
    area: stay.area ?? "",
    address: stay.address ?? "",
    amenities: stay.amenities ?? [],
    cleaningFee: String(stay.cleaningFee ?? ""),
    taxPercent: String(stay.taxPercent ?? ""),
    securityDeposit: String(stay.securityDeposit ?? ""),
    cancellationPolicy: stay.cancellationPolicy ?? "Moderate",
    checkInFrom: stay.checkInFrom ?? "14:00",
    checkOutBy: stay.checkOutBy ?? "11:00",
    houseRules: stay.houseRules ?? "",
    accessibility: stay.accessibility ?? "",
    opensOn: stay.opensOn ?? "",
    periods: (stay.academicPeriods ?? []).map((period) => ({ name: period.name ?? "", startsOn: period.startsOn, endsOn: period.endsOn })),
  };
}

function toInput(form: StayForm, includePhotos: boolean): Partial<SaveStayInput> {
  const number = (value: string) => (value.trim() === "" ? null : Number(value));
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    type: form.type,
    city: form.city.trim(),
    area: form.area.trim() || null,
    address: form.address.trim() || null,
    amenities: form.amenities,
    currency: "GHS",
    cleaningFee: number(form.cleaningFee),
    taxPercent: number(form.taxPercent),
    securityDeposit: number(form.securityDeposit),
    cancellationPolicy: form.cancellationPolicy,
    checkInFrom: form.checkInFrom || null,
    checkOutBy: form.checkOutBy || null,
    houseRules: form.houseRules.trim() || null,
    accessibility: form.accessibility.trim() || null,
    opensOn: form.opensOn || null,
    media: includePhotos && form.newPhotos.length > 0 ? form.newPhotos.map(({ path, contentType, name }) => ({ path, contentType, name })) : null,
    academicPeriods: form.type === "StudentHostel" ? form.periods.filter((period) => period.name && period.startsOn && period.endsOn) : null,
  };
}

function Text({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <FormField label={label}>
      <label className={cn(FIELD_BOX, "border-gray-200")}>
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={FIELD_INPUT} />
      </label>
    </FormField>
  );
}

function RoomsManager({ stay }: { stay: StayDetailDto }) {
  const queryClient = useQueryClient();
  const refresh = () => void queryClient.invalidateQueries({ queryKey: STAY_KEY });
  const options = { onSuccess: refresh, onError: (error: unknown) => notifyError(error) };

  const [room, setRoom] = useState({ name: "", shape: "HotelRoom", quantity: "1", maxGuests: "2", beds: "" });
  const addRoomMutation = useMutation({
    mutationFn: () =>
      addRoom(stay.id, { name: room.name.trim(), shape: room.shape, quantity: Number(room.quantity) || 1, maxGuestsPerUnit: Number(room.maxGuests) || 1, bedsDescription: room.beds.trim() || null }),
    ...options,
    onSuccess: () => {
      refresh();
      setRoom({ name: "", shape: "HotelRoom", quantity: "1", maxGuests: "2", beds: "" });
    },
  });

  const [rate, setRate] = useState<Record<string, { name: string; nightly: string; refundable: boolean; breakfast: boolean; minNights: string }>>({});
  const addRateMutation = useMutation({
    mutationFn: (roomId: string) => {
      const draft = rate[roomId];
      return addRate(stay.id, roomId, {
        name: draft.name.trim(),
        nightly: Number(draft.nightly),
        refundable: draft.refundable,
        includesBreakfast: draft.breakfast,
        minNights: Number(draft.minNights) || 1,
        longStayDiscountPercent: 0,
      });
    },
    onSuccess: (_result, roomId) => {
      refresh();
      setRate((current) => {
        const next = { ...current };
        delete next[roomId];
        return next;
      });
    },
    onError: (error) => notifyError(error),
  });

  const [block, setBlock] = useState<Record<string, { from: string; to: string; units: string; reason: string }>>({});
  const blockMutation = useMutation({
    mutationFn: (roomId: string) => {
      const draft = block[roomId];
      return blockUnits(stay.id, roomId, { from: draft.from, to: draft.to, units: Number(draft.units) || 1, reason: draft.reason.trim() || undefined });
    },
    onSuccess: (_result, roomId) => {
      showSuccessToast("Dates blocked");
      setBlock((current) => {
        const next = { ...current };
        delete next[roomId];
        return next;
      });
    },
    onError: (error) => notifyError(error),
  });

  const retireRoomMutation = useMutation({ mutationFn: (roomId: string) => retireRoom(stay.id, roomId), ...options });
  const retireRateMutation = useMutation({ mutationFn: ({ roomId, planId }: { roomId: string; planId: string }) => retireRate(stay.id, roomId, planId), ...options });

  return (
    <section className={CARD}>
      <h2 className={TITLE}>Rooms and rates</h2>
      {(stay.rooms ?? []).map((item) => {
        const draft = rate[item.id];
        const blockDraft = block[item.id];
        return (
          <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#0f172a]">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {SHAPE_LABEL[item.shape ?? ""] ?? item.shape} · {item.quantity} {item.shape === "DormBed" ? "beds" : "units"} · up to {item.maxGuestsPerUnit} guests
                </p>
              </div>
              <button type="button" onClick={() => retireRoomMutation.mutate(item.id)} className="text-[13px] font-medium text-[#dc2626]">
                Retire room
              </button>
            </div>
            {(item.ratePlans ?? []).map((plan) => (
              <p key={plan.id} className="flex flex-wrap items-center gap-x-3 text-[13px] text-[#334155]">
                <span className="font-medium text-[#0f172a]">{plan.name}</span>
                <span>{formatMoney(plan.nightly, plan.currency ?? "GHS")} / night</span>
                <span className="text-gray-500">{plan.refundable ? "Refundable" : "Non-refundable"}{plan.includesBreakfast ? " · Breakfast" : ""}</span>
                <button type="button" onClick={() => retireRateMutation.mutate({ roomId: item.id, planId: plan.id })} className="ml-auto text-xs font-medium text-[#dc2626]">
                  Retire
                </button>
              </p>
            ))}

            {draft ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <input className={cn(MINI, "col-span-2 sm:col-span-1")} placeholder="Rate name" value={draft.name} onChange={(event) => setRate({ ...rate, [item.id]: { ...draft, name: event.target.value } })} />
                <input className={MINI} placeholder="Nightly GHS" inputMode="decimal" value={draft.nightly} onChange={(event) => setRate({ ...rate, [item.id]: { ...draft, nightly: event.target.value } })} />
                <input className={MINI} placeholder="Min nights" inputMode="numeric" value={draft.minNights} onChange={(event) => setRate({ ...rate, [item.id]: { ...draft, minNights: event.target.value } })} />
                <label className="flex items-center gap-1.5 text-xs">
                  <input type="checkbox" checked={draft.refundable} onChange={(event) => setRate({ ...rate, [item.id]: { ...draft, refundable: event.target.checked } })} /> Refundable
                </label>
                <label className="flex items-center gap-1.5 text-xs">
                  <input type="checkbox" checked={draft.breakfast} onChange={(event) => setRate({ ...rate, [item.id]: { ...draft, breakfast: event.target.checked } })} /> Breakfast
                </label>
                <button type="button" disabled={!draft.name.trim() || !draft.nightly || addRateMutation.isPending} onClick={() => addRateMutation.mutate(item.id)} className="h-10 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white disabled:opacity-50 sm:col-span-5 sm:w-fit">
                  Save rate
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setRate({ ...rate, [item.id]: { name: "", nightly: "", refundable: true, breakfast: false, minNights: "1" } })} className="self-start text-[13px] font-medium text-brand-900">
                + Add a rate
              </button>
            )}

            {blockDraft ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <input type="date" className={MINI} value={blockDraft.from} onChange={(event) => setBlock({ ...block, [item.id]: { ...blockDraft, from: event.target.value } })} aria-label="Block from" />
                <input type="date" className={MINI} value={blockDraft.to} onChange={(event) => setBlock({ ...block, [item.id]: { ...blockDraft, to: event.target.value } })} aria-label="Block to" />
                <input className={MINI} placeholder="Units" inputMode="numeric" value={blockDraft.units} onChange={(event) => setBlock({ ...block, [item.id]: { ...blockDraft, units: event.target.value } })} />
                <input className={MINI} placeholder="Reason" value={blockDraft.reason} onChange={(event) => setBlock({ ...block, [item.id]: { ...blockDraft, reason: event.target.value } })} />
                <button type="button" disabled={!blockDraft.from || !blockDraft.to || blockMutation.isPending} onClick={() => blockMutation.mutate(item.id)} className="h-10 rounded-[10px] border border-gray-200 px-4 text-sm font-medium disabled:opacity-50 sm:w-fit">
                  Block dates
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setBlock({ ...block, [item.id]: { from: "", to: "", units: "1", reason: "" } })} className="self-start text-[13px] font-medium text-[#334155]">
                Block dates (maintenance or off-platform booking)
              </button>
            )}
          </div>
        );
      })}

      <div className="flex flex-col gap-2 rounded-xl bg-[#f8fafc] p-4">
        <p className="text-[13px] font-semibold text-[#0f172a]">Add a room type</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <input className={cn(MINI, "col-span-2 sm:col-span-1")} placeholder="Name" value={room.name} onChange={(event) => setRoom({ ...room, name: event.target.value })} />
          <select className={MINI} value={room.shape} onChange={(event) => setRoom({ ...room, shape: event.target.value })} aria-label="Shape">
            {SHAPES.map((shape) => (
              <option key={shape} value={shape}>
                {SHAPE_LABEL[shape]}
              </option>
            ))}
          </select>
          <input className={MINI} placeholder={room.shape === "DormBed" ? "Beds" : "Units"} inputMode="numeric" value={room.quantity} onChange={(event) => setRoom({ ...room, quantity: event.target.value })} />
          <input className={MINI} placeholder="Max guests" inputMode="numeric" value={room.maxGuests} onChange={(event) => setRoom({ ...room, maxGuests: event.target.value })} />
          <input className={MINI} placeholder="Beds (e.g. 1 queen)" value={room.beds} onChange={(event) => setRoom({ ...room, beds: event.target.value })} />
        </div>
        <button type="button" disabled={!room.name.trim() || addRoomMutation.isPending} onClick={() => addRoomMutation.mutate()} className="h-10 w-fit rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white disabled:opacity-50">
          Add room
        </button>
      </div>
    </section>
  );
}

function StayEditor({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isNew = id === "new";
  const [form, setForm] = useState<StayForm>(EMPTY);
  const [hydrated, setHydrated] = useState(isNew);
  const [uploading, setUploading] = useState(false);
  const photoInput = useRef<HTMLInputElement | null>(null);

  const stay = useQuery({ queryKey: [...STAY_KEY, "one", id, "editor"], queryFn: () => getStay(id), enabled: !isNew, refetchOnWindowFocus: false });
  useEffect(() => {
    if (!hydrated && stay.data) {
      setForm(fromDetail(stay.data));
      setHydrated(true);
    }
  }, [stay.data, hydrated]);

  const set = <K extends keyof StayForm>(key: K, value: StayForm[K]) => setForm((current) => ({ ...current, [key]: value }));

  const save = useMutation({
    mutationFn: async () => {
      if (isNew) return createOperatorProperty(toInput(form, true));
      await updateOperatorProperty(id, toInput(form, true));
      return id;
    },
    onSuccess: (savedId) => {
      void queryClient.invalidateQueries({ queryKey: STAY_KEY });
      showSuccessToast("Saved");
      set("newPhotos", []);
      if (isNew) router.replace(`/manage/stay/${savedId}`);
    },
    onError: (error) => notifyError(error, "The stay could not be saved."),
  });

  const publish = useMutation({
    mutationFn: () => publishOperatorProperty(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: STAY_KEY });
      showSuccessToast("Your stay is live");
    },
    onError: (error) => notifyError(error, "It could not be published yet."),
  });

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const media = await uploadMedia(file, { allowVideo: false });
        setForm((current) => ({ ...current, newPhotos: [...current.newPhotos, { path: media.path, contentType: media.contentType, name: media.name ?? file.name, url: media.publicUrl }] }));
      } catch (error) {
        notifyError(error, `${file.name} could not be uploaded.`);
      }
    }
    setUploading(false);
  }

  const toggleAmenity = (amenity: string) => set("amenities", form.amenities.includes(amenity) ? form.amenities.filter((item) => item !== amenity) : [...form.amenities, amenity]);
  const canSave = form.name.trim() !== "" && form.city.trim() !== "";
  const existingPhotos = stay.data?.photos ?? [];

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Stay", href: "/manage/stay" }, { label: isNew ? "New stay" : (stay.data?.name ?? "Stay") }]} />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="min-w-0 flex-1 text-2xl font-bold leading-8 text-[#0f172a]">{isNew ? "Add a stay" : "Edit your stay"}</h1>
          {!isNew && (
            <button type="button" disabled={publish.isPending} onClick={() => publish.mutate()} className="h-10 rounded-[10px] border border-gray-200 px-4 text-sm font-medium text-[#0f172a] hover:bg-gray-50 disabled:opacity-60">
              {publish.isPending ? "Publishing…" : "Publish"}
            </button>
          )}
          <button type="button" disabled={!canSave || save.isPending} onClick={() => save.mutate()} className="h-10 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white disabled:opacity-50">
            {save.isPending ? "Saving…" : isNew ? "Create stay" : "Save changes"}
          </button>
        </div>
        {!isNew && <p className="text-xs text-gray-500">To publish you need a verified host, a photo, a room with a rate and an opening date that has passed.</p>}
        {stay.isError && <p className="text-sm text-[#dc2626]">{errorMessage(stay.error)}</p>}
        {!hydrated && !stay.isError && <Skeleton className="h-64 w-full rounded-2xl" />}

        {hydrated && (
          <div className="flex w-full max-w-[860px] flex-col gap-5">
            <section className={CARD}>
              <h2 className={TITLE}>About the stay</h2>
              <Text label="Name" value={form.name} onChange={(value) => set("name", value)} placeholder="e.g. Golden Palm Hotel" />
              <FormField label="Type">
                <div role="radiogroup" aria-label="Type" className="flex flex-wrap gap-2">
                  {STAY_TYPES.map((type) => (
                    <ChoiceChip key={type} role="radio" label={STAY_TYPE_LABEL[type]} selected={form.type === type} onClick={() => set("type", type)} />
                  ))}
                </div>
              </FormField>
              <FormField label="Description">
                <textarea value={form.description} onChange={(event) => set("description", event.target.value)} rows={4} className="rounded-[10px] border border-gray-200 px-3.5 py-2.5 text-sm text-[#0f172a] focus:border-brand-900 focus:outline-none" />
              </FormField>
              <div className="grid gap-3 sm:grid-cols-3">
                <Text label="City" value={form.city} onChange={(value) => set("city", value)} />
                <Text label="Area" value={form.area} onChange={(value) => set("area", value)} />
                <Text label="Address (shared after booking)" value={form.address} onChange={(value) => set("address", value)} />
              </div>
              <FormField label="Amenities">
                <div className="flex flex-wrap gap-2">
                  {STAY_AMENITIES.map((amenity) => (
                    <ChoiceChip key={amenity} role="checkbox" label={amenity} selected={form.amenities.includes(amenity)} onClick={() => toggleAmenity(amenity)} />
                  ))}
                </div>
              </FormField>
            </section>

            <section className={CARD}>
              <h2 className={TITLE}>Fees and rules</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <Text label="Cleaning fee (GHS)" value={form.cleaningFee} onChange={(value) => set("cleaningFee", value)} />
                <Text label="Tax (%)" value={form.taxPercent} onChange={(value) => set("taxPercent", value)} />
                <Text label="Security deposit (GHS)" value={form.securityDeposit} onChange={(value) => set("securityDeposit", value)} />
              </div>
              <FormField label="Cancellation policy">
                <div role="radiogroup" aria-label="Cancellation policy" className="flex flex-wrap gap-2">
                  {POLICIES.map((policy) => (
                    <ChoiceChip key={policy} role="radio" label={policy} selected={form.cancellationPolicy === policy} onClick={() => set("cancellationPolicy", policy)} />
                  ))}
                </div>
              </FormField>
              <div className="grid gap-3 sm:grid-cols-3">
                <Text label="Check in from" type="time" value={form.checkInFrom} onChange={(value) => set("checkInFrom", value)} />
                <Text label="Check out by" type="time" value={form.checkOutBy} onChange={(value) => set("checkOutBy", value)} />
                <Text label="Opens on" type="date" value={form.opensOn} onChange={(value) => set("opensOn", value)} />
              </div>
              <FormField label="House rules">
                <textarea value={form.houseRules} onChange={(event) => set("houseRules", event.target.value)} rows={3} className="rounded-[10px] border border-gray-200 px-3.5 py-2.5 text-sm text-[#0f172a] focus:border-brand-900 focus:outline-none" />
              </FormField>
              <Text label="Accessibility" value={form.accessibility} onChange={(value) => set("accessibility", value)} />
            </section>

            {form.type === "StudentHostel" && (
              <section className={CARD}>
                <h2 className={TITLE}>Academic periods</h2>
                {form.periods.map((period, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <input className={cn(MINI, "col-span-2 sm:col-span-1")} placeholder="Name" value={period.name} onChange={(event) => set("periods", form.periods.map((p, i) => (i === index ? { ...p, name: event.target.value } : p)))} />
                    <input type="date" className={MINI} value={period.startsOn} onChange={(event) => set("periods", form.periods.map((p, i) => (i === index ? { ...p, startsOn: event.target.value } : p)))} />
                    <input type="date" className={MINI} value={period.endsOn} onChange={(event) => set("periods", form.periods.map((p, i) => (i === index ? { ...p, endsOn: event.target.value } : p)))} />
                    <button type="button" onClick={() => set("periods", form.periods.filter((_, i) => i !== index))} className="text-[13px] font-medium text-[#dc2626]">
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => set("periods", [...form.periods, { name: "", startsOn: "", endsOn: "" }])} className="self-start text-[13px] font-medium text-brand-900">
                  + Add a period
                </button>
              </section>
            )}

            <section className={CARD}>
              <h2 className={TITLE}>Photos</h2>
              {existingPhotos.length > 0 && form.newPhotos.length === 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {existingPhotos.map((url) => (
                    <span key={url} className="relative block h-[90px] w-[120px] overflow-hidden rounded-[10px] bg-[#eef2ff]">
                      <Image src={url} alt="" fill unoptimized className="object-cover" sizes="120px" />
                    </span>
                  ))}
                </div>
              )}
              {form.newPhotos.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {form.newPhotos.map((photo) => (
                    <span key={photo.path} className="relative block h-[90px] w-[120px] overflow-hidden rounded-[10px] bg-[#eef2ff]">
                      <Image src={photo.url} alt="" fill unoptimized className="object-cover" sizes="120px" />
                    </span>
                  ))}
                </div>
              )}
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
              <button type="button" disabled={uploading} onClick={() => photoInput.current?.click()} className="h-10 w-fit rounded-[10px] border border-gray-200 px-4 text-sm font-medium text-[#0f172a] hover:bg-gray-50 disabled:opacity-60">
                {uploading ? "Uploading…" : existingPhotos.length > 0 ? "Replace all photos" : "Add photos"}
              </button>
              <p className="text-xs text-gray-500">New photos replace the current set when you save.</p>
            </section>

            {stay.data && <RoomsManager stay={stay.data} />}
            {isNew && <p className="text-sm text-gray-500">Create the stay first, then add its rooms and rates.</p>}
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}

export default function StayEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <StayEditor id={id} />;
}
