"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MonthlyPercentiles } from "@/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface Props {
  data: MonthlyPercentiles[];
  withdrawalStartYear?: number;
}

function formatAmountJa(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}億`;
  return `${Math.round(value)}`;
}

function formatAmountEn(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000000) return `${(value / 1000000).toFixed(1)}B`;
  if (abs >= 1000) return `${(value / 1000).toFixed(1)}M`;
  return `${Math.round(value)}`;
}

export default function PercentileBandChart({ data, withdrawalStartYear }: Props) {
  const t = useTranslations("results");
  const locale = useLocale();
  const formatAmount = locale === "en" ? formatAmountEn : formatAmountJa;
  const [logScale, setLogScale] = useState(false);

  const chartData = data
    .filter((d) => d.month % 12 === 0)
    .map((d) => ({
      year: d.month / 12,
      // Clamp to 1 in log scale to avoid log(0)
      p5:  logScale ? Math.max(d.p5,  1) : d.p5,
      p25: logScale ? Math.max(d.p25, 1) : d.p25,
      p50: logScale ? Math.max(d.p50, 1) : d.p50,
      p75: logScale ? Math.max(d.p75, 1) : d.p75,
      p95: logScale ? Math.max(d.p95, 1) : d.p95,
    }));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">{t("percentileChart")}</h3>
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
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData} margin={{ top: 24, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="year"
            label={{ value: t("year"), position: "insideBottom", offset: -10 }}
          />
          <YAxis
            tickFormatter={formatAmount}
            scale={logScale ? "log" : "auto"}
            domain={logScale ? ["auto", "auto"] : [0, "auto"]}
            allowDataOverflow={false}
          />
          <Tooltip
            formatter={(value) => [`${formatAmount(Number(value))} ${t("tenThousandYen")}`, ""]}
            labelFormatter={(label) => `${label}${t("year")}`}
          />
          {/* 90% band (p5–p95): light fill */}
          <Area type="monotone" dataKey="p95" stroke="none" fill="#3b82f6" fillOpacity={0.15} isAnimationActive={false} />
          <Area type="monotone" dataKey="p5"  stroke="none" fill="white"  fillOpacity={1}    isAnimationActive={false} />
          {/* 50% band (p25–p75): darker fill */}
          <Area type="monotone" dataKey="p75" stroke="none" fill="#3b82f6" fillOpacity={0.35} isAnimationActive={false} />
          <Area type="monotone" dataKey="p25" stroke="none" fill="white"  fillOpacity={1}    isAnimationActive={false} />
          {/* Median */}
          <Area type="monotone" dataKey="p50" stroke="#2563eb" strokeWidth={2} fill="none" isAnimationActive={false} />
          {withdrawalStartYear && withdrawalStartYear > 0 ? (
            <ReferenceLine
              x={withdrawalStartYear}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{
                value: t("withdrawalStart"),
                position: "top",
                fill: "#ef4444",
                fontSize: 12,
              }}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
