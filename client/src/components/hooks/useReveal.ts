import { useEffect, useRef } from 'react';

/**
 * Attach to any element that should fade/slide in on scroll.
 * Replaces the old document.querySelectorAll('.reveal') + IntersectionObserver
 * loop in main.js. Works for both `.reveal` and `.reveal-stagger` — the
 * stagger delay is still handled by your existing CSS `nth-child` rules,
 * since this hook only toggles the `in` class on the element itself.
 *
 * Usage:
 *   const ref = useReveal<HTMLDivElement>();
 *   <div ref={ref} className="reveal-stagger">...</div>
 */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      el.classList.add('in');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return ref;
}
