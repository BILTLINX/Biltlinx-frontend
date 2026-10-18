"use client";

import { useRef, useState } from "react";

export interface LikeParticle {
  id: number;
  x: number;
  rotate: number;
  scale: number;
  delay: number;
}

const PARTICLES_PER_LIKE = 7;

/** Like state plus a TikTok/Instagram-style shower of hearts. Liking (not
 * unliking) spawns staggered particles that each remove themselves through
 * `removeParticle` once their animation completes, so there's no shared timer
 * to leak or race against fast repeat taps. Particles are skipped entirely
 * under reduced motion. */
export function useLikeBurst(prefersReducedMotion: boolean, options: { initialLiked?: boolean; onChange?: (liked: boolean) => void } = {}) {
  const [liked, setLiked] = useState(options.initialLiked ?? false);
  const [particles, setParticles] = useState<LikeParticle[]>([]);
  const nextId = useRef(0);

  // Derived from the `liked` closure — not from inside a `setLiked` updater —
  // so the particle side effect can't run twice under React Strict Mode.
  function toggleLike() {
    const next = !liked;
    setLiked(next);
    options.onChange?.(next);
    if (!next || prefersReducedMotion) return;
    const batch: LikeParticle[] = Array.from({ length: PARTICLES_PER_LIKE }, () => {
      nextId.current += 1;
      return {
        id: nextId.current,
        x: Math.random() * 120 - 60,
        rotate: Math.random() * 50 - 25,
        scale: 0.75 + Math.random() * 0.55,
        delay: Math.random() * 0.5,
      };
    });
    setParticles((current) => [...current, ...batch]);
  }

  function removeParticle(id: number) {
    setParticles((current) => current.filter((particle) => particle.id !== id));
  }

  return { liked, setLiked, particles, toggleLike, removeParticle };
}
