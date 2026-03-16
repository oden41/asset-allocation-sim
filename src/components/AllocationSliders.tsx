"use client";

import { useTranslations } from "next-intl";
import { AssetClassId } from "@/types";
import { ASSET_CLASS_IDS } from "@/lib/asset-data";

interface Props {
  allocations: Record<AssetClassId, number>;
  onChange: (allocations: Record<AssetClassId, number>) => void;
}

const COLORS: Record<AssetClassId, string> = {
  cash: "bg-gray-400",
  foreignStock: "bg-blue-500",
  japanStock: "bg-red-500",
  foreignBond: "bg-cyan-500",
  japanBond: "bg-green-500",
  gold: "bg-yellow-500",
  bitcoin: "bg-orange-500",
};

export default function AllocationSliders({ allocations, onChange }: Props) {
  const t = useTranslations("allocation");

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
        {ASSET_CLASS_IDS.map(
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

      {ASSET_CLASS_IDS.map((id) => (
        <div key={id} className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-sm shrink-0 ${COLORS[id]}`} />
          <span className="text-sm w-24 shrink-0">{t(id)}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={allocations[id]}
            onChange={(e) => handleChange(id, Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-mono w-10 text-right">{allocations[id]}%</span>
        </div>
      ))}
    </div>
  );
}
