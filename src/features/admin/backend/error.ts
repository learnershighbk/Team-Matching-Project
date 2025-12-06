export const adminErrorCodes = {
  duplicateEmail: 'ADMIN_001',
  cannotDelete: 'ADMIN_002',
  notFound: 'ADMIN_NOT_FOUND',
  fetchError: 'ADMIN_FETCH_ERROR',
  validationError: 'ADMIN_VALIDATION_ERROR',
} as const;

type AdminErrorValue = (typeof adminErrorCodes)[keyof typeof adminErrorCodes];

export type AdminServiceError = AdminErrorValue;

