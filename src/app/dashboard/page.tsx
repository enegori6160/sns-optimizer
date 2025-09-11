"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BudgetProposal } from "@/components/BudgetProposal";
import { PlatformCard } from "@/components/PlatformCard";
import { ROASTrendChart } from "@/components/ROASTrendChart";
import { GenderDistributionChart } from "@/components/GenderDistributionChart";
import {
  aggregateByPlatform,
  calculateBudgetAllocation,
  calculatePlatformTrend,
  createAISummary,
} from "@/lib/analytics";
import { useAuth } from "@/hooks/useAuth";
import { useRawDailyData } from "@/hooks/useRawDailyData";

export default function Dashboard() {
  const [totalBudget, setTotalBudget] = useState(300000);
  const router = useRouter();
  const { isAuthenticated, isLoading, userEmail } = useAuth();
  const { data: rawData, isLoading: isDataLoading } = useRawDailyData();

  // ダミーデータから各種指標を算出
  const stats = useMemo(() => aggregateByPlatform(rawData), [rawData]);
  const proposal = useMemo(
    () => calculateBudgetAllocation(stats, totalBudget, 5),
    [stats, totalBudget]
  );
  const platformTrend = useMemo(
    () => calculatePlatformTrend(rawData),
    [rawData]
  );
  const aiSummary = useMemo(
    () => createAISummary(stats, proposal, rawData),
    [stats, proposal, rawData]
  );

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    router.push("/login");
  };

  const handleBudgetChange = (budget: number) => {
    setTotalBudget(budget);
  };

    if (isLoading || isDataLoading) {
      return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

    if (!isAuthenticated) {
      return null;
    }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <Header
          totalBudget={totalBudget}
          onBudgetChange={handleBudgetChange}
          onLogout={handleLogout}
          userEmail={userEmail}
        />

        {/* 今日の提案配分 */}
        <BudgetProposal proposal={proposal} aiSummary={aiSummary} />

        {/* SNSごとのカード */}
          <section className="grid md:grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <PlatformCard key={s.platform} stats={s} index={i} rawData={rawData} />
            ))}
          </section>

          {/* 費用対効果の推移 */}
          <ROASTrendChart platformTrend={platformTrend} />

          {/* 男女比（円グラフ）例：全体のクリック分布 */}
          <GenderDistributionChart data={rawData} />

        <footer className="text-xs text-slate-400 text-center py-6">
          会員限定サービス — CSV/APIに置換して実データ化できます
        </footer>
      </div>
    </div>
  );
}
