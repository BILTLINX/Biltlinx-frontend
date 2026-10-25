import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { notifyError } from "@/lib/errors";
import { fromDraftData, toDraftData, type ListingForm } from "@/lib/listing-form";
import { createDraft, getDraft, getReadiness, saveDraft } from "@/lib/properties-api";

export type SaveState = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_MS = 900;

function hasContent(form: ListingForm) {
  return Boolean(form.name.trim() || form.description.trim() || form.price.trim() || form.address.trim() || form.city.trim() || form.media.length > 0);
}

export function useListingDraft(initialDraftId: string | null, onDraftCreated: (id: string) => void) {
  const [draftId, setDraftId] = useState<string | null>(initialDraftId);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState(0);
  const lastSaved = useRef<string>("");
  const pending = useRef<Promise<unknown> | null>(null);
  const createdId = useRef<string | null>(initialDraftId);

  const draft = useQuery({
    queryKey: ["draft", initialDraftId],
    queryFn: async () => {
      const result = await getDraft(initialDraftId as string);
      return fromDraftData(result.payload as Record<string, unknown> | null);
    },
    enabled: Boolean(initialDraftId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const readiness = useQuery({
    queryKey: ["readiness", draftId, savedAt],
    queryFn: () => getReadiness(draftId as string),
    enabled: Boolean(draftId) && savedAt > 0,
    placeholderData: keepPreviousData,
  });

  const persist = useCallback(
    async (form: ListingForm) => {
      const data = toDraftData(form);
      const serialized = JSON.stringify(data);
      if (serialized === lastSaved.current || !hasContent(form)) return createdId.current;
      setSaveState("saving");
      try {
        if (!createdId.current) {
          const id = await createDraft(1, data);
          createdId.current = id;
          setDraftId(id);
          onDraftCreated(id);
        } else {
          await saveDraft(createdId.current, 1, data);
        }
        lastSaved.current = serialized;
        setSaveState("saved");
        setSavedAt(Date.now());
      } catch (error) {
        setSaveState("error");
        notifyError(error, "Your draft could not be saved.");
      }
      return createdId.current;
    },
    [onDraftCreated],
  );

  const flush = useCallback(
    async (form: ListingForm) => {
      if (pending.current) await pending.current;
      const run = persist(form);
      pending.current = run;
      const id = await run;
      pending.current = null;
      return id;
    },
    [persist],
  );

  return { draftId, draft, readiness, saveState, flush, markLoaded: (form: ListingForm) => (lastSaved.current = JSON.stringify(toDraftData(form))) };
}

export function useAutosave(form: ListingForm, enabled: boolean, flush: (form: ListingForm) => Promise<unknown>) {
  const latest = useRef(form);
  useEffect(() => {
    latest.current = form;
  }, [form]);

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => void flush(latest.current), AUTOSAVE_MS);
    return () => window.clearTimeout(timer);
  }, [form, enabled, flush]);
}
