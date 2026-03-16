"use client";

import { useTranslations } from "next-intl";

interface Props {
  rebalance: boolean;
  onChange: (v: boolean) => void;
}

export default function RebalanceToggle({ rebalance, onChange }: Props) {
  const t = useTranslations("rebalance");

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(true)}
          className={`flex-1 rounded px-4 py-2 text-sm font-medium transition ${
            rebalance
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {t("annual")}
        </button>
        <button
          onClick={() => onChange(false)}
          className={`flex-1 rounded px-4 py-2 text-sm font-medium transition ${
            !rebalance
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {t("none")}
        </button>
      </div>
    </div>
  );
}
