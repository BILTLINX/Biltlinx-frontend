import type { Metadata } from "next";
import Navbar from "@/components/navbar/layout";

export const metadata: Metadata = {
  title: "Login | Festari Estate",
  description: "Login to your Festari Estate account.",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-full h-full bg-linear-to-br from-[#BE4D00] to-[#1E3240] shadow-sm rounded-lg">
        <Navbar />
        <div className="p-8 px-32">{children}</div>
      </div>
    </div>
  );
}
