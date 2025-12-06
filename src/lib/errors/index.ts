/**
 * 에러 처리 유틸리티
 * 
 * 모든 API에서 일관된 에러 응답 형식을 사용하기 위한 헬퍼 함수
 */

import { failure } from '@/backend/http/response';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ErrorCode } from './codes';
import { ERROR_STATUS_MAP, ERROR_MESSAGES } from './codes';

/**
 * 에러 코드로부터 실패 응답 생성
 *
 * @param code 에러 코드
 * @param customMessage 커스텀 메시지 (선택적)
 * @param details 추가 상세 정보 (선택적)
 */
export function createErrorResponse<TDetails = unknown>(
  code: ErrorCode,
  customMessage?: string,
  details?: TDetails
) {
  const status = ERROR_STATUS_MAP[code] as ContentfulStatusCode;
  const message = customMessage || ERROR_MESSAGES[code];

  return failure(status, code, message, details);
}

/**
 * Zod 검증 에러를 표준 에러 응답으로 변환
 */
export function zodErrorToResponse(zodError: { errors: Array<{ message: string; path: (string | number)[] }> }) {
  const firstError = zodError.errors[0];
  const fieldPath = firstError?.path.length 
    ? `${firstError.path.join('.')}: ` 
    : '';
  const message = firstError?.message || '입력값이 올바르지 않습니다';
  
  return failure(
    400,
    'VALIDATION_ERROR' as ErrorCode,
    `${fieldPath}${message}`,
    zodError.errors
  );
}

