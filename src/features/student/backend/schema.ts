import { z } from 'zod';

/**
 * Student Feature Zod 스키마
 */

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(100, '이름은 100자 이하여야 합니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  major: z.enum(['Undergraduate', 'Master', 'PhD']),
  gender: z.enum(['Male', 'Female', 'Other']),
  continent: z.enum(['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania']),
  role: z.enum(['Leader', 'Member', 'Flexible']),
  skill: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  times: z.array(z.enum(['Morning', 'Afternoon', 'Evening'])).min(1, '최소 1개의 시간대를 선택해주세요'),
  goal: z.enum(['Learn', 'Complete', 'Excel']),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

