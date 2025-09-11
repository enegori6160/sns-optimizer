import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 認証状態を管理するカスタムフック
// ローカルストレージの情報を確認し、未認証の場合はログインページへリダイレクトする
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    const email = localStorage.getItem("userEmail");

    if (auth === "true" && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
    } else {
      router.push("/login");
    }
    setIsLoading(false);
  }, [router]);

  return { isAuthenticated, isLoading, userEmail };
};
