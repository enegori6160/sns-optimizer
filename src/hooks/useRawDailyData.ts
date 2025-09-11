import { useEffect, useState } from "react";
import { DailyData } from "@/lib/analytics";

// API からダミーデータを取得するカスタムフック
export const useRawDailyData = () => {
  const [data, setData] = useState<DailyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/raw-daily");
        const json = await res.json();
        setData(json);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, isLoading };
};
