"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportButtons } from "@/components/export-buttons";
import { defaultProfile } from "@/lib/mock-data";
import { generateStrategyPlans } from "@/lib/recommendation";
import { loadProfile } from "@/lib/storage";
import { StrategyType } from "@/lib/types";

export default function PlanPage() {
  const profile = loadProfile() ?? defaultProfile;
  const plans = useMemo(() => generateStrategyPlans(profile), [profile]);
  const [active, setActive] = useState<StrategyType>("balanced");
  const plan = plans.find((p) => p.strategy === active) ?? plans[0];

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">多策略志愿表生成</CardTitle>
          <CardDescription>切换策略查看不同排序逻辑下的志愿顺序，并导出 Excel / PDF。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={active} onValueChange={(v) => setActive(v as StrategyType)}>
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
              {plans.map((p) => (
                <TabsTrigger key={p.strategy} value={p.strategy} className="text-xs sm:text-sm">
                  {p.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {plans.map((p) => (
              <TabsContent key={p.strategy} value={p.strategy} className="mt-3">
                <p className="text-sm text-muted-foreground">{p.description}</p>
              </TabsContent>
            ))}
          </Tabs>
          <ExportButtons items={plan.items} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">最终填报顺序（{plan.title}）</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 font-medium">顺序</th>
                <th className="p-2 font-medium">学校</th>
                <th className="p-2 font-medium">专业</th>
                <th className="p-2 font-medium">城市</th>
                <th className="p-2 font-medium">风险</th>
                <th className="p-2 font-medium">匹配度</th>
                <th className="p-2 font-medium">推荐说明</th>
                <th className="p-2 font-medium">备注</th>
              </tr>
            </thead>
            <tbody>
              {plan.items.map((item, idx) => (
                <tr key={`${item.universityId}-${item.majorId}`} className="border-b">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{item.universityName}</td>
                  <td className="p-2">{item.majorName}</td>
                  <td className="p-2">
                    {item.province}
                    {item.city}
                  </td>
                  <td className="p-2">{item.riskLabel}</td>
                  <td className="p-2">{item.matchScore}</td>
                  <td className="p-2">{item.recommendReason[0]}</td>
                  <td className="p-2">{item.riskTips[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
}
