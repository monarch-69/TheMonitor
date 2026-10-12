import { useEffect, useRef } from 'react';
import { Chart, type ChartConfiguration } from 'chart.js/auto';

/**
 * Creates (and tears down) a Chart.js instance bound to a <canvas>.
 * Replaces every `new Chart(el, {...})` block in main.js with one
 * reusable hook — call it once per chart component.
 *
 * Chart.js instances are NOT React state — they own the canvas
 * imperatively — so this intentionally lives outside React's render
 * cycle, same as the parallax/reveal hooks. React's job is just to
 * mount the <canvas>; Chart.js's job is everything drawn on it.
 *
 * Usage:
 *   const canvasRef = useChart(() => mainChartConfig);
 *   <canvas ref={canvasRef} />
 *
 * Pass a factory function (not the config object directly) so a fresh
 * config — with fresh gradient callbacks bound to the right canvas
 * context — is created on every mount.
 */
export function useChart<T extends HTMLCanvasElement = HTMLCanvasElement>(
  configFactory: () => ChartConfiguration
) {
  const canvasRef = useRef<T | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    chartRef.current = new Chart(canvas, configFactory());

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return canvasRef;
}
