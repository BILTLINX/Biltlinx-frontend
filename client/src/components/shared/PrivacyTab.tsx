"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast } from "@/components/shared/AppToast";
import { RowText, SETTINGS_CARD, SETTINGS_ROW, SectionHeading } from "@/components/shared/SettingsParts";
import { errorMessage, notifyError } from "@/lib/errors";
import { getPrivacy, updatePrivacy } from "@/lib/account-api";
import { cn } from "@/lib/utils";

const LABELS: Record<string, { title: string; note: string }> = {
  Profile: { title: "Profile", note: "Your name, photo and bio" },
  Email: { title: "Email address", note: "Shown on your profile" },
  Phone: { title: "Phone number", note: "Shown on your profile" },
  SavedActivity: { title: "Saved items", note: "What you have saved" },
  ViewedActivity: { title: "Viewed items", note: "What you have looked at" },
  Bookings: { title: "Bookings", note: "Always private" },
  OwnershipRelationships: { title: "Properties you own", note: "Which listings are linked to you" },
  Messages: { title: "Messages", note: "Always private" },
};

/** The privacy part of Account settings: everything is private until you choose to make it public. */
export function PrivacyTab() {
  const queryClient = useQueryClient();
  const privacy = useQuery({ queryKey: ["privacy"], queryFn: getPrivacy });
  const save = useMutation({
    mutationFn: ({ category, visibility }: { category: string; visibility: string }) => updatePrivacy([{ category, visibility }]),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["privacy"] });
      showSuccessToast("Privacy updated");
    },
    onError: (error) => notifyError(error),
  });

  return (
    <div className="flex flex-col gap-4 px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-night-900">Privacy</h1>
        <p className="text-[13px] text-gray-600">Everything starts private. Make something public only if you want others to see it.</p>
      </div>
      <section className={SETTINGS_CARD}>
        <SectionHeading title="Who can see what" />
        {privacy.isPending && <p className="py-3 text-sm text-gray-500">Loading…</p>}
        {privacy.isError && <p className="py-3 text-sm text-[#dc2626]">{errorMessage(privacy.error)}</p>}
        {privacy.data?.map((setting) => {
          const label = LABELS[setting.category ?? ""] ?? { title: setting.category ?? "", note: "" };
          const isPublic = setting.visibility === "Public";
          return (
            <div key={setting.category} className={SETTINGS_ROW}>
              <RowText title={label.title} note={setting.canBePublic ? label.note : "Always private"} />
              {setting.canBePublic ? (
                <div role="radiogroup" aria-label={label.title} className="flex shrink-0 gap-1 rounded-[10px] border border-gray-200 p-1">
                  {(["Private", "Public"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={(option === "Public") === isPublic}
                      disabled={save.isPending}
                      onClick={() => option !== setting.visibility && save.mutate({ category: setting.category ?? "", visibility: option })}
                      className={cn("rounded-lg px-3 py-1 text-[13px] font-medium", (option === "Public") === isPublic ? "bg-brand-900 text-white" : "text-[#334155] hover:bg-gray-50")}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="shrink-0 rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-medium text-[#334155]">Private</span>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
