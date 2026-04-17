import { defaultProfile, universities } from "@/lib/mock-data";
import { RecommendationItem, RiskLabel, ScoreBreakdown, StrategyPlan, StrategyType, UniversityItem, UserProfile } from "@/lib/types";

const tierScoreMap: Record<UniversityItem["tier"], number> = { "985": 100, "211": 92, "双一流": 86, "省重点": 76, "普通本科": 65 };

const avgRank = (arr: { minRank: number }[]) => arr.reduce((s, i) => s + i.minRank, 0) / arr.length;
const normalize = (v: number, min = 0, max = 100) => ((Math.max(min, Math.min(max, v)) - min) / (max - min));

function risk(userRank: number, majorRank: number): RiskLabel { const r = userRank / majorRank; if (r <= 0.88) return "冲"; if (r <= 1.08) return "稳"; return "保"; }
function costLabel(v: number): "低" | "中" | "高" { if (v < 2200) return "低"; if (v < 3000) return "中"; return "高"; }

function weights(profile: UserProfile, strategy: StrategyType) {
  const w = { majorMatch: 0.30, schoolTier: 0.15, cityPreference: 0.15, admitSafety: 0.20, costFit: 0.10, futureFit: 0.10 };
  if (profile.priorityMode === "major") { w.majorMatch += 0.1; w.schoolTier -= 0.05; w.cityPreference -= 0.05; }
  if (profile.priorityMode === "school") { w.schoolTier += 0.08; w.majorMatch -= 0.05; w.cityPreference -= 0.03; }
  if (profile.priorityMode === "city") { w.cityPreference += 0.1; w.admitSafety -= 0.05; w.schoolTier -= 0.05; }
  if (strategy === "rushSchool") { w.schoolTier += 0.08; w.admitSafety -= 0.08; }
  if (strategy === "stableJob") { w.futureFit += 0.06; w.admitSafety += 0.06; w.schoolTier -= 0.06; w.cityPreference -= 0.06; }
  if (strategy === "nearHome") { w.cityPreference += 0.1; w.costFit += 0.05; w.schoolTier -= 0.05; w.majorMatch -= 0.05; w.admitSafety -= 0.05; }
  const sum = Object.values(w).reduce((s, n) => s + n, 0);
  return Object.fromEntries(Object.entries(w).map(([k, v]) => [k, Number((v / sum).toFixed(4))]));
}

function hardFilter(p: UserProfile, s: UniversityItem, m: UniversityItem["majors"][number]): boolean {
  if (p.excludedCities.includes(s.city)) return false;
  if (p.excludedProvinces.includes(s.province)) return false;
  if (!p.acceptPrivate && s.schoolType === "private") return false;
  if (!p.acceptSinoForeign && s.isSinoForeign) return false;
  if (m.tuition > p.tuitionMax) return false;
  if (p.excludedMajors.includes(m.name)) return false;
  if (!p.willingLeaveAnhui && s.province !== "安徽") return false;
  if (!p.acceptAdjustment && m.adjustmentRisk > 40) return false;
  if (!p.acceptUnpopularMajor && m.popularity < 50) return false;
  if (p.maxDistanceTier === "local" && s.distanceKmFromXiaoXian > 450) return false;
  if (p.maxDistanceTier === "east_china" && !["华东", "长三角", "安徽"].includes(s.region)) return false;
  return true;
}

function futureFitValue(p: UserProfile, m: UniversityItem["majors"][number]) {
  if (p.futurePlan === "job") return m.employmentIndex;
  if (p.futurePlan === "postgraduate") return m.postgraduateIndex;
  if (p.futurePlan === "civil_service") return m.civilServiceIndex;
  return (m.employmentIndex + m.postgraduateIndex) / 2;
}

