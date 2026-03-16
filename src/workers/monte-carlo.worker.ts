import { SimulationParams, SimulationResult, MonthlyPercentiles } from "@/types";
import { ASSET_CLASSES, ASSET_CLASS_IDS, CORRELATION_MATRIX } from "@/lib/asset-data";
import { choleskyDecomposition } from "@/lib/cholesky";

function randomNormal(): number {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

function runSimulation(params: SimulationParams): SimulationResult {
  const { initialAmount, monthlyAmount, years, allocations, rebalance, numSimulations } = params;
  const totalMonths = years * 12;
  const n = ASSET_CLASS_IDS.length;

  const monthlyReturns = ASSET_CLASS_IDS.map((id) => ASSET_CLASSES[id].annualReturn / 12);
  const monthlyStdDevs = ASSET_CLASS_IDS.map((id) => ASSET_CLASSES[id].annualStdDev / Math.sqrt(12));
  const weights = ASSET_CLASS_IDS.map((id) => allocations[id] / 100);
  const L = choleskyDecomposition(CORRELATION_MATRIX);

  const monthlyTotals: number[][] = Array.from({ length: totalMonths + 1 }, () => new Float64Array(numSimulations) as unknown as number[]);
  const finalValues = new Float64Array(numSimulations);

  for (let sim = 0; sim < numSimulations; sim++) {
    const holdings = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      holdings[i] = initialAmount * weights[i];
    }

    let total = initialAmount;
    monthlyTotals[0][sim] = total;

    for (let month = 1; month <= totalMonths; month++) {
      const z = new Float64Array(n);
      for (let i = 0; i < n; i++) z[i] = randomNormal();

      const x = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j <= i; j++) sum += L[i][j] * z[j];
        x[i] = sum;
      }

      total = 0;
      for (let i = 0; i < n; i++) {
        const r = monthlyReturns[i] + monthlyStdDevs[i] * x[i];
        holdings[i] *= 1 + r;
        if (holdings[i] < 0) holdings[i] = 0;
      }

      for (let i = 0; i < n; i++) {
        holdings[i] += monthlyAmount * weights[i];
      }

      if (rebalance && month % 12 === 0) {
        total = 0;
        for (let i = 0; i < n; i++) total += holdings[i];
        for (let i = 0; i < n; i++) holdings[i] = total * weights[i];
      }

      total = 0;
      for (let i = 0; i < n; i++) total += holdings[i];
      monthlyTotals[month][sim] = total;
    }

    finalValues[sim] = total;
  }

  const percentiles: MonthlyPercentiles[] = [];
  for (let month = 0; month <= totalMonths; month++) {
    const values = Array.from(monthlyTotals[month]).sort((a, b) => a - b);
    percentiles.push({
      month,
      p5: percentile(values, 5),
      p25: percentile(values, 25),
      p50: percentile(values, 50),
      p75: percentile(values, 75),
      p95: percentile(values, 95),
    });
  }

  const sortedFinal = Array.from(finalValues).sort((a, b) => a - b);
  const principal = initialAmount + monthlyAmount * totalMonths;

  return {
    percentiles,
    finalValues: Array.from(finalValues),
    medianFinal: percentile(sortedFinal, 50),
    principal,
    p10Final: percentile(sortedFinal, 10),
    p90Final: percentile(sortedFinal, 90),
  };
}

self.onmessage = (e: MessageEvent<SimulationParams>) => {
  const result = runSimulation(e.data);
  self.postMessage(result);
};
