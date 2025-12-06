import {
  COURSE_ERROR_CODES,
  MATCH_ERROR_CODES,
  type CourseErrorCode,
  type MatchErrorCode
} from '@/lib/errors/codes';

export const instructorErrorCodes = {
  courseNotFound: COURSE_ERROR_CODES.NOT_FOUND,
  deadlinePassed: COURSE_ERROR_CODES.DEADLINE_PASSED,
  cannotModify: COURSE_ERROR_CODES.CANNOT_MODIFY,
  alreadyLocked: COURSE_ERROR_CODES.ALREADY_LOCKED,
  cannotMatch: COURSE_ERROR_CODES.CANNOT_MATCH,
  fetchError: COURSE_ERROR_CODES.FETCH_ERROR,
  validationError: COURSE_ERROR_CODES.VALIDATION_ERROR,
  matchInsufficientStudents: MATCH_ERROR_CODES.INSUFFICIENT_STUDENTS,
  alreadyConfirmed: MATCH_ERROR_CODES.ALREADY_CONFIRMED,
  matchNotRun: MATCH_ERROR_CODES.NOT_RUN,
} as const;

export type InstructorServiceError = CourseErrorCode | MatchErrorCode;

