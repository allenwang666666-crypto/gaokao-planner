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
      toast.success("已复制，请打开微信添加");
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
        <h2 className="pr-8 text-lg font-semibold">领取完整志愿方案（冲稳保 + 提升路径）</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          已为你生成基础结果，
          <br />
          但完整方案包含：
          <br />
          <br />
          - 冲稳保完整院校名单
          <br />
          - 志愿填报顺序（避免滑档）
          <br />
          - 是否可以冲更高一档的判断
          <br />
          - 提分/调整建议（是否值得冲）
          <br />
          <br />
          添加微信后发送完整分析报告
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
