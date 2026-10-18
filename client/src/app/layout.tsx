import type { Metadata } from "next";
import { Inter, Lexend, Onest, Plus_Jakarta_Sans, Rubik } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { CompareProvider } from "@/context/CompareContext";
import { PostsProvider } from "@/context/PostsContext";
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
        <PostsProvider>
          <CompareProvider>{children}</CompareProvider>
        </PostsProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  );
}
