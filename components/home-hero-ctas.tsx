"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function HomeHeroCtas() {
  const router = useRouter();

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Button
        type="button"
        size="lg"
        className="h-14 px-8 text-lg font-semibold bg-white text-primary hover:bg-white/90"
        onClick={() => router.push("/assessment")}
      >
        30秒测孩子当前定位
      </Button>
      <Button
        type="button"
        size="lg"
        variant="secondary"
        className="h-14 px-8 text-lg font-semibold bg-blue-700 text-white hover:bg-blue-800"
        onClick={() => router.push("/intake")}
      >
        获取完整志愿填报方案（冲稳保）
      </Button>
    </div>
  );
}
