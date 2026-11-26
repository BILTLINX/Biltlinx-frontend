"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { FIELD_BOX, FIELD_INPUT, FormField } from "@/components/shared/ModalFormParts";
import { NavIcon } from "@/components/shared/NavIcon";
import { searchPeople } from "@/lib/social-api";
import { cn } from "@/lib/utils";
import type { CommunityInvite } from "@/lib/dummy-communities";

const MIN_CHARS = 2;
const MAX_RESULTS = 5;

/** For a private community: a link to share, and a way to add people by name. */
export function CommunityInvitePanel({ link, invited, onChange }: { link: string; invited: CommunityInvite[]; onChange: (next: CommunityInvite[]) => void }) {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(timer);
  }, [term]);

  const people = useQuery({
    queryKey: ["people-search", debounced],
    queryFn: () => searchPeople(debounced, 1, MAX_RESULTS),
    enabled: debounced.length >= MIN_CHARS,
  });
  const results = people.data?.items ?? [];
  const searching = term.trim().length >= MIN_CHARS;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      showSuccessToast("Link copied");
    } catch {
      showSuccessToast("Select the link and copy it");
    }
  }

  const isInvited = (id: string) => invited.some((person) => person.id === id);
  const add = (person: CommunityInvite) => onChange(isInvited(person.id) ? invited : [...invited, person]);
  const remove = (id: string) => onChange(invited.filter((person) => person.id !== id));

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
      <div className="flex flex-col gap-0.5">
        <p className="text-[13px] font-semibold leading-[19px] text-[#0f172a]">Invite people</p>
        <p className="text-xs leading-[17px] text-[#64748a]">Optional. Share the link, or add people by name.</p>
      </div>

      <FormField label="Invite link">
        <div className="flex gap-2">
          <label className={cn(FIELD_BOX, "min-w-0 flex-1 border-[#e2e8f0]")}>
            <NavIcon icon="/icons/post-options-copy-link.svg" size={16} className="bg-[#64748a]" />
            <input readOnly value={link} onFocus={(event) => event.target.select()} aria-label="Invite link" className={FIELD_INPUT} />
          </label>
          <button type="button" onClick={() => void copyLink()} className="h-11 shrink-0 rounded-[10px] bg-[#eef4ff] px-4 text-[13px] font-medium text-[#1465e6] hover:bg-[#dfeaff]">
            Copy link
          </button>
        </div>
      </FormField>

      <FormField label="Add by name">
        <label className={cn(FIELD_BOX, "border-[#e2e8f0]")}>
          <NavIcon icon="/icons/search-02.svg" size={16} className="bg-[#64748a]" />
          <input value={term} onChange={(event) => setTerm(event.target.value)} aria-label="Add people by name" placeholder="Search by name" className={FIELD_INPUT} />
        </label>
        {searching && (
          <ul className="flex flex-col overflow-hidden rounded-[10px] border border-[#e2e8f0] bg-white">
            {people.isPending && <li className="px-3.5 py-2.5 text-[13px] text-gray-500">Searching…</li>}
            {!people.isPending && results.length === 0 && <li className="px-3.5 py-2.5 text-[13px] text-gray-500">No one found with that name.</li>}
            {results.map(({ account }) => {
              const added = isInvited(account.id);
              return (
                <li key={account.id} className="flex items-center gap-2.5 border-b border-[#e2e8f0] px-3 py-2 last:border-b-0">
                  <span className="relative block size-8 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
                    <Image src={account.profilePicUrl ?? "/icons/avatar-placeholder-user.svg"} alt="" fill sizes="32px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#0f172a]">{account.username}</span>
                  <button
                    type="button"
                    disabled={added}
                    onClick={() => add({ id: account.id, name: account.username })}
                    className="shrink-0 rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-medium text-[#1465e6] hover:bg-[#dfeaff] disabled:bg-[#f1f5f9] disabled:text-[#64748a]"
                  >
                    {added ? "Added" : "Add"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </FormField>

      {invited.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="People you are inviting">
          {invited.map((person) => (
            <span key={person.id} className="flex items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-white py-1 pl-3 pr-1.5 text-[13px] font-medium text-[#334155]">
              {person.name}
              <button type="button" aria-label={`Remove ${person.name}`} onClick={() => remove(person.id)} className="flex size-5 items-center justify-center rounded-full text-sm leading-none text-[#64748a] hover:bg-gray-100">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
