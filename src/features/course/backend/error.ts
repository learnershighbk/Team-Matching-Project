import { COURSE_ERROR_CODES, type CourseErrorCode } from '@/lib/errors/codes';

export const courseErrorCodes = {
  notFound: COURSE_ERROR_CODES.NOT_FOUND,
  deadlinePassed: COURSE_ERROR_CODES.DEADLINE_PASSED,
  cannotModify: COURSE_ERROR_CODES.CANNOT_MODIFY,
  alreadyLocked: COURSE_ERROR_CODES.ALREADY_LOCKED,
  cannotMatch: COURSE_ERROR_CODES.CANNOT_MATCH,
} as const;

export type CourseServiceError = CourseErrorCode;

