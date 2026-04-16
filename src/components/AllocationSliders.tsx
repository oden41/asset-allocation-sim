"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AssetClassId } from "@/types";
import { ASSET_CLASS_IDS, PRESET_PORTFOLIOS } from "@/lib/asset-data";

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

/** Check if current allocations match a preset (comparing all asset class values) */
function matchPreset(allocations: Record<AssetClassId, number>, locale: string): string {
  for (const preset of PRESET_PORTFOLIOS) {
    // In English locale, normalize both sides: merge japanStock into foreignStock
    if (locale === "en") {
      const normCurrent = allocations.foreignStock + allocations.japanStock;
      const normPreset = preset.allocations.foreignStock + preset.allocations.japanStock;
      const match =
        normCurrent === normPreset &&
        ASSET_CLASS_IDS.every(
          (id) =>
            id === "foreignStock" || id === "japanStock" || allocations[id] === preset.allocations[id]
        );
      if (match) return preset.id;
    } else {
      const match = ASSET_CLASS_IDS.every(
        (id) => allocations[id] === preset.allocations[id]
      );
      if (match) return preset.id;
    }
  }
  return "custom";
}

export default function AllocationSliders({ allocations, visibleIds, onChange }: Props) {
  const t = useTranslations("allocation");
  const locale = useLocale();

  const [selectedPreset, setSelectedPreset] = useState(() => matchPreset(allocations, locale));

  const displayIds = visibleIds ?? ASSET_CLASS_IDS;
  const total = ASSET_CLASS_IDS.reduce((sum, id) => sum + allocations[id], 0);
  const isValid = total === 100;

  // Sync selectedPreset when allocations change externally
  useEffect(() => {
    setSelectedPreset(matchPreset(allocations, locale));
  }, [allocations, locale]);

  const handleChange = (id: AssetClassId, value: number) => {
    onChange({ ...allocations, [id]: value });
  };

  const handlePresetChange = (presetId: string) => {
    const preset = PRESET_PORTFOLIOS.find((p) => p.id === presetId);
    if (!preset) { setSelectedPreset("custom"); return; }

    let next = { ...preset.allocations };

    // In English locale, merge japanStock into foreignStock
    if (locale === "en" && next.japanStock > 0) {
      next = {
        ...next,
        foreignStock: next.foreignStock + next.japanStock,
        japanStock: 0,
      };
    }

    setSelectedPreset(presetId);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <span className={`text-sm font-mono ${isValid ? "text-green-600" : "text-red-500 font-bold"}`}>
          {t("total")}: {total}%
        </span>
      </div>

      {/* プリセット選択 */}
      <div className="flex items-center gap-2">
        <label htmlFor="preset-select" className="text-sm font-medium shrink-0">
          {t("preset.label")}:
        </label>
        <select
          id="preset-select"
          value={selectedPreset}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="custom">{t("preset.custom")}</option>
          {PRESET_PORTFOLIOS.map((p) => (
            <option key={p.id} value={p.id}>
              {t(`preset.${p.id}`)}
            </option>
          ))}
        </select>
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