function score(p: UserProfile, s: UniversityItem, m: UniversityItem["majors"][number], st: StrategyType): ScoreBreakdown {
  const rank = Math.max(p.rank, 1);
  const averageRank = avgRank(m.admission);
  const admitSafety = normalize((averageRank / rank) * 100) * 100;
  const industryBonus = p.targetIndustries.some((tag) => m.industryTags.includes(tag)) ? 10 : 0;
  const majorMatch = Math.min(100, m.employmentIndex * 0.35 + m.postgraduateIndex * 0.25 + m.popularity * 0.2 + industryBonus + (100 - m.adjustmentRisk) * 0.2);
  const schoolTier = tierScoreMap[s.tier];
  const distancePenalty = p.preferNearHome ? Math.max(0, s.distanceKmFromXiaoXian / 20) : Math.max(0, s.distanceKmFromXiaoXian / 40);
  const cityBonus = p.preferredCities.includes(s.city) ? 15 : 0;
  const cityPreference = Math.max(1, Math.min(100, s.cityDevelopmentIndex * 0.45 + s.transportConvenience * 0.35 + cityBonus - distancePenalty));
  const budgetLine = p.budgetLevel === "low" ? 2500 : p.budgetLevel === "medium" ? 3400 : 4500;
  const costPressure = s.monthlyCost + m.tuition / 10;
  const costFit = Math.max(1, Math.min(100, 100 - Math.max(0, costPressure - budgetLine) / 20));
  const futureFit = futureFitValue(p, m);
  const w = weights(p, st);
  const total = majorMatch * w.majorMatch + schoolTier * w.schoolTier + cityPreference * w.cityPreference + admitSafety * w.admitSafety + costFit * w.costFit + futureFit * w.futureFit;
  return { majorMatch: +majorMatch.toFixed(2), schoolTier, cityPreference: +cityPreference.toFixed(2), admitSafety: +admitSafety.toFixed(2), costFit: +costFit.toFixed(2), futureFit: +futureFit.toFixed(2), total: +total.toFixed(2), weights: w };
}

function byStrategy(profile: UserProfile, strategy: StrategyType): RecommendationItem[] {
  const out: RecommendationItem[] = [];
  for (const school of universities) {
    for (const major of school.majors) {
      if (!hardFilter(profile, school, major)) continue;
      const breakdown = score(profile, school, major, strategy);
      const r = risk(Math.max(profile.rank, 1), avgRank(major.admission));
      out.push({
        universityId: school.id,
        universityName: school.name,
        majorId: major.id,
        majorName: major.name,
        city: school.city,
        province: school.province,
        schoolType: school.schoolType,
        tierLabel: school.tier,
        riskLabel: r,
        matchScore: breakdown.total,
        scoreBreakdown: breakdown,
        recommendReason: [
          `${major.name}与目标行业匹配，且就业指数 ${major.employmentIndex}/100。`,
          `${school.city}交通便利度 ${school.transportConvenience}/100，符合异地适应和往返效率。`,
          `综合分 ${breakdown.total}，由专业/城市/风险/成本联合打分。`
        ],
        riskTips: [r === "冲" ? "冲刺志愿，建议搭配更多稳保项。" : "风险总体可控，注意计划数波动。", major.adjustmentRisk > 38 ? "该专业调剂风险偏高。" : "调剂风险相对可控。"],
        tuition: major.tuition,
        costLabel: costLabel(school.monthlyCost)
      });
    }
  }
  return out.sort((a, b) => b.matchScore - a.matchScore).slice(0, 16);
}

export function generateStrategyPlans(profile: UserProfile = defaultProfile): StrategyPlan[] {
  return [
    { strategy: "rushSchool", title: "冲学校版本", description: "提高院校层次权重，接受一定录取波动。", items: byStrategy(profile, "rushSchool") },
    { strategy: "stableJob", title: "稳就业版本", description: "优先就业导向专业与城市产业匹配，控制录取风险。", items: byStrategy(profile, "stableJob") },
    { strategy: "nearHome", title: "离家近版本", description: "优先安徽及周边高铁可达城市，兼顾成本。", items: byStrategy(profile, "nearHome") },
    { strategy: "balanced", title: "综合平衡版本", description: "在学校层次、专业发展、城市和风险之间做均衡。", items: byStrategy(profile, "balanced") }
  ];
}
