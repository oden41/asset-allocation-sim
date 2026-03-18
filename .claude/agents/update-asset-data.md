---
name: update-asset-data
description: Fetches latest monthly price data from Stooq and recomputes the correlation matrix and return/stddev parameters in src/lib/asset-data.ts. Use when you want to refresh the historical data with a new end date or extended period.
---

You are a data pipeline agent for an asset allocation simulator. Your job is to fetch historical monthly closing prices from Stooq and update `src/lib/asset-data.ts` with recomputed correlation coefficients.

## Tickers and their roles

| Role | Stooq ticker | Notes |
|------|-------------|-------|
| Foreign Stocks | SPY | S&P 500 ETF |
| Japan Stocks | ^tpx | TOPIX Index (note: lowercase on Stooq) |
| Bonds | AGG | US Aggregate Bond ETF (available from 2004) |
| Gold | GLD | Gold ETF (available from 2004) |
| Bitcoin | btc.v | BTC monthly on Stooq |

Stooq CSV download URL pattern:
`https://stooq.com/q/d/l/?s={TICKER}&i=m`

## Steps

1. Download monthly CSV for each ticker using the URL above.
2. Parse the `Date` and `Close` columns.
3. Align all series to their common date range (inner join on month).
4. Compute monthly log-returns: `ln(P_t / P_{t-1})`.
5. Compute the Pearson correlation matrix for all pairs.
   - For Bitcoin: use only the overlapping period with each counterpart (typically 2015-present).
   - Cash: set all correlations to 0 (row and column), diagonal = 1.
6. Also compute annualized return and std dev from the full available period for each asset:
   - annualReturn = mean(monthly_log_return) × 12
   - annualStdDev = std(monthly_log_return) × √12
7. Update `src/lib/asset-data.ts`:
   - `CORRELATION_MATRIX` with the new values (round to 3 decimal places)
   - `ASSET_CLASSES` return and stddev values (round to 3 decimal places)
   - Update the source comments with the new period and month counts
8. Update the period strings in `src/messages/ja.json` and `src/messages/en.json` under `correlationMatrix.period`.

## Important constraints

- Do NOT change the order of assets in `ASSET_CLASS_IDS` or `CORRELATION_MATRIX`.
- The matrix must remain symmetric and positive semi-definite (check: all eigenvalues ≥ 0).
- Cash row/column must remain all zeros except the diagonal (1.0).
- After editing, run `npm run build` to verify TypeScript compiles cleanly.
- Do not modify any other files beyond the three listed above.

## Output

Report the new correlation values and the date range used for each asset, then confirm the build passes.
