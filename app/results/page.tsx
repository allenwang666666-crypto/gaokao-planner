"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WechatLeadModal } from "@/components/wechat-lead-modal";
import { defaultProfile } from "@/lib/mock-data";
import { getCurrentLevelSummary, getSlideRiskSummary } from "@/lib/results-preview";
import { loadProfile } from "@/lib/storage";
import type { UserProfile } from "@/lib/types";

const generationStages = [
  "正在分析近3年录取数据...",
  "正在匹配位次与院校模型...",
  "正在生成冲稳保策略...",
  "正在评估提升一个档次的可能性..."
] as const;

function streamToSubjectType(stream: string | null): string {
  switch (stream) {
    case "arts":
      return "文科";
    case "science":
      return "理科";
    case "newgaokao":
      return "新高考";
    default:
      return "";
  }
}

function gradeToLabel(grade: string | null): string {
  switch (grade) {
    case "high1":
      return "高一";
    case "high2":
      return "高二";
    case "high3":
      return "高三";
    default:
      return "";
  }
}

function getCurrentTier(profile: UserProfile): string {
  const { score, rank } = profile;
  if ((score > 0 && score >= 620) || (rank > 0 && rank <= 6000)) return "211";
  if ((score > 0 && score >= 530) || (rank > 0 && rank <= 18000)) return "一本";
  if (score > 0 || rank > 0) return "二本";
  return "待评估";
}

function getAssessmentTierLabel(profile: UserProfile): "二本稳" | "一本边缘" | "一本稳" | "有机会冲211" {
  const { score, rank } = profile;
  if ((score > 0 && score >= 620) || (rank > 0 && rank <= 6000)) return "有机会冲211";
  if ((score > 0 && score >= 560) || (rank > 0 && rank <= 12000)) return "一本稳";
  if ((score > 0 && score >= 520) || (rank > 0 && rank <= 22000)) return "一本边缘";
  return "二本稳";
}

function mergeProfileFromQuery(stored: UserProfile, searchParams: URLSearchParams): UserProfile {
  const scoreQ = searchParams.get("score");
  const rankQ = searchParams.get("rank");
  const stream = searchParams.get("stream");
  const cityQ = searchParams.get("city");
  const fromAssessment = searchParams.get("from") === "assessment";
  const hasQuery = Boolean(scoreQ || rankQ || stream || searchParams.get("grade") || cityQ || fromAssessment);
  if (!hasQuery) return stored;

  const next = { ...stored };

  if (fromAssessment) {
    if (scoreQ !== null && scoreQ.trim() !== "") {
      const n = Number(scoreQ);
      next.score = Number.isFinite(n) ? n : 0;
    } else {
      next.score = 0;
    }
    if (rankQ !== null && rankQ.trim() !== "") {
      const n = Number(rankQ);
      next.rank = Number.isFinite(n) ? n : 0;
    } else {
      next.rank = 0;
    }
  } else {
    if (scoreQ !== null && scoreQ.trim() !== "") {
      const n = Number(scoreQ);
      if (Number.isFinite(n)) next.score = n;
    }
    if (rankQ !== null && rankQ.trim() !== "") {
      const n = Number(rankQ);
      if (Number.isFinite(n)) next.rank = n;
    }
  }

  const st = streamToSubjectType(stream);
  if (st) next.subjectType = st;
  if (cityQ?.trim()) next.city = cityQ.trim();
  return next;
}

