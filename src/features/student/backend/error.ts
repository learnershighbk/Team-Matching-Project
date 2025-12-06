import { COURSE_ERROR_CODES, type CourseErrorCode } from '@/lib/errors/codes';

export const studentErrorCodes = {
  courseNotFound: COURSE_ERROR_CODES.NOT_FOUND,
  deadlinePassed: COURSE_ERROR_CODES.DEADLINE_PASSED,
} as const;

export type StudentServiceError = CourseErrorCode;

