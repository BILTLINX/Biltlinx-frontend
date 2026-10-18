import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { CompareProvider } from "@/context/CompareContext";
import { OrganizationProvider } from "@/context/OrganizationContext";
import { PostsProvider } from "@/context/PostsContext";
import { SessionProvider } from "@/context/SessionContext";
import "./globals.css";

const plusJakartaSans = localFont({
  src: "./fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  variable: "--font-plus-jakarta-sans",
  weight: "200 800",
  display: "swap",
});

// Marketplace card typography (price / detail lines / verification badge / tag).
const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter-face",
  weight: "100 900",
  display: "swap",
});
const lexend = localFont({
  src: "./fonts/lexend-latin-600-normal.woff2",
  variable: "--font-lexend-face",
  weight: "600",
  display: "swap",
});
const onest = localFont({
  src: "./fonts/onest-latin-400-normal.woff2",
  variable: "--font-onest-face",
  weight: "400",
  display: "swap",
});
const rubik = localFont({
  src: [
    { path: "./fonts/rubik-latin-300-normal.woff2", weight: "300" },
    { path: "./fonts/rubik-latin-400-normal.woff2", weight: "400" },
  ],
  variable: "--font-rubik-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Biltlinx",
  description: "Connecting the Built Environment",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${lexend.variable} ${onest.variable} ${rubik.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <OrganizationProvider>
            <SessionProvider>
              <PostsProvider>
                <CompareProvider>{children}</CompareProvider>
              </PostsProvider>
            </SessionProvider>
          </OrganizationProvider>
        </QueryProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  );
}
