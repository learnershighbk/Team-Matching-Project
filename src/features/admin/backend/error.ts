import { ADMIN_ERROR_CODES, type AdminErrorCode } from '@/lib/errors/codes';

export const adminErrorCodes = {
  duplicateEmail: ADMIN_ERROR_CODES.DUPLICATE_EMAIL,
  cannotDelete: ADMIN_ERROR_CODES.CANNOT_DELETE,
  fetchError: ADMIN_ERROR_CODES.FETCH_ERROR,
  notFound: ADMIN_ERROR_CODES.NOT_FOUND,
} as const;

export type AdminServiceError = AdminErrorCode;

