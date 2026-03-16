"use client";

import { useTranslations } from "next-intl";
import { MonthlyPercentiles } from "@/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: MonthlyPercentiles[];
}

function formatAmount(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}億`;
  return `${Math.round(value)}`;
}

export default function PercentileBandChart({ data }: Props) {
  const t = useTranslations("results");

  // 月→年に変換し、12ヶ月ごとにサンプリング
  const chartData = data
    .filter((d) => d.month % 12 === 0)
    .map((d) => ({
      year: d.month / 12,
      p5: Math.round(d.p5),
      p25: Math.round(d.p25),
      p50: Math.round(d.p50),
      p75: Math.round(d.p75),
      p95: Math.round(d.p95),
    }));

  return (
    <div>
      <h3 className="text-base font-semibold mb-3">{t("percentileChart")}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="year"
            label={{ value: t("year"), position: "insideBottom", offset: -2 }}
          />
          <YAxis tickFormatter={formatAmount} />
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString()} ${t("tenThousandYen")}`, ""]}
            labelFormatter={(label) => `${label}${t("year")}`}
          />
          {/* 90%信頼区間 (p5-p95) */}
          <Area
            type="monotone"
            dataKey="p95"
            stroke="none"
            fill="#3b82f6"
            fillOpacity={0.15}
            name="95th"
          />
          <Area
            type="monotone"
            dataKey="p5"
            stroke="none"
            fill="#ffffff"
            fillOpacity={1}
            name="5th"
          />
          {/* 50%信頼区間 (p25-p75) */}
          <Area
            type="monotone"
            dataKey="p75"
            stroke="none"
            fill="#3b82f6"
            fillOpacity={0.3}
            name="75th"
          />
          <Area
            type="monotone"
            dataKey="p25"
            stroke="none"
            fill="#ffffff"
            fillOpacity={1}
            name="25th"
          />
          {/* 中央値 */}
          <Area
            type="monotone"
            dataKey="p50"
            stroke="#2563eb"
            strokeWidth={2}
            fill="none"
            name={t("median")}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
