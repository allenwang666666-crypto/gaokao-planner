"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defaultProfile, emptyIntakeProfile } from "@/lib/mock-data";
import { saveProfile } from "@/lib/storage";
import type { FuturePlan, PreferencePriority, SchoolTierPreference, UserProfile } from "@/lib/types";

const rankRangeOptions = [
  { label: "1–1000", value: "1-1000", rank: 500 },
  { label: "1000–2000", value: "1000-2000", rank: 1500 },
  { label: "2000–3000", value: "2000-3000", rank: 2500 },
  { label: "3000–5000", value: "3000-5000", rank: 4000 },
  { label: "5000–8000", value: "5000-8000", rank: 6500 },
  { label: "8000–12000", value: "8000-12000", rank: 10000 },
  { label: "12000–18000", value: "12000-18000", rank: 15000 },
  { label: "18000–25000", value: "18000-25000", rank: 21500 },
  { label: "25000–35000", value: "25000-35000", rank: 30000 },
  { label: "35000–50000", value: "35000-50000", rank: 42500 },
  { label: "50000+", value: "50000+", rank: 55000 }
] as const;

const subjectOptions = [
  "物理+化学+生物",
  "物理+化学+地理",
  "物理+生物+政治",
  "物理+化学+政治",
  "历史+政治+地理",
  "历史+政治+生物",
  "其他组合"
] as const;

const regionPreferenceOptions = [
  "本省优先（安徽）",
  "长三角优先（江苏/浙江/上海）",
  "华东地区（含山东）",
  "华中地区（湖北/湖南）",
  "华南地区（广东/福建）",
  "全国均可"
] as const;

const majorQuickTags = [
  "医学类",
  "师范类",
  "法学类",
  "农林类",
  "艺术类",
  "军警类",
  "计算机类",
  "经管类"
] as const;

const schoolTierPreferenceOptions: { value: SchoolTierPreference; label: string; tip: string }[] = [
  { value: "985", label: "985优先", tip: "优先把 985 放到更靠前位置" },
  { value: "211", label: "211优先", tip: "优先考虑 211 及以上院校" },
  { value: "double_first_class", label: "双一流优先", tip: "优先考虑双一流及以上院校" },
  { value: "school_tier", label: "更看重学校层次", tip: "院校名气和层次更重要" },
  { value: "major_development", label: "更看重专业实际发展", tip: "更看重专业就业与长期发展" },
  { value: "balanced", label: "综合平衡", tip: "学校层次和专业发展都兼顾" }
];

/** 可接受学费区间（元/年），选中后映射为 tuitionMax 中位数/上限供推荐逻辑使用 */
const tuitionTierOptions = [
  { label: "5000 元/年以下", value: "0-5000", tuitionMax: 5000 },
  { label: "5000–8000 元/年", value: "5000-8000", tuitionMax: 6500 },
  { label: "8000–12000 元/年", value: "8000-12000", tuitionMax: 10000 },
  { label: "12000–20000 元/年", value: "12000-20000", tuitionMax: 16000 },
  { label: "20000 元/年以上", value: "20000+", tuitionMax: 30000 },
  { label: "其他（自填）", value: "other", tuitionMax: null }
] as const;

/** 根据已保存的 tuitionMax 反推下拉选中项；无法落入预设区间时视为「其他」 */
function tuitionTierFromAmount(amount: number): string {
  if (amount <= 0) return "0-5000";
  if (amount <= 5000) return "0-5000";
  if (amount <= 8000) return "5000-8000";
  if (amount <= 12000) return "8000-12000";
  if (amount <= 20000) return "12000-20000";
  if (amount <= 50000) return "20000+";
  return "other";
}

type ScoreMode = "" | "official" | "mock" | "combined";
type GradeMode = "" | "high1" | "high2" | "high3";

