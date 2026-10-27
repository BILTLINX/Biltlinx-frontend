"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { CenteredDialog } from "@/components/shared/CenteredDialog";
import { DANGER_BUTTON, OUTLINE_BUTTON, RowText, SETTINGS_CARD, SETTINGS_ROW, SectionHeading } from "@/components/shared/SettingsParts";
import { useSession } from "@/context/SessionContext";
import {
  changePassword,
  confirmContactChange,
  deactivateAccount,
  deleteAccount,
  disableTotp,
  enableTotp,
  getDeletionImpact,
  getSecurityAudit,
  regenerateRecoveryCodes,
  requestEmailChange,
  requestPhoneChange,
  setupTotp,
  updateProfile,
} from "@/lib/account-api";
import { notifyError } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const FIELD = "h-10 w-full rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] text-[#0f172a] focus:border-brand-900 focus:outline-none";
const PRIMARY = "h-10 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white hover:bg-brand-900/90 disabled:opacity-50";

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <CenteredDialog open onClose={onClose} labelledBy="security-dialog" className="max-w-[440px]">
      <div className="flex max-h-[85vh] flex-col gap-3 overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 id="security-dialog" className="text-lg font-bold text-[#0f172a]">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-lg text-gray-500 hover:text-[#0f172a]">
            ✕
          </button>
        </div>
        {children}
      </div>
    </CenteredDialog>
  );
}

