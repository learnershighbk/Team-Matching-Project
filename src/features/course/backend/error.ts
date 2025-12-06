export const courseErrorCodes = {
  notFound: 'COURSE_001',
  fetchError: 'COURSE_FETCH_ERROR',
  validationError: 'COURSE_VALIDATION_ERROR',
} as const;

type CourseErrorValue = (typeof courseErrorCodes)[keyof typeof courseErrorCodes];

export type CourseServiceError = CourseErrorValue;

