import { useEffect, useState } from 'react';

/**
 * Ticks a fake "live" response-time number, same jitter logic as the
 * `#liveMetric` setInterval block in main.js.
 *
 * Usage:
 *   const liveMetric = useLiveMetric(); // "142ms"
 *   <span>{liveMetric}</span>
 */
export function useLiveMetric(initial = 142, intervalMs = 1800) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const id = setInterval(() => {
      setValue((prev) => {
        const next = prev + (Math.random() - 0.5) * 6;
        return Math.max(120, Math.min(165, next));
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return `${value.toFixed(0)}ms`;
}
