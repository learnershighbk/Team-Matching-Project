import { z } from 'zod';

/**
 * Course Feature Zod 스키마
 */

export const CourseIdParamsSchema = z.object({
  id: z.string().uuid('올바른 UUID 형식이 아닙니다'),
});

export type CourseIdParams = z.infer<typeof CourseIdParamsSchema>;



