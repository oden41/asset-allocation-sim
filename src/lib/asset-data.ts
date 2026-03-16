import { AssetClass, AssetClassId } from "@/types";

export const ASSET_CLASS_IDS: AssetClassId[] = [
  "cash",
  "foreignStock",
  "japanStock",
  "foreignBond",
  "japanBond",
  "gold",
  "bitcoin",
];

// 過去約20年の代表的指標に基づく年率リターン・標準偏差（概算）
export const ASSET_CLASSES: Record<AssetClassId, AssetClass> = {
  cash: { id: "cash", annualReturn: 0.001, annualStdDev: 0.0 },
  foreignStock: { id: "foreignStock", annualReturn: 0.08, annualStdDev: 0.18 },
  japanStock: { id: "japanStock", annualReturn: 0.06, annualStdDev: 0.19 },
  foreignBond: { id: "foreignBond", annualReturn: 0.035, annualStdDev: 0.07 },
  japanBond: { id: "japanBond", annualReturn: 0.015, annualStdDev: 0.03 },
  gold: { id: "gold", annualReturn: 0.06, annualStdDev: 0.17 },
  bitcoin: { id: "bitcoin", annualReturn: 0.30, annualStdDev: 0.70 },
};

// 7×7 相関行列（行・列の順序はASSET_CLASS_IDSと同じ）
// [Cash, ForeignStock, JapanStock, ForeignBond, JapanBond, Gold, Bitcoin]
export const CORRELATION_MATRIX: number[][] = [
  [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],     // Cash
  [0.0, 1.0, 0.65, 0.15, -0.1, 0.05, 0.35],  // ForeignStock
  [0.0, 0.65, 1.0, 0.1, -0.15, 0.1, 0.25],   // JapanStock
  [0.0, 0.15, 0.1, 1.0, 0.4, -0.05, 0.05],   // ForeignBond
  [0.0, -0.1, -0.15, 0.4, 1.0, 0.1, -0.05],  // JapanBond
  [0.0, 0.05, 0.1, -0.05, 0.1, 1.0, 0.15],   // Gold
  [0.0, 0.35, 0.25, 0.05, -0.05, 0.15, 1.0],  // Bitcoin
];

export const DEFAULT_ALLOCATIONS: Record<AssetClassId, number> = {
  cash: 10,
  foreignStock: 30,
  japanStock: 20,
  foreignBond: 10,
  japanBond: 10,
  gold: 10,
  bitcoin: 10,
};
