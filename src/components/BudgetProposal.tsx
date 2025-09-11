import React from "react";
// 予算配分結果の型をインポート
import { BudgetAllocation } from "@/lib/analytics";

interface BudgetProposalProps {
  proposal: BudgetAllocation[];
  aiSummary: string;
}

const colors = ["#64748b", "#22c55e", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];

export const BudgetProposal: React.FC<BudgetProposalProps> = ({ proposal, aiSummary }) => {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">今日の提案配分</h2>
        <span className="text-sm text-slate-500">（費用対効果に基づく自動提案）</span>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {proposal.map((p, i) => (
          <div key={p.platform} className="rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{p.platform}</span>
              <span className="text-sm text-slate-600">
                {Math.round(p.ratio * 100)}% / {p.budget.toLocaleString()}円
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3"
                style={{
                  width: `${Math.round(p.ratio * 100)}%`,
                  background: colors[i % colors.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-900 text-sm">
        💡 {aiSummary}
      </div>
    </section>
  );
}; 