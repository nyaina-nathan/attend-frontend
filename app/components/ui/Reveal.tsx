"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll-entry animation: elements fade + lift into view as they enter the
 * viewport. Uses IntersectionObserver (never scroll listeners) and animates
 * only transform/opacity/filter for GPU-safe motion.
 *
 * State is applied directly to the DOM node rather than through React state,
 * which keeps the effect free of synchronous re-renders.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
      el.style.filter = "blur(0)";
    };

    if (typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show();
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: 0,
        transform: "translateY(2rem)",
        filter: "blur(6px)",
      }}
      className={`transition-all duration-700 ease-brutal will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
