import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  } from "recharts";
import { DailyData } from "@/lib/analytics";

const colors = ["#64748b", "#22c55e", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];

  interface GenderDistributionChartProps {
    data: DailyData[];
  }

  export const GenderDistributionChart: React.FC<GenderDistributionChartProps> = ({ data }) => {
    // 男女別のクリック数を集計
    const genderData = React.useMemo(() => {
      const agg = data.reduce((m, r) => {
        const k = r.gender;
        m[k] = (m[k] || 0) + r.clicks;
        return m;
      }, {} as Record<string, number>);
    
    return Object.entries(agg).map(([name, value]) => ({
      name: name === "F" ? "女性" : name === "M" ? "男性" : "不明",
      value,
    }));
    }, [data]);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-medium mb-2">男女別不明含むのクリック分布（全体）</h2>
      <div className="h-60">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={genderData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
            >
              {genderData.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}; 