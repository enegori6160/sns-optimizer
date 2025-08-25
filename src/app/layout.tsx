import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SNS最適化ダッシュボード - 会員限定サービス",
  description: "SNS広告の配分を最適化するための会員限定ダッシュボード",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
