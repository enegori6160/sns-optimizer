import React from "react";

interface HeaderProps {
  totalBudget: number;
  onBudgetChange: (budget: number) => void;
  onLogout: () => void;
  userEmail?: string;
}

export const Header: React.FC<HeaderProps> = ({
  totalBudget,
  onBudgetChange,
  onLogout,
  userEmail
}) => {
  return (
    <header className="bg-white rounded-2xl p-6 shadow-soft border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* ロゴ */}
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              SNS最適化ダッシュボード
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              会員限定サービス {userEmail && `- ${userEmail}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
              今日の総予算
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">¥</span>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => onBudgetChange(parseInt(e.target.value || "0", 10))}
                className="pl-8 pr-3 py-2 w-32 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-right"
                min="0"
                step="1000"
              />
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-300 hover:border-slate-400"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
};
