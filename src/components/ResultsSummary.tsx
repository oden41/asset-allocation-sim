"use client";

import { useTranslations } from "next-intl";
import { SimulationResult } from "@/types";

interface Props {
  result: SimulationResult;
}

export default function ResultsSummary({ result }: Props) {
  const t = useTranslations("results");

  const items = [
    { label: t("median"), value: result.medianFinal },
    { label: t("principal"), value: result.principal },
    { label: t("upper10"), value: result.p90Final },
    { label: t("lower10"), value: result.p10Final },
  ];

  return (
    <div>
      <h3 className="text-base font-semibold mb-3">{t("summary")}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
            <div className="mt-1 text-lg font-bold">
              {Math.round(item.value).toLocaleString()}
              <span className="ml-1 text-xs font-normal text-gray-500">
                {t("tenThousandYen")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
