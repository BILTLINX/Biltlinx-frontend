import type { Metadata } from "next";
import SidebarLayout from "@/components/sidebar/layout";

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
    <div className="flex bg-gray-50 min-h-screen">
      <SidebarLayout />
      <main className="flex-1 ml-64 flex items-center justify-center p-6">
        <div className="w-full  p-8 bg-white shadow-sm rounded-lg">
          {children}
        </div>
      </main>
    </div>
  );
}
