"use client";

import { useRef, useState } from "react";
import { AnchoredPanel } from "@/components/shared/AnchoredPanel";
import { showSuccessToast } from "@/components/shared/AppToast";
import { NavIcon } from "@/components/shared/NavIcon";
import { OUTLINE_BUTTON, RowText, SETTINGS_CARD, SETTINGS_ROW, SectionHeading, Switch } from "@/components/shared/SettingsParts";
import { VisibilityRow } from "@/components/shared/VisibilityRow";
import {
  CURRENCIES,
  LANGUAGES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_TOPICS,
  PROFILE_VISIBILITY,
  QUIET_HOURS,
  REGIONS,
  UNITS,
  WHO_CAN_MESSAGE,
  type NotificationChannel,
} from "@/lib/dummy-general-settings";
import { cn } from "@/lib/utils";

/** The compact "value ▾" control on the right of a setting row, opening the app's frosted dropdown. */
function InlineSelect({ value, options, label, onChange }: { value: string; options: string[]; label: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] font-medium leading-[19px] text-[#0f1621] hover:text-brand-900"
      >
        {value}
        <NavIcon icon="/icons/poll-chevron-down.svg" size={10} className={cn("bg-gray-500 transition-transform duration-150", open && "rotate-180")} />
      </button>
      <AnchoredPanel open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} estimatedHeight={24 + options.length * 40} minWidth={190}>
        {options.map((option) => (
          <VisibilityRow
            key={option}
            label={option}
            selected={option === value}
            onClick={() => {
              onChange(option);
              setOpen(false);
            }}
          />
        ))}
      </AnchoredPanel>
    </>
  );
}

/** The General settings tab of Account settings (Figma node 1050:26209): privacy, notifications, language and region, and your data. */
export function GeneralSettingsTab() {
  const [visibility, setVisibility] = useState(PROFILE_VISIBILITY[0]);
  const [messaging, setMessaging] = useState(WHO_CAN_MESSAGE[0]);
  const [showPhone, setShowPhone] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [recommendations, setRecommendations] = useState(true);
  const [historyCleared, setHistoryCleared] = useState(false);
  const [channels, setChannels] = useState(() => Object.fromEntries(NOTIFICATION_TOPICS.map((topic) => [topic.id, topic.channels])));
  const [quietHours, setQuietHours] = useState(QUIET_HOURS[1]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [region, setRegion] = useState(REGIONS[0]);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [units, setUnits] = useState(UNITS[0]);
  const [requested, setRequested] = useState(false);

  function toggleChannel(topicId: string, channel: NotificationChannel) {
    setChannels((current) => ({ ...current, [topicId]: { ...current[topicId], [channel]: !current[topicId][channel] } }));
  }

  return (
    <div className="flex flex-col gap-4 px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-night-900">General settings</h1>
        <p className="text-[13px] text-gray-600">Privacy, notifications, language and region.</p>
      </div>

      <section className={SETTINGS_CARD}>
        <SectionHeading title="Privacy" note="Control who sees what on your profile." />
        <div className={SETTINGS_ROW}>
          <RowText title="Profile visibility" note="Who can see your profile" />
          <InlineSelect value={visibility} options={PROFILE_VISIBILITY} label="Profile visibility" onChange={setVisibility} />
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Show phone number" note="Only after you accept an enquiry" />
          <Switch checked={showPhone} label="Show phone number" onToggle={() => setShowPhone(!showPhone)} />
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Who can message you" note="People can always reply to enquiries you send" />
          <InlineSelect value={messaging} options={WHO_CAN_MESSAGE} label="Who can message you" onChange={setMessaging} />
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Show saved items and activity" note="Saved items are always private" />
          <Switch checked={showActivity} label="Show saved items and activity" onToggle={() => setShowActivity(!showActivity)} />
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Use my activity for recommendations" note="Viewed listings and searches tune Home and Discover" />
          <Switch checked={recommendations} label="Use my activity for recommendations" onToggle={() => setRecommendations(!recommendations)} />
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Search history" note="Clear the searches stored on your account" />
          <button
            type="button"
            disabled={historyCleared}
            onClick={() => {
              setHistoryCleared(true);
              showSuccessToast("Search history cleared");
            }}
            className={cn(OUTLINE_BUTTON, "disabled:cursor-not-allowed disabled:opacity-50")}
          >
            {historyCleared ? "Cleared" : "Clear history"}
          </button>
        </div>
      </section>

      <section className={SETTINGS_CARD}>
        <SectionHeading title="Notifications" note="Choose how we reach you for each kind of update." />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" aria-label="Update type" className="py-2" />
                {NOTIFICATION_CHANNELS.map((channel) => (
                  <th key={channel} scope="col" className="w-16 py-2 text-center text-xs font-medium leading-[17px] text-gray-500">
                    {channel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NOTIFICATION_TOPICS.map((topic) => (
                <tr key={topic.id} className="border-t border-gray-200">
                  <th scope="row" className="py-3.5 pr-3 text-left text-[13px] font-normal leading-[19px] text-[#0f1621]">
                    {topic.label}
                  </th>
                  {NOTIFICATION_CHANNELS.map((channel) => (
                    <td key={channel} className="py-3.5">
                      <span className="flex justify-center">
                        <Switch checked={channels[topic.id][channel]} label={`${topic.label} by ${channel}`} onToggle={() => toggleChannel(topic.id, channel)} />
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Quiet hours" note="No push notifications between these times." />
          <InlineSelect value={quietHours} options={QUIET_HOURS} label="Quiet hours" onChange={setQuietHours} />
        </div>
      </section>

      <section className={SETTINGS_CARD}>
        <SectionHeading title="Language & region" />
        <div className={SETTINGS_ROW}>
          <RowText title="Language" />
          <InlineSelect value={language} options={LANGUAGES} label="Language" onChange={setLanguage} />
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Region" />
          <InlineSelect value={region} options={REGIONS} label="Region" onChange={setRegion} />
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Currency display" note="Prices are charged in GHS" />
          <InlineSelect value={currency} options={CURRENCIES} label="Currency display" onChange={setCurrency} />
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Units" note="Area and distance" />
          <InlineSelect value={units} options={UNITS} label="Units" onChange={setUnits} />
        </div>
      </section>

      <section className={SETTINGS_CARD}>
        <SectionHeading title="Your data" />
        <div className={SETTINGS_ROW}>
          <RowText title="Download your data" note="We’ll email you a file within 48 hours" />
          <button
            type="button"
            disabled={requested}
            onClick={() => {
              setRequested(true);
              showSuccessToast("Request received. We’ll email you within 48 hours");
            }}
            className={cn(OUTLINE_BUTTON, "disabled:cursor-not-allowed disabled:opacity-50")}
          >
            {requested ? "Requested" : "Request download"}
          </button>
        </div>
      </section>
    </div>
  );
}