export function ProfileForm() {
  const router = useRouter();
  const [form, setForm] = useState<UserProfile>(emptyIntakeProfile);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [scoreMode, setScoreMode] = useState<ScoreMode>("");
  const [scoreInput, setScoreInput] = useState("");
  const [mockScoreInput, setMockScoreInput] = useState("");
  const [combinedMock1, setCombinedMock1] = useState("");
  const [combinedMock2, setCombinedMock2] = useState("");
  const [combinedMock3, setCombinedMock3] = useState("");
  const [gradeMode, setGradeMode] = useState<GradeMode>("");
  const [mockExamType, setMockExamType] = useState("");
  const [tuitionTier, setTuitionTier] = useState("");
  const [customTuitionInput, setCustomTuitionInput] = useState("");
  const [selectedRankRange, setSelectedRankRange] = useState("");
  const [selectedSubjectOption, setSelectedSubjectOption] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [selectedRegionPreference, setSelectedRegionPreference] = useState("");
  const [prefPriority, setPrefPriority] = useState<PreferencePriority | undefined>(undefined);
  const [prefFuture, setPrefFuture] = useState<FuturePlan | undefined>(undefined);
  const [schoolTierPreference, setSchoolTierPreference] = useState<SchoolTierPreference>("balanced");
  const [excludeCity, setExcludeCity] = useState("");
  const [excludeProvince, setExcludeProvince] = useState("");
  const [excludeMajor, setExcludeMajor] = useState("");

  const validateStepOne = () => {
    if (!scoreMode) {
      toast.error("请先选择分数填写场景");
      return false;
    }
    if (scoreMode === "official" && (!scoreInput.trim() || form.score <= 0)) {
      toast.error("请填写高考分数（正式分）");
      return false;
    }
    if (scoreMode === "mock") {
      if (!gradeMode) {
        toast.error("请先选择当前年级");
        return false;
      }
      if (!mockExamType) {
        toast.error("请先选择模考类型");
        return false;
      }
      if (!mockScoreInput.trim() || form.mockScore <= 0) {
        toast.error("请填写模考分数");
        return false;
      }
    }
    if (scoreMode === "combined") {
      const officialScore = scoreInput.trim() ? Number(scoreInput) : 0;
      const mockScores = [combinedMock1, combinedMock2, combinedMock3]
        .map((v) => (v.trim() ? Number(v) : 0))
        .filter((v) => v > 0);
      if (officialScore <= 0 && mockScores.length === 0) {
        toast.error("综合参考至少填写一个成绩（正式分或任一模考分）");
        return false;
      }
    }
    if (!selectedRankRange) {
      toast.error("请选择全省位次区间");
      return false;
    }
    if (!selectedSubjectOption) {
      toast.error("请选择科类 / 选科组合");
      return false;
    }
    if (selectedSubjectOption === "其他组合" && !customSubject.trim()) {
      toast.error("请填写你的选科组合");
      return false;
    }
    if (!tuitionTier) {
      toast.error("请选择可接受学费区间");
      return false;
    }
    if (tuitionTier === "other" && !customTuitionInput.trim()) {
      toast.error("请填写可接受最高学费（元/年）");
      return false;
    }
    if (!selectedRegionPreference) {
      toast.error("请选择更倾向的地区");
      return false;
    }
    return true;
  };

  const validateStepThree = () => {
    if (prefPriority === undefined) {
      toast.error("请选择排序偏好");
      return false;
    }
    if (prefFuture === undefined) {
      toast.error("请选择毕业方向侧重");
      return false;
    }
    return true;
  };

  const goNextStep = () => {
    if (currentStep === 1 && !validateStepOne()) return;
    if (currentStep < 3) setCurrentStep((s) => (s + 1) as 2 | 3);
  };

  const submit = () => {
    if (!validateStepOne()) return;
    if (!validateStepThree()) return;

    const officialScore = scoreInput.trim() ? Number(scoreInput) : 0;
    let finalScore = 0;
    let finalMockScore = 0;
    if (scoreMode === "official") {
      finalScore = officialScore;
    } else if (scoreMode === "mock") {
      finalScore = form.mockScore;
      finalMockScore = form.mockScore;
    } else {
      const mockScores = [combinedMock1, combinedMock2, combinedMock3]
        .map((v) => (v.trim() ? Number(v) : 0))
        .filter((v) => v > 0);
      const avgMock = mockScores.length > 0 ? mockScores.reduce((sum, n) => sum + n, 0) / mockScores.length : 0;
      finalMockScore = avgMock > 0 ? Math.round(avgMock) : 0;
      finalScore = officialScore > 0 ? officialScore : Math.round(avgMock);
    }
    if (finalScore <= 0) {
      toast.error("分数填写不完整，请检查");
      return;
    }

    const profile: UserProfile = {
      ...form,
      score: finalScore,
      mockScore: finalMockScore,
      priorityMode: prefPriority as PreferencePriority,
      futurePlan: prefFuture as FuturePlan,
      schoolTierPreference,
      focusMajorReputation: form.focusMajorReputation
    };
    saveProfile(profile);
    toast.success("画像已保存", { description: "正在进入推荐结果页" });
    router.push("/results");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">安徽考生信息采集</CardTitle>
          <CardDescription>分步填写核心信息与偏好，数据仅存于本机浏览器。</CardDescription>
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
            本工具支持出分前用模考成绩提前规划，也支持出分后按正式成绩生成方案。
          </div>
          <div className="rounded-lg border bg-muted/40 px-3 py-2">
            <p className="text-sm font-medium">第 {currentStep} 步 / 共三步</p>
            <p className="text-xs text-muted-foreground">
              {currentStep === 1 && "第一步：基础与分数（先确定分数场景，再填写核心信息）"}
              {currentStep === 2 && "第二步：硬约束排除（可选，填了会更贴合你的真实诉求）"}
              {currentStep === 3 && "第三步：偏好与路径（确定排序偏好和规划方向）"}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                <Label>先选择你目前的情况</Label>
                <div className="grid gap-2 md:grid-cols-3">
                  {[
                    { value: "official", title: "我已经有正式高考分数", desc: "适用于出分后正式填报" },
                    { value: "mock", title: "我现在只有模考/预估成绩", desc: "适用于出分前提前规划" },
                    { value: "combined", title: "我想综合多个阶段成绩参考", desc: "系统会综合成绩给更稳妥方向" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setScoreMode(option.value as ScoreMode)}
                      className={`rounded-md border px-3 py-3 text-left text-sm transition ${
                        scoreMode === option.value
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-input bg-background hover:border-blue-400"
                      }`}
                    >
                      <p className="font-medium">{option.title}</p>
                      <p className={`mt-1 text-xs ${scoreMode === option.value ? "text-blue-100" : "text-muted-foreground"}`}>{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {scoreMode === "official" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="score">高考分数（正式分）</Label>
                    <Input
                      id="score"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="出分后填写正式成绩"
                      className="no-spinner"
                      value={scoreInput}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        setScoreInput(digits);
                        const n = digits === "" ? 0 : parseInt(digits, 10);
                        setForm((f) => ({ ...f, score: Number.isNaN(n) ? 0 : n }));
                      }}
                    />
                    <p className="text-xs text-muted-foreground">适用于正式出分后，系统将以正式分为准。</p>
                  </div>
                )}

                {scoreMode === "mock" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="grade-mode">当前年级</Label>
                      <Select value={gradeMode || undefined} onValueChange={(v) => setGradeMode(v as GradeMode)}>
                        <SelectTrigger id="grade-mode">
                          <SelectValue placeholder="请选择年级" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high1">高一</SelectItem>
                          <SelectItem value="high2">高二</SelectItem>
                          <SelectItem value="high3">高三</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mock-type">模考类型</Label>
                      <Select value={mockExamType || undefined} onValueChange={setMockExamType}>
                        <SelectTrigger id="mock-type">
                          <SelectValue placeholder="请选择模考类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high1-stage">高一阶段考试</SelectItem>
                          <SelectItem value="high2-stage">高二阶段考试</SelectItem>
                          <SelectItem value="high3-1">高三一模</SelectItem>
                          <SelectItem value="high3-2">高三二模</SelectItem>
                          <SelectItem value="high3-3">高三三模</SelectItem>
                          <SelectItem value="other">其他校内大型考试</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="mock-score">模考分数</Label>
                      <Input
                        id="mock-score"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="请输入模考分数"
                        className="no-spinner"
                        value={mockScoreInput}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          setMockScoreInput(digits);
                          const n = digits === "" ? 0 : parseInt(digits, 10);
                          setForm((f) => ({ ...f, mockScore: Number.isNaN(n) ? 0 : n }));
                        }}
                      />
                      <p className="text-xs text-muted-foreground">适用于出分前做提前规划。</p>
                    </div>
                  </>
                )}

                {scoreMode === "combined" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="score-combined">高考正式分（如有）</Label>
                      <Input
                        id="score-combined"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="如暂无可留空"
                        className="no-spinner"
                        value={scoreInput}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          setScoreInput(digits);
                          const n = digits === "" ? 0 : parseInt(digits, 10);
                          setForm((f) => ({ ...f, score: Number.isNaN(n) ? 0 : n }));
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="combined-1">一模分数</Label>
                      <Input
                        id="combined-1"
                        type="text"
                        inputMode="numeric"
                        className="no-spinner"
                        value={combinedMock1}
                        onChange={(e) => setCombinedMock1(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="combined-2">二模分数</Label>
                      <Input
                        id="combined-2"
                        type="text"
                        inputMode="numeric"
                        className="no-spinner"
                        value={combinedMock2}
                        onChange={(e) => setCombinedMock2(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="combined-3">三模分数</Label>
                      <Input
                        id="combined-3"
                        type="text"
                        inputMode="numeric"
                        className="no-spinner"
                        value={combinedMock3}
                        onChange={(e) => setCombinedMock3(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground md:col-span-2">
                      系统会综合不同阶段成绩做更稳妥的方向参考。
                    </p>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="rank-range">全省位次（区间）</Label>
                  <Select
                    value={selectedRankRange || undefined}
                    onValueChange={(value) => {
                      setSelectedRankRange(value);
                      const found = rankRangeOptions.find((item) => item.value === value);
                      if (found) setForm((f) => ({ ...f, rank: found.rank }));
                    }}
                  >
                    <SelectTrigger id="rank-range">
                      <SelectValue placeholder="选择位次区间" />
                    </SelectTrigger>
                    <SelectContent>
                      {rankRangeOptions.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">用于评估录取风险，区间越合理推荐越稳定</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="subject">科类 / 选科组合</Label>
                  <Select
                    value={selectedSubjectOption || undefined}
                    onValueChange={(value) => {
                      setSelectedSubjectOption(value);
                      setForm((f) => ({
                        ...f,
                        subjectType: value === "其他组合" ? customSubject || "其他组合" : value
                      }));
                    }}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="请选择选科组合" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectOptions.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedSubjectOption === "其他组合" && (
                    <Input
                      value={customSubject}
                      placeholder="请输入你的选科组合"
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomSubject(value);
                        setForm((f) => ({ ...f, subjectType: value || "其他组合" }));
                      }}
                    />
                  )}
                  <p className="text-xs text-muted-foreground">用于筛选可报考专业范围</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tuition-tier">可接受学费（元/年）</Label>
                  <Select
                    value={tuitionTier || undefined}
                    onValueChange={(value) => {
                      setTuitionTier(value);
                      if (value === "other") {
                        setCustomTuitionInput((prev) =>
                          prev || (form.tuitionMax > 0 ? String(form.tuitionMax) : "")
                        );
                        return;
                      }
                      const opt = tuitionTierOptions.find((o) => o.value === value);
                      if (opt && opt.tuitionMax !== null) {
                        setCustomTuitionInput("");
                        setForm((f) => ({ ...f, tuitionMax: opt.tuitionMax as number }));
                      }
                    }}
                  >
                    <SelectTrigger id="tuition-tier">
                      <SelectValue placeholder="选择学费区间" />
                    </SelectTrigger>
                    <SelectContent>
                      {tuitionTierOptions.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {tuitionTier === "other" && (
                    <Input
                      id="tuition-custom"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      className="no-spinner"
                      placeholder="请输入可接受最高学费（元/年）"
                      value={customTuitionInput}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        setCustomTuitionInput(digits);
                        if (digits === "") {
                          setForm((f) => ({ ...f, tuitionMax: 0 }));
                          return;
                        }
                        const n = parseInt(digits, 10);
                        setForm((f) => ({ ...f, tuitionMax: Number.isNaN(n) ? 0 : n }));
                      }}
                    />
                  )}
                  <p className="text-xs text-muted-foreground">按区间估算成本；选「其他」可精确填写</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="region-preference">更倾向的地区</Label>
                  <Select
                    value={selectedRegionPreference || undefined}
                    onValueChange={(value) => {
                      setSelectedRegionPreference(value);
                      setForm((f) => ({
                        ...f,
                        preferredRegions: [value],
                        maxDistanceTier: "nationwide"
                      }));
                    }}
                  >
                    <SelectTrigger id="region-preference">
                      <SelectValue placeholder="选择更倾向的地区" />
                    </SelectTrigger>
                    <SelectContent>
                      {regionPreferenceOptions.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">影响推荐城市偏好与排序权重</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-dashed bg-muted/20 p-4">
                <p className="text-sm font-medium">硬约束排除（可选）</p>
                <p className="mt-1 text-xs text-muted-foreground">这部分为可选项，不填也可正常生成报告。只在你明确不考虑某些城市/省份/专业时再展开填写。</p>
                <details className="mt-3 rounded-md border bg-background p-3">
                  <summary className="cursor-pointer text-sm font-medium">展开高级筛选（可选）</summary>
                  <div className="mt-3 space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="flex flex-1 gap-2">
                        <Input
                          placeholder="排除城市，如：广州"
                          value={excludeCity}
                          onChange={(e) => setExcludeCity(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            if (!excludeCity.trim()) return;
                            setForm((f) => ({
                              ...f,
                              excludedCities: Array.from(new Set([...f.excludedCities, excludeCity.trim()]))
                            }));
                            setExcludeCity("");
                          }}
                        >
                          添加城市
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="flex flex-1 gap-2">
                        <Input
                          placeholder="排除省份，如：黑龙江"
                          value={excludeProvince}
                          onChange={(e) => setExcludeProvince(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            if (!excludeProvince.trim()) return;
                            setForm((f) => ({
                              ...f,
                              excludedProvinces: Array.from(new Set([...f.excludedProvinces, excludeProvince.trim()]))
                            }));
                            setExcludeProvince("");
                          }}
                        >
                          添加省份
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="mb-2 text-sm font-medium">专业排除快速标签（可选）</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {majorQuickTags.map((tag) => {
                          const checked = form.excludedMajors.includes(tag);
                          return (
                            <div key={tag} className="flex items-center gap-2">
                              <Checkbox
                                id={`major-tag-${tag}`}
                                checked={checked}
                                onCheckedChange={(value) => {
                                  if (value === true) {
                                    setForm((f) => ({
                                      ...f,
                                      excludedMajors: Array.from(new Set([...f.excludedMajors, tag]))
                                    }));
                                  } else {
                                    setForm((f) => ({
                                      ...f,
                                      excludedMajors: f.excludedMajors.filter((item) => item !== tag)
                                    }));
                                  }
                                }}
                              />
                              <Label htmlFor={`major-tag-${tag}`} className="font-normal">
                                {tag}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        placeholder="补充不考虑专业，例如：口腔医学"
                        value={excludeMajor}
                        onChange={(e) => setExcludeMajor(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          if (!excludeMajor.trim()) return;
                          setForm((f) => ({
                            ...f,
                            excludedMajors: Array.from(new Set([...f.excludedMajors, excludeMajor.trim()]))
                          }));
                          setExcludeMajor("");
                        }}
                      >
                        添加专业
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      当前已排除：城市 {form.excludedCities.join("、") || "无"}；省份 {form.excludedProvinces.join("、") || "无"}；专业 {form.excludedMajors.join("、") || "无"}
                    </p>
                  </div>
                </details>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="private"
                    checked={form.acceptPrivate}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, acceptPrivate: v === true }))}
                  />
                  <Label htmlFor="private" className="font-normal">
                    接受民办院校
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="sino"
                    checked={form.acceptSinoForeign}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, acceptSinoForeign: v === true }))}
                  />
                  <Label htmlFor="sino" className="font-normal">
                    接受中外合作 / 高学费项目
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="adj"
                    checked={form.acceptAdjustment}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, acceptAdjustment: v === true }))}
                  />
                  <Label htmlFor="adj" className="font-normal">
                    接受专业调剂
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="cold"
                    checked={form.acceptUnpopularMajor}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, acceptUnpopularMajor: v === true }))}
                  />
                  <Label htmlFor="cold" className="font-normal">
                    接受相对冷门专业
                  </Label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">家长最关心：985 / 211 / 双一流优先怎么选</p>
                <p className="mt-1 text-xs text-blue-800">这会直接影响推荐排序，建议先选一项最符合你家诉求的方向。</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {schoolTierPreferenceOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSchoolTierPreference(option.value)}
                      className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                        schoolTierPreference === option.value
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-blue-200 bg-white text-slate-700 hover:border-blue-400"
                      }`}
                    >
                      <p className="font-medium">{option.label}</p>
                      <p className={`text-xs ${schoolTierPreference === option.value ? "text-blue-100" : "text-muted-foreground"}`}>{option.tip}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="priority">排序偏好</Label>
                  <Select
                    value={prefPriority}
                    onValueChange={(value) => setPrefPriority(value as PreferencePriority)}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="选择排序偏好" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="major">专业优先</SelectItem>
                      <SelectItem value="school">学校优先</SelectItem>
                      <SelectItem value="city">城市优先</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">影响系统推荐排序方式</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="future">毕业方向侧重</Label>
                  <Select
                    value={prefFuture}
                    onValueChange={(value) => setPrefFuture(value as FuturePlan)}
                  >
                    <SelectTrigger id="future">
                      <SelectValue placeholder="选择毕业方向" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="job">就业</SelectItem>
                      <SelectItem value="postgraduate">考研</SelectItem>
                      <SelectItem value="civil_service">考公</SelectItem>
                      <SelectItem value="abroad">出国</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">影响推荐专业方向</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="industries">意向行业（逗号分隔）</Label>
                  <Input
                    id="industries"
                    value={form.targetIndustries.join(",")}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        targetIndustries: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">用于匹配专业方向与就业路径</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 sm:col-span-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                  <Checkbox
                    id="major-fame"
                    checked={form.focusMajorReputation}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, focusMajorReputation: v === true }))}
                  />
                  <Label htmlFor="major-fame" className="font-normal text-amber-900">
                    着重专业知名度（家长更容易认可、社会认知度更高）
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="near"
                    checked={form.preferNearHome}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, preferNearHome: v === true }))}
                  />
                  <Label htmlFor="near" className="font-normal">
                    倾向离家近 / 高铁可达
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="leave"
                    checked={form.willingLeaveAnhui}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, willingLeaveAnhui: v === true }))}
                  />
                  <Label htmlFor="leave" className="font-normal">
                    愿意出省就读
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="campus"
                    checked={form.valueCampus}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, valueCampus: v === true }))}
                  />
                  <Label htmlFor="campus" className="font-normal">
                    看重校园环境
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="citydev"
                    checked={form.valueCityDevelopment}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, valueCityDevelopment: v === true }))}
                  />
                  <Label htmlFor="citydev" className="font-normal">
                    看重城市发展
                  </Label>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Checkbox
                    id="localjob"
                    checked={form.planWorkLocallyAfterGrad}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, planWorkLocallyAfterGrad: v === true }))}
                  />
                  <Label htmlFor="localjob" className="font-normal">
                    希望本科毕业后留在读书城市工作
                  </Label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((s) => (s - 1) as 1 | 2)}
            >
              上一步
            </Button>
            {currentStep < 3 ? (
              <Button type="button" onClick={goNextStep}>
                下一步
              </Button>
            ) : (
              <Button type="button" onClick={submit}>
                生成报告
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setCurrentStep(1);
            setScoreMode("");
            setForm(defaultProfile);
            setScoreInput(defaultProfile.score > 0 ? String(defaultProfile.score) : "");
            setMockScoreInput(defaultProfile.mockScore > 0 ? String(defaultProfile.mockScore) : "");
            setCombinedMock1("");
            setCombinedMock2("");
            setCombinedMock3("");
            setGradeMode("high3");
            setMockExamType("high3-1");
            setTuitionTier(tuitionTierFromAmount(defaultProfile.tuitionMax));
            setCustomTuitionInput(
              tuitionTierFromAmount(defaultProfile.tuitionMax) === "other"
                ? String(defaultProfile.tuitionMax)
                : ""
            );
            setSelectedRankRange("18000-25000");
            setSelectedSubjectOption("物理+化学+地理");
            setCustomSubject("");
            setSelectedRegionPreference("长三角优先（江苏/浙江/上海）");
            setPrefPriority(defaultProfile.priorityMode);
            setPrefFuture(defaultProfile.futurePlan);
            setSchoolTierPreference(defaultProfile.schoolTierPreference);
          }}
        >
          恢复默认示例
        </Button>
      </div>
    </div>
  );
}
