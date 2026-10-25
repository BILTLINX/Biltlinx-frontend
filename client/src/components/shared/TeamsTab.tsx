"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { OUTLINE_BUTTON, RowText, SETTINGS_CARD, SETTINGS_ROW, SectionHeading } from "@/components/shared/SettingsParts";
import { useOrganization } from "@/context/OrganizationContext";
import { useSession } from "@/context/SessionContext";
import {
  acceptInvitation,
  CAPABILITIES,
  createOrganization,
  getOrganizationAudit,
  inviteMember,
  listCapabilities,
  listInvitations,
  listMembers,
  listRoles,
  removeMember,
  requestCapability,
  resendInvitation,
  setMemberRoles,
  withdrawCapability,
} from "@/lib/account-api";
import { errorMessage, notifyError } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const PERSONAL_ORGANIZATION_ID = "fac586f8-1ffa-4cca-9bb0-224736bbc5a4";
const FIELD ="h-10 min-w-0 rounded-[10px] border border-gray-200 bg-white px-3 text-[13px] text-[#0f172a] focus:border-brand-900 focus:outline-none";
const PRIMARY = "h-10 rounded-[10px] bg-brand-900 px-4 text-sm font-medium text-white hover:bg-brand-900/90 disabled:opacity-50";
const STATUS_TONE: Record<string, string> = {
  Approved: "bg-[#dcfce7] text-[#16a34a]",
  Pending: "bg-[#fef3c7] text-[#b45309]",
  Rejected: "bg-[#fee2e2] text-[#dc2626]",
  Revoked: "bg-[#fee2e2] text-[#dc2626]",
};

