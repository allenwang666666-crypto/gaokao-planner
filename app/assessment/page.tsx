"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Stream = "arts" | "science" | "newgaokao";
type Grade = "high1" | "high2" | "high3";

type FormState = {
  score: string;
  rank: string;
  stream: Stream;
  grade: Grade;
  city: string;
};

const initialForm: FormState = {
  score: "",
  rank: "",
  stream: "newgaokao",
  grade: "high3",
  city: ""
};

export default function AssessmentPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);

  const submit = () => {
    const score = form.score.trim();
    const rank = form.rank.trim();
    if (!score && !rank) {
      toast.error("请至少填写分数或位次中的一项");
      return;
    }

    const params = new URLSearchParams();
    if (score) params.set("score", score);
    if (rank) params.set("rank", rank);
    params.set("stream", form.stream);
    params.set("grade", form.grade);
    params.set("from", "assessment");
    const city = form.city.trim();
    if (city) params.set("city", city);

    router.push(`/results?${params.toString()}`);
  };

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl md:text-2xl">30秒测孩子当前定位</CardTitle>
            <CardDescription>基于安徽近3年数据 + 位次模型，快速判断当前大致能到什么层次</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="assessment-score">高考分数（选填）</Label>
              <Input
                id="assessment-score"
                inputMode="decimal"
                placeholder="例如 612"
                value={form.score}
                onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assessment-rank">全省位次（选填）</Label>
              <Input
                id="assessment-rank"
                inputMode="numeric"
                placeholder="例如 8600"
                value={form.rank}
                onChange={(e) => setForm((p) => ({ ...p, rank: e.target.value }))}
              />
            </div>
            <p className="text-xs text-muted-foreground">分数与位次至少填写一项（必填）。</p>

            <div className="space-y-2">
              <Label>科类</Label>
              <Select value={form.stream} onValueChange={(v: Stream) => setForm((p) => ({ ...p, stream: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arts">文科</SelectItem>
                  <SelectItem value="science">理科</SelectItem>
                  <SelectItem value="newgaokao">新高考</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>年级</Label>
              <Select value={form.grade} onValueChange={(v: Grade) => setForm((p) => ({ ...p, grade: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high1">高一</SelectItem>
                  <SelectItem value="high2">高二</SelectItem>
                  <SelectItem value="high3">高三</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessment-city">意向城市（可选）</Label>
              <Input
                id="assessment-city"
                placeholder="例如 合肥、南京"
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              />
            </div>

            <Button type="button" className="h-11 w-full text-base font-semibold" onClick={submit}>
              立即测评
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
