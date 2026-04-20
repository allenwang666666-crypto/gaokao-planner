"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy, X } from "lucide-react";
import { toast } from "sonner";

type WechatLeadModalProps = {
  open: boolean;
  onClose: () => void;
  className?: string;
};

export function WechatLeadModal({ open, onClose, className }: WechatLeadModalProps) {
  if (!open) return null;
  const wechatId = "Allen518588";

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(wechatId);
      toast.success("已复制微信号");
    } catch {
      toast.error("复制失败，请手动添加");
    }
  };

  return (
    <div className={cn("fixed inset-0 z-[100] flex items-center justify-center p-4", className)} role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="关闭" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
        <button
          type="button"
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={onClose}
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="pr-8 text-lg font-semibold">领取完整志愿方案</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          你当前看到的是基础结果。
          <br />
          <br />
          完整方案将包含：
          <br />
          ✔ 可冲院校名单（具体学校）
          <br />
          ✔ 稳妥院校（录取概率分析）
          <br />
          ✔ 保底院校（避免滑档）
          <br />
          ✔ 是否有机会冲更高档次（关键判断）
          <br />
          <br />
          很多家长在这一步，
          <br />
          通过优化填报，最终提升了一个档次。
          <br />
          <br />
          👇 添加老师微信领取完整方案
        </p>
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="w-full rounded-lg border bg-muted/30 px-3 py-2 text-center">
            <span className="text-xs text-muted-foreground">微信号</span>
            <p className="font-mono text-base font-medium">{wechatId}</p>
          </div>
          <Button type="button" className="w-full gap-2" onClick={copyId}>
            <Copy className="h-4 w-4" />
            复制微信号
          </Button>
        </div>
      </div>
    </div>
  );
}
