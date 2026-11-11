"use client";

import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type ReactNode } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PROJECTS_KEY, useIncomingVisits, useProjectReservations } from "@/hooks/useProjects";
import { errorMessage, notifyError } from "@/lib/errors";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import {
  addUnitType,
  deleteProjectUpdate,
  postProjectUpdate,
  releaseReservation,
  removeUnitType,
  replaceMilestones,
  replaceTeam,
  respondToVisit,
  updateUnitType,
} from "@/lib/projects-api";
import { uploadMedia, type UploadedMedia } from "@/lib/upload";
import { cn } from "@/lib/utils";
import type { MilestoneStatusKey, ProjectDetailDto, UnitTypeDto, UnitTypeInput } from "@/types/api/projects";

const CARD = "flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5";
const SELECT_BOX = cn(FIELD_BOX, "border-gray-200");
const SECONDARY = "h-9 rounded-[10px] border border-gray-200 bg-white px-4 text-[13px] font-medium text-[#0f172a] hover:bg-gray-50 disabled:opacity-60";

function useRefresh() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
}

function TextField({ label, value, onChange, error, placeholder, type = "text", inputMode }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "decimal";
}) {
  return (
    <FormField label={label} error={error}>
      <div className={cn(FIELD_BOX, error ? "border-[#dc2626]" : "border-gray-200")}>
        <input type={type} inputMode={inputMode} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={FIELD_INPUT} />
      </div>
    </FormField>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-[13px] leading-[19px] text-gray-500">{children}</p>;
}

interface UnitForm {
  name: string;
  description: string;
  sizeSqm: string;
  bedrooms: string;
  totalUnits: string;
  price: string;
  depositPercent: string;
  installments: string;
  handoverPercent: string;
}

const EMPTY_UNIT: UnitForm = { name: "", description: "", sizeSqm: "", bedrooms: "", totalUnits: "1", price: "", depositPercent: "10", installments: "0", handoverPercent: "10" };

function unitToForm(unit: UnitTypeDto): UnitForm {
  return {
    name: unit.name,
    description: unit.description ?? "",
    sizeSqm: unit.sizeSqm ? String(unit.sizeSqm) : "",
    bedrooms: unit.bedrooms !== null ? String(unit.bedrooms) : "",
    totalUnits: String(unit.totalUnits),
    price: String(unit.price),
    depositPercent: String(unit.paymentPlan.depositPercent),
    installments: String(unit.paymentPlan.installments),
    handoverPercent: String(unit.paymentPlan.handoverPercent),
  };
}

export function UnitsPanel({ detail }: { detail: ProjectDetailDto }) {
  const refresh = useRefresh();
  const projectId = detail.card.id;
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<UnitForm>(EMPTY_UNIT);
  const [error, setError] = useState<string | undefined>();

  const save = useMutation({
    mutationFn: (input: UnitTypeInput) => (editing && editing !== "new" ? updateUnitType(projectId, editing, input) : addUnitType(projectId, input)),
    onSuccess: () => {
      refresh();
      setEditing(null);
      showSuccessToast("Unit type saved");
    },
    onError: (failure) => notifyError(failure, "We could not save that unit type."),
  });
  const remove = useMutation({
    mutationFn: (unitId: string) => removeUnitType(projectId, unitId),
    onSuccess: refresh,
    onError: (failure) => notifyError(failure),
  });

  function set<K extends keyof UnitForm>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit() {
    const price = Number(form.price);
    const totalUnits = Number(form.totalUnits);
    if (!form.name.trim() || !(price > 0) || !Number.isInteger(totalUnits) || totalUnits < 1) {
      setError("Add a name, a price above zero and at least one unit");
      return;
    }
    setError(undefined);
    save.mutate({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      sizeSqm: form.sizeSqm ? Number(form.sizeSqm) : undefined,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      totalUnits,
      price,
      depositPercent: Number(form.depositPercent),
      installments: Number(form.installments),
      handoverPercent: Number(form.handoverPercent),
    });
  }

  return (
    <section className={CARD}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[#0f172a]">Unit types</h2>
        {!editing && (
          <button type="button" className={SECONDARY} onClick={() => { setForm(EMPTY_UNIT); setEditing("new"); }}>
            Add a unit type
          </button>
        )}
      </div>
      {detail.unitTypes.length === 0 && !editing && <Empty>Add at least one unit type before you publish.</Empty>}
      {detail.unitTypes.map((unit) => (
        <div key={unit.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-gray-200 p-3.5">
          <div className="flex min-w-[160px] flex-1 flex-col gap-0.5">
            <p className="text-sm font-semibold text-[#0f172a]">
              {unit.name} {!unit.isActive && <span className="text-xs font-normal text-gray-500">(switched off)</span>}
            </p>
            <p className="text-xs text-gray-500">{unit.summary} · {unit.totalUnits} total</p>
          </div>
          <p className="text-sm font-bold text-[#0f172a]">{formatMoney(unit.price, unit.currency)}</p>
          <div className="flex gap-2">
            <button type="button" className={SECONDARY} onClick={() => { setForm(unitToForm(unit)); setEditing(unit.id); }}>
              Edit
            </button>
            {unit.isActive && (
              <button type="button" className={cn(SECONDARY, "text-[#dc2626]")} disabled={remove.isPending} onClick={() => remove.mutate(unit.id)}>
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
      {editing && (
        <div className="flex flex-col gap-3 rounded-xl bg-[#f8fafc] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Name" value={form.name} onChange={(value) => set("name", value)} placeholder="2-bedroom apartment" />
            <TextField label="Price (GHS)" value={form.price} onChange={(value) => set("price", value)} inputMode="decimal" />
            <TextField label="Number of units" value={form.totalUnits} onChange={(value) => set("totalUnits", value)} inputMode="numeric" />
            <TextField label="Size (sqm, optional)" value={form.sizeSqm} onChange={(value) => set("sizeSqm", value)} inputMode="decimal" />
            <TextField label="Bedrooms (optional)" value={form.bedrooms} onChange={(value) => set("bedrooms", value)} inputMode="numeric" />
            <TextField label="Description (optional)" value={form.description} onChange={(value) => set("description", value)} />
          </div>
          <p className="text-[13px] font-semibold text-[#0f172a]">Payment plan</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <TextField label="Deposit to reserve (%)" value={form.depositPercent} onChange={(value) => set("depositPercent", value)} inputMode="decimal" />
            <TextField label="Monthly payments" value={form.installments} onChange={(value) => set("installments", value)} inputMode="numeric" />
            <TextField label="On handover (%)" value={form.handoverPercent} onChange={(value) => set("handoverPercent", value)} inputMode="decimal" />
          </div>
          <p className="text-xs text-gray-500">The deposit, the monthly payments and the handover payment together cover the whole price.</p>
          {error && <p className="text-xs text-[#dc2626]">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className={SECONDARY} onClick={() => setEditing(null)}>Cancel</button>
            <Button variant="primary" onClick={submit} disabled={save.isPending} className="h-9 w-auto rounded-[10px] px-5 lg:rounded-[10px]">
              {save.isPending ? "Saving…" : "Save unit type"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

interface MilestoneRow {
  title: string;
  status: MilestoneStatusKey;
  progress: string;
  date: string;
}

export function MilestonesPanel({ detail }: { detail: ProjectDetailDto }) {
  const refresh = useRefresh();
  const [rows, setRows] = useState<MilestoneRow[]>(() =>
    detail.milestones.map((m) => ({ title: m.title, status: m.status, progress: m.progressPercent !== null ? String(m.progressPercent) : "", date: (m.status === "Done" ? m.completedOn : m.dueOn) ?? "" })),
  );

  const save = useMutation({
    mutationFn: () =>
      replaceMilestones(
        detail.card.id,
        rows.filter((row) => row.title.trim()).map((row) => ({
          title: row.title.trim(),
          status: row.status,
          progressPercent: row.status === "InProgress" && row.progress ? Number(row.progress) : undefined,
          dueOn: row.status !== "Done" && row.date ? row.date : undefined,
          completedOn: row.status === "Done" && row.date ? row.date : undefined,
        })),
      ),
    onSuccess: () => {
      refresh();
      showSuccessToast("Milestones saved");
    },
    onError: (failure) => notifyError(failure, "We could not save the milestones."),
  });

  function patch(index: number, change: Partial<MilestoneRow>) {
    setRows((current) => current.map((row, position) => (position === index ? { ...row, ...change } : row)));
  }

  return (
    <section className={CARD}>
      <h2 className="text-base font-bold text-[#0f172a]">Milestones</h2>
      {rows.length === 0 && <Empty>Add the stages buyers can follow, for example foundation, structure and handover.</Empty>}
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 rounded-xl border border-gray-200 p-3 sm:grid-cols-[1fr_150px_90px_150px_auto] sm:items-center">
          <div className={SELECT_BOX}>
            <input value={row.title} onChange={(event) => patch(index, { title: event.target.value })} maxLength={120} placeholder="Milestone" className={FIELD_INPUT} />
          </div>
          <div className={SELECT_BOX}>
            <select value={row.status} onChange={(event) => patch(index, { status: event.target.value as MilestoneStatusKey })} className={FIELD_INPUT}>
              <option value="Done">Done</option>
              <option value="InProgress">In progress</option>
              <option value="Upcoming">Upcoming</option>
            </select>
          </div>
          <div className={cn(SELECT_BOX, row.status !== "InProgress" && "opacity-40")}>
            <input value={row.progress} disabled={row.status !== "InProgress"} onChange={(event) => patch(index, { progress: event.target.value })} inputMode="numeric" placeholder="%" className={FIELD_INPUT} />
          </div>
          <div className={SELECT_BOX}>
            <input type="date" value={row.date} onChange={(event) => patch(index, { date: event.target.value })} className={FIELD_INPUT} aria-label={row.status === "Done" ? "Completed on" : "Due on"} />
          </div>
          <button type="button" className={cn(SECONDARY, "text-[#dc2626]")} onClick={() => setRows((current) => current.filter((_, position) => position !== index))}>
            Remove
          </button>
        </div>
      ))}
      <div className="flex justify-between gap-2">
        <button type="button" className={SECONDARY} onClick={() => setRows((current) => [...current, { title: "", status: "Upcoming", progress: "", date: "" }])}>
          Add a milestone
        </button>
        <Button variant="primary" onClick={() => save.mutate()} disabled={save.isPending} className="h-9 w-auto rounded-[10px] px-5 lg:rounded-[10px]">
          {save.isPending ? "Saving…" : "Save milestones"}
        </Button>
      </div>
    </section>
  );
}

export function TeamPanel({ detail }: { detail: ProjectDetailDto }) {
  const refresh = useRefresh();
  const [rows, setRows] = useState(() => detail.team.map((member) => ({ name: member.name, role: member.role, accountId: member.accountId ?? undefined })));

  const save = useMutation({
    mutationFn: () => replaceTeam(detail.card.id, rows.filter((row) => row.name.trim() && row.role.trim()).map((row) => ({ name: row.name.trim(), role: row.role.trim(), accountId: row.accountId }))),
    onSuccess: () => {
      refresh();
      showSuccessToast("Team saved");
    },
    onError: (failure) => notifyError(failure, "We could not save the team."),
  });

  return (
    <section className={CARD}>
      <h2 className="text-base font-bold text-[#0f172a]">Project team</h2>
      {rows.length === 0 && <Empty>List the architect, contractor and other professionals behind the project.</Empty>}
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
          <div className={SELECT_BOX}>
            <input value={row.name} maxLength={120} placeholder="Name" onChange={(event) => setRows((current) => current.map((item, position) => (position === index ? { ...item, name: event.target.value } : item)))} className={FIELD_INPUT} />
          </div>
          <div className={SELECT_BOX}>
            <input value={row.role} maxLength={80} placeholder="Role" onChange={(event) => setRows((current) => current.map((item, position) => (position === index ? { ...item, role: event.target.value } : item)))} className={FIELD_INPUT} />
          </div>
          <button type="button" className={cn(SECONDARY, "text-[#dc2626]")} onClick={() => setRows((current) => current.filter((_, position) => position !== index))}>
            Remove
          </button>
        </div>
      ))}
      <div className="flex justify-between gap-2">
        <button type="button" className={SECONDARY} onClick={() => setRows((current) => [...current, { name: "", role: "", accountId: undefined }])}>
          Add a member
        </button>
        <Button variant="primary" onClick={() => save.mutate()} disabled={save.isPending} className="h-9 w-auto rounded-[10px] px-5 lg:rounded-[10px]">
          {save.isPending ? "Saving…" : "Save team"}
        </Button>
      </div>
    </section>
  );
}

export function UpdatesPanel({ detail }: { detail: ProjectDetailDto }) {
  const refresh = useRefresh();
  const projectId = detail.card.id;
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<UploadedMedia | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const post = useMutation({
    mutationFn: () => postProjectUpdate(projectId, { note: note.trim(), photo: photo ? { path: photo.path, contentType: photo.contentType, name: photo.name } : undefined }),
    onSuccess: () => {
      refresh();
      setNote("");
      setPhoto(null);
      showSuccessToast("Update posted. Followers will see it.");
    },
    onError: (failure) => notifyError(failure, "We could not post that update."),
  });
  const remove = useMutation({
    mutationFn: (updateId: string) => deleteProjectUpdate(projectId, updateId),
    onSuccess: refresh,
    onError: (failure) => notifyError(failure),
  });

  async function pick(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setPhoto(await uploadMedia(file, { allowVideo: false }));
    } catch (failure) {
      notifyError(failure, "That photo could not be uploaded.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <section className={CARD}>
      <h2 className="text-base font-bold text-[#0f172a]">Site updates</h2>
      <div className="flex flex-col gap-3 rounded-xl bg-[#f8fafc] p-4">
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          maxLength={500}
          placeholder="What happened on site this week?"
          className="resize-none rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-3">
          {photo && <span className="relative block size-12 overflow-hidden rounded-lg"><Image src={photo.publicUrl} alt="" fill className="object-cover" sizes="48px" /></span>}
          <button type="button" className={SECONDARY} onClick={() => fileInput.current?.click()} disabled={uploading}>
            {uploading ? "Uploading…" : photo ? "Change photo" : "Add a photo"}
          </button>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(event) => void pick(event.target.files)} />
          <Button variant="primary" onClick={() => post.mutate()} disabled={!note.trim() || post.isPending} className="ml-auto h-9 w-auto rounded-[10px] px-5 lg:rounded-[10px]">
            {post.isPending ? "Posting…" : "Post update"}
          </Button>
        </div>
      </div>
      {detail.updates.length === 0 && <Empty>No updates yet.</Empty>}
      {detail.updates.map((update) => (
        <div key={update.id} className="flex items-start gap-3">
          {update.photoUrl && <span className="relative block h-14 w-16 shrink-0 overflow-hidden rounded-lg"><Image src={update.photoUrl} alt="" fill className="object-cover" sizes="64px" /></span>}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-sm text-[#0f172a]">{update.note}</p>
            <p className="text-xs text-gray-500">{formatDateTime(update.createdAt)}</p>
          </div>
          <button type="button" className={cn(SECONDARY, "text-[#dc2626]")} onClick={() => remove.mutate(update.id)} disabled={remove.isPending}>
            Delete
          </button>
        </div>
      ))}
    </section>
  );
}

const RESERVATION_TONE: Record<string, string> = {
  Reserved: "bg-[#dcfce7] text-[#16a34a]",
  PendingPayment: "bg-[#fef3c7] text-[#b45309]",
  Cancelled: "bg-[#f1f5f9] text-[#334155]",
  Expired: "bg-[#f1f5f9] text-[#334155]",
};

export function ReservationsPanel({ projectId }: { projectId: string }) {
  const refresh = useRefresh();
  const reservations = useProjectReservations(projectId);
  const [confirming, setConfirming] = useState<string | null>(null);
  const release = useMutation({
    mutationFn: (id: string) => releaseReservation(id),
    onSuccess: () => {
      setConfirming(null);
      refresh();
      showSuccessToast("Reservation released. A paid deposit is refunded.");
    },
    onError: (failure) => notifyError(failure),
  });

  return (
    <section className={CARD}>
      <h2 className="text-base font-bold text-[#0f172a]">Reservations</h2>
      {reservations.isPending && <Skeleton className="h-16 w-full" />}
      {reservations.isError && <p className="text-sm text-[#dc2626]">{errorMessage(reservations.error)}</p>}
      {reservations.data?.length === 0 && <Empty>No one has reserved a unit yet.</Empty>}
      {reservations.data?.map((reservation) => (
        <div key={reservation.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-gray-200 p-3.5">
          <div className="flex min-w-[180px] flex-1 flex-col gap-0.5">
            <p className="text-sm font-semibold text-[#0f172a]">{reservation.buyer?.name ?? "Buyer"} · {reservation.unitName}</p>
            <p className="text-xs text-gray-500">{reservation.reference} · deposit {formatMoney(reservation.deposit, reservation.currency)} · {formatDate(reservation.createdAt)}</p>
          </div>
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", RESERVATION_TONE[reservation.status])}>{reservation.status === "PendingPayment" ? "Awaiting payment" : reservation.status}</span>
          {(reservation.status === "Reserved" || reservation.status === "PendingPayment") &&
            (confirming === reservation.id ? (
              <div className="flex gap-2">
                <button type="button" className={cn(SECONDARY, "text-[#dc2626]")} disabled={release.isPending} onClick={() => release.mutate(reservation.id)}>
                  {reservation.status === "Reserved" ? "Release and refund" : "Release"}
                </button>
                <button type="button" className={SECONDARY} onClick={() => setConfirming(null)}>Keep</button>
              </div>
            ) : (
              <button type="button" className={SECONDARY} onClick={() => setConfirming(reservation.id)}>Release</button>
            ))}
        </div>
      ))}
    </section>
  );
}

const VISIT_TONE: Record<string, string> = {
  Requested: "bg-[#fef3c7] text-[#b45309]",
  Confirmed: "bg-[#dcfce7] text-[#16a34a]",
  Declined: "bg-[#f1f5f9] text-[#334155]",
  Cancelled: "bg-[#f1f5f9] text-[#334155]",
};

export function VisitsPanel({ projectId }: { projectId: string }) {
  const refresh = useRefresh();
  const visits = useIncomingVisits(projectId);
  const respond = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "confirm" | "decline" }) => respondToVisit(id, action),
    onSuccess: refresh,
    onError: (failure) => notifyError(failure),
  });

  return (
    <section className={CARD}>
      <h2 className="text-base font-bold text-[#0f172a]">Site visit requests</h2>
      {visits.isPending && <Skeleton className="h-16 w-full" />}
      {visits.isError && <p className="text-sm text-[#dc2626]">{errorMessage(visits.error)}</p>}
      {visits.data?.length === 0 && <Empty>No site visit requests yet.</Empty>}
      {visits.data?.map((visit) => (
        <div key={visit.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-gray-200 p-3.5">
          <div className="flex min-w-[180px] flex-1 flex-col gap-0.5">
            <p className="text-sm font-semibold text-[#0f172a]">{visit.requester.name} · {formatDateTime(visit.scheduledAt ?? visit.preferredAt)}</p>
            {visit.message && <p className="text-xs text-gray-500">{visit.message}</p>}
          </div>
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", VISIT_TONE[visit.status])}>{visit.status}</span>
          {visit.status === "Requested" && (
            <div className="flex gap-2">
              <button type="button" className={SECONDARY} disabled={respond.isPending} onClick={() => respond.mutate({ id: visit.id, action: "confirm" })}>Confirm</button>
              <button type="button" className={cn(SECONDARY, "text-[#dc2626]")} disabled={respond.isPending} onClick={() => respond.mutate({ id: visit.id, action: "decline" })}>Decline</button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
