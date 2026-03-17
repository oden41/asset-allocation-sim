"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { AssetClassId } from "@/types";
import { ASSET_CLASS_IDS } from "@/lib/asset-data";

interface Props {
  allocations: Record<AssetClassId, number>;
  visibleIds?: AssetClassId[];
  onChange: (allocations: Record<AssetClassId, number>) => void;
}

const COLORS: Record<AssetClassId, string> = {
  cash:         "bg-gray-400",
  foreignStock: "bg-blue-500",
  japanStock:   "bg-red-500",
  bond:         "bg-cyan-500",
  gold:         "bg-yellow-500",
  bitcoin:      "bg-orange-500",
};

/** 入力中は文字列として保持し、フォーカスが外れた時のみ数値に変換 */
function AllocationInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [str, setStr] = useState(String(value));
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) setStr(String(value));
  }, [value]);

  return (
    <input
      type="number"
      min={0}
      max={100}
      value={str}
      onChange={(e) => setStr(e.target.value)}
      onFocus={() => { isFocused.current = true; }}
      onBlur={() => {
        isFocused.current = false;
        const num = Math.min(100, Math.max(0, parseInt(str, 10) || 0));
        onChange(num);
        setStr(String(num));
      }}
      className="w-14 rounded border border-gray-300 px-1 py-0.5 text-sm font-mono text-right dark:border-gray-600 dark:bg-gray-800"
    />
  );
}

export default function AllocationSliders({ allocations, visibleIds, onChange }: Props) {
  const t = useTranslations("allocation");

  const displayIds = visibleIds ?? ASSET_CLASS_IDS;
  const total = ASSET_CLASS_IDS.reduce((sum, id) => sum + allocations[id], 0);
  const isValid = total === 100;

  const handleChange = (id: AssetClassId, value: number) => {
    onChange({ ...allocations, [id]: value });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <span className={`text-sm font-mono ${isValid ? "text-green-600" : "text-red-500 font-bold"}`}>
          {t("total")}: {total}%
        </span>
      </div>

      {/* 配分バー */}
      <div className="flex h-4 rounded overflow-hidden">
        {displayIds.map(
          (id) =>
            allocations[id] > 0 && (
              <div
                key={id}
                className={`${COLORS[id]} transition-all`}
                style={{ width: `${allocations[id]}%` }}
              />
            )
        )}
      </div>

      {displayIds.map((id) => (
        <div key={id} className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-sm shrink-0 ${COLORS[id]}`} />
          <span className="text-sm w-20 shrink-0">{t(id)}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={allocations[id]}
            onChange={(e) => handleChange(id, Number(e.target.value))}
            className="flex-1"
          />
          <AllocationInput value={allocations[id]} onChange={(v) => handleChange(id, v)} />
          <span className="text-sm text-gray-400">%</span>
        </div>
      ))}
    </div>
  );
}
