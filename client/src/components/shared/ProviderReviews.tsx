"use client";

import Image from "next/image";
import { useState } from "react";

export interface ProviderReview {
  id: string;
  author: string;
  avatar?: string | null;
  /** 1 to 5. */
  rating: number;
  /** Already formatted, e.g. "Oct 2026". */
  date: string;
  /** What the client hired them for, e.g. "Permit pack". */
  context?: string;
  text: string;
}

const SHOWN = 2;
const STARS = [1, 2, 3, 4, 5];

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span aria-label={`${rating} out of 5`} className={`tracking-[1px] text-[#b45309] ${className ?? ""}`}>
      {"★".repeat(Math.round(rating))}
    </span>
  );
}

/**
 * A provider's reviews (Figma node 1563:53436): the average and how the ratings are spread, then the latest reviews.
 * `verifiedLabel` is what each review is verified as: a client for a professional, a job for an artisan.
 */
export function ProviderReviews({ reviews, verifiedLabel = "Verified client" }: { reviews: ProviderReview[]; verifiedLabel?: string }) {
  const [all, setAll] = useState(false);

  if (reviews.length === 0) return <p className="py-6 text-center text-sm text-gray-500">No reviews yet.</p>;

  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const share = (stars: number) => Math.round((reviews.filter((review) => review.rating === stars).length / reviews.length) * 100);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-6 border-b border-gray-200 pb-4">
        <div className="flex flex-col items-start gap-0.5">
          <p className="text-[34px] font-bold leading-10 text-[#0f172a]">{average.toFixed(1)}</p>
          <Stars rating={average} className="text-sm" />
          <p className="text-[13px] text-gray-500">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {[...STARS].reverse().map((stars) => (
            <div key={stars} className="flex items-center gap-3 text-xs text-gray-500">
              <span className="w-2 text-right">{stars}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f1f5f9]">
                <span className="block h-full rounded-full bg-brand-900" style={{ width: `${share(stars)}%` }} />
              </span>
              <span className="w-9 text-right">{share(stars)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        {(all ? reviews : reviews.slice(0, SHOWN)).map((review) => (
          <article key={review.id} className="flex gap-3 border-b border-gray-200 py-3.5 last:border-b-0">
            <span className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-[#eef2ff]">
              <Image src={review.avatar ?? "/icons/avatar-placeholder-user.svg"} alt="" fill className="object-cover" sizes="40px" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#0f172a]">{review.author}</p>
                <Stars rating={review.rating} className="text-xs" />
                <span className="ml-auto shrink-0 text-xs text-gray-500">{review.date}</span>
              </div>
              <p className="text-[13px] font-medium text-[#166534]">{verifiedLabel}{review.context ? ` · ${review.context}` : ""}</p>
              <p className="text-sm leading-5 text-[#334155]">{review.text}</p>
            </div>
          </article>
        ))}
      </div>

      {reviews.length > SHOWN && (
        <button type="button" onClick={() => setAll((current) => !current)} className="self-start text-[13px] font-medium text-brand-900">
          {all ? "Show fewer" : `See all ${reviews.length} reviews ›`}
        </button>
      )}
    </div>
  );
}
