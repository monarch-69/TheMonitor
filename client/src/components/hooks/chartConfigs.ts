import type { ChartConfiguration, ScriptableContext } from 'chart.js';

export const COLORS = {
  teal: '#2FC9BA',
  sage: '#A9D6A2',
  amber: '#E68A4F',
  grid: '#232323',
  tick: '#666560',
  tooltipBg: '#1e1e1e',
  tooltipBorder: '#2d2d2d',
  tooltipTitle: '#F1EFE7',
  tooltipBody: '#B8B6AE',
} as const;

const commonGrid = { color: COLORS.grid };
const commonTicks = { color: COLORS.tick, font: { size: 10.5 } };

function tealFade(ctx: ScriptableContext<'line'>) {
  const { chart } = ctx;
  const g = chart.ctx.createLinearGradient(0, 0, 0, chart.height);
  g.addColorStop(0, 'rgba(47,201,186,0.35)');
  g.addColorStop(1, 'rgba(47,201,186,0)');
  return g;
}

const tooltipBase = {
  backgroundColor: COLORS.tooltipBg,
  borderColor: COLORS.tooltipBorder,
  borderWidth: 1,
  titleColor: COLORS.tooltipTitle,
  bodyColor: COLORS.tooltipBody,
  padding: 10,
  cornerRadius: 8,
};

/** Hero mini latency pulse — sparkline, no axes, no tooltip. */
export function heroChartConfig(): ChartConfiguration {
  const data = [42, 44, 41, 45, 43, 47, 52, 49, 44, 42, 40, 43, 46, 50, 55, 53, 48, 44, 41, 39, 42, 45, 43, 44];
  return {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [
        {
          data,
          borderColor: COLORS.teal,
          backgroundColor: tealFade,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1400, easing: 'easeOutQuart' },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
      interaction: { intersect: false },
    },
  };
}

/** Main response-time vs. error-rate line chart, dual y-axis. */
export function mainChartConfig(): ChartConfiguration {
  const labels = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  const responseTime = [118, 124, 109, 131, 142, 138, 151, 146, 133, 127, 121, 116];
  const errorRate = [0.4, 0.3, 0.6, 0.2, 0.9, 0.5, 1.1, 0.7, 0.3, 0.4, 0.2, 0.3];

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Response time (ms)',
          data: responseTime,
          borderColor: COLORS.teal,
          backgroundColor: tealFade,
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: COLORS.teal,
          yAxisID: 'y',
        },
        {
          label: 'Error rate (%)',
          data: errorRate,
          borderColor: COLORS.amber,
          borderDash: [4, 4],
          fill: false,
          tension: 0.4,
          borderWidth: 1.75,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: COLORS.amber,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...tooltipBase,
          titleFont: { family: "'JetBrains Mono', monospace", size: 11 },
          bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
          displayColors: true,
          boxPadding: 4,
        },
      },
      scales: {
        x: { grid: commonGrid, ticks: commonTicks },
        y: { grid: commonGrid, ticks: { ...commonTicks, callback: (v) => `${v}ms` }, position: 'left' },
        y1: { grid: { display: false }, ticks: { ...commonTicks, callback: (v) => `${v}%` }, position: 'right' },
      },
    },
  };
}

/** Uptime breakdown donut. */
export function uptimeChartConfig(): ChartConfiguration {
  return {
    type: 'doughnut',
    data: {
      labels: ['Operational', 'Degraded', 'Downtime'],
      datasets: [
        {
          data: [99.4, 0.5, 0.1],
          backgroundColor: [COLORS.teal, COLORS.amber, '#4a4a4a'],
          borderColor: '#212121',
          borderWidth: 3,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '74%',
      plugins: { legend: { display: false }, tooltip: tooltipBase },
    },
  };
}

/** Requests-per-day bar chart. */
export function reqChartConfig(): ChartConfiguration {
  return {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: [820, 940, 880, 1020, 960, 610, 540],
          backgroundColor: 'rgba(47,201,186,0.55)',
          hoverBackgroundColor: COLORS.teal,
          borderRadius: 5,
          maxBarThickness: 26,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: tooltipBase },
      scales: {
        x: { grid: { display: false }, ticks: commonTicks },
        y: { grid: commonGrid, ticks: commonTicks, display: false },
      },
    },
  };
}

/** Uptime-by-region horizontal bar chart. */
export function regionChartConfig(): ChartConfiguration {
  return {
    type: 'bar',
    data: {
      labels: ['us-east', 'eu-west', 'ap-south', 'sa-east'],
      datasets: [
        {
          data: [99.98, 99.95, 99.99, 99.91],
          backgroundColor: [COLORS.teal, COLORS.sage, COLORS.teal, COLORS.amber],
          borderRadius: 5,
          maxBarThickness: 16,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { min: 99.8, max: 100, grid: commonGrid, ticks: { ...commonTicks, callback: (v) => `${v}%` } },
        y: { grid: { display: false }, ticks: commonTicks },
      },
    },
  };
}
