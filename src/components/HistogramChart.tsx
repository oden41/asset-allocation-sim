"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface Props {
  finalValues: number[];
  median: number;
}

function formatAmount(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 10000) return `${(value / 10000).toFixed(1)}億`;
  return `${Math.round(value)}`;
}

export default function HistogramChart({ finalValues, median }: Props) {
  const t = useTranslations("results");
  const [logScale, setLogScale] = useState(false);

  const numBins = 40;
  const positiveValues = finalValues.filter((v) => v > 0);
  const sorted = [...positiveValues].sort((a, b) => a - b);
  const n = sorted.length;

  // P1〜P99の範囲でビン作成
  const p1  = sorted[Math.max(0, Math.floor(0.01 * (n - 1)))];
  const p99 = sorted[Math.min(n - 1, Math.ceil(0.99 * (n - 1)))];

  const bins: { midpoint: number; count: number }[] = logScale
    ? (() => {
        // 対数スペースで等幅ビン（log-normal分布に最適）
        const logMin = Math.log(Math.max(p1, 1));
        const logMax = Math.log(Math.max(p99, 1));
        const logBinWidth = (logMax - logMin) / numBins || 0.1;
        return Array.from({ length: numBins }, (_, i) => ({
          midpoint: Math.exp(logMin + (i + 0.5) * logBinWidth),
          count: 0,
        }));
      })()
    : (() => {
        const binWidth = (p99 - p1) / numBins || 1;
        return Array.from({ length: numBins }, (_, i) => ({
          midpoint: p1 + (i + 0.5) * binWidth,
          count: 0,
        }));
      })();

  for (const v of positiveValues) {
    if (logScale) {
      const logMin = Math.log(Math.max(p1, 1));
      const logMax = Math.log(Math.max(p99, 1));
      const logBinWidth = (logMax - logMin) / numBins || 0.1;
      const logV = Math.log(Math.max(v, 1));
      const idx = Math.min(numBins - 1, Math.max(0, Math.floor((logV - logMin) / logBinWidth)));
      bins[idx].count++;
    } else {
      const binWidth = (p99 - p1) / numBins || 1;
      if (v < p1) { bins[0].count++; }
      else if (v > p99) { bins[numBins - 1].count++; }
      else {
        const idx = Math.min(numBins - 1, Math.floor((v - p1) / binWidth));
        bins[idx].count++;
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">{t("histogram")}</h3>
        <button
          onClick={() => setLogScale((v) => !v)}
          className={`rounded px-3 py-1 text-xs font-medium transition ${
            logScale
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {logScale ? t("logScale") : t("linearScale")}
        </button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={bins} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="midpoint"
            tickFormatter={formatAmount}
            label={{ value: t("tenThousandYen"), position: "insideBottom", offset: -10 }}
            tickCount={6}
          />
          <YAxis label={{ value: t("frequency"), angle: -90, position: "insideLeft" }} />
          <Tooltip
            formatter={(value) => [value as number, t("frequency")]}
            labelFormatter={(label) => `~${formatAmount(Number(label))} ${t("tenThousandYen")}`}
          />
          <Bar dataKey="count" fill="#3b82f6" fillOpacity={0.7} isAnimationActive={false} />
          <ReferenceLine
            x={median}
            stroke="#dc2626"
            strokeWidth={2}
            strokeDasharray="4 4"
            label={{ value: t("median"), position: "top", fill: "#dc2626", fontSize: 12 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
