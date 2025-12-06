/**
 * 에러 응답 유틸리티 테스트
 */

import { describe, it, expect } from 'vitest';
import { createErrorResponse, zodErrorToResponse } from '@/lib/errors';
import { AUTH_ERROR_CODES, COURSE_ERROR_CODES, ADMIN_ERROR_CODES } from '@/lib/errors/codes';

describe('createErrorResponse', () => {
  it('에러 코드로부터 올바른 응답 생성', () => {
    const response = createErrorResponse(AUTH_ERROR_CODES.AUTH_FAILED);

    expect(response.ok).toBe(false);
    expect(response.error.code).toBe('AUTH_003');
    expect(response.error.message).toBe('인증에 실패했습니다');
    expect(response.status).toBe(401);
  });

  it('커스텀 메시지 사용', () => {
    const customMessage = '사용자 정의 에러 메시지';
    const response = createErrorResponse(AUTH_ERROR_CODES.AUTH_FAILED, customMessage);

    expect(response.ok).toBe(false);
    expect(response.error.message).toBe(customMessage);
  });

  it('상세 정보 포함', () => {
    const details = { field: 'email', reason: 'invalid format' };
    const response = createErrorResponse(
      AUTH_ERROR_CODES.INVALID_PIN,
      undefined,
      details
    );

    expect(response.error.details).toEqual(details);
  });

  it('COURSE 에러 코드 처리', () => {
    const response = createErrorResponse(COURSE_ERROR_CODES.NOT_FOUND);

    expect(response.status).toBe(404);
    expect(response.error.code).toBe('COURSE_001');
  });

  it('ADMIN 에러 코드 처리', () => {
    const response = createErrorResponse(ADMIN_ERROR_CODES.DUPLICATE_EMAIL);

    expect(response.status).toBe(400);
    expect(response.error.code).toBe('ADMIN_001');
    expect(response.error.message).toBe('이미 등록된 이메일입니다');
  });

  it('500 에러 코드 처리', () => {
    const response = createErrorResponse(COURSE_ERROR_CODES.FETCH_ERROR);

    expect(response.status).toBe(500);
    expect(response.error.code).toBe('COURSE_006');
  });
});

describe('zodErrorToResponse', () => {
  it('Zod 에러를 표준 에러 응답으로 변환', () => {
    const zodError = {
      errors: [
        { message: '필수 필드입니다', path: ['email'] },
        { message: '잘못된 형식입니다', path: ['pin'] },
      ],
    };

    const response = zodErrorToResponse(zodError);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
    expect(response.error.code).toBe('VALIDATION_ERROR');
    expect(response.error.message).toContain('email');
    expect(response.error.message).toContain('필수 필드입니다');
  });

  it('중첩된 경로 처리', () => {
    const zodError = {
      errors: [
        { message: '잘못된 값', path: ['profile', 'address', 'city'] },
      ],
    };

    const response = zodErrorToResponse(zodError);

    expect(response.error.message).toContain('profile.address.city');
  });

  it('빈 경로 처리', () => {
    const zodError = {
      errors: [
        { message: '전체 객체가 유효하지 않습니다', path: [] },
      ],
    };

    const response = zodErrorToResponse(zodError);

    expect(response.error.message).toBe('전체 객체가 유효하지 않습니다');
  });

  it('에러 배열이 비어있는 경우', () => {
    const zodError = {
      errors: [],
    };

    const response = zodErrorToResponse(zodError);

    expect(response.status).toBe(400);
    expect(response.error.message).toBe('입력값이 올바르지 않습니다');
  });

  it('상세 정보에 모든 에러 포함', () => {
    const zodError = {
      errors: [
        { message: '에러1', path: ['field1'] },
        { message: '에러2', path: ['field2'] },
        { message: '에러3', path: ['field3'] },
      ],
    };

    const response = zodErrorToResponse(zodError);

    expect(response.error.details).toEqual(zodError.errors);
    expect(response.error.details).toHaveLength(3);
  });

  it('숫자 경로 인덱스 처리', () => {
    const zodError = {
      errors: [
        { message: '잘못된 항목', path: ['items', 0, 'name'] },
      ],
    };

    const response = zodErrorToResponse(zodError);

    expect(response.error.message).toContain('items.0.name');
  });
});

describe('에러 응답 형식', () => {
  it('ok 필드는 항상 false', () => {
    const responses = [
      createErrorResponse(AUTH_ERROR_CODES.AUTH_FAILED),
      createErrorResponse(COURSE_ERROR_CODES.NOT_FOUND),
      createErrorResponse(ADMIN_ERROR_CODES.DUPLICATE_EMAIL),
    ];

    responses.forEach((response) => {
      expect(response.ok).toBe(false);
    });
  });

  it('error 객체에 code와 message 필수 포함', () => {
    const response = createErrorResponse(AUTH_ERROR_CODES.INVALID_PIN);

    expect(response.error).toHaveProperty('code');
    expect(response.error).toHaveProperty('message');
    expect(typeof response.error.code).toBe('string');
    expect(typeof response.error.message).toBe('string');
  });

  it('status는 유효한 HTTP 상태 코드', () => {
    const codes = [
      AUTH_ERROR_CODES.AUTH_FAILED,
      AUTH_ERROR_CODES.INVALID_PIN,
      COURSE_ERROR_CODES.NOT_FOUND,
      COURSE_ERROR_CODES.FETCH_ERROR,
    ];

    codes.forEach((code) => {
      const response = createErrorResponse(code);
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(600);
    });
  });
});
