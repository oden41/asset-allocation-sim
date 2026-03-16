import { AssetClassId, SimulationParams, SimulationResult, MonthlyPercentiles } from "@/types";
import { ASSET_CLASSES, ASSET_CLASS_IDS, CORRELATION_MATRIX } from "./asset-data";
import { choleskyDecomposition } from "./cholesky";

/** Box-Muller変換で標準正規分布の乱数を生成 */
function randomNormal(): number {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

/** 配列のパーセンタイルを計算 */
function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

export function runSimulation(params: SimulationParams): SimulationResult {
  const { initialAmount, monthlyAmount, years, allocations, rebalance, numSimulations } = params;
  const totalMonths = years * 12;
  const n = ASSET_CLASS_IDS.length;

  // 年率→月率変換
  const monthlyReturns = ASSET_CLASS_IDS.map((id) => ASSET_CLASSES[id].annualReturn / 12);
  const monthlyStdDevs = ASSET_CLASS_IDS.map((id) => ASSET_CLASSES[id].annualStdDev / Math.sqrt(12));

  // 配分比率（0-1）
  const weights = ASSET_CLASS_IDS.map((id) => allocations[id] / 100);

  // コレスキー分解
  const L = choleskyDecomposition(CORRELATION_MATRIX);

  // 全パスの月次ポートフォリオ合計を格納
  // monthlyTotals[month][simulation]
  const monthlyTotals: number[][] = Array.from({ length: totalMonths + 1 }, () => new Float64Array(numSimulations) as unknown as number[]);
  const finalValues: number[] = new Float64Array(numSimulations) as unknown as number[];

  for (let sim = 0; sim < numSimulations; sim++) {
    // 各資産の保有額
    const holdings = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      holdings[i] = initialAmount * weights[i];
    }

    let total = initialAmount;
    monthlyTotals[0][sim] = total;

    for (let month = 1; month <= totalMonths; month++) {
      // 独立な標準正規乱数ベクトル
      const z = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        z[i] = randomNormal();
      }

      // 相関付き乱数: x = L * z
      const x = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j <= i; j++) {
          sum += L[i][j] * z[j];
        }
        x[i] = sum;
      }

      // 各資産にリターンを適用
      total = 0;
      for (let i = 0; i < n; i++) {
        const r = monthlyReturns[i] + monthlyStdDevs[i] * x[i];
        holdings[i] *= 1 + r;
        if (holdings[i] < 0) holdings[i] = 0;
      }

      // 毎月の積立を配分比率で追加
      for (let i = 0; i < n; i++) {
        holdings[i] += monthlyAmount * weights[i];
      }

      // 年次リバランス（12ヶ月ごと）
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

  // 各月のパーセンタイルを計算
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

  // 最終値のソートとパーセンタイル
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
