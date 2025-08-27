import React from "react";

interface HeaderProps {
  totalBudget: number;
  onBudgetChange: (budget: number) => void;
  onLogout: () => void;
  userEmail?: string;
}

import Link from "next/link";

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
          <Link
            href="/settings"
            className="p-2 rounded-lg hover:bg-slate-100 border border-slate-300 hover:border-slate-400 transition-colors"
            aria-label="設定"
            title="設定"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-slate-700"
            >
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 9.91 3H10a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0A1.65 1.65 0 0 0 21 10h.09a2 2 0 1 1 0 4H21a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
          </Link>
          
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
