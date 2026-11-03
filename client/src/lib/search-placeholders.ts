/** What the top navigation search says it searches, for the pages that use what is typed there. */
const SEARCH_PLACEHOLDERS: [prefix: string, text: string][] = [
  ["/properties", "Search properties"],
  ["/marketplace", "Search the marketplace"],
  ["/services", "Search services"],
  ["/stay/bookings", "Search this page"],
  ["/stay", "Search stays by place"],
  ["/professionals", "Search professionals"],
  ["/artisans", "Search artisans"],
  ["/projects", "Search projects"],
  ["/communities", "Search communities"],
  ["/request-board", "Search requests"],
  ["/saved", "Search saved items"],
  ["/notifications", "Search notifications"],
  ["/messages", "Search conversations"],
  ["/payments", "Search payments"],
  ["/manage/listings", "Search your listings"],
  ["/manage/properties", "Search your properties"],
  ["/manage/rent", "Search rent"],
  ["/manage/tenancies", "Search tenancies"],
  ["/manage/documents", "Search documents"],
  ["/manage/inspections", "Search inspections"],
  ["/manage/maintenance", "Search maintenance"],
  ["/manage/artisan/jobs", "Search jobs"],
  ["/manage/artisan/quotes", "Search quotes"],
  ["/manage/professional/clients", "Search clients"],
];

export function searchPlaceholder(pathname: string) {
  const match = SEARCH_PLACEHOLDERS.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return match?.[1] ?? "Search this page";
}
