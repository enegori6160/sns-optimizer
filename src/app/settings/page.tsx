"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  // 認証情報を取得
  const { isAuthenticated, isLoading, userEmail } = useAuth();

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
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">設定</h1>
          <Link
            href="/dashboard"
            className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-300"
          >
            ダッシュボードへ戻る
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-200 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">アカウント</h2>
            <p className="text-sm text-slate-600 mt-1">ログイン中: {userEmail}</p>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-700">通知メール</label>
              <input type="checkbox" className="toggle toggle-primary" disabled />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-700">ダークモード</label>
              <input type="checkbox" className="toggle toggle-primary" disabled />
            </div>
          </div>

          <p className="text-xs text-slate-500">※ デモ版のため設定は無効です。</p>
        </div>
      </div>
    </div>
  );
}


