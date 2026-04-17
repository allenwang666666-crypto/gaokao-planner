import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/app/providers";
import "./globals.css";
import { APP_VERSION } from "@/lib/version";

export const metadata: Metadata = {
  title: `高考志愿智能决策系统（安徽版）· V${APP_VERSION}`,
  description: "面向安徽新高考，支持硬约束筛选、解释型推荐、多策略志愿生成。"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
