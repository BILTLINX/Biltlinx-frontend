"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { showErrorToast, showSuccessToast } from "@/components/shared/AppToast";
import { AuthScreenLayout } from "@/components/shared/AuthScreenLayout";
import { HangTightCard } from "@/components/shared/HangTightCard";
import { SocialAuthButton } from "@/components/shared/SocialAuthButton";
import { TermsAgreement } from "@/components/shared/TermsAgreement";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useHangTight } from "@/hooks/useHangTight";
import { ApiError } from "@/lib/api";
import { register } from "@/lib/auth-api";
import { validateFullName, validateIdentifier, validatePassword } from "@/lib/validation";

const TERMS_ERROR = "You must confirm your age and agree to the terms to continue";

const PROVIDERS = [
  { id: "google", label: "Sign Up with Google", iconSrc: "/brand/google-icon.svg", invertOnDark: false },
  { id: "apple", label: "Sign Up with Apple", iconSrc: "/brand/apple-icon.svg", invertOnDark: true },
] as const;

const MOBILE_FIELDS = ["fullName", "email", "phone", "password", "terms"] as const;
type MobileField = (typeof MOBILE_FIELDS)[number];

const STEP_ONE_TAGLINE = { highlight: "One account .", rest: "Every part of the built environment ." };
const STEP_ONE_FOOTER =
  "You start as a Seeker. Add landlord, Professional, Artisan, Developer or Business capabilities anytime from your profile.";
const STEP_TWO_TAGLINE = { highlight: "Join", rest: "the Built Environment" };

function handleStubAuth(provider: string) {
  showSuccessToast(`${provider} sign-up is coming soon`);
}

function SocialButtons() {
  return (
    <div className="flex flex-col gap-3">
      {PROVIDERS.map((provider) => (
        <SocialAuthButton
          key={provider.id}
          label={provider.label}
          iconSrc={provider.iconSrc}
          iconAlt={provider.id}
          invertOnDark={provider.invertOnDark}
          onClick={() => handleStubAuth(provider.label)}
        />
      ))}
    </div>
  );
}

function SignInFooter() {
  return (
    <p className="flex justify-center gap-2.5 text-sm">
      <span className="text-ink dark:text-white">Already have an account ?</span>
      <Link href="/auth" className="font-medium text-brand-900 underline underline-offset-2">
        Sign In
      </Link>
    </p>
  );
}

