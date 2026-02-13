import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  } from "recharts";
// 型定義と集計関数をインポート
import { PlatformStats, aggregateBySegment, DailyData } from "@/lib/analytics";

  interface PlatformCardProps {
    stats: PlatformStats;
    index: number;
    rawData: DailyData[];
  }

const colors = ["#64748b", "#22c55e", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];

  export const PlatformCard: React.FC<PlatformCardProps> = ({ stats, index, rawData }) => {
    // プラットフォームごとのセグメント集計をメモ化
    const segmentData = useMemo(
      () => aggregateBySegment(rawData, stats.platform),
      [rawData, stats.platform]
    );
    return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{stats.platform}</h3>
        <span className="text-xs text-slate-500">
          表示 {stats.impressions.toLocaleString()}
        </span>
      </div>
      <div className="text-sm grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-slate-500">クリック率</div>
          <div className="text-lg font-semibold">
            {(stats.ctr * 100).toFixed(2)}%
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-slate-500">購入率</div>
          <div className="text-lg font-semibold">
            {(stats.cvr * 100).toFixed(2)}%
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-slate-500">1件あたりの獲得コスト</div>
          <div className="text-lg font-semibold">
            ¥{Math.round(stats.cpa).toLocaleString()}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-slate-500">クリック単価 (CPC)</div>
          <div className="text-lg font-semibold">
            {Number.isFinite(stats.cpc) ? `¥${Math.round(stats.cpc).toLocaleString()}` : "—"}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 col-span-2">
          <div className="text-slate-500">費用対効果</div>
          <div className="text-lg font-semibold">{stats.roas.toFixed(2)}</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 col-span-2">
          <div className="text-slate-500">スルー率（= 1 − クリック率）</div>
          <div className="text-lg font-semibold">
            {(stats.skipRate * 100).toFixed(2)}%
          </div>
        </div>
      </div>
      {/* セグメント（年齢×性別）簡易棒グラフ */}
      <div className="h-40">
          <ResponsiveContainer>
            <BarChart data={segmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="key" hide />
            <YAxis hide />
            <Tooltip
              formatter={(v: number | string) =>
                typeof v === "number" ? v.toFixed(2) : v
              }
            />
            <Bar
              dataKey="efficiency"
              fill={colors[index % colors.length]}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-slate-500 mt-1">
        （年齢×性別の費用対効果）
      </div>
    </div>
  );
}; 
