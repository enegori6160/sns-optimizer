
"use client"; 

import React from "react";
import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ──────────────────────────────────────────────────────────────
// ダミーデータ（CSV/APIに置換可能）
// ──────────────────────────────────────────────────────────────
const rawDaily = [
  // date, platform, impressions, clicks, cost, conversions, revenue, age, gender
  { date: "2025-08-18", platform: "Instagram", impressions: 12000, clicks: 320, cost: 42000, conversions: 36, revenue: 98000, age: "25-34", gender: "F"},
  { date: "2025-08-18", platform: "TikTok",    impressions: 15000, clicks: 260, cost: 35000, conversions: 18, revenue: 42000, age: "18-24", gender: "F"},
  { date: "2025-08-18", platform: "Facebook",  impressions:  9000, clicks: 110, cost: 24000, conversions: 10, revenue: 21000, age: "35-44", gender: "M"},

  { date: "2025-08-19", platform: "Instagram", impressions: 13000, clicks: 340, cost: 43000, conversions: 38, revenue:102000, age: "25-34", gender: "F"},
  { date: "2025-08-19", platform: "TikTok",    impressions: 16000, clicks: 255, cost: 36000, conversions: 17, revenue: 40000, age: "18-24", gender: "F"},
  { date: "2025-08-19", platform: "Facebook",  impressions:  9500, clicks: 120, cost: 23000, conversions: 11, revenue: 22000, age: "35-44", gender: "M"},

  { date: "2025-08-20", platform: "Instagram", impressions: 14000, clicks: 355, cost: 45000, conversions: 40, revenue:110000, age: "25-34", gender: "F"},
  { date: "2025-08-20", platform: "TikTok",    impressions: 16500, clicks: 250, cost: 37000, conversions: 16, revenue: 38000, age: "18-24", gender: "M"},
  { date: "2025-08-20", platform: "Facebook",  impressions: 10000, clicks: 118, cost: 23500, conversions: 10, revenue: 20500, age: "45-54", gender: "M"},

  { date: "2025-08-21", platform: "Instagram", impressions: 15000, clicks: 370, cost: 47000, conversions: 42, revenue:116000, age: "25-34", gender: "F"},
  { date: "2025-08-21", platform: "TikTok",    impressions: 17000, clicks: 245, cost: 37500, conversions: 15, revenue: 36000, age: "18-24", gender: "M"},
  { date: "2025-08-21", platform: "Facebook",  impressions: 11000, clicks: 130, cost: 24500, conversions: 12, revenue: 23000, age: "45-54", gender: "M"},

  { date: "2025-08-22", platform: "Instagram", impressions: 15800, clicks: 380, cost: 48000, conversions: 43, revenue:120000, age: "25-34", gender: "F"},
  { date: "2025-08-22", platform: "TikTok",    impressions: 17500, clicks: 240, cost: 38000, conversions: 14, revenue: 34000, age: "18-24", gender: "M"},
  { date: "2025-08-22", platform: "Facebook",  impressions: 11500, clicks: 128, cost: 25000, conversions: 11, revenue: 22000, age: "45-54", gender: "M"},
];

// ──────────────────────────────────────────────────────────────
// 指標計算ヘルパー
// ──────────────────────────────────────────────────────────────
const byPlatform = (rows: typeof rawDaily) => {
  const acc: Record<string, any> = {};
  for (const r of rows) {
    const k = r.platform;
    if (!acc[k]) acc[k] = { platform: k, impressions: 0, clicks: 0, cost: 0, conversions: 0, revenue: 0 };
    acc[k].impressions += r.impressions;
    acc[k].clicks      += r.clicks;
    acc[k].cost        += r.cost;
    acc[k].conversions += r.conversions;
    acc[k].revenue     += r.revenue;
  }
  return Object.values(acc).map((x: any) => ({
    ...x,
    ctr: x.clicks / Math.max(1, x.impressions),
    cvr: x.conversions / Math.max(1, x.clicks),
    cpa: x.conversions ? x.cost / x.conversions : 0,
    roas: x.cost ? x.revenue / x.cost : 0,
    skipRate: 1 - (x.clicks / Math.max(1, x.impressions)),
  }));
};

