import { z } from 'zod';

/**
 * Admin Feature Zod 스키마
 */

export const CreateInstructorSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  pin: z.string().regex(/^\d{4}$/, 'PIN은 4자리 숫자여야 합니다'),
  name: z.string().min(1, '이름을 입력해주세요').max(100, '이름은 100자 이하여야 합니다'),
});

export const UpdateInstructorSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다').optional(),
  pin: z.string().regex(/^\d{4}$/, 'PIN은 4자리 숫자여야 합니다').optional(),
  name: z.string().min(1, '이름을 입력해주세요').max(100, '이름은 100자 이하여야 합니다').optional(),
});

export const ResetStudentPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, 'PIN은 4자리 숫자여야 합니다'),
});

export const UpdateCourseDeadlineSchema = z.object({
  deadline: z.string().datetime('올바른 날짜 형식이 아닙니다'),
});

export type CreateInstructorInput = z.infer<typeof CreateInstructorSchema>;
export type UpdateInstructorInput = z.infer<typeof UpdateInstructorSchema>;
export type ResetStudentPinInput = z.infer<typeof ResetStudentPinSchema>;
export type UpdateCourseDeadlineInput = z.infer<typeof UpdateCourseDeadlineSchema>;

