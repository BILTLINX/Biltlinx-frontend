import { useCallback, useLayoutEffect, useRef, useState } from "react";

export function useIsClamped<T extends HTMLElement>(expanded: boolean, content: unknown) {
  const ref = useRef<T>(null);
  const [clamped, setClamped] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el || expanded) return;
    setClamped(el.scrollHeight > el.clientHeight + 1);
  }, [expanded]);

  useLayoutEffect(() => {
    measure();
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, content]);

  return { ref, clamped };
}
