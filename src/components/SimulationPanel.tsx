"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { AssetClassId, SimulationParams, SimulationResult } from "@/types";
import { DEFAULT_ALLOCATIONS, ASSET_CLASS_IDS } from "@/lib/asset-data";
import InvestmentForm from "./InvestmentForm";
import AllocationSliders from "./AllocationSliders";
import RebalanceToggle from "./RebalanceToggle";
import PercentileBandChart from "./PercentileBandChart";
import HistogramChart from "./HistogramChart";
import ResultsSummary from "./ResultsSummary";

const NUM_SIMULATIONS = 10000;

export default function SimulationPanel() {
  const t = useTranslations();

  const [initialAmount, setInitialAmount] = useState(500);
  const [monthlyAmount, setMonthlyAmount] = useState(5);
  const [years, setYears] = useState(20);
  const [allocations, setAllocations] = useState<Record<AssetClassId, number>>(DEFAULT_ALLOCATIONS);
  const [rebalance, setRebalance] = useState(true);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const total = ASSET_CLASS_IDS.reduce((sum, id) => sum + allocations[id], 0);
  const isValid = total === 100;

  const runSimulation = useCallback(() => {
    if (!isValid || isRunning) return;

    setIsRunning(true);

    // 既存のWorkerを終了
    if (workerRef.current) {
      workerRef.current.terminate();
    }

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
    };

    worker.postMessage(params);
  }, [initialAmount, monthlyAmount, years, allocations, rebalance, isValid, isRunning]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* 入力パネル */}
        <div className="space-y-6">
          <InvestmentForm
            initialAmount={initialAmount}
            monthlyAmount={monthlyAmount}
            years={years}
            onInitialChange={setInitialAmount}
            onMonthlyChange={setMonthlyAmount}
            onYearsChange={setYears}
          />

          <AllocationSliders allocations={allocations} onChange={setAllocations} />

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

        {/* 結果パネル */}
        <div className="space-y-8">
          {result ? (
            <>
              <ResultsSummary result={result} />
              <PercentileBandChart data={result.percentiles} />
              <HistogramChart
                finalValues={result.finalValues}
                median={result.medianFinal}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <p className="text-center">
                {t("simulate")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
