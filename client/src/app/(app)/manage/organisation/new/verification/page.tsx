"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { CreateOrganisationStepper } from "@/components/shared/CreateOrganisationStepper";
import { FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { NavIcon } from "@/components/shared/NavIcon";
import { PageContainer } from "@/components/shared/PageContainer";
import { CREDENTIAL_FILE_MAX_BYTES, CREDENTIAL_FILE_TYPES } from "@/lib/dummy-onboarding";
import { updateOrganisationDraft } from "@/lib/organisation-draft";
import { cn } from "@/lib/utils";

const CARD = "flex flex-col gap-[18px] rounded-2xl border border-gray-200 bg-white p-5 sm:p-6";

interface DocumentRowProps {
  title: string;
  hint: string;
  /** The file's name once one is chosen. */
  fileName: string | null;
  onFile: (name: string) => void;
}

/** One document slot: dashed with an Upload button while empty, solid with an "Uploaded" pill once a file is chosen. */
function DocumentRow({ title, hint, fileName, onFile }: DocumentRowProps) {
  const input = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");

  function handlePick(file: File | undefined) {
    if (!file) return;
    if (!CREDENTIAL_FILE_TYPES.includes(file.type)) {
      setError("Use a PDF, JPG or PNG file.");
      return;
    }
    if (file.size > CREDENTIAL_FILE_MAX_BYTES) {
      setError("That file is over 10 MB. Choose a smaller one.");
      return;
    }
    setError("");
    onFile(file.name);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className={cn("flex flex-wrap items-center gap-3 rounded-xl p-3.5 sm:flex-nowrap", fileName ? "border border-gray-200" : "border border-dashed border-[#cbd5e1]")}>
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", fileName ? "bg-[#dcfce7]" : "bg-[#f1f5f9]")}>
          <NavIcon icon="/icons/layers-01.svg" size={18} className={fileName ? "bg-[#16a34a]" : "bg-gray-500"} />
        </span>
        <span className="flex min-w-0 flex-1 basis-40 flex-col gap-0.5">
          <span className="text-sm font-semibold leading-5 text-[#0f172a]">{title}</span>
          <span className="truncate text-xs leading-[17px] text-gray-500">{fileName ? `Uploaded · ${fileName}` : hint}</span>
        </span>
        <input ref={input} type="file" accept={CREDENTIAL_FILE_TYPES.join(",")} aria-label={title} className="hidden" onChange={(event) => { handlePick(event.target.files?.[0]); event.target.value = ""; }} />
        {fileName ? (
          <button type="button" onClick={() => input.current?.click()} className="shrink-0 rounded-full bg-[#dcfce7] px-2.5 py-[3px] text-[11px] font-medium leading-4 text-[#16a34a]" aria-label={`${title} uploaded. Replace file`}>
            Uploaded
          </button>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="h-9 shrink-0 rounded-[10px] border border-gray-200 bg-white px-4 text-sm font-medium text-[#0f172a] hover:bg-gray-50">
            Upload
          </button>
        )}
      </div>
      {error && <span className="text-xs leading-[17px] text-[#dc2626]">{error}</span>}
    </div>
  );
}

/** Create organisation · step 2 (Figma node 1084:34877): proving the organisation is real. */
export default function CreateOrganisationVerificationPage() {
  const router = useRouter();
  const [registration, setRegistration] = useState("");
  const [tin, setTin] = useState("");
  const [certificate, setCertificate] = useState<string | null>(null);
  const [form3, setForm3] = useState<string | null>(null);
  const [licence, setLicence] = useState<string | null>(null);

  function next() {
    updateOrganisationDraft({ tin: tin.trim(), documents: [certificate, form3, licence].filter(Boolean).length });
    router.push("/manage/organisation/new/structure");
  }

  return (
    <AppShell activeKey="manage" contentFullWidth>
      <PageContainer>
        <Breadcrumbs crumbs={[{ label: "Manage", href: "/manage" }, { label: "Create organisation" }]} />

        <div className="flex w-full flex-col items-start gap-6 lg:flex-row lg:gap-8">
          <CreateOrganisationStepper current={1} />

          <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold leading-[17px] text-brand-900">Step 2 of 4</p>
              <h1 className="text-2xl font-bold leading-8 text-[#0f172a]">Verification</h1>
            </div>

            <section className={CARD}>
              <p className="text-sm leading-5 text-[#334155]">Verified organisations get a &ldquo;Business verified&rdquo; badge that says exactly what was checked. Your plan never changes this badge.</p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Registration number">
                  <label className={cn(FIELD_BOX, "border-gray-200")}>
                    <input value={registration} maxLength={30} placeholder="e.g. CS-1029384-2014" onChange={(event) => setRegistration(event.target.value)} className={FIELD_INPUT} />
                  </label>
                </FormField>
                <FormField label="TIN">
                  <label className={cn(FIELD_BOX, "border-gray-200")}>
                    <input value={tin} maxLength={14} placeholder="e.g. C0004471239" onChange={(event) => setTin(event.target.value.toUpperCase())} className={FIELD_INPUT} />
                  </label>
                </FormField>
              </div>

              <DocumentRow title="Certificate of incorporation" hint="PDF, JPG or PNG, up to 10 MB" fileName={certificate} onFile={setCertificate} />
              <DocumentRow title="Business registration (Form 3)" hint="PDF, JPG or PNG, up to 10 MB" fileName={form3} onFile={setForm3} />
              <DocumentRow title="Agent licence (if you're an agency)" hint={'Required for the "Licensed agent" badge'} fileName={licence} onFile={setLicence} />

              <p className="flex items-center gap-2.5 rounded-xl bg-[#eff5ff] p-3.5 text-[13px] font-medium leading-[19px] text-brand-900">
                <NavIcon icon="/icons/clock-01.svg" size={18} className="shrink-0 bg-brand-900" />
                Checks usually take 1–2 working days. You can keep setting up while we review.
              </p>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2.5">
              <p className="flex-1 text-xs leading-[17px] text-gray-500">
                <button type="button" onClick={next} className="hover:text-brand-900">
                  Skip for now
                </button>{" "}
                · your page shows &ldquo;Not yet verified&rdquo;.
              </p>
              <div className="flex gap-2.5">
                <button type="button" onClick={() => router.push("/manage/organisation/new")} className="h-11 rounded-[10px] border border-gray-200 bg-white px-4 text-sm font-medium text-[#0f172a] hover:bg-gray-50">
                  Back
                </button>
                <button type="button" onClick={next} className="h-11 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white hover:opacity-90">
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
