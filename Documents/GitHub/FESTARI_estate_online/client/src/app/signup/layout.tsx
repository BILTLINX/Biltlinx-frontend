import type { Metadata } from "next";
import Navbar from "@/components/navbar/layout";

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
    <div className="flex items-center justify-center p-8">
      <div className="w-full h-full bg-linear-to-br from-[#BE4D00] to-[#1E3240] shadow-sm rounded-lg">
        <Navbar />
        <div className="p-8 px-32 w-full max-w-4xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
