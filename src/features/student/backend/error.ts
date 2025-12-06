export const studentErrorCodes = {
  courseNotFound: 'COURSE_001',
  deadlinePassed: 'COURSE_002',
  notFound: 'STUDENT_NOT_FOUND',
  fetchError: 'STUDENT_FETCH_ERROR',
  validationError: 'STUDENT_VALIDATION_ERROR',
} as const;

type StudentErrorValue = (typeof studentErrorCodes)[keyof typeof studentErrorCodes];

export type StudentServiceError = StudentErrorValue;

