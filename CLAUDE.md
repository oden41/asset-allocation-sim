# Asset Allocation Simulator

Monte Carlo portfolio simulator for FIRE planning. Visualizes future asset growth with percentile band charts and histograms.

## Tech Stack

- **Next.js 15 + TypeScript** — App Router, deployed on Vercel
- **Tailwind CSS v4** — styling
- **Recharts** — percentile band chart and histogram
- **next-intl** — Japanese/English i18n (`/ja`, `/en`)
- **Web Worker** — Monte Carlo computation off the main thread

## Commands

```bash
npm run dev     # Start dev server (localhost:3000)
npm run build   # Production build
npm run lint    # ESLint check
```

## Key Files

| File | Role |
|------|------|
| `src/lib/asset-data.ts` | Annual return, std dev, and 6×6 correlation matrix for all 6 asset classes |
| `src/lib/cholesky.ts` | Cholesky decomposition for correlated random return generation |
| `src/lib/monte-carlo.ts` | Core simulation logic (also used in tests / non-Worker contexts) |
| `src/workers/monte-carlo.worker.ts` | Web Worker entry point — this is what the UI uses |
| `src/components/SimulationPanel.tsx` | Top-level component: integrates inputs, dispatches Worker, passes results |
| `src/components/CorrelationMatrixTable.tsx` | Displays the correlation matrix with color-coded cells |
| `src/messages/ja.json`, `en.json` | Translation strings |
| `src/types/index.ts` | Type definitions (`SimulationParams`, `SimulationResult`, etc.) |

## Asset Classes and Data

6 asset classes: Cash, Foreign Stocks, Japan Stocks, Bonds, Gold, Bitcoin.

All parameters are hardcoded in `src/lib/asset-data.ts`. **To update the data, edit only this file.**

### Correlation Matrix Sources

Pairwise correlations of monthly returns, computed from Stooq monthly closing prices:

| Asset | Ticker on Stooq | Period |
|-------|-----------------|--------|
| Foreign Stocks | SPY | Feb 2005 – Dec 2024 (238 mo.) |
| Japan Stocks | ^TPX | Jan 2005 – Dec 2024 (239 mo.) |
| Bonds | AGG | Feb 2005 – Dec 2024 (238 mo.) |
| Gold | GLD | Feb 2005 – Dec 2024 (238 mo.) |
| Bitcoin | btc.v | Jan 2015 – Dec 2024 (119 mo.) |
| Cash | — | assumed uncorrelated |

AGG and GLD launched in 2004, so data before 2005 is unavailable for bonds/gold.
BTC correlations are computed over the overlapping period with each counterpart.

### Updating Data

1. Download monthly CSV from https://stooq.com for each ticker.
2. Compute pairwise Pearson correlation of monthly log-returns in Python (or Excel).
3. Update `CORRELATION_MATRIX` and the return/stddev values in `src/lib/asset-data.ts`.
4. Update the source comments and period strings in `src/messages/ja.json` and `en.json`.

## Simulation Algorithm

1. Convert annual parameters to monthly (return ÷ 12, std dev ÷ √12)
2. Cholesky-decompose the correlation matrix (`L` such that `corr = L Lᵀ`)
3. Each month: draw `z ~ N(0,1)ⁿ`, compute correlated returns `r = μ + σ ⊙ (L z)`
4. Apply returns to holdings; add monthly contribution proportionally
5. Rebalance annually if enabled
6. After 10,000 paths: compute per-month percentiles (p5/p25/p50/p75/p95) and final value distribution

Negative portfolio values are preserved (not clamped) to accurately track principal loss probability.

## i18n

Routes: `/ja` (default) and `/en`.
When adding any user-visible text, update **both** `src/messages/ja.json` and `en.json`.

English locale hides Japan Stocks — the allocation is merged into Foreign Stocks automatically
(see `SimulationPanel.tsx`: `EN_HIDDEN` constant and the `useEffect` that absorbs `japanStock` into `foreignStock`).

Default amounts differ by locale:
- Japanese: initialAmount = 1000 (万円), monthlyAmount = 10 (万円)
- English: initialAmount = 100 (K$), monthlyAmount = 1 (K$)

## Adding New Asset Classes

1. Add a new `AssetClassId` literal to `src/types/index.ts`
2. Add entry to `ASSET_CLASS_IDS`, `ASSET_CLASSES`, and `DEFAULT_ALLOCATIONS` in `asset-data.ts`
3. Extend `CORRELATION_MATRIX` to (n+1)×(n+1) with measured correlation values
4. Add translation keys to both `ja.json` and `en.json`
5. If the asset should be hidden in English locale, add its id to `EN_HIDDEN` in `SimulationPanel.tsx`
