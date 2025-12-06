/**
 * 가중치 프로파일 정의
 * 
 * 참조: docs/MATCHING_ALGORITHM.md
 */

export type WeightProfile = {
  time: number;
  skill: number;
  role: number;
  major: number;
  goal: number;
  continent: number;
  gender: number;
};

export const WEIGHT_PROFILES: Record<string, WeightProfile> = {
  balanced: {
    time: 4,
    skill: 3,
    role: 2,
    major: 2,
    goal: 1,
    continent: 2,
    gender: 1.5,
  },
  skill_heavy: {
    time: 3,
    skill: 5,
    role: 2,
    major: 1.5,
    goal: 1,
    continent: 1.5,
    gender: 1.5,
  },
  diversity_heavy: {
    time: 2,
    skill: 2,
    role: 2,
    major: 4,
    goal: 1,
    continent: 4,
    gender: 2.5,
  },
  time_heavy: {
    time: 6,
    skill: 2,
    role: 1.5,
    major: 1.5,
    goal: 1,
    continent: 1.5,
    gender: 1.5,
  },
};

/**
 * 가중치 프로파일 가져오기
 */
export function getWeightProfile(profileName: string): WeightProfile {
  return WEIGHT_PROFILES[profileName] || WEIGHT_PROFILES.balanced;
}

