"use client";

import { useState } from "react";
import { RecommendationItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecommendationCard({ item, rankIndex }: { item: RecommendationItem; rankIndex: number }) {
  const [showExplain, setShowExplain] = useState(false);
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col gap-2 text-base font-semibold sm:flex-row sm:items-center sm:justify-between">
          <span>
            {rankIndex + 1}. {item.universityName} · {item.majorName}
          </span>
          <Badge variant="secondary">匹配度 {item.matchScore}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid gap-2 md:grid-cols-3">
          <p>城市：{item.province}{item.city}</p>
          <p>层次：{item.tierLabel}</p>
          <p>风险：{item.riskLabel}</p>
          <p>办学：{item.schoolType === "public" ? "公办" : "民办"}</p>
          <p>学费：{item.tuition} 元/年</p>
          <p>生活成本：{item.costLabel}</p>
        </div>
        <div>
          <p className="font-medium">推荐理由</p>
          <ul className="list-disc pl-5 text-muted-foreground">
            {item.recommendReason.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium">风险提示</p>
          <ul className="list-disc pl-5 text-muted-foreground">
            {item.riskTips.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowExplain((v) => !v)}>
          {showExplain ? "收起打分说明" : "我为什么会看到这个推荐"}
        </Button>
        {showExplain && (
          <div className="rounded-lg border bg-muted/50 p-3 text-xs leading-6 text-muted-foreground">
            <p>专业匹配：{item.scoreBreakdown.majorMatch} × 权重 {item.scoreBreakdown.weights.majorMatch}</p>
            <p>学校层次：{item.scoreBreakdown.schoolTier} × 权重 {item.scoreBreakdown.weights.schoolTier}</p>
            <p>城市偏好：{item.scoreBreakdown.cityPreference} × 权重 {item.scoreBreakdown.weights.cityPreference}</p>
            <p>录取安全：{item.scoreBreakdown.admitSafety} × 权重 {item.scoreBreakdown.weights.admitSafety}</p>
            <p>成本适配：{item.scoreBreakdown.costFit} × 权重 {item.scoreBreakdown.weights.costFit}</p>
            <p>发展适配：{item.scoreBreakdown.futureFit} × 权重 {item.scoreBreakdown.weights.futureFit}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
