"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AssetClassId, SimulationParams, SimulationResult } from "@/types";
import { DEFAULT_ALLOCATIONS, ASSET_CLASS_IDS } from "@/lib/asset-data";
import InvestmentForm from "./InvestmentForm";
import AllocationSliders from "./AllocationSliders";
import RebalanceToggle from "./RebalanceToggle";
import PercentileBandChart from "./PercentileBandChart";
import HistogramChart from "./HistogramChart";
import ResultsSummary from "./ResultsSummary";
import CorrelationMatrixTable from "./CorrelationMatrixTable";

const NUM_SIMULATIONS = 10000;

// In English mode, hide Japan stocks (merged into foreign stocks as "Stocks")
const EN_HIDDEN: AssetClassId[] = ["japanStock"];

export default function SimulationPanel() {
  const t = useTranslations();
  const locale = useLocale();

  const [initialAmount, setInitialAmount] = useState(locale === "en" ? 100 : 1000);
  const [monthlyAmount, setMonthlyAmount] = useState(locale === "en" ? 1 : 10);
  const [years, setYears] = useState(20);
  const [allocations, setAllocations] = useState<Record<AssetClassId, number>>(DEFAULT_ALLOCATIONS);
  const [rebalance, setRebalance] = useState(true);
  const [withdrawalStartYear, setWithdrawalStartYear] = useState(0);
  const [withdrawalMonthlyAmount, setWithdrawalMonthlyAmount] = useState(locale === "en" ? 1 : 10);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  // When switching to English locale, absorb Japan stock allocation into foreign stocks
  useEffect(() => {
    if (locale === "en" && allocations.japanStock > 0) {
      setAllocations((prev) => ({
        ...prev,
        foreignStock: Math.min(100, prev.foreignStock + prev.japanStock),
        japanStock: 0,
      }));
    }
  }, [locale]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleIds = locale === "en"
    ? ASSET_CLASS_IDS.filter((id) => !EN_HIDDEN.includes(id))
    : ASSET_CLASS_IDS;

  const total = ASSET_CLASS_IDS.reduce((sum, id) => sum + allocations[id], 0);
  const isValid = total === 100;

  const runSimulation = useCallback(() => {
    if (!isValid || isRunning) return;

    setIsRunning(true);

    if (workerRef.current) workerRef.current.terminate();

    const worker = new Worker(
      new URL("../workers/monte-carlo.worker.ts", import.meta.url)
    );
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<SimulationResult>) => {
      setResult(e.data);
      setIsRunning(false);
      worker.terminate();
      workerRef.current = null;
    };

    worker.onerror = () => {
      setIsRunning(false);
      worker.terminate();
      workerRef.current = null;
    };

    const params: SimulationParams = {
      initialAmount,
      monthlyAmount,
      years,
      allocations,
      rebalance,
      numSimulations: NUM_SIMULATIONS,
      withdrawalStartYear,
      withdrawalMonthlyAmount,
    };

    worker.postMessage(params);
  }, [initialAmount, monthlyAmount, years, allocations, rebalance, isValid, isRunning, withdrawalStartYear, withdrawalMonthlyAmount]);

  const handleYearsChange = (v: number) => {
    setYears(v);
    if (withdrawalStartYear > v) setWithdrawalStartYear(v);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* Input panel */}
        <div className="space-y-6">
          <InvestmentForm
            initialAmount={initialAmount}
            monthlyAmount={monthlyAmount}
            years={years}
            onInitialChange={setInitialAmount}
            onMonthlyChange={setMonthlyAmount}
            onYearsChange={handleYearsChange}
            withdrawalStartYear={withdrawalStartYear}
            withdrawalMonthlyAmount={withdrawalMonthlyAmount}
            onWithdrawalStartYearChange={setWithdrawalStartYear}
            onWithdrawalMonthlyAmountChange={setWithdrawalMonthlyAmount}
            maxYears={years}
          />

          <AllocationSliders
            allocations={allocations}
            visibleIds={visibleIds}
            onChange={setAllocations}
          />

          <RebalanceToggle rebalance={rebalance} onChange={setRebalance} />

          <button
            onClick={runSimulation}
            disabled={!isValid || isRunning}
            className={`w-full rounded-lg py-3 text-sm font-semibold text-white transition ${
              isValid && !isRunning
                ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isRunning ? t("simulating") : t("simulate")}
          </button>
        </div>

        {/* Results panel */}
        <div className="space-y-8">
          {result ? (
            <>
              <ResultsSummary result={result} />
              <PercentileBandChart data={result.percentiles} withdrawalStartYear={result.withdrawalStartYear} />
              <HistogramChart finalValues={result.finalValues} median={result.medianFinal} />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <p className="text-center">{t("simulate")}</p>
            </div>
          )}
        </div>
      </div>
      {/* Correlation matrix */}
      <div className="mt-8 border-t pt-8 border-gray-200 dark:border-gray-700">
        <CorrelationMatrixTable />
      </div>
    </div>
  );
}
