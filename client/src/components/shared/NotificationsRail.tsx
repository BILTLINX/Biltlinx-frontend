"use client";

import { RailCta } from "@/components/shared/RailCta";

/** Notifications side cards (Figma node 1046:23152): where to change what reaches you, and a privacy note. */
export function NotificationsRail() {
  return (
    <div className="flex w-full flex-col gap-4">
      <RailCta
        title="Notification settings"
        body="Choose what reaches you, from messages and viewings to payments, jobs and marketing."
        label="Edit settings"
        href="/account-settings"
        variant="outline"
      />
      <section className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Private details stay private</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Lock-screen and email previews never show arrears, ID or document details. Open Biltlinx to see them.
        </p>
      </section>
    </div>
  );
}
