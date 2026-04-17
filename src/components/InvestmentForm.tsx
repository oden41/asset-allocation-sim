"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface Props {
  initialAmount: number;
  monthlyAmount: number;
  years: number;
  onInitialChange: (v: number) => void;
  onMonthlyChange: (v: number) => void;
  onYearsChange: (v: number) => void;
  withdrawalStartYear: number;
  withdrawalMonthlyAmount: number;
  onWithdrawalStartYearChange: (v: number) => void;
  onWithdrawalMonthlyAmountChange: (v: number) => void;
  maxYears: number;
}

function useNumberInput(value: number, onChange: (v: number) => void) {
  const [text, setText] = useState(String(value));

  // Sync when parent resets the value externally
  useEffect(() => {
    setText(String(value));
  }, [value]);

  return {
    value: text,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value),
    onBlur: () => {
      const n = Number(text);
      if (!isNaN(n) && n >= 0) {
        onChange(n);
        setText(String(n));
      } else {
        setText(String(value));
      }
    },
  };
}

export default function InvestmentForm({
  initialAmount,
  monthlyAmount,
  years,
  onInitialChange,
  onMonthlyChange,
  onYearsChange,
  withdrawalStartYear,
  withdrawalMonthlyAmount,
  onWithdrawalStartYearChange,
  onWithdrawalMonthlyAmountChange,
  maxYears,
}: Props) {
  const t = useTranslations("investment");
  const initialProps = useNumberInput(initialAmount, onInitialChange);
  const monthlyProps = useNumberInput(monthlyAmount, onMonthlyChange);
  const withdrawalMonthlyProps = useNumberInput(withdrawalMonthlyAmount, onWithdrawalMonthlyAmountChange);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("title")}</h2>

      <div>
        <label className="block text-sm font-medium mb-1">{t("initialAmount")}</label>
        <input
          type="number"
          min={0}
          {...initialProps}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t("monthlyAmount")}</label>
        <input
          type="number"
          min={0}
          {...monthlyProps}
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

      {/* Withdrawal settings */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold mb-3">{t("withdrawalTitle")}</h3>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t("withdrawalStartYear")}: {withdrawalStartYear === 0 ? t("withdrawalNone") : `${withdrawalStartYear}${t("yearsUnit")}`}
          </label>
          <input
            type="range"
            min={0}
            max={maxYears}
            value={withdrawalStartYear}
            onChange={(e) => onWithdrawalStartYearChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{t("withdrawalNone")}</span>
            <span>{Math.floor(maxYears / 2)}</span>
            <span>{maxYears}</span>
          </div>
        </div>

        {withdrawalStartYear > 0 && (
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">{t("withdrawalMonthlyAmount")}</label>
            <input
              type="number"
              min={0}
              {...withdrawalMonthlyProps}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
        )}
      </div>
    </div>
  );
}
