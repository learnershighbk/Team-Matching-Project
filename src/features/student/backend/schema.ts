import { z } from 'zod';

/**
 * Student Feature Zod 스키마
 */

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(100, '이름은 100자 이하여야 합니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  major: z.enum(['MPP', 'MDP', 'MPM', 'MDS', 'MIPD', 'MPPM', 'PhD']),
  gender: z.enum(['male', 'female', 'other']),
  continent: z.enum(['asia', 'africa', 'europe', 'north_america', 'south_america', 'oceania']),
  role: z.enum(['leader', 'executor', 'ideator', 'coordinator']),
  skill: z.enum(['data_analysis', 'research', 'writing', 'visual', 'presentation']),
  times: z.array(z.enum(['weekday_daytime', 'weekday_evening', 'weekend'])).min(1, '최소 1개의 시간대를 선택해주세요'),
  goal: z.enum(['a_plus', 'balanced', 'minimum']),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