const ema = (values: number[], alpha: number) => {
  let v: number | null = null;
  for (const x of values) v = v === null ? x : alpha * x + (1 - alpha) * v;
  return v ?? 0;
};

// 提案配分（費用対効果(ROAS)のEMA比例 + 探索5% + 上下限 5%-60%）
const proposeAllocation = (stats: any[], totalBudget: number, window = 5) => {
  const alpha = 2 / (window + 1);
  // 簡易：過去からのroas推移がないので、合算ROASをそのままEMA扱い
  const roases = stats.map(s => s.roas);
  const base = roases.reduce((a,b)=>a+b,0) === 0
    ? Array(stats.length).fill(1/stats.length)
    : roases.map(r => r / roases.reduce((a,b)=>a+b,0));

  const exploration = 0.05;
  let w = base.map((b) => (1 - exploration) * b + exploration * (1 / base.length));
  const MIN = 0.05, MAX = 0.60;
  w = w.map(x => Math.min(MAX, Math.max(MIN, x)));
  const sum = w.reduce((a,b)=>a+b,0);
  w = w.map(x => x / sum);

  return stats.map((s, i) => ({
    platform: s.platform,
    ratio: w[i],
    budget: Math.round(w[i] * totalBudget),
  }));
};

// セグメント（年齢×性別）の集計
const bySegment = (rows: typeof rawDaily, platform: string) => {
  const acc: Record<string, any> = {};
  for (const r of rows.filter(r => r.platform === platform)) {
    const k = `${r.age}-${r.gender}`;
    if (!acc[k]) acc[k] = { key: k, age: r.age, gender: r.gender, impressions: 0, clicks: 0, cost: 0, conversions: 0, revenue: 0 };
    acc[k].impressions += r.impressions;
    acc[k].clicks      += r.clicks;
    acc[k].cost        += r.cost;
    acc[k].conversions += r.conversions;
    acc[k].revenue     += r.revenue;
  }
  return Object.values(acc).map((x: any) => ({
    ...x,
    clickRate: x.clicks / Math.max(1, x.impressions),
    purchaseRate: x.conversions / Math.max(1, x.clicks),
    costPerAcq: x.conversions ? x.cost / x.conversions : 0,
    efficiency: x.cost ? x.revenue / x.cost : 0,
  }));
};

