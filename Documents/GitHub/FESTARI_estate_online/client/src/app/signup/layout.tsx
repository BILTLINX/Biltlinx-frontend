import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Festari Estate",
  description: "Create a Festari Estate account.",
};

export default function SignupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-4xl">{children}</div>
    </div>
  );
}
