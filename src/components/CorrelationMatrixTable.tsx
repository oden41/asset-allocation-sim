"use client";

import { useTranslations, useLocale } from "next-intl";
import { ASSET_CLASS_IDS, CORRELATION_MATRIX } from "@/lib/asset-data";
import { AssetClassId } from "@/types";

const ASSET_KEYS: Record<string, string> = {
  cash:         "cash",
  foreignStock: "foreignStock",
  japanStock:   "japanStock",
  bond:         "bond",
  gold:         "gold",
  bitcoin:      "bitcoin",
};

const EN_HIDDEN: AssetClassId[] = ["japanStock"];

function cellColor(value: number): string {
  if (value === 1) return "bg-gray-100 dark:bg-gray-700 font-bold";
  if (value > 0.5)  return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300";
  if (value > 0.2)  return "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300";
  if (value > 0)    return "bg-gray-50 dark:bg-gray-800";
  if (value < -0.2) return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";
  return "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";
}

export default function CorrelationMatrixTable() {
  const t = useTranslations("correlationMatrix");
  const tAlloc = useTranslations("allocation");
  const locale = useLocale();

  const visibleIds = locale === "en"
    ? ASSET_CLASS_IDS.filter((id) => !EN_HIDDEN.includes(id))
    : ASSET_CLASS_IDS;
  const visibleIndices = visibleIds.map((id) => ASSET_CLASS_IDS.indexOf(id));
  const labels = visibleIds.map((id) => tAlloc(ASSET_KEYS[id]));

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t("description")}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr>
              <th className="p-1.5" />
              {labels.map((label, i) => (
                <th key={i} className="p-1.5 text-center font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleIds.map((rowId, li) => {
              const i = visibleIndices[li];
              return (
                <tr key={rowId}>
                  <td className="p-1.5 font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap pr-3">
                    {labels[li]}
                  </td>
                  {visibleIndices.map((j) => {
                    const v = CORRELATION_MATRIX[i][j];
                    return (
                      <td
                        key={j}
                        className={`p-1.5 text-center rounded ${cellColor(v)}`}
                      >
                        {v === 1 ? "—" : v.toFixed(3)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-400 dark:text-gray-500 space-y-0.5">
        <p>{t("source")} / {t("period")}</p>
        <p>{t("note")}</p>
      </div>
    </div>
  );
}
