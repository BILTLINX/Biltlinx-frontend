"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { NOTIFICATION_SETTINGS } from "@/lib/dummy-notifications";

const CARD = "flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4";

/** Notifications side cards (Figma node 1046:23299): a settings summary and a privacy note. */
export function NotificationsRail() {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col gap-4">
      <section className={CARD}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Notification settings</h2>
        <ul className="flex flex-col gap-3">
          {NOTIFICATION_SETTINGS.map((setting) => (
            <li key={setting.label} className="flex items-start justify-between gap-3">
              <span className="text-[13px] font-medium leading-[19px] text-[#334155]">{setting.label}</span>
              <span className="shrink-0 whitespace-nowrap text-xs leading-[17px] text-gray-500">{setting.channels}</span>
            </li>
          ))}
        </ul>
        <Button variant="outline" onClick={() => router.push("/account-settings")} className="rounded-[10px] lg:rounded-[10px]">
          Edit settings
        </Button>
      </section>

      <section className={`${CARD} gap-2`}>
        <h2 className="text-sm font-bold leading-5 text-[#0f172a]">Private details stay private</h2>
        <p className="text-xs leading-[17px] text-gray-500">
          Lock-screen and email previews never show arrears, ID or document details. Open Biltlinx to see them.
        </p>
      </section>
    </div>
  );
}
