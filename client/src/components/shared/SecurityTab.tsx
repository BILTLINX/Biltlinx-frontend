"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { showSuccessToast } from "@/components/shared/AppToast";
import { DANGER_BUTTON, OUTLINE_BUTTON, RowText, SETTINGS_CARD, SETTINGS_ROW, SectionHeading, Switch } from "@/components/shared/SettingsParts";
import { comingSoonHref } from "@/lib/coming-soon";
import { SIGNED_IN_DEVICES } from "@/lib/dummy-security";
import { cn } from "@/lib/utils";

/** The Security tab of Account settings (Figma node 1050:23086): sign-in methods, signed-in devices, alerts and account deletion. */
export function SecurityTab() {
  const router = useRouter();
  const [twoStep, setTwoStep] = useState(true);
  const [signInEmails, setSignInEmails] = useState(true);
  const [devices, setDevices] = useState(SIGNED_IN_DEVICES);
  const comingSoon = (feature: string) => () => router.push(comingSoonHref(feature));

  function signOut(id: string) {
    setDevices((current) => current.filter((device) => device.id !== id));
    showSuccessToast("Signed out of that device");
  }

  function signOutOthers() {
    setDevices((current) => current.filter((device) => device.current));
    showSuccessToast("Signed out of all other devices");
  }

  const hasOthers = devices.some((device) => !device.current);

  return (
    <div className="flex flex-col gap-4 px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-night-900">Security</h1>
        <p className="text-[13px] text-gray-600">Keep your account safe. Changes here may ask you to confirm with a code.</p>
      </div>

      <section className={SETTINGS_CARD}>
        <SectionHeading title="Sign-in" note="How you log in to Biltlinx." />
        <div className={SETTINGS_ROW}>
          <RowText title="Password" note="Last changed 3 months ago" />
          <button type="button" onClick={comingSoon("Change password")} className={OUTLINE_BUTTON}>
            Change password
          </button>
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Passkeys" note="Sign in with your fingerprint or face instead of a password." />
          <button type="button" onClick={comingSoon("Add passkey")} className={OUTLINE_BUTTON}>
            Add passkey
          </button>
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Two-step verification" note="Text a code to 024 *** 8595 when you sign in from a new device." />
          <Switch
            checked={twoStep}
            label="Two-step verification"
            onToggle={() => {
              setTwoStep(!twoStep);
              showSuccessToast(`Two-step verification turned ${twoStep ? "off" : "on"}`);
            }}
          />
        </div>
      </section>

      <section className={SETTINGS_CARD}>
        <SectionHeading
          title="Where you’re signed in"
          note="Sign out of any device you don’t recognise."
          action={
            <button type="button" onClick={signOutOthers} disabled={!hasOthers} className={cn(DANGER_BUTTON, "disabled:cursor-not-allowed disabled:opacity-50")}>
              Sign out of all others
            </button>
          }
        />
        {devices.map((device) => (
          <div key={device.id} className={SETTINGS_ROW}>
            <RowText title={device.name} note={device.detail} />
            {device.current ? (
              <span className="shrink-0 whitespace-nowrap rounded-full bg-[#dcfce7] px-2.5 py-[3px] text-[11px] font-medium leading-4 text-[#16a34a]">This device</span>
            ) : (
              <button type="button" onClick={() => signOut(device.id)} className={OUTLINE_BUTTON}>
                Sign out
              </button>
            )}
          </div>
        ))}
      </section>

      <section className={SETTINGS_CARD}>
        <SectionHeading title="Security alerts & recovery" />
        <div className={SETTINGS_ROW}>
          <RowText title="Email me about new sign-ins" note="madelineprice@gmail.com" />
          <Switch
            checked={signInEmails}
            label="Email me about new sign-ins"
            onToggle={() => {
              setSignInEmails(!signInEmails);
              showSuccessToast(`Sign-in emails turned ${signInEmails ? "off" : "on"}`);
            }}
          />
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Recovery phone" note="024 *** 8595" />
          <button type="button" onClick={comingSoon("Change recovery phone")} className={OUTLINE_BUTTON}>
            Change
          </button>
        </div>
        <div className={SETTINGS_ROW}>
          <RowText title="Backup codes" note="Use these if you lose your phone. 8 of 10 left." />
          <button type="button" onClick={comingSoon("Backup codes")} className={OUTLINE_BUTTON}>
            View codes
          </button>
        </div>
      </section>

      <section className={cn(SETTINGS_CARD, "gap-3")}>
        <SectionHeading title="Delete account" note="Your listings, messages and saved items are removed. Payment and tax records are kept as the law requires." />
        <button type="button" onClick={comingSoon("Delete account")} className={cn(DANGER_BUTTON, "w-fit")}>
          Delete my account
        </button>
      </section>
    </div>
  );
}
