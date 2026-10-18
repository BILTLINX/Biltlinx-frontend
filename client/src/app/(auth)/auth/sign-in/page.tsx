"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/components/shared/AppToast";
import { AuthScreenLayout } from "@/components/shared/AuthScreenLayout";
import { HangTightCard } from "@/components/shared/HangTightCard";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useHangTight } from "@/hooks/useHangTight";
import { useSession } from "@/context/SessionContext";
import { ApiError, safeNextPath } from "@/lib/api";
import { completeMfaLogin, login, sendMfaOtp } from "@/lib/auth-api";
import type { MfaChallenge, MfaMethod } from "@/types/api/auth";
import { isNonEmpty, validateIdentifier } from "@/lib/validation";

const TAGLINE = { highlight: "Welcome Back to", rest: "the Built Environment" };

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const method = searchParams.get("method") === "email" ? "email" : "phone";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [challenge, setChallenge] = useState<MfaChallenge | null>(null);
  const [mfaMethod, setMfaMethod] = useState<MfaMethod>("totp");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | undefined>();
  const [otpSent, setOtpSent] = useState(false);
  const { pending, runAsync } = useHangTight();
  const { refresh } = useSession();
  const nextPath = safeNextPath(searchParams.get("next")) ?? "/home";

  async function finishSignIn() {
    await refresh();
    showSuccessToast("Signed in! Welcome back to Biltlinx");
    router.replace(nextPath);
  }

  function useOtherMethod() {
    router.push("/auth");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors = {
      identifier: validateIdentifier(identifier, method),
      password: isNonEmpty(password) ? undefined : "Enter your password",
    };
    setErrors(nextErrors);
    if (nextErrors.identifier || nextErrors.password) return;

    try {
      const result = await runAsync(() =>
        login(
          method === "email"
            ? { email: identifier, password, rememberMe }
            : { phone: identifier, password, rememberMe },
        ),
      );
      if (result.mfaRequired) {
        setChallenge(result);
        setMfaMethod(result.methods.includes("totp") ? "totp" : result.methods[0]);
        return;
      }
      await finishSignIn();
    } catch (error) {
      showErrorToast(error instanceof ApiError ? error.message : "Unable to sign in");
    }
  }

  async function handleMfaSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!challenge) return;
    if (!isNonEmpty(code)) {
      setCodeError("Enter your code");
      return;
    }
    setCodeError(undefined);
    try {
      await runAsync(() => completeMfaLogin({ challengeToken: challenge.challengeToken, code: code.trim(), method: mfaMethod }));
      await finishSignIn();
    } catch (error) {
      setCodeError(error instanceof ApiError ? error.message : "That code didn't work");
    }
  }

  async function handleSendOtp() {
    if (!challenge) return;
    try {
      await sendMfaOtp({ challengeToken: challenge.challengeToken, channel: method === "email" ? "email" : "sms" });
      setMfaMethod("otp");
      setOtpSent(true);
      setCode("");
      showSuccessToast(`We sent a code to your ${method === "email" ? "email" : "phone"}`);
    } catch (error) {
      showErrorToast(error instanceof ApiError ? error.message : "Unable to send a code");
    }
  }

  function chooseMethod(next: MfaMethod) {
    setMfaMethod(next);
    setCode("");
    setCodeError(undefined);
  }

  if (pending) {
    return (
      <div className="flex justify-center">
        <HangTightCard
          heading="Signing you in!"
          body="We are verifying your details for you!"
          footer="You'll be allowed in soon..."
        />
      </div>
    );
  }

  if (challenge) {
    const prompt =
      mfaMethod === "recovery"
        ? "Enter one of your recovery codes"
        : mfaMethod === "otp"
          ? "Enter the code we sent you"
          : "Enter the code from your authenticator app";
    return (
      <>
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-[36px] font-bold leading-[40px] tracking-[-1.08px] text-black dark:text-white">
            Two-step check
          </h1>
          <p className="text-sm leading-5 text-black dark:text-white">{prompt}</p>
        </div>
        <form onSubmit={handleMfaSubmit} className="flex flex-col gap-6">
          <Input
            id="mfa-code"
            label={mfaMethod === "recovery" ? "Recovery code" : "Code"}
            inputMode={mfaMethod === "recovery" ? "text" : "numeric"}
            autoComplete="one-time-code"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={codeError}
          />
          <Button type="submit" variant="primary">
            Verify and sign in
          </Button>
          <div className="flex flex-col items-center gap-2 text-xs font-medium text-brand-900">
            {mfaMethod !== "totp" && (
              <button type="button" onClick={() => chooseMethod("totp")} className="hover:underline">
                Use my authenticator app
              </button>
            )}
            {mfaMethod !== "otp" && challenge.methods.includes("otp") && (
              <button type="button" onClick={handleSendOtp} className="hover:underline">
                Send me a code instead
              </button>
            )}
            {mfaMethod === "otp" && otpSent && (
              <button type="button" onClick={handleSendOtp} className="hover:underline">
                Send the code again
              </button>
            )}
            {mfaMethod !== "recovery" && challenge.methods.includes("recovery") && (
              <button type="button" onClick={() => chooseMethod("recovery")} className="hover:underline">
                Use a recovery code
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setChallenge(null);
                setCode("");
                setCodeError(undefined);
              }}
              className="text-gray-500 hover:underline"
            >
              Back to sign in
            </button>
          </div>
        </form>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-[36px] font-bold leading-[40px] tracking-[-1.08px] text-black dark:text-white">
          Let&rsquo;s Get In
        </h1>
        <p className="text-sm leading-5 text-black dark:text-white">
          Continue with your {method === "email" ? "email address" : "phone number"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          {method === "email" ? (
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="Useraccount@gmail.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              error={errors.identifier}
            />
          ) : (
            <Input
              id="phone-number"
              label="Phone Number"
              type="tel"
              placeholder="0208 000 000"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              error={errors.identifier}
            />
          )}
          <PasswordInput
            id="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <div className="flex items-center justify-between">
            <Checkbox
              id="remember-me"
              label="Remember me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <Link
              href={`/auth/forgot-password?method=${method}`}
              className="text-xs text-ink hover:underline dark:text-white"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" variant="primary">
          Sign in
        </Button>

        <p className="flex justify-center gap-2.5 text-sm">
          <span className="text-ink dark:text-white">Don&rsquo;t have an account ?</span>
          <Link href="/auth/sign-up" className="font-medium text-brand-900 underline underline-offset-2">
            Sign up
          </Link>
        </p>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={useOtherMethod}
            className="text-xs font-medium text-brand-900 hover:underline"
          >
            Use a different method
          </button>
        </div>
      </form>
    </>
  );
}

export default function SignInPage() {
  return (
    <AuthScreenLayout tagline={TAGLINE}>
      <Suspense fallback={null}>
        <SignInContent />
      </Suspense>
    </AuthScreenLayout>
  );
}
