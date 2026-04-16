import { AssetClass, AssetClassId } from "@/types";

export const ASSET_CLASS_IDS: AssetClassId[] = [
  "cash",
  "foreignStock",
  "japanStock",
  "bond",
  "gold",
  "bitcoin",
];

// Approximate annualized return and standard deviation based on ~20-year historical data.
// bond: blended foreign/Japan bonds (FTSE World Government Bond basis)
export const ASSET_CLASSES: Record<AssetClassId, AssetClass> = {
  cash:         { id: "cash",         annualReturn: 0.001, annualStdDev: 0.001 },
  foreignStock: { id: "foreignStock", annualReturn: 0.08,  annualStdDev: 0.18  },
  japanStock:   { id: "japanStock",   annualReturn: 0.06,  annualStdDev: 0.19  },
  bond:         { id: "bond",         annualReturn: 0.025, annualStdDev: 0.055 },
  gold:         { id: "gold",         annualReturn: 0.06,  annualStdDev: 0.17  },
  bitcoin:      { id: "bitcoin",      annualReturn: 0.30,  annualStdDev: 0.70  },
};

// 6×6 correlation matrix (row/column order matches ASSET_CLASS_IDS)
// [Cash, ForeignStock, JapanStock, Bond, Gold, Bitcoin]
//
// Measured pairwise correlations of monthly returns, computed from Stooq monthly closing prices.
// Source: https://stooq.com
//   ForeignStock: SPY (S&P 500 ETF)       Feb 2005 – Dec 2024 (238 months)
//   JapanStock:   ^TPX (TOPIX Index)      Jan 2005 – Dec 2024 (239 months)
//   Bond:         AGG (US Agg Bond ETF)   Feb 2005 – Dec 2024 (238 months)
//   Gold:         GLD (Gold ETF)          Feb 2005 – Dec 2024 (238 months)
//   Bitcoin:      BTC-USD                 Jan 2015 – Dec 2024 (119 months)
//   Cash:         assumed uncorrelated with all other assets
//
// Note 1: AGG and GLD launched in 2004, so the common period for all non-BTC assets starts 2005.
//         Data before 2005 is unavailable for bonds and gold via public sources.
// Note 2: BTC correlations are computed over the overlapping period with each counterpart.
export const CORRELATION_MATRIX: number[][] = [
  [ 1.0,   0.0,    0.0,   0.0,   0.0,   0.0 ],  // Cash
  [ 0.0,   1.0,    0.637, 0.239, 0.084, 0.351],  // ForeignStock (SPY)
  [ 0.0,   0.637,  1.0,  -0.067,-0.142, 0.196],  // JapanStock (^TPX)
  [ 0.0,   0.239, -0.067, 1.0,   0.331, 0.192],  // Bond (AGG)
  [ 0.0,   0.084, -0.142, 0.331, 1.0,   0.115],  // Gold (GLD)
  [ 0.0,   0.351,  0.196, 0.192, 0.115, 1.0  ],  // Bitcoin (BTC-USD)
];

export const DEFAULT_ALLOCATIONS: Record<AssetClassId, number> = {
  cash:         25,
  foreignStock: 30,
  japanStock:   20,
  bond:         10,
  gold:         10,
  bitcoin:      5,
};

export interface PresetPortfolio {
  id: string;
  allocations: Record<AssetClassId, number>;
}

export const PRESET_PORTFOLIOS: PresetPortfolio[] = [
  {
    id: "default",
    allocations: { cash: 25, foreignStock: 30, japanStock: 20, bond: 10, gold: 10, bitcoin: 5 },
  },
  {
    id: "allStock",
    allocations: { cash: 0, foreignStock: 50, japanStock: 50, bond: 0, gold: 0, bitcoin: 0 },
  },
  {
    id: "sixtyForty",
    allocations: { cash: 0, foreignStock: 35, japanStock: 25, bond: 40, gold: 0, bitcoin: 0 },
  },
  {
    id: "gpif",
    allocations: { cash: 0, foreignStock: 25, japanStock: 25, bond: 50, gold: 0, bitcoin: 0 },
  },
  {
    id: "allWeather",
    allocations: { cash: 0, foreignStock: 30, japanStock: 0, bond: 40, gold: 15, bitcoin: 0 },
  },
  {
    id: "conservative",
    allocations: { cash: 30, foreignStock: 20, japanStock: 10, bond: 30, gold: 10, bitcoin: 0 },
  },
];
