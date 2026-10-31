"use client";

import { useEffect, useRef, useState } from "react";
import { showErrorToast } from "@/components/shared/AppToast";
import { SocialAuthButton } from "@/components/shared/SocialAuthButton";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import { cn } from "@/lib/utils";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_BUTTON_MAX_WIDTH = 400;
const GOOGLE_BUTTON_HEIGHT = 40;

interface GoogleAccounts {
  id: {
    initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
    renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
  };
}

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (window.google?.accounts) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Google script failed to load"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

interface GoogleAuthButtonProps {
  label: string;
}

const ICON = { iconSrc: "/brand/google-icon.svg", iconAlt: "google" } as const;

export function GoogleAuthButton({ label }: GoogleAuthButtonProps) {
  const { pending, signIn } = useGoogleSignIn();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const signInRef = useRef(signIn);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    signInRef.current = signIn;
  }, [signIn]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const overlay = overlayRef.current;
    if (!CLIENT_ID || !wrapper || !overlay) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => {
            if (response.credential) void signInRef.current(response.credential);
            else showErrorToast("Google did not return a credential, please try again");
          },
        });

        const { width, height } = wrapper.getBoundingClientRect();
        const renderWidth = Math.max(Math.min(Math.round(width), GOOGLE_BUTTON_MAX_WIDTH), 200);
        overlay.replaceChildren();
        overlay.style.width = `${renderWidth}px`;
        overlay.style.transformOrigin = "top left";
        overlay.style.transform = `scale(${width / renderWidth || 1}, ${height / GOOGLE_BUTTON_HEIGHT || 1})`;
        window.google.accounts.id.renderButton(overlay, {
          type: "standard",
          size: "large",
          width: renderWidth,
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!CLIENT_ID || failed) {
    const message = CLIENT_ID
      ? "Google sign-in couldn't load. Check your connection or disable content blockers, then refresh."
      : "Google sign-in isn't configured for this environment.";
    return <SocialAuthButton label={label} {...ICON} onClick={() => showErrorToast(message)} />;
  }

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative h-12 w-full overflow-hidden rounded-[20px] lg:rounded-xl",
        "[&:hover>button]:bg-muted-300/40 dark:[&:hover>button]:bg-night-700/60",
        pending && "pointer-events-none opacity-60",
      )}
    >
      <SocialAuthButton label={label} {...ICON} onClick={() => {}} />
      <div
        ref={overlayRef}
        className="absolute left-0 top-0 opacity-[0.01] [&_iframe]:cursor-pointer"
        aria-label={label}
      />
    </div>
  );
}
