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
| `src/lib/asset-data.ts` | Hardcoded annual return, std dev, and correlation matrix for 6 asset classes |
| `src/lib/cholesky.ts` | Cholesky decomposition (used for correlated random return generation) |
| `src/lib/monte-carlo.ts` | Core simulation logic |
| `src/workers/monte-carlo.worker.ts` | Web Worker version (used by the UI) |
| `src/components/SimulationPanel.tsx` | Top-level component integrating inputs and results |
| `src/messages/ja.json`, `en.json` | Translation strings |
| `src/types/index.ts` | Type definitions |

## Asset Classes and Data

6 classes: Cash, Foreign Stocks, Japan Stocks, Bonds, Gold, Bitcoin.

Annual return, std dev, and 6×6 correlation matrix are hardcoded in `src/lib/asset-data.ts`.
Correlation values are measured from Stooq monthly closing prices (2005–2024 for most assets, 2015–2024 for BTC).
To update the data, edit only this file.

## Simulation Algorithm

1. Convert annual parameters to monthly (return ÷ 12, std dev ÷ √12)
2. Cholesky-decompose the correlation matrix to generate correlated random returns (Box-Muller transform)
3. Run 10,000 paths month by month
4. Compute per-month percentiles (p5/p25/p50/p75/p95) and final value distribution

## i18n

Routes: `/ja` (default) and `/en`.
When adding text, update both `src/messages/ja.json` and `en.json` together.
English locale hides Japan Stocks (allocation merged into Foreign Stocks automatically).
