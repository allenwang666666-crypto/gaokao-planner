"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecommendationCard } from "@/components/recommendation-card";
import { defaultProfile } from "@/lib/mock-data";
import { generateStrategyPlans } from "@/lib/recommendation";
import { loadProfile, saveProfile } from "@/lib/storage";
import { StrategyType } from "@/lib/types";

export default function ResultsPage() {
  const [profile, setProfile] = useState(() => loadProfile() ?? defaultProfile);
  const [active, setActive] = useState<StrategyType>("planA");
  const [quickExcludeCity, setQuickExcludeCity] = useState("");
  const plans = useMemo(() => generateStrategyPlans(profile), [profile]);
  const current = plans.find((p) => p.strategy === active) ?? plans[0];
  const planA = plans.find((p) => p.strategy === "planA");
  const planB = plans.find((p) => p.strategy === "planB");
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");
  const leftOptions = (planA?.items ?? []).map((i) => ({
    id: `${i.universityId}-${i.majorId}`,
    label: `${i.universityName}-${i.majorName}`,
    item: i
  }));
  const rightOptions = (planB?.items ?? []).map((i) => ({
    id: `${i.universityId}-${i.majorId}`,
    label: `${i.universityName}-${i.majorName}`,
    item: i
  }));
  const left = leftOptions.find((o) => o.id === leftId)?.item;
  const right = rightOptions.find((o) => o.id === rightId)?.item;

  const recalcExclude = () => {
    const city = quickExcludeCity.trim();
    if (!city) return;
    const next = {
      ...profile,
      excludedCities: Array.from(new Set([...profile.excludedCities, city]))
    };
    setProfile(next);
    saveProfile(next);
    setQuickExcludeCity("");
    toast.message("已排除城市并重算", { description: city });
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">推荐结果（解释型）</CardTitle>
          <CardDescription>
            当前画像：{profile.city || "未填写城市"}
            {profile.district || ""} · 采用分数 {profile.score} · 位次 {profile.rank}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            真实性提示：当前结果基于项目内置示意数据与规则引擎，用于志愿规划与方向参考；正式填报前请结合安徽省教育考试院及院校当年最新投档线、位次、专业分数线、招生计划、选科要求进一步核实。
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            方案差异说明：方案A更稳妥、更重录取概率；方案B更冲刺、更重学校层次和城市资源。
          </div>
          <Tabs value={active} onValueChange={(v) => setActive(v as StrategyType)}>
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
              {plans.map((plan) => (
                <TabsTrigger key={plan.strategy} value={plan.strategy} className="text-xs sm:text-sm">
                  {plan.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {plans.map((plan) => (
              <TabsContent key={plan.strategy} value={plan.strategy} className="mt-3 space-y-2">
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="exclude-city">即时排除城市（硬约束）</Label>
              <Input
                id="exclude-city"
                placeholder="例如：广州"
                value={quickExcludeCity}
                onChange={(e) => setQuickExcludeCity(e.target.value)}
              />
            </div>
            <Button type="button" variant="secondary" onClick={recalcExclude}>
              重算推荐
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">方案A / 方案B 对比</CardTitle>
          <CardDescription>请分别选择稳妥方案与冲刺方案，查看学校层次、风险和发展差异。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 md:grid-cols-2">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={leftId}
              onChange={(e) => setLeftId(e.target.value)}
            >
              <option value="">选择方案 A（稳妥优先）</option>
              {leftOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={rightId}
              onChange={(e) => setRightId(e.target.value)}
            >
              <option value="">选择方案 B（冲刺优先）</option>
              {rightOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {left && right && (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-2 text-left font-medium">维度</th>
                    <th className="p-2 text-left font-medium">方案 A</th>
                    <th className="p-2 text-left font-medium">方案 B</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2">城市</td>
                    <td className="p-2">
                      {left.province}
                      {left.city}
                    </td>
                    <td className="p-2">
                      {right.province}
                      {right.city}
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">学费</td>
                    <td className="p-2">{left.tuition}</td>
                    <td className="p-2">{right.tuition}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">学校层次</td>
                    <td className="p-2">{left.tierLabel}</td>
                    <td className="p-2">{right.tierLabel}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">录取风险</td>
                    <td className="p-2">{left.riskLabel}</td>
                    <td className="p-2">{right.riskLabel}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">发展适配分</td>
                    <td className="p-2">{left.scoreBreakdown.futureFit}</td>
                    <td className="p-2">{right.scoreBreakdown.futureFit}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">城市 / 离家适配</td>
                    <td className="p-2">{left.scoreBreakdown.cityPreference}</td>
                    <td className="p-2">{right.scoreBreakdown.cityPreference}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-2">总体推荐指数</td>
                    <td className="p-2 font-semibold">{left.matchScore}</td>
                    <td className="p-2 font-semibold">{right.matchScore}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {current.items.map((item, idx) => (
          <RecommendationCard key={`${item.universityId}-${item.majorId}`} item={item} rankIndex={idx} />
        ))}
      </div>

      <div className="flex justify-end">
        <Button asChild>
          <Link href="/plan">进入志愿表与导出</Link>
        </Button>
      </div>
    </main>
  );
}
