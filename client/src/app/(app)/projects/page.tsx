import { redirect } from "next/navigation";
import { comingSoonHref } from "@/lib/coming-soon";

export default function Page() {
  redirect(comingSoonHref("Projects"));
}
