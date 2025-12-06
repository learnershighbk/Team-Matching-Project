import { z } from 'zod';

/**
 * Instructor Feature Zod 스키마
 */

export const CreateCourseSchema = z.object({
  courseName: z.string().min(1, '코스 이름을 입력해주세요').max(200, '코스 이름은 200자 이하여야 합니다'),
  courseCode: z.string().min(1, '코스 코드를 입력해주세요').max(20, '코스 코드는 20자 이하여야 합니다'),
  teamSize: z.number().int().min(2, '팀 크기는 최소 2명이어야 합니다').max(6, '팀 크기는 최대 6명입니다'),
  weightProfile: z.enum(['balanced', 'skill_heavy', 'skill_role_focused', 'diversity_heavy', 'time_heavy']),
  deadline: z.string().datetime('올바른 날짜 형식이 아닙니다'),
});

export const UpdateCourseSchema = z.object({
  courseName: z.string().min(1).max(200).optional(),
  courseCode: z.string().min(1).max(20).optional(),
  teamSize: z.number().int().min(2).max(6).optional(),
  weightProfile: z.enum(['balanced', 'skill_heavy', 'skill_role_focused', 'diversity_heavy', 'time_heavy']).optional(),
  deadline: z.string().datetime().optional(),
});

export const MatchCourseSchema = z.object({
  weightProfile: z.enum(['balanced', 'skill_heavy', 'skill_role_focused', 'diversity_heavy', 'time_heavy']).optional(),
});

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>;
export type MatchCourseInput = z.infer<typeof MatchCourseSchema>;

