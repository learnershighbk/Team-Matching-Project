import { ADMIN_ERROR_CODES, type AdminErrorCode } from '@/lib/errors/codes';

export const adminErrorCodes = {
  duplicateEmail: ADMIN_ERROR_CODES.DUPLICATE_EMAIL,
  cannotDelete: ADMIN_ERROR_CODES.CANNOT_DELETE,
} as const;

export type AdminServiceError = AdminErrorCode;

