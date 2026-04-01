export interface Stats {
  samples: number[];
  min: number;
  max: number;
  mean: number;
  p50: number;
  p95: number;
}

export function computeStats(timings: number[]): Stats {
  const sorted = [...timings].sort((a, b) => a - b);
  const n = sorted.length;
  return {
    samples: timings.map((t) => Math.round(t * 100) / 100),
    min: Math.round(sorted[0] * 100) / 100,
    max: Math.round(sorted[n - 1] * 100) / 100,
    mean: Math.round((timings.reduce((a, b) => a + b, 0) / n) * 100) / 100,
    p50: Math.round(sorted[Math.floor(n * 0.5)] * 100) / 100,
    p95: Math.round(sorted[Math.floor(n * 0.95)] * 100) / 100,
  };
}
