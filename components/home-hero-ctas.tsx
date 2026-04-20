"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function HomeHeroCtas() {
  const router = useRouter();

  return (
    <div className="mt-8 grid w-full gap-3 md:grid-cols-2">
      <div className="flex flex-col">
        <Button
          type="button"
          size="lg"
          className="h-14 w-full px-8 text-lg font-semibold bg-white text-primary hover:bg-white/90"
          onClick={() => router.push("/assessment")}
        >
          30秒测孩子当前定位
        </Button>
      </div>
      <div className="flex flex-col">
        <div className="relative">
          <span className="pointer-events-none absolute -top-2 right-2 z-10 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md animate-pulse">
            🔥 推荐 · 90%家长会继续做这一步
          </span>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="h-14 w-full px-8 text-lg font-semibold bg-blue-700 text-white hover:bg-blue-800"
            onClick={() => router.push("/intake")}
          >
            进入志愿填报分析（生成完整方案）
          </Button>
        </div>
        <p className="mt-2 rounded-md bg-white/20 px-3 py-1 text-center text-sm font-medium text-white">
          填写孩子成绩与意向，系统将生成冲稳保志愿方案（约2-3分钟完成）
        </p>
      </div>
    </div>
  );
}
