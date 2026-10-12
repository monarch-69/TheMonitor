import { useEffect, useRef } from 'react';

type ParallaxKind = 'orb' | 'dash' | 'image';

/**
 * Attach to a single element to give it a scroll-driven parallax transform.
 * Replaces the combined orbs/dash/cro-img loop in main.js — call this once
 * per element instead, so each piece only re-renders/updates itself.
 *
 * kind:
 *   'orb'   — simple vertical drift, speed via the `speed` argument
 *             (matches the old `data-speed` attribute, default 0.12)
 *   'dash'  — the dashboard mockup's subtle lift + tilt as it enters view
 *   'image' — the mascot image's zoom/drift (used in .cro-img-wrap img)
 *
 * Usage:
 *   const orbRef = useParallax<HTMLDivElement>('orb', 0.08);
 *   <div ref={orbRef} className="glow-orb hero-orb-1" />
 *
 *   const dashRef = useParallax<HTMLDivElement>('dash');
 *   <div ref={dashRef} className="dash">...</div>
 *
 *   const imgRef = useParallax<HTMLImageElement>('image');
 *   <img ref={imgRef} src="images/mascot.jpg" />
 */
export function useParallax<T extends HTMLElement>(kind: ParallaxKind, speed = 0.12) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let ticking = false;

    const apply = () => {
      const vh = window.innerHeight;

      if (kind === 'orb') {
        el.style.transform = `translate3d(0, ${window.scrollY * speed}px, 0)`;
      }

      if (kind === 'dash') {
        const rect = el.getBoundingClientRect();
        const progress = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);
        const offset = (progress - 0.5) * 26;
        el.style.transform = `translate3d(0, ${-offset}px, 0) rotateX(${(0.5 - progress) * 2}deg)`;
      }

      if (kind === 'image') {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
          const progress = (vh - rect.top) / (vh + rect.height);
          const offset = (progress - 0.5) * 34;
          el.style.transform = `scale(1.08) translate3d(0, ${offset}px, 0)`;
        }
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(apply);
        ticking = true;
      }
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [kind, speed]);

  return ref;
}
