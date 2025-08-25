"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "../../components/Header";
import { BudgetProposal } from "../../components/BudgetProposal";
import { PlatformCard } from "../../components/PlatformCard";
import { ROASTrendChart } from "../../components/ROASTrendChart";
import { GenderDistributionChart } from "../../components/GenderDistributionChart";
import {
  byPlatform,
  proposeAllocation,
  getPlatformTrend,
  generateAISummary,
  rawDaily,
} from "../../utils/dataProcessing";

export default function Dashboard() {
  const [totalBudget, setTotalBudget] = useState(300000);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const router = useRouter();
  
  const stats = useMemo(() => byPlatform(rawDaily), []);
  const proposal = useMemo(() => proposeAllocation(stats, totalBudget, 5), [stats, totalBudget]);
  const platformTrend = useMemo(() => getPlatformTrend(), []);
  const aiSummary = useMemo(() => generateAISummary(stats, proposal), [stats, proposal]);

  useEffect(() => {
    // 認証チェック
    const checkAuth = () => {
      const auth = localStorage.getItem("isAuthenticated");
      const email = localStorage.getItem("userEmail");
      
      if (auth === "true" && email) {
        setIsAuthenticated(true);
        setUserEmail(email);
      } else {
        router.push("/login");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    router.push("/login");
  };

  const handleBudgetChange = (budget: number) => {
    setTotalBudget(budget);
  };

  if (isLoading) {
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
            <PlatformCard key={s.platform} stats={s} index={i} />
          ))}
        </section>

        {/* 費用対効果の推移 */}
        <ROASTrendChart platformTrend={platformTrend} />

        {/* 男女比（円グラフ）例：全体のクリック分布 */}
        <GenderDistributionChart />

        <footer className="text-xs text-slate-400 text-center py-6">
          会員限定サービス — CSV/APIに置換して実データ化できます
        </footer>
      </div>
    </div>
  );
}