export default function SignUpPage() {
  const router = useRouter();

  const [step, setStep] = useState<"profile" | "security" | "terms">("profile");
  const [mobileFieldIndex, setMobileFieldIndex] = useState(0);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    terms?: string;
  }>({});
  const { pending, runAsync } = useHangTight();

  function handleContinue(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors = {
      fullName: validateFullName(fullName),
      email: validateIdentifier(email, "email"),
    };
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    if (nextErrors.fullName || nextErrors.email) return;

    setStep("security");
  }

  async function submitRegistration() {
    try {
      await runAsync(() => register({ username: fullName, primaryContact: phone, email, password }));
    } catch (error) {
      showErrorToast(error instanceof ApiError ? error.message : "Unable to create account");
      return;
    }
    const params = new URLSearchParams({ identifier: email, channel: "email", context: "signup" });
    router.push(`/auth/verify?${params.toString()}`);
  }

  function handleSecurityContinue(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors = {
      phone: validateIdentifier(phone, "phone"),
      password: validatePassword(password),
    };
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    if (nextErrors.phone || nextErrors.password) return;

    setStep("terms");
  }

  function handleTermsSubmit(event: React.FormEvent) {
    event.preventDefault();

    const termsError = agreedToTerms ? undefined : TERMS_ERROR;
    setErrors((prev) => ({ ...prev, terms: termsError }));
    if (termsError) return;

    void submitRegistration();
  }

  const mobileField: MobileField = MOBILE_FIELDS[mobileFieldIndex];
  const isMobileLastField = mobileFieldIndex === MOBILE_FIELDS.length - 1;

  function handleMobileBack() {
    if (mobileFieldIndex === 0) return;
    setMobileFieldIndex((index) => index - 1);
  }

  function handleMobileContinue(event: React.FormEvent) {
    event.preventDefault();

    let fieldError: string | undefined;
    if (mobileField === "fullName") fieldError = validateFullName(fullName);
    else if (mobileField === "email") fieldError = validateIdentifier(email, "email");
    else if (mobileField === "phone") fieldError = validateIdentifier(phone, "phone");
    else if (mobileField === "password") fieldError = validatePassword(password);

    const termsError = mobileField === "terms" && !agreedToTerms ? TERMS_ERROR : undefined;

    setErrors((prev) => ({ ...prev, [mobileField]: fieldError, terms: termsError }));
    if (fieldError || termsError) return;

    if (isMobileLastField) {
      void submitRegistration();
      return;
    }
    setMobileFieldIndex((index) => index + 1);
  }

  if (pending) {
    return (
      <AuthScreenLayout tagline={STEP_TWO_TAGLINE}>
        <div className="flex justify-center">
          <HangTightCard
            heading="Creating your account!"
            body="We are setting things up for you!"
            footer="This won't take long..."
          />
        </div>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      tagline={step === "security" ? STEP_TWO_TAGLINE : STEP_ONE_TAGLINE}
      footerText={step === "security" ? undefined : STEP_ONE_FOOTER}
    >
      {/* Mobile: one field per step, per the Figma mobile sign-up flow. */}
      <div className="flex flex-col gap-8 lg:hidden">
        {mobileField !== "terms" && (
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-[32px] font-bold leading-10 tracking-[-0.96px] text-black dark:text-white">
              Create your account
            </h1>
            <p className="text-sm leading-5 text-black dark:text-white">
              Takes under a minute. No role commitment requirement.
            </p>
          </div>
        )}

        <form onSubmit={handleMobileContinue} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {mobileField === "fullName" && (
              <Input
                id="mobile-full-name"
                label="Full Name"
                placeholder="Username"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
              />
            )}
            {mobileField === "email" && (
              <Input
                id="mobile-email"
                label="Email Address"
                type="email"
                placeholder="Useraccount@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
            )}
            {mobileField === "phone" && (
              <Input
                id="mobile-phone-number"
                label="Phone Number"
                type="tel"
                placeholder="0208 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
              />
            )}
            {mobileField === "password" && (
              <div className="flex flex-col gap-1">
                <PasswordInput
                  id="mobile-password"
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />
                {!errors.password && (
                  <p className="text-xs text-muted-400 dark:text-muted-300">
                    Use 8 or more characters with a mix of letters and numbers
                  </p>
                )}
              </div>
            )}
            {mobileField === "terms" && (
              <TermsAgreement
                id="mobile-agree-terms"
                checked={agreedToTerms}
                onChange={setAgreedToTerms}
                error={errors.terms}
              />
            )}
          </div>

          <div className="flex gap-2.5">
            <Button
              type="button"
              variant={mobileFieldIndex === 0 ? "secondary" : "primary"}
              className="flex-1"
              disabled={mobileFieldIndex === 0}
              onClick={handleMobileBack}
            >
              Back
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {isMobileLastField ? "Create an Account" : "Continue"}
            </Button>
          </div>

          <Divider label="or" />

          <SocialButtons />

          <Divider />

          <SignInFooter />
        </form>
      </div>

      {/* Desktop: three steps (profile, then security, then a dedicated terms step). */}
      {step === "profile" ? (
        <div className="hidden lg:flex lg:flex-col lg:gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-[36px] font-bold leading-[40px] tracking-[-1.08px] text-black dark:text-white">
              Create your account
            </h1>
            <p className="text-sm leading-5 text-black dark:text-white">
              Takes under a minute. No role commitment requirement.
            </p>
          </div>

          <form onSubmit={handleContinue} className="flex flex-col gap-4">
            <SocialButtons />

            <Divider label="or" />

            <div className="flex flex-col gap-3">
              <Input
                id="full-name"
                label="Full Name"
                placeholder="Username"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
              />
              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="Useraccount@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
            </div>

            <div className="flex gap-2.5">
              <Button type="button" variant="secondary" className="flex-1" disabled>
                Back
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                Continue
              </Button>
            </div>

            <SignInFooter />
          </form>
        </div>
      ) : step === "security" ? (
        <div className="hidden lg:flex lg:flex-col lg:gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-[36px] font-bold leading-[40px] tracking-[-1.08px] text-black dark:text-white">
              Secure your account
            </h1>
            <p className="text-sm leading-5 text-black dark:text-white">
              Add a phone number and password to finish up.
            </p>
          </div>

          <form onSubmit={handleSecurityContinue} className="flex flex-col gap-4">
            <SocialButtons />

            <Divider label="or" />

            <div className="flex flex-col gap-3">
              <Input
                id="phone-number"
                label="Phone Number"
                type="tel"
                placeholder="0208 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
              />
              <div className="flex flex-col gap-1">
                <PasswordInput
                  id="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />
                {!errors.password && (
                  <p className="text-xs text-muted-400 dark:text-muted-300">
                    Use 8 or more characters with a mix of letters and numbers
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2.5">
              <Button
                type="button"
                variant="primary"
                className="flex-1"
                onClick={() => setStep("profile")}
              >
                Back
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                Continue
              </Button>
            </div>

            <SignInFooter />
          </form>
        </div>
      ) : (
        <div className="hidden lg:flex lg:flex-col lg:gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-[36px] font-bold leading-[40px] tracking-[-1.08px] text-black dark:text-white">
              Create your account
            </h1>
            <p className="text-sm leading-5 text-black dark:text-white">
              Takes under a minute. No role commitment requirement.
            </p>
          </div>

          <form onSubmit={handleTermsSubmit} className="flex flex-col gap-4">
            <SocialButtons />

            <Divider label="or" />

            <TermsAgreement
              id="agree-terms"
              checked={agreedToTerms}
              onChange={setAgreedToTerms}
              error={errors.terms}
            />

            <div className="flex gap-2.5">
              <Button
                type="button"
                variant="primary"
                className="flex-1"
                onClick={() => setStep("security")}
              >
                Back
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                Continue
              </Button>
            </div>

            <SignInFooter />
          </form>
        </div>
      )}
    </AuthScreenLayout>
  );
}
