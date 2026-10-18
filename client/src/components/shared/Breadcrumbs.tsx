import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

/** The trail at the top of a detail page; the last crumb is the current page. */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-[19px] text-gray-500">
      {crumbs.map((crumb, index) => (
        <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden>/</span>}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-brand-900">
              {crumb.label}
            </Link>
          ) : (
            <span className={index === crumbs.length - 1 ? "text-[#334155]" : undefined}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
