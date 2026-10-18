"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormField } from "@/components/shared/ModalFormParts";
import { RequestSentDialog } from "@/components/shared/RequestSentDialog";
import { DatePickerField, OptionSelectField, formatDateKey, todayKey } from "@/components/shared/ViewingSlotPickers";
import { WizardDialog } from "@/components/shared/WizardDialog";
import { SERVICE_FEE_RATE } from "@/lib/dummy-service-detail";
import { cn } from "@/lib/utils";

const DURATIONS = ["Same day", "1 day", "2 days", "3 days", "1 week", "2 weeks", "1 month"];
const PAYMENT_TERMS = ["50% upfront, 50% on completion", "100% on completion", "30% upfront, 70% on completion", "Paid in milestones"];
const VALID_FOR = ["3 days", "7 days", "14 days", "30 days"];

interface LineItem {
  id: number;
  label: string;
  quantity: string;
  price: string;
}

const newItem = (id: number): LineItem => ({ id, label: "", quantity: "1", price: "" });
const ghs = (amount: number) => `GHS ${amount.toLocaleString("en-US")}`;
const toNumber = (value: string) => {
  const parsed = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export interface QuoteRequest {
  /** Who asked, e.g. "Akua M." */
  poster: string;
  title: string;
}

const CELL_INPUT = "min-w-0 bg-transparent text-[13px] leading-[19px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none";

/** "Send a quote" dialog for a provider answering a request (Figma nodes 1061:30913, 1061:30918, 1061:30986): itemised line items, what the customer pays, timing, payment terms and a message. */
export function SendQuoteModal({ open, onClose, request }: { open: boolean; onClose: () => void; request: QuoteRequest }) {
  const router = useRouter();
  const [items, setItems] = useState<LineItem[]>([newItem(1)]);
  const [nextId, setNextId] = useState(2);
  const [canStart, setCanStart] = useState("");
  const [takes, setTakes] = useState(DURATIONS[1]);
  const [terms, setTerms] = useState(PAYMENT_TERMS[0]);
  const [validFor, setValidFor] = useState(VALID_FOR[1]);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<{ items?: string; canStart?: string }>({});

  const subtotal = items.reduce((sum, item) => sum + toNumber(item.quantity) * toNumber(item.price), 0);
  const fee = Math.round(subtotal * SERVICE_FEE_RATE);
  const posterFirstName = request.poster.split(" ")[0];

  function updateItem(id: number, patch: Partial<LineItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((current) => [...current, newItem(nextId)]);
    setNextId((id) => id + 1);
  }

  function removeItem(id: number) {
    setItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : [newItem(id)]));
  }

  function close() {
    setItems([newItem(1)]);
    setNextId(2);
    setCanStart("");
    setTakes(DURATIONS[1]);
    setTerms(PAYMENT_TERMS[0]);
    setValidFor(VALID_FOR[1]);
    setMessage("");
    setSent(false);
    setErrors({});
    onClose();
  }

  function send() {
    const priced = items.some((item) => item.label.trim() && toNumber(item.price) > 0);
    const found = { items: priced ? undefined : "Add at least one item with a price", canStart: canStart ? undefined : "Choose a start date" };
    setErrors(found);
    if (!found.items && !found.canStart) setSent(true);
  }

  return (
    <>
      <WizardDialog
        open={open && !sent}
        onClose={close}
        title="Send a quote"
        subtitle={`To ${request.poster} · ${request.title}`}
        fixedHeight={false}
        hint="Payments are held by Biltlinx and released on the terms above."
        backLabel="Cancel"
        nextLabel="Send quote"
        onBack={close}
        onNext={send}
      >
        <FormField label="Line items" error={errors.items}>
          <div className={cn("flex flex-col overflow-hidden rounded-xl border", errors.items ? "border-[#dc2626]" : "border-gray-200")}>
            {items.map((item, index) => (
              <div key={item.id} className={cn("flex items-center gap-2 px-3.5 py-2", index > 0 && "border-t border-gray-200")}>
                <input
                  value={item.label}
                  onChange={(event) => updateItem(item.id, { label: event.target.value })}
                  placeholder="Item or labour, e.g. Stainless sink"
                  aria-label="Item"
                  className={cn(CELL_INPUT, "flex-1")}
                />
                <span className="flex shrink-0 items-center gap-0.5 text-[13px] text-gray-500">
                  ×
                  <input
                    value={item.quantity}
                    onChange={(event) => updateItem(item.id, { quantity: event.target.value.replace(/\D/g, "") })}
                    inputMode="numeric"
                    aria-label="Quantity"
                    className={cn(CELL_INPUT, "w-7 text-center")}
                  />
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-[#0f172a]">
                  GHS
                  <input
                    value={item.price}
                    onChange={(event) => updateItem(item.id, { price: event.target.value.replace(/[^\d.]/g, "") })}
                    inputMode="decimal"
                    placeholder="0"
                    aria-label="Price each"
                    className={cn(CELL_INPUT, "w-14 font-semibold")}
                  />
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove item"
                  className="shrink-0 px-0.5 text-sm leading-none text-gray-400 hover:text-[#dc2626]"
                >
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={addItem} className="border-t border-gray-200 px-3.5 py-2.5 text-left text-[13px] font-medium leading-[19px] text-brand-900">
              + Add item
            </button>
          </div>
        </FormField>

        <dl className="flex shrink-0 flex-col gap-1.5 rounded-xl bg-[#f8fafc] p-3 text-[13px] leading-[19px]">
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Subtotal</dt>
            <dd className="font-medium text-[#0f172a]">{ghs(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Biltlinx fee (paid by customer)</dt>
            <dd className="font-medium text-[#0f172a]">{ghs(fee)}</dd>
          </div>
          <div className="flex justify-between gap-3 font-bold text-[#0f172a]">
            <dt>Customer pays</dt>
            <dd>{ghs(subtotal + fee)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">You receive</dt>
            <dd className="font-medium text-[#0f172a]">{ghs(subtotal)}</dd>
          </div>
        </dl>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Can start" error={errors.canStart}>
            <DatePickerField value={canStart} min={todayKey()} invalid={Boolean(errors.canStart)} onChange={setCanStart} />
          </FormField>
          <FormField label="Takes">
            <OptionSelectField value={takes} options={DURATIONS} onChange={setTakes} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Payment terms">
            <OptionSelectField value={terms} options={PAYMENT_TERMS} onChange={setTerms} minPanelWidth={260} />
          </FormField>
          <FormField label="Quote valid for">
            <OptionSelectField value={validFor} options={VALID_FOR} onChange={setValidFor} />
          </FormField>
        </div>

        <FormField label="Message" className="min-h-[65px]">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={2}
            placeholder={`Hi ${posterFirstName}, tell them why you’re the right person for this job`}
            className="h-[72px] resize-none rounded-[10px] border border-gray-200 px-3.5 py-3 text-[13px] leading-5 text-[#0f172a] placeholder:text-[#94a3b8] focus:border-brand-900 focus:outline-none sm:text-sm"
          />
        </FormField>
      </WizardDialog>

      <RequestSentDialog
        open={open && sent}
        onClose={close}
        title="Quote sent"
        message={`${posterFirstName} can accept it, ask about it or decline. You’ll hear back in Messages.`}
        rows={[
          { label: "Request", value: request.title },
          { label: "Customer pays", value: ghs(subtotal + fee) },
          { label: "Can start", value: canStart ? formatDateKey(canStart) : "" },
          { label: "Status", value: "Waiting for customer" },
        ]}
        secondary={{ label: "Done", onClick: close }}
        primary={{ label: `Message ${posterFirstName}`, onClick: () => router.push("/messages") }}
      />
    </>
  );
}
