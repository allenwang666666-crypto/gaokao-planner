export type PreferencePriority = "major" | "school" | "city";
export type FuturePlan = "job" | "postgraduate" | "civil_service" | "abroad";
export type RiskLabel = "冲" | "稳" | "保";
export type StrategyType = "planA" | "planB" | "nearHome" | "balanced";
export type SchoolTierPreference =
  | "985"
  | "211"
  | "double_first_class"
  | "school_tier"
  | "major_development"
  | "balanced";

export interface UserProfile {
  province: "安徽";
  city: string;
  district: string;
  subjectType: string;
  mockScore: number;
  score: number;
  rank: number;
  budgetLevel: "low" | "medium" | "high";
  tuitionMax: number;
  acceptPrivate: boolean;
  acceptSinoForeign: boolean;
  acceptAdjustment: boolean;
  acceptUnpopularMajor: boolean;
  willingLeaveAnhui: boolean;
  maxDistanceTier: "local" | "east_china" | "nationwide";
  excludedCities: string[];
  excludedProvinces: string[];
  preferredCities: string[];
  preferredRegions: string[];
  priorityMode: PreferencePriority;
  futurePlan: FuturePlan;
  schoolTierPreference: SchoolTierPreference;
  focusMajorReputation: boolean;
  targetIndustries: string[];
  personalityTags: string[];
  preferNearHome: boolean;
  valueCampus: boolean;
  valueCityDevelopment: boolean;
  planWorkLocallyAfterGrad: boolean;
  excludedMajors: string[];
}

export interface AdmissionData { year: number; minScore: number; minRank: number; }

export interface MajorItem {
  id: string;
  name: string;
  tuition: number;
  adjustmentRisk: number;
  popularity: number;
  employmentIndex: number;
  postgraduateIndex: number;
  civilServiceIndex: number;
  industryTags: string[];
  admission: AdmissionData[];
}

export interface UniversityItem {
  id: string;
  name: string;
  province: string;
  city: string;
  region: string;
  tier: "985" | "211" | "双一流" | "省重点" | "普通本科";
  schoolType: "public" | "private";
  isSinoForeign: boolean;
  monthlyCost: number;
  distanceKmFromXiaoXian: number;
  transportConvenience: number;
  cityDevelopmentIndex: number;
  majors: MajorItem[];
}

export interface ScoreBreakdown {
  majorMatch: number;
  schoolTier: number;
  cityPreference: number;
  admitSafety: number;
  costFit: number;
  futureFit: number;
  total: number;
  weights: Record<string, number>;
}

export interface RecommendationItem {
  universityId: string;
  universityName: string;
  majorId: string;
  majorName: string;
  city: string;
  province: string;
  schoolType: "public" | "private";
  tierLabel: UniversityItem["tier"];
  riskLabel: RiskLabel;
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  recommendReason: string[];
  riskTips: string[];
  tuition: number;
  costLabel: "低" | "中" | "高";
}

export interface StrategyPlan { strategy: StrategyType; title: string; description: string; items: RecommendationItem[]; }
