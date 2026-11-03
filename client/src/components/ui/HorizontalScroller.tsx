"use client";

import { useCallback, useEffect, useRef, useState, type HTMLAttributes, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

const FADE = 28;
const DRAG_THRESHOLD = 4;

export function HorizontalScroller({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const left = el.scrollLeft > 1;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setEdges((current) => (current.left === left && current.right === right ? current : { left, right }));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    const onWheel = (event: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      el.scrollLeft += event.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer.disconnect();
      el.removeEventListener("wheel", onWheel);
    };
  }, [measure]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const selected = el.querySelector<HTMLElement>('[aria-selected="true"], [aria-current="true"]');
    if (!selected) return;
    const left = selected.offsetLeft - FADE;
    const right = selected.offsetLeft + selected.offsetWidth + FADE;
    if (left < el.scrollLeft) el.scrollTo({ left, behavior: "smooth" });
    else if (right > el.scrollLeft + el.clientWidth) el.scrollTo({ left: right - el.clientWidth, behavior: "smooth" });
  });

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0 || !ref.current) return;
    drag.current = { active: true, startX: event.clientX, startLeft: ref.current.scrollLeft, moved: false };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state.active || !ref.current) return;
    const delta = event.clientX - state.startX;
    if (!state.moved && Math.abs(delta) < DRAG_THRESHOLD) return;
    state.moved = true;
    ref.current.scrollLeft = state.startLeft - delta;
  }

  function endDrag() {
    drag.current.active = false;
  }

  const mask = `linear-gradient(to right, ${edges.left ? "transparent" : "black"} 0, black ${FADE}px, black calc(100% - ${FADE}px), ${edges.right ? "transparent" : "black"} 100%)`;

  return (
    <div
      ref={ref}
      onScroll={measure}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onClickCapture={(event) => {
        if (drag.current.moved) {
          event.preventDefault();
          event.stopPropagation();
          drag.current.moved = false;
        }
      }}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      className={cn("no-scrollbar flex overflow-x-auto overscroll-x-contain", className)}
      {...props}
    >
      {children}
    </div>
  );
}
