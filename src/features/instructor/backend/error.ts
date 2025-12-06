export const instructorErrorCodes = {
  courseNotFound: 'COURSE_001',
  deadlinePassed: 'COURSE_002',
  cannotModify: 'COURSE_003',
  alreadyLocked: 'COURSE_004',
  cannotMatch: 'COURSE_005',
  matchInsufficientStudents: 'MATCH_001',
  alreadyConfirmed: 'MATCH_002',
  matchNotRun: 'MATCH_003',
  notFound: 'INSTRUCTOR_NOT_FOUND',
  fetchError: 'INSTRUCTOR_FETCH_ERROR',
  validationError: 'INSTRUCTOR_VALIDATION_ERROR',
} as const;

type InstructorErrorValue = (typeof instructorErrorCodes)[keyof typeof instructorErrorCodes];

export type InstructorServiceError = InstructorErrorValue;