function Capabilities() {
  const queryClient = useQueryClient();
  const capabilities = useQuery({ queryKey: ["capabilities"], queryFn: listCapabilities });
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["capabilities"] });
    void queryClient.invalidateQueries({ queryKey: ["me"] });
    void queryClient.invalidateQueries({ queryKey: ["action-needed"] });
  };
  const request = useMutation({
    mutationFn: (capability: string) => requestCapability(capability),
    onSuccess: () => {
      refresh();
      showSuccessToast("Requested. A Biltlinx reviewer will look at it.");
    },
    onError: (error) => notifyError(error),
  });
  const withdraw = useMutation({ mutationFn: withdrawCapability, onSuccess: refresh, onError: (error) => notifyError(error) });
  const byName = new Map((capabilities.data ?? []).map((item) => [item.capability, item]));

  return (
    <section className={SETTINGS_CARD}>
      <SectionHeading title="What you do on Biltlinx" note="Ask for a role to unlock its tools. A reviewer approves each request." />
      {capabilities.isPending && <p className="py-3 text-sm text-gray-500">Loading…</p>}
      {capabilities.isError && <p className="py-3 text-sm text-[#dc2626]">{errorMessage(capabilities.error)}</p>}
      {CAPABILITIES.map((item) => {
        const current = byName.get(item.value);
        const open = current?.status === "Pending" || current?.status === "Approved";
        return (
          <div key={item.value} className={SETTINGS_ROW}>
            <RowText title={item.label} note={current?.status === "Rejected" && current.reviewReason ? `Not approved: ${current.reviewReason}` : item.note} />
            <div className="flex shrink-0 items-center gap-2.5">
              {current && <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", STATUS_TONE[current.status ?? ""])}>{current.status}</span>}
              {open ? (
                <button type="button" onClick={() => withdraw.mutate(item.value)} className={OUTLINE_BUTTON}>
                  {current?.status === "Pending" ? "Withdraw" : "Give up"}
                </button>
              ) : (
                <button type="button" disabled={request.isPending} onClick={() => request.mutate(item.value)} className={OUTLINE_BUTTON}>
                  {current ? "Ask again" : "Request"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function Invitations() {
  const queryClient = useQueryClient();
  const invitations = useQuery({ queryKey: ["invitations"], queryFn: listInvitations });
  const [codes, setCodes] = useState<Record<string, string>>({});
  const accept = useMutation({
    mutationFn: ({ organizationId, code }: { organizationId: string; code: string }) => acceptInvitation(organizationId, code),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["invitations"] });
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      showSuccessToast("You joined the team");
    },
    onError: (error) => notifyError(error),
  });
  if (!invitations.data || invitations.data.length === 0) return null;
  return (
    <section className={SETTINGS_CARD}>
      <SectionHeading title="Invitations" note="Enter the code sent to your personal email to join." />
      {invitations.data.map((invitation) => (
        <div key={invitation.organizationId} className={cn(SETTINGS_ROW, "flex-wrap")}>
          <RowText title={invitation.organizationName ?? "Organization"} note={`Invited ${formatDateTime(invitation.invitedAt)} as ${invitation.workEmail}`} />
          <div className="flex gap-2">
            <input className={cn(FIELD, "w-28")} placeholder="Code" value={codes[invitation.organizationId] ?? ""} onChange={(event) => setCodes({ ...codes, [invitation.organizationId]: event.target.value })} />
            <button type="button" disabled={!codes[invitation.organizationId] || accept.isPending} onClick={() => accept.mutate({ organizationId: invitation.organizationId, code: codes[invitation.organizationId] })} className={PRIMARY}>
              Join
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

function CreateOrganization() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", ownerEmail: "" });
  const create = useMutation({
    mutationFn: () => createOrganization(form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      showSuccessToast("Your business account was created");
      setOpen(false);
    },
    onError: (error) => notifyError(error, "The business account could not be created. You need an approved Agent, Developer, Property manager or Stay operator role."),
  });
  return (
    <div className={cn(SETTINGS_ROW, "flex-col items-stretch")}>
      <div className="flex items-center justify-between gap-4">
        <RowText title="Business account" note="Work as a team under one business name. Needs an approved Agent, Developer, Property manager or Stay operator role." />
        <button type="button" onClick={() => setOpen((v) => !v)} className={OUTLINE_BUTTON}>
          {open ? "Close" : "Create"}
        </button>
      </div>
      {open && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          <input className={FIELD} placeholder="Business name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input className={FIELD} placeholder="Business email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input className={FIELD} placeholder="Business phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <input className={FIELD} placeholder="Your work email in this business" defaultValue={user?.accounts[0]?.email} value={form.ownerEmail} onChange={(event) => setForm({ ...form, ownerEmail: event.target.value })} />
          <button type="button" disabled={!form.name || !form.email || !form.phone || !form.ownerEmail || create.isPending} onClick={() => create.mutate()} className={cn(PRIMARY, "sm:w-fit")}>
            {create.isPending ? "Creating…" : "Create business account"}
          </button>
        </div>
      )}
    </div>
  );
}

function Team() {
  const { activeOrganizationId } = useOrganization();
  const queryClient = useQueryClient();
  const members = useQuery({ queryKey: ["org-members", activeOrganizationId], queryFn: listMembers, enabled: activeOrganizationId !== null });
  const roles = useQuery({ queryKey: ["org-roles", activeOrganizationId], queryFn: listRoles, enabled: activeOrganizationId !== null });
  const audit = useQuery({ queryKey: ["org-audit", activeOrganizationId], queryFn: () => getOrganizationAudit(1), enabled: activeOrganizationId !== null });
  const [invite, setInvite] = useState({ workEmail: "", personalEmail: "", roleId: "" });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["org-members"] });
  const send = useMutation({
    mutationFn: () => inviteMember({ workEmail: invite.workEmail, personalEmail: invite.personalEmail, roleIds: invite.roleId ? [invite.roleId] : undefined }),
    onSuccess: () => {
      refresh();
      setInvite({ workEmail: "", personalEmail: "", roleId: "" });
      showSuccessToast("Invitation sent");
    },
    onError: (error) => notifyError(error),
  });
  const changeRole = useMutation({ mutationFn: ({ accountId, roleId }: { accountId: string; roleId: string }) => setMemberRoles(accountId, [roleId]), onSuccess: refresh, onError: (error) => notifyError(error) });
  const remove = useMutation({ mutationFn: removeMember, onSuccess: refresh, onError: (error) => notifyError(error) });
  const resend = useMutation({ mutationFn: resendInvitation, onSuccess: () => showSuccessToast("Invitation sent again"), onError: (error) => notifyError(error) });

  if (activeOrganizationId === null) return null;

  return (
    <section className={SETTINGS_CARD}>
      <SectionHeading title="Team" note="People who can work on this business account." />
      {members.isError && <p className="py-3 text-sm text-[#dc2626]">{errorMessage(members.error)}</p>}
      {members.data?.map((member) => (
        <div key={member.accountId} className={cn(SETTINGS_ROW, "flex-wrap")}>
          <RowText title={member.username ?? member.workEmail ?? "Member"} note={`${member.workEmail} · ${member.status}`} />
          <div className="flex items-center gap-2">
            <select
              value={member.roles?.[0]?.id ?? ""}
              onChange={(event) => changeRole.mutate({ accountId: member.accountId, roleId: event.target.value })}
              aria-label={`Role for ${member.username}`}
              className={FIELD}
            >
              <option value="" disabled>
                Role
              </option>
              {roles.data?.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {member.status === "Pending" && (
              <button type="button" onClick={() => resend.mutate(member.accountId)} className={OUTLINE_BUTTON}>
                Resend
              </button>
            )}
            <button type="button" onClick={() => remove.mutate(member.accountId)} className="text-[13px] font-medium text-[#dc2626]">
              Remove
            </button>
          </div>
        </div>
      ))}
      <div className="grid gap-2.5 border-t border-gray-200 pt-3.5 sm:grid-cols-3">
        <input className={FIELD} placeholder="Their work email" value={invite.workEmail} onChange={(event) => setInvite({ ...invite, workEmail: event.target.value })} />
        <input className={FIELD} placeholder="Their personal email (gets the code)" value={invite.personalEmail} onChange={(event) => setInvite({ ...invite, personalEmail: event.target.value })} />
        <select className={FIELD} value={invite.roleId} onChange={(event) => setInvite({ ...invite, roleId: event.target.value })} aria-label="Role">
          <option value="">Member (default)</option>
          {roles.data?.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <button type="button" disabled={!invite.workEmail || !invite.personalEmail || send.isPending} onClick={() => send.mutate()} className={cn(PRIMARY, "sm:w-fit")}>
          Invite
        </button>
      </div>
      {audit.data?.items && audit.data.items.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-gray-200 pt-3.5">
          <p className="text-[13px] font-semibold text-[#0f172a]">Recent activity</p>
          {audit.data.items.slice(0, 8).map((entry) => (
            <p key={entry.id} className="text-xs text-gray-500">
              {formatDateTime(entry.occurredAt)} · {entry.actorName} · {entry.action}
              {entry.detail ? ` — ${entry.detail}` : ""}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}

/** Roles you can hold, invitations to join a business, and the team of the business you are acting for. */
export function TeamsTab() {
  const { user } = useSession();
  const { activeOrganizationId, switchOrganization } = useOrganization();
  const accounts = (user?.accounts ?? []).filter((account) => account.organization.id !== PERSONAL_ORGANIZATION_ID);

  return (
    <div className="flex flex-col gap-4 px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-night-900">Roles and teams</h1>
        <p className="text-[13px] text-gray-600">Choose what you do, work for a business, and manage who is on your team.</p>
      </div>
      <Capabilities />
      <Invitations />
      <section className={SETTINGS_CARD}>
        <SectionHeading title="Acting as" note="Everything you do in the app happens as the account chosen here." />
        <div className={SETTINGS_ROW}>
          <RowText title="Personal account" note={user?.username} />
          <button type="button" disabled={activeOrganizationId === null} onClick={() => switchOrganization(null)} className={OUTLINE_BUTTON}>
            {activeOrganizationId === null ? "Current" : "Switch"}
          </button>
        </div>
        {accounts.map((account) => (
          <div key={account.id} className={SETTINGS_ROW}>
            <RowText title={account.organization.name} note={`${account.email} · ${account.status}`} />
            <button type="button" disabled={activeOrganizationId === account.organization.id || account.status !== "Active"} onClick={() => switchOrganization(account.organization.id)} className={OUTLINE_BUTTON}>
              {activeOrganizationId === account.organization.id ? "Current" : "Switch"}
            </button>
          </div>
        ))}
        <CreateOrganization />
      </section>
      <Team />
    </div>
  );
}
