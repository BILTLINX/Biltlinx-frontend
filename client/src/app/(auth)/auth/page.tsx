"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthScreenLayout } from "@/components/shared/AuthScreenLayout";
import { GoogleAuthButton } from "@/components/shared/GoogleAuthButton";
import { SocialAuthButton } from "@/components/shared/SocialAuthButton";
import { Divider } from "@/components/ui/Divider";

const CONTACT_PROVIDERS = [
  {
    id: "email",
    label: "Continue with  Email",
    iconSrc: "/brand/mail-icon.svg",
    method: "email",
    invertOnDark: true,
  },
  {
    id: "phone",
    label: "Continue with Phone",
    iconSrc: "/brand/phone-icon.svg",
    method: "phone",
    invertOnDark: true,
  },
] as const;

export default function AuthPage() {
  const router = useRouter();

  return (
    <AuthScreenLayout>
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-[36px] font-bold leading-[40px] tracking-[-1.08px] text-black dark:text-white">
          Welcome!
        </h1>
        <p className="text-sm leading-5 text-black dark:text-white">get into your account</p>
      </div>

      <div className="flex flex-col gap-3">
        <GoogleAuthButton label="Continue with Google" />

        <Divider label="or" />

        {CONTACT_PROVIDERS.map((provider) => (
          <SocialAuthButton
            key={provider.id}
            label={provider.label}
            iconSrc={provider.iconSrc}
            iconAlt={provider.id}
            invertOnDark={provider.invertOnDark}
            onClick={() => router.push(`/auth/sign-in?method=${provider.method}`)}
          />
        ))}

        <Divider />

        <p className="flex justify-center gap-2.5 text-sm">
          <span className="text-ink dark:text-white">Don&rsquo;t have an account ?</span>
          <Link
            href="/auth/sign-up"
            className="font-medium text-brand-900 underline underline-offset-2"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthScreenLayout>
  );
}
