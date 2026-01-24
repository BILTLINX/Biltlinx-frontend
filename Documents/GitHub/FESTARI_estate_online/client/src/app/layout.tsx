import type { Metadata } from "next";
import Footer from "@/components/footer/layout";
import SidebarLayout from "@/components/sidebar/layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Festari Estate",
  description: "Festari Estate Online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <SidebarLayout />
        <div className="min-h-screen ml-64 flex flex-col">
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