function PasswordDialog({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const change = useMutation({
    mutationFn: () => changePassword({ currentPassword: current, newPassword: next, confirmPassword: confirm }),
    onSuccess: () => {
      showSuccessToast("Password changed. Other devices were signed out.");
      onClose();
    },
    onError: (error) => notifyError(error),
  });
  return (
    <Dialog title="Change password" onClose={onClose}>
      <input type="password" autoComplete="current-password" placeholder="Current password" value={current} onChange={(event) => setCurrent(event.target.value)} className={FIELD} />
      <input type="password" autoComplete="new-password" placeholder="New password" value={next} onChange={(event) => setNext(event.target.value)} className={FIELD} />
      <input type="password" autoComplete="new-password" placeholder="Repeat new password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className={FIELD} />
      <button type="button" disabled={!current || !next || next !== confirm || change.isPending} onClick={() => change.mutate()} className={PRIMARY}>
        {change.isPending ? "Saving…" : "Change password"}
      </button>
      {confirm && next !== confirm && <p className="text-xs text-[#dc2626]">The two new passwords do not match.</p>}
    </Dialog>
  );
}

function ContactDialog({ kind, onClose }: { kind: "email" | "phone"; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [value, setValue] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const request = useMutation({
    mutationFn: () => (kind === "email" ? requestEmailChange({ currentPassword: password, newValue: value }) : requestPhoneChange({ currentPassword: password, newValue: value })),
    onSuccess: () => setSent(true),
    onError: (error) => notifyError(error),
  });
  const confirm = useMutation({
    mutationFn: () => confirmContactChange(code),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      showSuccessToast(`Your ${kind} was updated`);
      onClose();
    },
    onError: (error) => notifyError(error),
  });
  return (
    <Dialog title={kind === "email" ? "Change email" : "Change phone number"} onClose={onClose}>
      {!sent ? (
        <>
          <input type="password" placeholder="Current password" value={password} onChange={(event) => setPassword(event.target.value)} className={FIELD} />
          <input type={kind === "email" ? "email" : "tel"} placeholder={kind === "email" ? "New email address" : "New phone number"} value={value} onChange={(event) => setValue(event.target.value)} className={FIELD} />
          <button type="button" disabled={!password || !value || request.isPending} onClick={() => request.mutate()} className={PRIMARY}>
            {request.isPending ? "Sending…" : "Send me a code"}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500">We sent a code to {value}. Enter it to finish the change.</p>
          <input inputMode="numeric" placeholder="Code" value={code} onChange={(event) => setCode(event.target.value)} className={FIELD} />
          <button type="button" disabled={!code || confirm.isPending} onClick={() => confirm.mutate()} className={PRIMARY}>
            {confirm.isPending ? "Checking…" : "Confirm change"}
          </button>
        </>
      )}
    </Dialog>
  );
}

function QrCode({ value }: { value: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    import("qrcode")
      .then((module) => module.toDataURL(value, { margin: 1, width: 180 }))
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [value]);
  if (!src) return null;
  return <Image src={src} alt="Scan this code with your authenticator app" width={180} height={180} unoptimized className="self-center rounded-lg border border-gray-200" />;
}

function TotpDialog({ enabled, onClose }: { enabled: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const setup = useMutation({ mutationFn: () => setupTotp(password), onError: (error) => notifyError(error) });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["me"] });
  const enable = useMutation({
    mutationFn: () => enableTotp(code),
    onSuccess: (result) => {
      refresh();
      setCodes(result.recoveryCodes ?? []);
    },
    onError: (error) => notifyError(error),
  });
  const disable = useMutation({
    mutationFn: () => disableTotp({ currentPassword: password, code }),
    onSuccess: () => {
      refresh();
      showSuccessToast("Two-step verification is off");
      onClose();
    },
    onError: (error) => notifyError(error),
  });
  const regenerate = useMutation({
    mutationFn: () => regenerateRecoveryCodes({ currentPassword: password, code }),
    onSuccess: (result) => {
      refresh();
      setCodes(result.recoveryCodes ?? []);
    },
    onError: (error) => notifyError(error),
  });

  if (codes) {
    return (
      <Dialog title="Save your recovery codes" onClose={onClose}>
        <p className="text-sm text-gray-500">Each code works once if you lose your phone. We show them only now. Store them somewhere safe.</p>
        <ul className="grid grid-cols-2 gap-2 rounded-xl bg-[#f8fafc] p-3.5 font-mono text-sm text-[#0f172a]">
          {codes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <button type="button" onClick={() => void navigator.clipboard.writeText(codes.join("\n"))} className={OUTLINE_BUTTON}>
          Copy codes
        </button>
        <button type="button" onClick={onClose} className={PRIMARY}>
          I have saved them
        </button>
      </Dialog>
    );
  }

  if (enabled) {
    return (
      <Dialog title="Two-step verification" onClose={onClose}>
        <p className="text-sm text-gray-500">Enter your password and a code from your authenticator app (or a recovery code).</p>
        <input type="password" placeholder="Current password" value={password} onChange={(event) => setPassword(event.target.value)} className={FIELD} />
        <input placeholder="Authenticator or recovery code" value={code} onChange={(event) => setCode(event.target.value)} className={FIELD} />
        <button type="button" disabled={!password || !code || regenerate.isPending} onClick={() => regenerate.mutate()} className={OUTLINE_BUTTON}>
          Get new recovery codes
        </button>
        <button type="button" disabled={!password || !code || disable.isPending} onClick={() => disable.mutate()} className={DANGER_BUTTON}>
          Turn off two-step verification
        </button>
      </Dialog>
    );
  }

  return (
    <Dialog title="Turn on two-step verification" onClose={onClose}>
      {!setup.data ? (
        <>
          <p className="text-sm text-gray-500">Use an authenticator app such as Google Authenticator. Enter your password to begin.</p>
          <input type="password" placeholder="Current password" value={password} onChange={(event) => setPassword(event.target.value)} className={FIELD} />
          <button type="button" disabled={!password || setup.isPending} onClick={() => setup.mutate()} className={PRIMARY}>
            {setup.isPending ? "Starting…" : "Continue"}
          </button>
        </>
      ) : (
        <>
          {setup.data.otpAuthUri && <QrCode value={setup.data.otpAuthUri} />}
          <p className="text-xs text-gray-500">Cannot scan? Enter this key in your app: <span className="font-mono text-[#0f172a]">{setup.data.secret}</span></p>
          <input inputMode="numeric" placeholder="6-digit code from the app" value={code} onChange={(event) => setCode(event.target.value)} className={FIELD} />
          <button type="button" disabled={!code || enable.isPending} onClick={() => enable.mutate()} className={PRIMARY}>
            {enable.isPending ? "Checking…" : "Turn on"}
          </button>
        </>
      )}
    </Dialog>
  );
}

function DeleteDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { user, signOut } = useSession();
  const impact = useQuery({ queryKey: ["deletion-impact"], queryFn: getDeletionImpact, staleTime: 0 });
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const remove = useMutation({
    mutationFn: () => deleteAccount({ currentPassword: password, code: code || undefined }),
    onSuccess: async () => {
      await signOut();
      router.replace("/auth");
    },
    onError: (error) => notifyError(error),
  });
  return (
    <Dialog title="Delete your account" onClose={onClose}>
      {impact.isPending && <p className="text-sm text-gray-500">Checking what this affects…</p>}
      {impact.data && (
        <>
          {(impact.data.blockers ?? []).length > 0 && (
            <ul className="list-disc rounded-xl bg-[#fee2e2] p-3.5 pl-7 text-[13px] text-[#dc2626]">
              {impact.data.blockers?.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          <ul className="list-disc pl-5 text-[13px] text-[#334155]">
            {impact.data.effects?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-xs text-gray-500">Your account is deactivated now and deleted after {impact.data.gracePeriodDays} days. Signing in again within that time cancels the deletion.</p>
          <input type="password" placeholder="Current password" value={password} onChange={(event) => setPassword(event.target.value)} className={FIELD} />
          {user?.totpEnabled && <input placeholder="Authenticator code" value={code} onChange={(event) => setCode(event.target.value)} className={FIELD} />}
          <button type="button" disabled={!impact.data.canDelete || !password || remove.isPending} onClick={() => remove.mutate()} className={DANGER_BUTTON}>
            {remove.isPending ? "Deleting…" : "Delete my account"}
          </button>
        </>
      )}
    </Dialog>
  );
}

function DeactivateDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { user, signOut } = useSession();
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const deactivate = useMutation({
    mutationFn: () => deactivateAccount({ currentPassword: password, code: code || undefined }),
    onSuccess: async () => {
      await signOut();
      router.replace("/auth");
    },
    onError: (error) => notifyError(error),
  });
  return (
    <Dialog title="Deactivate your account" onClose={onClose}>
      <p className="text-sm text-gray-500">Your profile and listings are hidden. Signing in again reactivates your account.</p>
      <input type="password" placeholder="Current password" value={password} onChange={(event) => setPassword(event.target.value)} className={FIELD} />
      {user?.totpEnabled && <input placeholder="Authenticator code" value={code} onChange={(event) => setCode(event.target.value)} className={FIELD} />}
      <button type="button" disabled={!password || deactivate.isPending} onClick={() => deactivate.mutate()} className={DANGER_BUTTON}>
        {deactivate.isPending ? "Deactivating…" : "Deactivate"}
      </button>
    </Dialog>
  );
}

/** The Security tab of Account settings (Figma node 1050:23086): sign-in, two-step verification, activity and account removal. */
function LocationDialog({ current, onClose }: { current: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(current);
  const save = useMutation({
    mutationFn: () => updateProfile({ location: value.trim() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      showSuccessToast("Your location was updated");
      onClose();
    },
    onError: (error) => notifyError(error),
  });
  return (
    <Dialog title="Change location" onClose={onClose}>
      <input placeholder="e.g. East Legon, Accra" maxLength={80} value={value} onChange={(event) => setValue(event.target.value)} className={FIELD} />
      <button type="button" disabled={save.isPending} onClick={() => save.mutate()} className={PRIMARY}>
        {save.isPending ? "Saving…" : "Save location"}
      </button>
    </Dialog>
  );
}

export function SecurityTab() {
  const { user } = useSession();
  const [dialog, setDialog] = useState<"password" | "email" | "phone" | "location" | "totp" | "deactivate" | "delete" | null>(null);
  const [page, setPage] = useState(1);
  const audit = useQuery({ queryKey: ["security-audit", page], queryFn: () => getSecurityAudit(page) });

  return (
    <div className="flex flex-col gap-4 px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-night-900">Security</h1>
        <p className="text-[13px] text-gray-600">Keep your account safe. Changes here may ask you to confirm with a code.</p>
      </div>

      <section className={SETTINGS_CARD}>
        <SectionHeading title="Sign-in and address" note="How you log in to Biltlinx, and where you are." />
        <div className={SETTINGS_ROW}>
          <RowText title="Password" note="Changing it signs out your other devices." />
          <button type="button" onClick={() => setDialog("password")} className={OUTLINE_BUTTON}>
            Change password
          </button>
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Email" note={user?.accounts[0]?.email ?? "Not set"} />
          <button type="button" onClick={() => setDialog("email")} className={OUTLINE_BUTTON}>
            Change
          </button>
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Phone number" note={user?.primaryContact ?? "Not set"} />
          <button type="button" onClick={() => setDialog("phone")} className={OUTLINE_BUTTON}>
            Change
          </button>
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Location" note={user?.location || "Not set"} />
          <button type="button" onClick={() => setDialog("location")} className={OUTLINE_BUTTON}>
            Change
          </button>
        </div>
        {user?.pendingContactChange && (
          <p className="rounded-lg bg-[#fef3c7] p-3 text-xs text-[#b45309]">
            A change to your {user.pendingContactChange.kind.toLowerCase()} is waiting for its code ({user.pendingContactChange.value}).{" "}
            <button type="button" onClick={() => setDialog(user.pendingContactChange?.kind.toLowerCase() === "email" ? "email" : "phone")} className="font-medium underline">
              Enter it
            </button>
          </p>
        )}
        <div className={SETTINGS_ROW}>
          <RowText title="Two-step verification" note={user?.totpEnabled ? `On with an authenticator app. ${user.recoveryCodesRemaining} recovery codes left.` : "Off. Add an authenticator app for a second sign-in step."} />
          <button type="button" onClick={() => setDialog("totp")} className={OUTLINE_BUTTON}>
            {user?.totpEnabled ? "Manage" : "Turn on"}
          </button>
        </div>
      </section>

      <section className={SETTINGS_CARD}>
        <SectionHeading title="Recent security activity" note="Password, contact, two-step and organization changes on your account." />
        {audit.isPending && <p className="py-3 text-sm text-gray-500">Loading…</p>}
        {audit.data?.items?.map((entry) => (
          <div key={entry.id} className={cn(SETTINGS_ROW, "items-start")}>
            <RowText title={entry.action ?? "Activity"} note={entry.detail ?? undefined} />
            <p className="shrink-0 text-right text-xs text-gray-500">
              {formatDateTime(entry.occurredAt)}
              {entry.ipAddress ? <span className="block">{entry.ipAddress}</span> : null}
            </p>
          </div>
        ))}
        {audit.data && (audit.data.items?.length ?? 0) === 0 && <p className="py-3 text-sm text-gray-500">Nothing yet.</p>}
        {audit.data && audit.data.totalPages > 1 && (
          <div className="flex items-center gap-3 pt-2 text-[13px]">
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="font-medium text-brand-900 disabled:opacity-40">
              ‹ Newer
            </button>
            <span className="text-gray-500">
              {page} of {audit.data.totalPages}
            </span>
            <button type="button" disabled={page >= audit.data.totalPages} onClick={() => setPage(page + 1)} className="font-medium text-brand-900 disabled:opacity-40">
              Older ›
            </button>
          </div>
        )}
      </section>

      <section className={SETTINGS_CARD}>
        <SectionHeading title="Your account" note="Leave for a while, or remove your account and data." />
        <div className={SETTINGS_ROW}>
          <RowText title="Deactivate account" note="Hide your profile and listings. Sign in again to come back." />
          <button type="button" onClick={() => setDialog("deactivate")} className={OUTLINE_BUTTON}>
            Deactivate
          </button>
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Delete account" note="Deactivates now and deletes after a 30-day grace period." />
          <button type="button" onClick={() => setDialog("delete")} className={DANGER_BUTTON}>
            Delete
          </button>
        </div>
      </section>

      {dialog === "password" && <PasswordDialog onClose={() => setDialog(null)} />}
      {dialog === "email" && <ContactDialog kind="email" onClose={() => setDialog(null)} />}
      {dialog === "phone" && <ContactDialog kind="phone" onClose={() => setDialog(null)} />}
      {dialog === "location" && <LocationDialog current={user?.location ?? ""} onClose={() => setDialog(null)} />}
      {dialog === "totp" && <TotpDialog enabled={Boolean(user?.totpEnabled)} onClose={() => setDialog(null)} />}
      {dialog === "deactivate" && <DeactivateDialog onClose={() => setDialog(null)} />}
      {dialog === "delete" && <DeleteDialog onClose={() => setDialog(null)} />}
    </div>
  );
}
