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
}: Props) {
  const t = useTranslations("investment");
  const initialProps = useNumberInput(initialAmount, onInitialChange);
  const monthlyProps = useNumberInput(monthlyAmount, onMonthlyChange);

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
    </div>
  );
}
