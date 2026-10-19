"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/components/shared/AppToast";
import { AuthScreenLayout } from "@/components/shared/AuthScreenLayout";
import { HangTightCard } from "@/components/shared/HangTightCard";
import { OtpInput } from "@/components/shared/OtpInput";
import { Button } from "@/components/ui/Button";
import { useHangTight } from "@/hooks/useHangTight";
import { useResendCountdown } from "@/hooks/useResendCountdown";
import { ApiError } from "@/lib/api";
import { resendOtp, verifyOtp } from "@/lib/auth-api";
import { isCompleteOtp } from "@/lib/validation";
import { cn } from "@/lib/utils";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get("identifier") || "Useraccount@gmail.com";
  const channel = searchParams.get("channel") === "phone" ? "phone" : "email";
  const isSignup = searchParams.get("context") === "signup";

  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [otpError, setOtpError] = useState(false);
  const { pending, runAsync } = useHangTight();
  const { secondsLeft, canResend, restart } = useResendCountdown();

  async function handleResend() {
    if (!canResend) return;
    try {
      await resendOtp({ email: identifier });
      showSuccessToast("OTP resent");
      restart();
    } catch (error) {
      showErrorToast(error instanceof ApiError ? error.message : "Unable to resend OTP");
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const incomplete = !isCompleteOtp(otp);
    setOtpError(incomplete);
    if (incomplete) return;

    try {
      await runAsync(() => verifyOtp({ email: identifier, otp: otp.join("") }));
      showSuccessToast(isSignup ? "Account verified! Sign in to continue" : "Account verified!");
      router.push(isSignup ? "/auth/sign-in?method=email&next=onboarding" : "/auth/sign-in?method=email");
    } catch (error) {
      showErrorToast(error instanceof ApiError ? error.message : "Unable to verify code");
    }
  }

  if (pending) {
    return (
      <div className="flex justify-center">
        <HangTightCard />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-[36px] font-bold leading-[40px] tracking-[-1.08px] text-black dark:text-white">
          Enter OTP
        </h1>
        <p className="text-sm leading-5 text-[#111826] dark:text-white">
          We have shared a code to your registered {channel === "phone" ? "phone number" : "email"}
          {" "}
          <span className="font-semibold tracking-[-0.54px]">{identifier}.</span>{" "}
          {channel === "phone" ? "Check your messages" : "Check your inbox"} to verify your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <OtpInput
            value={otp}
            onChange={(next) => {
              setOtp(next);
              if (otpError) setOtpError(false);
            }}
            error={otpError}
          />
          {otpError && <p className="text-xs text-[#e73d1c]">Enter the full 4-digit code</p>}
        </div>

        <Button type="submit" variant="primary">
          Verify
        </Button>

        <p className="text-center text-base text-helper">
          Didn&rsquo;t receive code?{" "}
          <button
            type="button"
            disabled={!canResend}
            className={cn(
              "font-semibold",
              canResend ? "text-brand-900" : "cursor-not-allowed text-muted-400",
            )}
            onClick={handleResend}
          >
            {canResend ? "Resend OTP" : `Resend OTP in ${secondsLeft}s`}
          </button>
        </p>
      </form>
    </>
  );
}

export default function VerifyPage() {
  return (
    <AuthScreenLayout tagline={{ highlight: "Confirming", rest: "the Built Environment" }}>
      <Suspense fallback={null}>
        <VerifyContent />
      </Suspense>
    </AuthScreenLayout>
  );
}
