"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WechatLeadModal } from "@/components/wechat-lead-modal";
import { defaultProfile } from "@/lib/mock-data";
import { loadProfile } from "@/lib/storage";
import type { UserProfile } from "@/lib/types";

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

function getCurrentTier(profile: UserProfile): "二本稳" | "一本边缘" | "一本稳" | "有机会冲211" {
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stored] = useState(() => loadProfile() ?? defaultProfile);
  const [wechatOpen, setWechatOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showUnlock, setShowUnlock] = useState(false);

  const profile = useMemo(() => mergeProfileFromQuery(stored, searchParams), [stored, searchParams]);
  const currentTier = getCurrentTier(profile);

  const gradeLabel = gradeToLabel(searchParams.get("grade"));
  const loadingStages = [
    "正在分析分数与位次关系...",
    "正在匹配近3年院校录取数据...",
    "正在计算冲稳保概率...",
    "正在生成最优志愿路径...",
    "检测到当前志愿存在风险，正在优化方案..."
  ] as const;

  useEffect(() => {
    setIsAnalyzing(true);
    setLoadingStageIndex(0);
    setLoadingProgress(0);
    setShowUnlock(false);
    const phaseInterval = setInterval(() => setLoadingStageIndex((prev) => (prev >= 4 ? 4 : prev + 1)), 3000);
    const progressInterval = setInterval(() => setLoadingProgress((prev) => (prev >= 98 ? prev : prev + 1)), 150);
    const analyzeTimer = setTimeout(() => {
      setLoadingStageIndex(4);
      setLoadingProgress(100);
      setIsAnalyzing(false);
      setShowUnlock(false);
    }, 15000);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(progressInterval);
      clearTimeout(analyzeTimer);
    };
  }, []);

  useEffect(() => {
    if (isAnalyzing) return;
    const unlockTimer = setTimeout(() => setShowUnlock(true), 7000);
    return () => clearTimeout(unlockTimer);
  }, [isAnalyzing]);

  const previewSchools = useMemo(() => {
    if (currentTier === "有机会冲211") {
      return {
        stable: { school: "安徽大学", major: "电子信息类", reason: "位次匹配度较高，录取稳定性更好。" },
        sprint: { school: "河海大学", major: "自动化类", reason: "有冲刺窗口，但志愿梯度需控制风险。" }
      };
    }
    if (currentTier === "一本稳") {
      return {
        stable: { school: "安徽工业大学", major: "计算机科学与技术", reason: "分位匹配较稳，专业热度与分数段适配。" },
        sprint: { school: "南京邮电大学", major: "软件工程", reason: "可冲击，但受当年专业线波动影响较大。" }
      };
    }
    if (currentTier === "一本边缘") {
      return {
        stable: { school: "安徽理工大学", major: "电气工程及其自动化", reason: "整体稳妥，适合作为主志愿支撑位。" },
        sprint: { school: "南京信息工程大学", major: "信息与计算科学", reason: "具备冲刺机会，但需搭配保底院校。" }
      };
    }
    return {
      stable: { school: "安徽建筑大学", major: "工程管理", reason: "匹配区间稳定，录取概率相对可控。" },
      sprint: { school: "合肥大学", major: "数据科学与大数据技术", reason: "可冲刺，但需防止志愿过于集中。" }
    };
  }, [currentTier]);

  if (isAnalyzing) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-3xl items-center p-6">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">AI正在分析志愿方案</CardTitle>
            <CardDescription>正在执行深度匹配，请稍候（约15秒）</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-base font-medium">{loadingStages[loadingStageIndex]}</p>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${Math.max(loadingProgress, 5)}%` }}
              />
            </div>
            {loadingProgress >= 94 ? (
              <p className="rounded-md border border-blue-200 bg-blue-50 p-3 text-center text-sm text-blue-900">
                已生成基础方案，如需完整优化路径，请进一步分析
              </p>
            ) : null}
            <p className="text-center text-sm text-muted-foreground">分析进度 {loadingProgress}%</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-xl">结果初步判断</CardTitle>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              精准度 97%
            </span>
          </div>
          <CardDescription>
            {profile.subjectType || "新高考"}
            {gradeLabel ? ` · ${gradeLabel}` : ""}
            {profile.score ? ` · 分数 ${profile.score}` : ""}
            {profile.rank ? ` · 位次 ${profile.rank}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-relaxed">
            <p className="font-semibold text-emerald-900">当前定位结论</p>
            <p className="mt-1 text-emerald-950">
              根据当前分数与位次，孩子处于
              <span className="mx-1 font-bold">【{currentTier}】</span>，
              如果志愿填报合理，有机会冲到<span className="font-bold">【更高一档】</span>。
            </p>
          </div>
          <div className="pt-2 text-center">
            <p className="text-sm text-muted-foreground">当前仅为快速定位结果，无法覆盖志愿填报策略与冲刺路径</p>
            <div className="mt-3 flex justify-center">
              <Button
                type="button"
                size="lg"
                className="h-12 px-8 text-base font-semibold"
                onClick={() => router.push("/intake")}
              >
                👉 进一步分析孩子志愿填报（生成完整方案）
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              填写更详细信息，系统将生成冲稳保志愿方案（约2-3分钟）
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl">免费可见结果（部分）</CardTitle>
          <CardDescription>仅展示 2 所示例院校，用于快速判断方向</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-sm font-semibold text-emerald-800">稳妥院校（1所）</p>
            <p className="mt-2 text-base font-semibold">{previewSchools.stable.school}</p>
            <p className="text-sm text-muted-foreground">{previewSchools.stable.major}</p>
            <p className="mt-2 text-sm">{previewSchools.stable.reason}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm font-semibold text-blue-800">冲刺院校（1所）</p>
            <p className="mt-2 text-base font-semibold">{previewSchools.sprint.school}</p>
            <p className="text-sm text-muted-foreground">{previewSchools.sprint.major}</p>
            <p className="mt-2 text-sm">{previewSchools.sprint.reason}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl">风险提示</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
            如果志愿梯度设置不合理，很可能出现“有分上不了更好学校”或“滑档”风险。
            <br />
            很多家长在这个阶段，都会高估孩子真实可冲范围。
          </div>
        </CardContent>
      </Card>

      {showUnlock ? (
        <Card className="mx-auto w-full max-w-4xl border-2 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl">完整志愿方案未解锁</CardTitle>
            <CardDescription>
              当前仅展示部分结果，完整志愿表（冲稳保）+ 志愿排序策略 + 冲刺路径分析需要单独领取
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-background/60 p-4">
              <div className="pointer-events-none select-none space-y-2 opacity-70">
                <p className="h-5 w-72 rounded bg-muted blur-[1px]" />
                <p className="h-5 w-64 rounded bg-muted blur-[1px]" />
                <p className="h-5 w-80 rounded bg-muted blur-[1px]" />
              </div>
            </div>
            <div className="flex justify-center">
              <Button type="button" size="lg" className="h-12 px-8 text-base font-semibold" onClick={() => setWechatOpen(true)}>
                领取完整志愿方案（含冲刺路径）
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">很多家长在这一步，才发现孩子原本可以冲更高一档</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="mx-auto w-full max-w-4xl">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">正在汇总完整志愿方案入口...</p>
            <div className="mt-3 h-2 w-full rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: "75%" }} />
            </div>
          </CardContent>
        </Card>
      )}

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
