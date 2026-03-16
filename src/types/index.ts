export type AssetClassId =
  | "cash"
  | "foreignStock"
  | "japanStock"
  | "bond"
  | "gold"
  | "bitcoin";

export interface AssetClass {
  id: AssetClassId;
  annualReturn: number;
  annualStdDev: number;
}

export interface SimulationParams {
  initialAmount: number; // 万円
  monthlyAmount: number; // 万円
  years: number;
  allocations: Record<AssetClassId, number>; // 0-100 (%)
  rebalance: boolean;
  numSimulations: number;
}

export interface MonthlyPercentiles {
  month: number;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
}

export interface SimulationResult {
  percentiles: MonthlyPercentiles[];
  finalValues: number[];
  medianFinal: number;
  principal: number;
  p10Final: number;
  p90Final: number;
  bankruptcyProbability: number; // 途中で一度でも0以下になる確率
}
