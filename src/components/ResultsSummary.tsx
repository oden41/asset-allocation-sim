"use client";

import { useTranslations } from "next-intl";
import { SimulationResult } from "@/types";

interface Props {
  result: SimulationResult;
}

export default function ResultsSummary({ result }: Props) {
  const t = useTranslations("results");

  const moneyItems = [
    { label: t("median"),    value: result.medianFinal, highlight: true },
    { label: t("principal"), value: result.principal,   highlight: false },
    { label: t("upper10"),   value: result.p90Final,    highlight: false },
    { label: t("upper25"),   value: result.p75Final,    highlight: false },
    { label: t("lower25"),   value: result.p25Final,    highlight: false },
    { label: t("lower10"),   value: result.p10Final,    highlight: false },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">{t("summary")}</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {moneyItems.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
            <div className={`mt-1 text-lg font-bold ${item.highlight ? "text-blue-600 dark:text-blue-400" : ""}`}>
              {Math.round(item.value).toLocaleString()}
              <span className="ml-1 text-xs font-normal text-gray-500">{t("tenThousandYen")}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 破産確率 */}
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t("principalLossProbability")}</span>
        <span className={`text-lg font-bold ${result.principalLossProbability > 0.3 ? "text-red-500" : result.principalLossProbability > 0.1 ? "text-yellow-500" : "text-green-600"}`}>
          {(result.principalLossProbability * 100).toFixed(1)}%
        </span>
      </div>

      {/* 資産枯渇確率（取り崩しモード時のみ） */}
      {result.withdrawalStartYear > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">{t("depletionProbability")}</span>
          <span className={`text-lg font-bold ${result.depletionProbability > 0.3 ? "text-red-500" : result.depletionProbability > 0.1 ? "text-yellow-500" : "text-green-600"}`}>
            {(result.depletionProbability * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
