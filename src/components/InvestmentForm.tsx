"use client";

import { useTranslations } from "next-intl";

interface Props {
  initialAmount: number;
  monthlyAmount: number;
  years: number;
  onInitialChange: (v: number) => void;
  onMonthlyChange: (v: number) => void;
  onYearsChange: (v: number) => void;
}

export default function InvestmentForm({
  initialAmount,
  monthlyAmount,
  years,
  onInitialChange,
  onMonthlyChange,
  onYearsChange,
}: Props) {
  const t = useTranslations("investment");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("title")}</h2>

      <div>
        <label className="block text-sm font-medium mb-1">{t("initialAmount")}</label>
        <input
          type="number"
          min={0}
          value={initialAmount}
          onChange={(e) => onInitialChange(Math.max(0, Number(e.target.value)))}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t("monthlyAmount")}</label>
        <input
          type="number"
          min={0}
          value={monthlyAmount}
          onChange={(e) => onMonthlyChange(Math.max(0, Number(e.target.value)))}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t("years")}: {years}{t("yearsUnit")}
        </label>
        <input
          type="range"
          min={1}
          max={50}
          value={years}
          onChange={(e) => onYearsChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>1</span>
          <span>25</span>
          <span>50</span>
        </div>
      </div>
    </div>
  );
}
