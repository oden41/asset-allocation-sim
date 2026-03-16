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

export default function HistogramChart({ finalValues, median }: Props) {
  const t = useTranslations("results");

  // ヒストグラムのビンを作成
  const numBins = 40;
  const min = Math.min(...finalValues);
  const max = Math.max(...finalValues);
  const binWidth = (max - min) / numBins || 1;

  const bins: { range: number; count: number; label: string }[] = [];
  for (let i = 0; i < numBins; i++) {
    const lower = min + i * binWidth;
    bins.push({
      range: Math.round(lower + binWidth / 2),
      count: 0,
      label: `${Math.round(lower)}–${Math.round(lower + binWidth)}`,
    });
  }

  for (const v of finalValues) {
    const idx = Math.min(Math.floor((v - min) / binWidth), numBins - 1);
    bins[idx].count++;
  }

  function formatAmount(value: number): string {
    if (value >= 10000) return `${(value / 10000).toFixed(1)}億`;
    return `${Math.round(value)}`;
  }

  return (
    <div>
      <h3 className="text-base font-semibold mb-3">{t("histogram")}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={bins} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="range"
            tickFormatter={formatAmount}
            label={{ value: t("tenThousandYen"), position: "insideBottom", offset: -2 }}
          />
          <YAxis label={{ value: t("frequency"), angle: -90, position: "insideLeft" }} />
          <Tooltip
            formatter={(value) => [value as number, t("frequency")]}
            labelFormatter={(label) => `${Number(label).toLocaleString()} ${t("tenThousandYen")}`}
          />
          <Bar dataKey="count" fill="#3b82f6" fillOpacity={0.7} />
          <ReferenceLine
            x={Math.round(median)}
            stroke="#dc2626"
            strokeWidth={2}
            strokeDasharray="4 4"
            label={{ value: t("median"), position: "top", fill: "#dc2626" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
