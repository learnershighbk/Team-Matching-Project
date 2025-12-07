import { COURSE_ERROR_CODES, type CourseErrorCode } from '@/lib/errors/codes';

export const studentErrorCodes = {
  courseNotFound: COURSE_ERROR_CODES.NOT_FOUND,
  deadlinePassed: COURSE_ERROR_CODES.DEADLINE_PASSED,
  fetchError: COURSE_ERROR_CODES.FETCH_ERROR,
  notFound: COURSE_ERROR_CODES.NOT_FOUND,
} as const;

export type StudentServiceError = CourseErrorCode;

