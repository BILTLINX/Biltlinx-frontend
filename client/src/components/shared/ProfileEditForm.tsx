"use client";

import { useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { useSession } from "@/context/SessionContext";
import { updateProfile } from "@/lib/account-api";
import { notifyError } from "@/lib/errors";
import { INTRO_MAX_LENGTH } from "@/lib/dummy-onboarding";

const FIELD = "w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-[#0f172a] focus:border-brand-900 focus:outline-none";
const LABEL = "text-[13px] font-medium text-night-900";

/** Edits the parts of the profile the account allows changing here: display name, bio and location. */
export function ProfileEditForm({ onDone }: { onDone: () => void }) {
  const { user, refresh } = useSession();
  const [name, setName] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [saving, setSaving] = useState(false);

  const changed = name.trim() !== (user?.username ?? "") || bio.trim() !== (user?.bio ?? "") || location.trim() !== (user?.location ?? "");

  async function save() {
    if (!name.trim()) {
      notifyError(new Error("Your display name can't be empty."));
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ displayName: name.trim(), bio: bio.trim(), location: location.trim() });
      await refresh();
      showSuccessToast("Your profile was updated");
      onDone();
    } catch (error) {
      notifyError(error, "Your profile could not be saved. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>Display name</span>
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} className={FIELD} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={LABEL}>Location</span>
        <input value={location} onChange={(event) => setLocation(event.target.value)} maxLength={80} placeholder="e.g. East Legon, Accra" className={FIELD} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="flex items-center justify-between">
          <span className={LABEL}>Bio</span>
          <span className="text-[11px] text-gray-400">
            {bio.length}/{INTRO_MAX_LENGTH}
          </span>
        </span>
        <textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={INTRO_MAX_LENGTH} rows={3} placeholder="A short intro people see on your profile" className={FIELD} />
      </label>
      <div className="flex justify-end gap-2.5">
        <button type="button" onClick={onDone} className="h-10 rounded-[10px] border border-gray-200 px-4 text-sm font-medium text-[#0f172a] hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={!changed || saving} className="h-10 rounded-[10px] bg-brand-900 px-5 text-sm font-medium text-white hover:bg-brand-900/90 disabled:opacity-50">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
