// ──────────────────────────────────────────────────────────────
// データ処理ユーティリティ
// ──────────────────────────────────────────────────────────────

export interface DailyData {
  date: string;
  platform: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  revenue: number;
  age: string;
  gender: string;
}

export interface PlatformStats {
  platform: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cvr: number;
  cpa: number;
  cpc: number;
  roas: number;
  skipRate: number;
}

export interface BudgetProposal {
  platform: string;
  ratio: number;
  budget: number;
}

export interface SegmentData {
  key: string;
  age: string;
  gender: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  revenue: number;
  clickRate: number;
  purchaseRate: number;
  costPerAcq: number;
  efficiency: number;
}

export interface PlatformTrend {
  date: string;
  Instagram: number;
  TikTok: number;
  Facebook: number;
  cInstagram: number;
  cTikTok: number;
  cFacebook: number;
}

// ダミーデータ（CSV/APIに置換可能）
export const rawDaily: DailyData[] = [
  // date, platform, impressions, clicks, cost, conversions, revenue, age, gender
  { date: "2025-08-18", platform: "Instagram", impressions: 12000, clicks: 320, cost: 42000, conversions: 36, revenue: 98000, age: "20代", gender: "F"},
  { date: "2025-08-18", platform: "TikTok",    impressions: 15000, clicks: 260, cost: 35000, conversions: 18, revenue: 42000, age: "10代", gender: "F"},
  { date: "2025-08-18", platform: "Facebook",  impressions:  9000, clicks: 110, cost: 24000, conversions: 10, revenue: 21000, age: "30代", gender: "M"},
  { date: "2025-08-18", platform: "Facebook",  impressions:  9000, clicks: 110, cost: 24000, conversions: 10, revenue: 21000, age: "50代", gender: "M"},

  { date: "2025-08-19", platform: "Instagram", impressions: 13000, clicks: 340, cost: 43000, conversions: 38, revenue:102000, age: "20代", gender: "F"},
  { date: "2025-08-19", platform: "TikTok",    impressions: 16000, clicks: 255, cost: 36000, conversions: 17, revenue: 40000, age: "10代", gender: "F"},
  { date: "2025-08-19", platform: "Facebook",  impressions:  9500, clicks: 120, cost: 23000, conversions: 11, revenue: 22000, age: "30代", gender: "M"},

  { date: "2025-08-20", platform: "Instagram", impressions: 14000, clicks: 355, cost: 45000, conversions: 40, revenue:110000, age: "20代", gender: "F"},
  { date: "2025-08-20", platform: "TikTok",    impressions: 16500, clicks: 250, cost: 37000, conversions: 16, revenue: 38000, age: "10代", gender: "F"},
  { date: "2025-08-20", platform: "Facebook",  impressions: 10000, clicks: 118, cost: 23500, conversions: 10, revenue: 20500, age: "30代", gender: "M"},

  { date: "2025-08-21", platform: "Instagram", impressions: 15000, clicks: 370, cost: 47000, conversions: 42, revenue:116000, age: "20代", gender: "F"},
  { date: "2025-08-21", platform: "TikTok",    impressions: 17000, clicks: 245, cost: 37500, conversions: 15, revenue: 36000, age: "10代", gender: "F"},
  { date: "2025-08-21", platform: "Facebook",  impressions: 11000, clicks: 130, cost: 24500, conversions: 12, revenue: 23000, age: "30代", gender: "M"},

  { date: "2025-08-22", platform: "Instagram", impressions: 15800, clicks: 380, cost: 48000, conversions: 43, revenue:120000, age: "20代", gender: "F"},
  { date: "2025-08-22", platform: "TikTok",    impressions: 17500, clicks: 240, cost: 38000, conversions: 14, revenue: 34000, age: "10代", gender: "F"},
  { date: "2025-08-22", platform: "Facebook",  impressions: 11500, clicks: 128, cost: 25000, conversions: 11, revenue: 22000, age: "30代", gender: "M"},
];

// プラットフォーム別の統計を計算
export const byPlatform = (rows: DailyData[]): PlatformStats[] => {
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
    cpc: x.cost ? x.cost / x.clicks : 0,
  }));
};

// 提案配分（費用対効果(ROAS)のEMA比例 + 探索5% + 上下限 5%-60%）
export const proposeAllocation = (stats: PlatformStats[], totalBudget: number, window = 5): BudgetProposal[] => {
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
export const bySegment = (rows: DailyData[], platform: string): SegmentData[] => {
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

// プラットフォーム別のROAS推移を計算
export const getPlatformTrend = (): PlatformTrend[] => {
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
};

// AIサマリーを生成
export const generateAISummary = (stats: PlatformStats[], proposal: BudgetProposal[]): string => {
  const best = [...stats].sort((a,b)=>b.roas - a.roas)[0]?.platform;
  const worst = [...stats].sort((a,b)=>a.roas - b.roas)[0]?.platform;
  const igSeg = bySegment(rawDaily, "Instagram").sort((a,b)=>b.efficiency - a.efficiency)[0];
  return `本日の提案は「${proposal.map(p=>`${p.platform}${Math.round(p.ratio*100)}%`).join(" / ") }」。` +
         `${best}が費用対効果で最良。${worst}は獲得コストが高めのため抑制推奨。` +
         (igSeg ? `Instagramでは「${igSeg.age}${igSeg.gender === "F" ? "女性" : "男性"}」が高反応。` : "");
}; 