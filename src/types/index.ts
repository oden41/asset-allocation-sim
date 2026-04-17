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
  withdrawalStartYear: number; // 0 = no withdrawal
  withdrawalMonthlyAmount: number; // 万円 / K$
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
  p25Final: number;
  p75Final: number;
  p90Final: number;
  principalLossProbability: number; // 最終資産額が元本を下回る確率
  depletionProbability: number; // 投資期間中に資産が0以下になったパスの割合
  withdrawalStartYear: number; // チャート表示用
}