// ──────────────────────────────────────────────────────────────
// UI
// ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [totalBudget, setTotalBudget] = useState(300000);
  const stats = useMemo(() => byPlatform(rawDaily), []);
  const proposal = useMemo(() => proposeAllocation(stats, totalBudget, 5), [stats, totalBudget]);
  const platformTrend = useMemo(() => {
    // 折れ線：日別の費用対効果
    const byDate: Record<string, any> = {};
    for (const r of rawDaily) {
      const key = r.date;
      if (!byDate[key]) byDate[key] = { date: key, Instagram: 0, TikTok: 0, Facebook: 0, cInstagram:0,cTikTok:0,cFacebook:0 };
      const roas = r.cost ? r.revenue / r.cost : 0;
      const cap = (p: string) => {
        const k = `c${p}` as const;
        const v = (byDate[key][k] ?? 0) + 1;
        byDate[key][k] = v;
        byDate[key][p] = ((byDate[key][p] ?? 0) * (v-1) + roas) / v;
      };
      cap(r.platform as any);
    }
    return Object.values(byDate).sort((a:any,b:any)=>a.date.localeCompare(b.date));
  }, []);

  const colors = ["#64748b", "#22c55e", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"]; // デフォ色（Tailwind系）

  const aiSummary = useMemo(() => {
    const best = [...stats].sort((a,b)=>b.roas - a.roas)[0]?.platform;
    const worst = [...stats].sort((a,b)=>a.roas - b.roas)[0]?.platform;
    const igSeg = bySegment(rawDaily, "Instagram").sort((a,b)=>b.efficiency - a.efficiency)[0];
    return `本日の提案は「${proposal.map(p=>`${p.platform}${Math.round(p.ratio*100)}%`).join(" / ") }」。` +
           `${best}が費用対効果で最良。${worst}は獲得コストが高めのため抑制推奨。` +
           (igSeg ? `Instagramでは「${igSeg.age}${igSeg.gender === "F" ? "女性" : "男性"}」が高反応。` : "");
  }, [stats, proposal]);

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
              onChange={(e)=>setTotalBudget(parseInt(e.target.value || "0",10))}
              className="rounded-xl border px-3 py-2 w-40"
            />
          </div>
        </header>

        {/* 今日の提案配分 */}
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
                  <span className="text-sm text-slate-600">{Math.round(p.ratio*100)}% / {p.budget.toLocaleString()}円</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="h-3" style={{width: `${Math.round(p.ratio*100)}%`, background: colors[i % colors.length]}} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-900 text-sm">
            💡 {aiSummary}
          </div>
        </section>

        {/* SNSごとのカード */}
        <section className="grid md:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={s.platform} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{s.platform}</h3>
                <span className="text-xs text-slate-500">表示 {s.impressions.toLocaleString()}</span>
              </div>
              <div className="text-sm grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-slate-500">クリック率</div>
                  <div className="text-lg font-semibold">{(s.ctr*100).toFixed(2)}%</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-slate-500">購入率</div>
                  <div className="text-lg font-semibold">{(s.cvr*100).toFixed(2)}%</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-slate-500">1件あたりの獲得コスト</div>
                  <div className="text-lg font-semibold">¥{Math.round(s.cpa).toLocaleString()}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-slate-500">費用対効果</div>
                  <div className="text-lg font-semibold">{s.roas.toFixed(2)}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 col-span-2">
                  <div className="text-slate-500">スルー率（= 1 − クリック率）</div>
                  <div className="text-lg font-semibold">{(s.skipRate*100).toFixed(2)}%</div>
                </div>
              </div>
              {/* セグメント（年齢×性別）簡易棒グラフ */}
              <div className="h-40">
                <ResponsiveContainer>
                  <BarChart data={bySegment(rawDaily, s.platform)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="key" hide />
                    <YAxis hide />
                    <Tooltip formatter={(v:any)=>typeof v==="number"?v.toFixed(2):v} />
                    <Bar dataKey="efficiency" fill={colors[i % colors.length]} radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-slate-500 mt-1">（年齢×性別の費用対効果）</div>
            </div>
          ))}
        </section>

        {/* 費用対効果の推移 */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">費用対効果の推移（過去日別）</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={platformTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Instagram" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="TikTok" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Facebook" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 男女比（円グラフ）例：全体のクリック分布 */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-medium mb-2">男女別のクリック分布（全体）</h2>
          <div className="h-60">
            <ResponsiveContainer>
              <PieChart>
                {(() => {
                  const agg = rawDaily.reduce((m, r) => {
                    const k = r.gender;
                    m[k] = (m[k] || 0) + r.clicks;
                    return m;
                  }, {} as Record<string, number>);
                  const data = Object.entries(agg).map(([name, value]) => ({ name: name === "F" ? "女性" : name === "M" ? "男性" : "不明", value }));
                  return (
                    <>
                      <Pie data={data} dataKey="value" nameKey="name" outerRadius={100}>
                        {data.map((_, i) => (
                          <Cell key={i} fill={colors[i % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </>
                  );
                })()}
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <footer className="text-xs text-slate-400 text-center py-6">MVP sample — CSV/APIに置換して実データ化できます</footer>
      </div>
    </div>
  );
}
