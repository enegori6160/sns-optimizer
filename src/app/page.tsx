
"use client"; 

import React, { useMemo, useState } from "react";
import { BudgetProposal } from "../components/BudgetProposal";
import { PlatformCard } from "../components/PlatformCard";
import { ROASTrendChart } from "../components/ROASTrendChart";
import { GenderDistributionChart } from "../components/GenderDistributionChart";
import {
  byPlatform,
  proposeAllocation,
  getPlatformTrend,
  generateAISummary,
  rawDaily,
} from "../utils/dataProcessing";

export default function Dashboard() {
  const [totalBudget, setTotalBudget] = useState(300000);
  
  const stats = useMemo(() => byPlatform(rawDaily), []);
  const proposal = useMemo(() => proposeAllocation(stats, totalBudget, 5), [stats, totalBudget]);
  const platformTrend = useMemo(() => getPlatformTrend(), []);
  const aiSummary = useMemo(() => generateAISummary(stats, proposal), [stats, proposal]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">広告配分ダッシュボード（MVP）</h1>
          <div className="flex items-center gap-4">
            <label className="text-sm">今日の総予算（円）</label>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(parseInt(e.target.value || "0", 10))}
              className="rounded-xl border px-3 py-2 w-40"
            />
          </div>
        </header>

        {/* 今日の提案配分 */}
        <BudgetProposal proposal={proposal} aiSummary={aiSummary} />

        {/* SNSごとのカード */}
        <section className="grid md:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <PlatformCard key={s.platform} stats={s} index={i} />
          ))}
        </section>

        {/* 費用対効果の推移 */}
        <ROASTrendChart platformTrend={platformTrend} />

        {/* 男女比（円グラフ）例：全体のクリック分布 */}
        <GenderDistributionChart />

        <footer className="text-xs text-slate-400 text-center py-6">
          MVP sample — CSV/APIに置換して実データ化できます
        </footer>
      </div>
    </div>
  );
}
