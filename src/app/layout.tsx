import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppNav } from "@/components/layout/AppNav";

export const metadata: Metadata = {
  title: "赤ちゃんの生活ログ",
  description:
    "赤ちゃんの授乳・睡眠・おむつなどの記録と予定を管理し、バルーン遊びも楽しめるアプリ。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <Providers>
          {/* 下部ナビの高さ分の余白を確保 */}
          <div className="mx-auto min-h-screen max-w-md px-4 pb-24 pt-4">
            {children}
          </div>
          <AppNav />
        </Providers>
      </body>
    </html>
  );
}
