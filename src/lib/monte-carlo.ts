import { AssetClassId, SimulationParams, SimulationResult, MonthlyPercentiles } from "@/types";
import { ASSET_CLASSES, ASSET_CLASS_IDS, CORRELATION_MATRIX } from "./asset-data";
import { choleskyDecomposition } from "./cholesky";

/** Generate a standard normal random number via Box-Muller transform. */
function randomNormal(): number {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

/** Compute the p-th percentile of a pre-sorted array. */
function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

export function runSimulation(params: SimulationParams): SimulationResult {
  const { initialAmount, monthlyAmount, years, allocations, rebalance, numSimulations, withdrawalYears, withdrawalMonthlyAmount } = params;
  // Simulation covers the accumulation phase (years) + the withdrawal phase (withdrawalYears).
  const totalMonths = (years + (withdrawalYears > 0 ? withdrawalYears : 0)) * 12;
  const n = ASSET_CLASS_IDS.length;
  // Withdrawal begins once the accumulation phase ends. Infinity disables withdrawal entirely.
  const withdrawalStartMonth = withdrawalYears > 0 ? years * 12 : Infinity;

  // Convert annual parameters to monthly
  const monthlyReturns = ASSET_CLASS_IDS.map((id) => ASSET_CLASSES[id].annualReturn / 12);
  const monthlyStdDevs = ASSET_CLASS_IDS.map((id) => ASSET_CLASSES[id].annualStdDev / Math.sqrt(12));

  // Allocation weights (0–1)
  const weights = ASSET_CLASS_IDS.map((id) => allocations[id] / 100);

  // Cholesky decomposition of the correlation matrix
  const L = choleskyDecomposition(CORRELATION_MATRIX);

  const monthlyTotals: Float64Array[] = Array.from({ length: totalMonths + 1 }, () => new Float64Array(numSimulations));
  const finalValues = new Float64Array(numSimulations);
  let principalLossCount = 0;
  let depletionCount = 0;

  for (let sim = 0; sim < numSimulations; sim++) {
    const holdings = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      holdings[i] = initialAmount * weights[i];
    }

    let total = initialAmount;
    let depleted = false;
    monthlyTotals[0][sim] = total;
    for (let month = 1; month <= totalMonths; month++) {
      const z = new Float64Array(n);
      for (let i = 0; i < n; i++) z[i] = randomNormal();

      // Correlated random returns: x = L * z
      const x = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j <= i; j++) sum += L[i][j] * z[j];
        x[i] = sum;
      }

      // Apply returns to each asset (no clamping — negative values tracked for loss probability)
      for (let i = 0; i < n; i++) {
        const r = monthlyReturns[i] + monthlyStdDevs[i] * x[i];
        holdings[i] *= 1 + r;
      }

      if (month <= withdrawalStartMonth) {
        // Accumulation phase — add monthly contribution proportionally
        for (let i = 0; i < n; i++) {
          holdings[i] += monthlyAmount * weights[i];
        }
      } else {
        // Withdrawal phase — draw from each asset proportional to current holdings
        total = 0;
        for (let i = 0; i < n; i++) total += holdings[i];
        if (total > 0) {
          for (let i = 0; i < n; i++) {
            holdings[i] -= withdrawalMonthlyAmount * (holdings[i] / total);
          }
        }
      }

      // Annual rebalancing (every 12 months)
      if (rebalance && month % 12 === 0) {
        total = 0;
        for (let i = 0; i < n; i++) total += holdings[i];
        for (let i = 0; i < n; i++) holdings[i] = total * weights[i];
      }

      total = 0;
      for (let i = 0; i < n; i++) total += holdings[i];

      // Only clamp to 0 during the withdrawal phase. During accumulation we
      // preserve negative values so principal-loss probability tracking stays
      // consistent with the "no clamping" invariant in CLAUDE.md.
      if (total <= 0 && month > withdrawalStartMonth) {
        for (let i = 0; i < n; i++) holdings[i] = 0;
        total = 0;
        if (!depleted) {
          depletionCount++;
          depleted = true;
        }
      }

      monthlyTotals[month][sim] = total;

    }

    finalValues[sim] = total;
  }

  // Compute per-month percentiles across all simulation paths
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
  const contributionMonths = years * 12;
  const withdrawalMonths = withdrawalYears > 0 ? withdrawalYears * 12 : 0;
  const principal = initialAmount + monthlyAmount * contributionMonths - withdrawalMonthlyAmount * withdrawalMonths;

  for (let sim = 0; sim < numSimulations; sim++) {
    if (finalValues[sim] < principal) principalLossCount++;
  }

  return {
    percentiles,
    finalValues: Array.from(finalValues),
    medianFinal: percentile(sortedFinal, 50),
    principal,
    p10Final: percentile(sortedFinal, 10),
    p25Final: percentile(sortedFinal, 25),
    p75Final: percentile(sortedFinal, 75),
    p90Final: percentile(sortedFinal, 90),
    principalLossProbability: principalLossCount / numSimulations,
    depletionProbability: depletionCount / numSimulations,
    withdrawalStartYear: withdrawalYears > 0 ? years : 0,
  };
}