function ResultsView() {
  const searchParams = useSearchParams();
  const [stored] = useState(() => loadProfile() ?? defaultProfile);
  const [wechatOpen, setWechatOpen] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [autoModalShown, setAutoModalShown] = useState(false);
  const hiddenSectionRef = useRef<HTMLDivElement | null>(null);

  const profile = useMemo(() => mergeProfileFromQuery(stored, searchParams), [stored, searchParams]);

  const levelText = getCurrentLevelSummary(profile);
  const riskText = getSlideRiskSummary(profile);
  const currentTier = getCurrentTier(profile);

  const gradeLabel = gradeToLabel(searchParams.get("grade"));
  const fromAssessment = searchParams.get("from") === "assessment";

  useEffect(() => {
    if (fromAssessment) {
      setGenerated(true);
      return;
    }

    setStageIndex(0);
    setProgress(0);
    setGenerated(false);

    const stageTimers = [
      setTimeout(() => setStageIndex(1), 6000),
      setTimeout(() => setStageIndex(2), 12000),
      setTimeout(() => setStageIndex(3), 18000),
      setTimeout(() => {
        setStageIndex(3);
        setProgress(100);
        setGenerated(true);
      }, 24000)
    ];

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev >= 96 ? prev : prev + 1));
    }, 240);

    return () => {
      stageTimers.forEach((timer) => clearTimeout(timer));
      clearInterval(progressTimer);
    };
  }, [fromAssessment]);

  useEffect(() => {
    if (fromAssessment || !generated || autoModalShown) return;

    let eligibleByStay = false;
    const stayTimer = setTimeout(() => {
      eligibleByStay = true;
      checkAndOpen();
    }, 15000);

    const checkAndOpen = () => {
      if (!eligibleByStay || autoModalShown || wechatOpen) return;
      const node = hiddenSectionRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.2;
      if (inView) {
        setWechatOpen(true);
        setAutoModalShown(true);
      }
    };

    const onScroll = () => checkAndOpen();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(stayTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [fromAssessment, generated, autoModalShown, wechatOpen]);

  if (fromAssessment) {
    const quickTier = getAssessmentTierLabel(profile);
    const quickRisk = quickTier === "有机会冲211" ? "志愿偏高可能滑档" : "志愿偏保守可能浪费分数";

    return (
      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <Card className="mx-auto w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">快速测评结果</CardTitle>
            <CardDescription>
              {profile.subjectType ? `${profile.subjectType} · ` : ""}
              {gradeLabel ? `${gradeLabel} · ` : ""}
              {profile.city ? `${profile.city} · ` : ""}
              核心指标定位
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
              <p className="text-sm text-emerald-900">当前定位</p>
              <p className="mt-1 text-2xl font-bold text-emerald-950">{quickTier}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-semibold text-amber-900">风险提示</p>
              <p className="mt-1">{quickRisk}</p>
            </div>
            <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
              该结果为快速定位，仅基于核心指标估算，误差可能在1个档次以内
            </p>
          </CardContent>
        </Card>

        <Card className="mx-auto w-full">
          <CardContent className="space-y-4 pt-6 text-center">
            <p className="text-base font-medium">想知道具体能上哪些学校，以及是否有机会冲更高一档？</p>
            <p className="text-sm text-muted-foreground">获取完整志愿填报方案（含冲稳保名单）</p>
            <Button asChild size="lg" className="h-12 px-8 text-base font-semibold">
              <Link href="/intake">获取完整志愿方案</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!generated) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-3xl items-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">正在生成完整志愿方案</CardTitle>
            <CardDescription>
              已录入画像：{profile.subjectType || "新高考"}{gradeLabel ? ` · ${gradeLabel}` : ""}{profile.score ? ` · 分数 ${profile.score}` : ""}{profile.rank ? ` · 位次 ${profile.rank}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base font-medium">{generationStages[stageIndex]}</p>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${Math.max(progress, 4)}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">方案生成中 {progress}% · 完整路径会比快速测评更详细，请稍候...</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl">结果初步判断</CardTitle>
          <CardDescription>基于当前画像与位次模型给出的阶段性结论</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
            <p className="font-semibold text-emerald-900">当前定位</p>
            <p className="mt-1 text-base text-emerald-950">
              <span className="font-bold">{currentTier === "211" ? "有机会冲211" : currentTier === "一本" ? "一本边缘 / 一本稳" : "二本稳"}</span>
            </p>
            <p className="mt-1 text-emerald-900/90">{levelText}</p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
            <p className="font-semibold text-amber-900">风险提示</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-950">
              <li><span className="font-semibold">志愿过高</span>存在滑档风险</li>
              <li><span className="font-semibold">志愿偏保守</span>可能浪费分数</li>
            </ul>
            <p className="mt-2 text-amber-900/90">{riskText}</p>
          </div>

          <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
            <p className="font-semibold">提升空间</p>
            <p className="mt-1">如果志愿结构规划合理，有机会冲更高一档学校。</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mx-auto w-full max-w-4xl" ref={hiddenSectionRef}>
        <CardHeader>
          <CardTitle className="text-xl">完整志愿方案（部分未展开）</CardTitle>
          <CardDescription>方案已经生成，当前仅展示部分内容</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm font-semibold">冲刺院校（未展开）</p>
            <p className="mt-1 text-sm">
              示例可见院校：<span className="font-semibold">安徽大学（计算机类）</span>
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded bg-muted px-2 py-1">未展开</span>
              <span className="h-4 w-40 rounded bg-muted/70 blur-[1px]" />
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm font-semibold">稳妥院校（未展开）</p>
            <div className="mt-2 space-y-2 opacity-80">
              <p className="h-5 w-64 rounded bg-muted/70 blur-[1px]" />
              <p className="h-5 w-56 rounded bg-muted/70 blur-[1px]" />
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm font-semibold">保底院校（未展开）</p>
            <div className="mt-2 space-y-2 opacity-70">
              <p className="h-5 w-52 rounded bg-muted/70 blur-[1px]" />
              <p className="h-5 w-44 rounded bg-muted/60 blur-[1px]" />
            </div>
          </div>
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            完整院校名单与冲稳保策略，需要单独领取
          </p>
        </CardContent>
      </Card>

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl">风险提示</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
            <p className="font-semibold text-amber-900">志愿结构风险</p>
            <p className="mt-1 text-amber-950">{riskText}</p>
          </div>
          <div className="rounded-lg border p-4 text-sm">
            <p>若冲刺占比过高，存在滑档风险；若保底占比过高，存在浪费分数风险。</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl">提升空间判断</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
            <p className="font-semibold">是否有机会冲更高一档：有机会</p>
            <p className="mt-1">如果在专业选择、城市梯度和冲稳保比例上做优化，存在冲击更高层次院校的可能。</p>
          </div>
          <div className="rounded-lg border p-4 text-sm">
            <p>很多家长在这一步会发现：</p>
            <p className="font-medium">原本只能上一本到，通过优化填报，可以冲到211。</p>
            <p className="mt-2 text-muted-foreground">但完整院校名单与冲稳保策略，仅支持单独领取。</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button type="button" size="lg" className="h-12 px-8 text-base font-semibold" onClick={() => setWechatOpen(true)}>
          领取完整志愿方案（含院校名单）
        </Button>
      </div>

      <WechatLeadModal open={wechatOpen} onClose={() => setWechatOpen(false)} />
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl p-6">
          <p className="text-sm text-muted-foreground">加载中…</p>
        </main>
      }
    >
      <ResultsView />
    </Suspense>
  );
}
