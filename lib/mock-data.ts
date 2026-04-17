import { UniversityItem, UserProfile } from "@/lib/types";

/** 信息采集页初始状态：无示例分数/位次等，需用户自行填写 */
export const emptyIntakeProfile: UserProfile = {
  province: "安徽",
  city: "",
  district: "",
  subjectType: "",
  mockScore: 0,
  score: 0,
  rank: 0,
  budgetLevel: "medium",
  tuitionMax: 0,
  acceptPrivate: false,
  acceptSinoForeign: false,
  acceptAdjustment: false,
  acceptUnpopularMajor: false,
  willingLeaveAnhui: false,
  maxDistanceTier: "nationwide",
  excludedCities: [],
  excludedProvinces: [],
  preferredCities: [],
  preferredRegions: [],
  priorityMode: "major",
  futurePlan: "job",
  schoolTierPreference: "balanced",
  focusMajorReputation: false,
  targetIndustries: [],
  personalityTags: [],
  preferNearHome: false,
  valueCampus: false,
  valueCityDevelopment: false,
  planWorkLocallyAfterGrad: false,
  excludedMajors: []
};

export const defaultProfile: UserProfile = {
  province: "安徽",
  city: "宿州市",
  district: "萧县",
  subjectType: "物理+化学+地理",
  mockScore: 580,
  score: 588,
  rank: 21500,
  budgetLevel: "medium",
  tuitionMax: 12000,
  acceptPrivate: false,
  acceptSinoForeign: false,
  acceptAdjustment: false,
  acceptUnpopularMajor: false,
  willingLeaveAnhui: true,
  maxDistanceTier: "east_china",
  excludedCities: ["哈尔滨", "长春"],
  excludedProvinces: ["黑龙江", "吉林"],
  preferredCities: ["合肥", "南京", "杭州", "苏州"],
  preferredRegions: ["长三角", "华东"],
  priorityMode: "major",
  futurePlan: "job",
  schoolTierPreference: "school_tier",
  focusMajorReputation: true,
  targetIndustries: ["互联网", "制造业", "公务员"],
  personalityTags: ["务实导向", "稳定导向"],
  preferNearHome: true,
  valueCampus: true,
  valueCityDevelopment: true,
  planWorkLocallyAfterGrad: false,
  excludedMajors: ["临床医学"]
};

export const universities: UniversityItem[] = [
  { id: "ahut", name: "安徽工业大学", province: "安徽", city: "马鞍山", region: "华东", tier: "省重点", schoolType: "public", isSinoForeign: false, monthlyCost: 1800, distanceKmFromXiaoXian: 360, transportConvenience: 85, cityDevelopmentIndex: 78,
    majors: [
      { id: "soft-ahut", name: "软件工程", tuition: 6500, adjustmentRisk: 40, popularity: 84, employmentIndex: 88, postgraduateIndex: 75, civilServiceIndex: 60, industryTags: ["互联网", "制造业"], admission: [{ year: 2025, minScore: 576, minRank: 26000 }, { year: 2024, minScore: 571, minRank: 28500 }, { year: 2023, minScore: 568, minRank: 30200 }] },
      { id: "auto-ahut", name: "自动化", tuition: 6200, adjustmentRisk: 35, popularity: 76, employmentIndex: 87, postgraduateIndex: 72, civilServiceIndex: 63, industryTags: ["制造业"], admission: [{ year: 2025, minScore: 568, minRank: 30000 }, { year: 2024, minScore: 565, minRank: 31800 }, { year: 2023, minScore: 562, minRank: 33600 }] }
    ]
  },
  { id: "njupt", name: "南京邮电大学", province: "江苏", city: "南京", region: "长三角", tier: "双一流", schoolType: "public", isSinoForeign: false, monthlyCost: 2600, distanceKmFromXiaoXian: 350, transportConvenience: 92, cityDevelopmentIndex: 93,
    majors: [{ id: "ai-njupt", name: "人工智能", tuition: 6800, adjustmentRisk: 45, popularity: 90, employmentIndex: 92, postgraduateIndex: 82, civilServiceIndex: 60, industryTags: ["互联网"], admission: [{ year: 2025, minScore: 604, minRank: 15800 }, { year: 2024, minScore: 599, minRank: 17500 }, { year: 2023, minScore: 596, minRank: 19300 }] }]
  },
  { id: "sdut", name: "山东理工大学", province: "山东", city: "淄博", region: "华东", tier: "普通本科", schoolType: "public", isSinoForeign: false, monthlyCost: 2000, distanceKmFromXiaoXian: 470, transportConvenience: 80, cityDevelopmentIndex: 70,
    majors: [{ id: "me-sdut", name: "机械设计制造及其自动化", tuition: 6000, adjustmentRisk: 30, popularity: 70, employmentIndex: 84, postgraduateIndex: 68, civilServiceIndex: 59, industryTags: ["制造业"], admission: [{ year: 2025, minScore: 552, minRank: 40200 }, { year: 2024, minScore: 548, minRank: 43000 }, { year: 2023, minScore: 546, minRank: 44500 }] }]
  },
  { id: "jnu", name: "暨南大学", province: "广东", city: "广州", region: "华南", tier: "211", schoolType: "public", isSinoForeign: false, monthlyCost: 3300, distanceKmFromXiaoXian: 1450, transportConvenience: 88, cityDevelopmentIndex: 95,
    majors: [{ id: "econ-jnu", name: "经济学", tuition: 6850, adjustmentRisk: 42, popularity: 80, employmentIndex: 86, postgraduateIndex: 84, civilServiceIndex: 79, industryTags: ["金融", "公务员"], admission: [{ year: 2025, minScore: 610, minRank: 14000 }, { year: 2024, minScore: 605, minRank: 16000 }, { year: 2023, minScore: 602, minRank: 17200 }] }]
  },
  { id: "x-private", name: "某沿海民办学院", province: "浙江", city: "宁波", region: "长三角", tier: "普通本科", schoolType: "private", isSinoForeign: true, monthlyCost: 3600, distanceKmFromXiaoXian: 720, transportConvenience: 83, cityDevelopmentIndex: 90,
    majors: [{ id: "biz-x", name: "国际商务", tuition: 38000, adjustmentRisk: 48, popularity: 66, employmentIndex: 73, postgraduateIndex: 55, civilServiceIndex: 46, industryTags: ["金融"], admission: [{ year: 2025, minScore: 520, minRank: 72000 }, { year: 2024, minScore: 516, minRank: 75000 }, { year: 2023, minScore: 512, minRank: 78000 }] }]
  }
];
