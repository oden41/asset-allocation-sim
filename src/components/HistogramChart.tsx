"use client";

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
  if (value >= 10000) return `${(value / 10000).toFixed(1)}億`;
  if (value <= -10000) return `${(value / 10000).toFixed(1)}億`;
  return `${Math.round(value)}`;
}

export default function HistogramChart({ finalValues, median }: Props) {
  const t = useTranslations("results");

  // 外れ値を除外してビン範囲を決定（P1〜P99）
  const sorted = [...finalValues].sort((a, b) => a - b);
  const n = sorted.length;
  const p1 = sorted[Math.floor(0.01 * (n - 1))];
  const p99 = sorted[Math.min(Math.ceil(0.99 * (n - 1)), n - 1)];
  const range = p99 - p1 || 1;

  const numBins = 40;
  const binWidth = range / numBins;

  const bins: { midpoint: number; count: number }[] = Array.from({ length: numBins }, (_, i) => ({
    midpoint: p1 + (i + 0.5) * binWidth,
    count: 0,
  }));

  let clippedLow = 0;
  let clippedHigh = 0;

  for (const v of finalValues) {
    if (v < p1) {
      clippedLow++;
    } else if (v > p99) {
      clippedHigh++;
    } else {
      const idx = Math.min(Math.floor((v - p1) / binWidth), numBins - 1);
      bins[idx].count++;
    }
  }

  // 端のビンに外れ値を加算して表示
  if (clippedLow > 0) bins[0].count += clippedLow;
  if (clippedHigh > 0) bins[numBins - 1].count += clippedHigh;

  return (
    <div>
      <h3 className="text-base font-semibold mb-3">{t("histogram")}</h3>
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
