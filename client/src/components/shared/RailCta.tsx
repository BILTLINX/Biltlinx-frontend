"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface RailCtaProps {
  title: string;
  body: string;
  label: string;
  /** Where the action goes, or `onClick` for one that opens something on the page. */
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline";
}

/** A right-rail card with one action, used for each page's "list / create / join" call to action. */
export function RailCta({ title, body, label, href, onClick, variant = "primary" }: RailCtaProps) {
  const router = useRouter();

  return (
    <section className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-4">
      <h2 className="text-sm font-bold leading-5 text-[#0f172a]">{title}</h2>
      <p className="text-xs leading-[17px] text-gray-500">{body}</p>
      <Button variant={variant} onClick={onClick ?? (() => href && router.push(href))} className="rounded-[10px] lg:rounded-[10px]">
        {label}
      </Button>
    </section>
  );
}
