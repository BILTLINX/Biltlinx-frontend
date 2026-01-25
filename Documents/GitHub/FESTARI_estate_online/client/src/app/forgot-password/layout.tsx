import type { Metadata } from "next";
import Navbar from "@/components/navbar/layout";

export const metadata: Metadata = {
  title: "Forgot Password | Festari Estate",
  description: "Reset your Festari Estate account password.",
};

export default function ForgotPasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex items-center justify-center p-8 min-h-screen">
      <div className="w-full h-full bg-linear-to-br from-[#BE4D00] to-[#1E3240] shadow-sm rounded-lg">
        <Navbar />
        <div className="p-8 px-32 flex items-center justify-center min-h-[calc(100vh-200px)]">{children}</div>
      </div>
    </div>
  );
}
