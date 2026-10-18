import type { Metadata } from "next";
import { Inter, Lexend, Onest, Plus_Jakarta_Sans, Rubik } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { CompareProvider } from "@/context/CompareContext";
import { OrganizationProvider } from "@/context/OrganizationContext";
import { PostsProvider } from "@/context/PostsContext";
import { SessionProvider } from "@/context/SessionContext";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

// Marketplace card typography (price / detail lines / verification badge / tag).
const inter = Inter({ variable: "--font-inter-face", subsets: ["latin"] });
const lexend = Lexend({ variable: "--font-lexend-face", subsets: ["latin"], weight: "600" });
const onest = Onest({ variable: "--font-onest-face", subsets: ["latin"], weight: "400" });
const rubik = Rubik({ variable: "--font-rubik-face", subsets: ["latin"], weight: ["300", "400"] });

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
