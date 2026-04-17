import { defaultProfile } from "@/lib/mock-data";
import type { UserProfile } from "@/lib/types";

/** 将部分字段与默认画像合并，供 API 与本地恢复使用 */
export function mergeUserProfile(partial: Partial<UserProfile>): UserProfile {
  return {
    ...defaultProfile,
    ...partial,
    excludedCities: partial.excludedCities ?? defaultProfile.excludedCities,
    excludedProvinces: partial.excludedProvinces ?? defaultProfile.excludedProvinces,
    preferredCities: partial.preferredCities ?? defaultProfile.preferredCities,
    preferredRegions: partial.preferredRegions ?? defaultProfile.preferredRegions,
    targetIndustries: partial.targetIndustries ?? defaultProfile.targetIndustries,
    personalityTags: partial.personalityTags ?? defaultProfile.personalityTags,
    excludedMajors: partial.excludedMajors ?? defaultProfile.excludedMajors
  };
}
