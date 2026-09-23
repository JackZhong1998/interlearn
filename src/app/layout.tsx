import type { Metadata } from "next";
import "./globals.css";
import { TabBar } from "@/components/TabBar";

export const metadata: Metadata = {
  title: "interlearn",
  description: "互动学习视频",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-dvh overflow-hidden bg-black font-sans antialiased">
        <div className="relative mx-auto h-dvh w-full max-w-[430px] overflow-hidden bg-black">
          {children}
          <TabBar />
        </div>
      </body>
    </html>
  );
}
