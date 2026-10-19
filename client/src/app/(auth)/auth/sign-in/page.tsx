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
import { ApiError } from "@/lib/api";
import { login } from "@/lib/auth-api";
import { isNonEmpty, validateIdentifier } from "@/lib/validation";

const TAGLINE = { highlight: "Welcome Back to", rest: "the Built Environment" };

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const method = searchParams.get("method") === "email" ? "email" : "phone";
  const destination = searchParams.get("next") === "onboarding" ? "/onboarding" : "/home";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const { pending, runAsync } = useHangTight();

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
      await runAsync(() =>
        login(
          method === "email"
            ? { email: identifier, password, rememberMe }
            : { phone: identifier, password, rememberMe },
        ),
      );
      showSuccessToast("Signed in! Welcome back to Biltlinx");
      router.push(destination);
    } catch (error) {
      showErrorToast(error instanceof ApiError ? error.message : "Unable to sign in");
    }
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
