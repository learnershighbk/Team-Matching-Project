/**
 * 에러 코드 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  AUTH_ERROR_CODES,
  COURSE_ERROR_CODES,
  MATCH_ERROR_CODES,
  ADMIN_ERROR_CODES,
  ERROR_STATUS_MAP,
  ERROR_MESSAGES,
} from '@/lib/errors/codes';

describe('에러 코드 정의', () => {
  describe('AUTH_ERROR_CODES', () => {
    it('모든 인증 에러 코드가 정의됨', () => {
      expect(AUTH_ERROR_CODES.INVALID_STUDENT_NUMBER).toBe('AUTH_001');
      expect(AUTH_ERROR_CODES.INVALID_PIN).toBe('AUTH_002');
      expect(AUTH_ERROR_CODES.AUTH_FAILED).toBe('AUTH_003');
      expect(AUTH_ERROR_CODES.CONFIG_ERROR).toBe('AUTH_CONFIG_ERROR');
      expect(AUTH_ERROR_CODES.REGISTRATION_FAILED).toBe('AUTH_004');
    });

    it('AUTH 에러 코드는 고유함', () => {
      const codes = Object.values(AUTH_ERROR_CODES);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });

  describe('COURSE_ERROR_CODES', () => {
    it('모든 코스 에러 코드가 정의됨', () => {
      expect(COURSE_ERROR_CODES.NOT_FOUND).toBe('COURSE_001');
      expect(COURSE_ERROR_CODES.DEADLINE_PASSED).toBe('COURSE_002');
      expect(COURSE_ERROR_CODES.CANNOT_MODIFY).toBe('COURSE_003');
      expect(COURSE_ERROR_CODES.ALREADY_LOCKED).toBe('COURSE_004');
      expect(COURSE_ERROR_CODES.CANNOT_MATCH).toBe('COURSE_005');
      expect(COURSE_ERROR_CODES.FETCH_ERROR).toBe('COURSE_006');
      expect(COURSE_ERROR_CODES.VALIDATION_ERROR).toBe('COURSE_007');
    });

    it('COURSE 에러 코드는 고유함', () => {
      const codes = Object.values(COURSE_ERROR_CODES);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });

  describe('MATCH_ERROR_CODES', () => {
    it('모든 매칭 에러 코드가 정의됨', () => {
      expect(MATCH_ERROR_CODES.INSUFFICIENT_STUDENTS).toBe('MATCH_001');
      expect(MATCH_ERROR_CODES.ALREADY_CONFIRMED).toBe('MATCH_002');
      expect(MATCH_ERROR_CODES.NOT_RUN).toBe('MATCH_003');
    });

    it('MATCH 에러 코드는 고유함', () => {
      const codes = Object.values(MATCH_ERROR_CODES);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });

  describe('ADMIN_ERROR_CODES', () => {
    it('모든 관리자 에러 코드가 정의됨', () => {
      expect(ADMIN_ERROR_CODES.DUPLICATE_EMAIL).toBe('ADMIN_001');
      expect(ADMIN_ERROR_CODES.CANNOT_DELETE).toBe('ADMIN_002');
      expect(ADMIN_ERROR_CODES.FETCH_ERROR).toBe('ADMIN_003');
      expect(ADMIN_ERROR_CODES.NOT_FOUND).toBe('ADMIN_004');
    });

    it('ADMIN 에러 코드는 고유함', () => {
      const codes = Object.values(ADMIN_ERROR_CODES);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });
});

describe('ERROR_STATUS_MAP', () => {
  describe('AUTH 에러 상태 코드', () => {
    it('INVALID_STUDENT_NUMBER → 400', () => {
      expect(ERROR_STATUS_MAP[AUTH_ERROR_CODES.INVALID_STUDENT_NUMBER]).toBe(400);
    });

    it('INVALID_PIN → 400', () => {
      expect(ERROR_STATUS_MAP[AUTH_ERROR_CODES.INVALID_PIN]).toBe(400);
    });

    it('AUTH_FAILED → 401', () => {
      expect(ERROR_STATUS_MAP[AUTH_ERROR_CODES.AUTH_FAILED]).toBe(401);
    });

    it('CONFIG_ERROR → 500', () => {
      expect(ERROR_STATUS_MAP[AUTH_ERROR_CODES.CONFIG_ERROR]).toBe(500);
    });

    it('REGISTRATION_FAILED → 500', () => {
      expect(ERROR_STATUS_MAP[AUTH_ERROR_CODES.REGISTRATION_FAILED]).toBe(500);
    });
  });

  describe('COURSE 에러 상태 코드', () => {
    it('NOT_FOUND → 404', () => {
      expect(ERROR_STATUS_MAP[COURSE_ERROR_CODES.NOT_FOUND]).toBe(404);
    });

    it('DEADLINE_PASSED → 403', () => {
      expect(ERROR_STATUS_MAP[COURSE_ERROR_CODES.DEADLINE_PASSED]).toBe(403);
    });

    it('CANNOT_MODIFY → 403', () => {
      expect(ERROR_STATUS_MAP[COURSE_ERROR_CODES.CANNOT_MODIFY]).toBe(403);
    });

    it('ALREADY_LOCKED → 400', () => {
      expect(ERROR_STATUS_MAP[COURSE_ERROR_CODES.ALREADY_LOCKED]).toBe(400);
    });

    it('CANNOT_MATCH → 400', () => {
      expect(ERROR_STATUS_MAP[COURSE_ERROR_CODES.CANNOT_MATCH]).toBe(400);
    });

    it('FETCH_ERROR → 500', () => {
      expect(ERROR_STATUS_MAP[COURSE_ERROR_CODES.FETCH_ERROR]).toBe(500);
    });

    it('VALIDATION_ERROR → 400', () => {
      expect(ERROR_STATUS_MAP[COURSE_ERROR_CODES.VALIDATION_ERROR]).toBe(400);
    });
  });

  describe('MATCH 에러 상태 코드', () => {
    it('INSUFFICIENT_STUDENTS → 400', () => {
      expect(ERROR_STATUS_MAP[MATCH_ERROR_CODES.INSUFFICIENT_STUDENTS]).toBe(400);
    });

    it('ALREADY_CONFIRMED → 400', () => {
      expect(ERROR_STATUS_MAP[MATCH_ERROR_CODES.ALREADY_CONFIRMED]).toBe(400);
    });

    it('NOT_RUN → 400', () => {
      expect(ERROR_STATUS_MAP[MATCH_ERROR_CODES.NOT_RUN]).toBe(400);
    });
  });

  describe('ADMIN 에러 상태 코드', () => {
    it('DUPLICATE_EMAIL → 400', () => {
      expect(ERROR_STATUS_MAP[ADMIN_ERROR_CODES.DUPLICATE_EMAIL]).toBe(400);
    });

    it('CANNOT_DELETE → 400', () => {
      expect(ERROR_STATUS_MAP[ADMIN_ERROR_CODES.CANNOT_DELETE]).toBe(400);
    });

    it('FETCH_ERROR → 500', () => {
      expect(ERROR_STATUS_MAP[ADMIN_ERROR_CODES.FETCH_ERROR]).toBe(500);
    });

    it('NOT_FOUND → 404', () => {
      expect(ERROR_STATUS_MAP[ADMIN_ERROR_CODES.NOT_FOUND]).toBe(404);
    });
  });

  it('모든 에러 코드에 상태 매핑이 있음', () => {
    const allCodes = [
      ...Object.values(AUTH_ERROR_CODES),
      ...Object.values(COURSE_ERROR_CODES),
      ...Object.values(MATCH_ERROR_CODES),
      ...Object.values(ADMIN_ERROR_CODES),
    ];

    allCodes.forEach((code) => {
      expect(ERROR_STATUS_MAP[code]).toBeDefined();
      expect(typeof ERROR_STATUS_MAP[code]).toBe('number');
    });
  });
});

describe('ERROR_MESSAGES', () => {
  describe('AUTH 에러 메시지', () => {
    it('INVALID_STUDENT_NUMBER 메시지', () => {
      expect(ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_STUDENT_NUMBER]).toBe('학번은 9자리 숫자여야 합니다');
    });

    it('INVALID_PIN 메시지', () => {
      expect(ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_PIN]).toBe('PIN은 4자리 숫자여야 합니다');
    });

    it('AUTH_FAILED 메시지', () => {
      expect(ERROR_MESSAGES[AUTH_ERROR_CODES.AUTH_FAILED]).toBe('인증에 실패했습니다');
    });
  });

  describe('COURSE 에러 메시지', () => {
    it('NOT_FOUND 메시지', () => {
      expect(ERROR_MESSAGES[COURSE_ERROR_CODES.NOT_FOUND]).toBe('코스를 찾을 수 없습니다');
    });

    it('DEADLINE_PASSED 메시지', () => {
      expect(ERROR_MESSAGES[COURSE_ERROR_CODES.DEADLINE_PASSED]).toBe('프로필 입력 마감기한이 지났습니다');
    });
  });

  describe('MATCH 에러 메시지', () => {
    it('INSUFFICIENT_STUDENTS 메시지', () => {
      expect(ERROR_MESSAGES[MATCH_ERROR_CODES.INSUFFICIENT_STUDENTS]).toBe('매칭을 실행하기에는 학생 수가 부족합니다');
    });

    it('ALREADY_CONFIRMED 메시지', () => {
      expect(ERROR_MESSAGES[MATCH_ERROR_CODES.ALREADY_CONFIRMED]).toBe('이미 매칭이 확정되었습니다');
    });
  });

  describe('ADMIN 에러 메시지', () => {
    it('DUPLICATE_EMAIL 메시지', () => {
      expect(ERROR_MESSAGES[ADMIN_ERROR_CODES.DUPLICATE_EMAIL]).toBe('이미 등록된 이메일입니다');
    });

    it('CANNOT_DELETE 메시지', () => {
      expect(ERROR_MESSAGES[ADMIN_ERROR_CODES.CANNOT_DELETE]).toBe('연관된 데이터가 있어 삭제할 수 없습니다');
    });
  });

  it('모든 에러 코드에 메시지가 있음', () => {
    const allCodes = [
      ...Object.values(AUTH_ERROR_CODES),
      ...Object.values(COURSE_ERROR_CODES),
      ...Object.values(MATCH_ERROR_CODES),
      ...Object.values(ADMIN_ERROR_CODES),
    ];

    allCodes.forEach((code) => {
      expect(ERROR_MESSAGES[code]).toBeDefined();
      expect(typeof ERROR_MESSAGES[code]).toBe('string');
      expect(ERROR_MESSAGES[code].length).toBeGreaterThan(0);
    });
  });
});

describe('HTTP 상태 코드 범위', () => {
  it('클라이언트 에러(4xx)와 서버 에러(5xx)만 사용', () => {
    Object.values(ERROR_STATUS_MAP).forEach((status) => {
      expect(status).toBeGreaterThanOrEqual(400);
      expect(status).toBeLessThan(600);
    });
  });

  it('400 상태 코드 사용 사례', () => {
    const badRequestCodes = Object.entries(ERROR_STATUS_MAP)
      .filter(([_, status]) => status === 400)
      .map(([code]) => code);

    expect(badRequestCodes.length).toBeGreaterThan(0);
  });

  it('401 상태 코드 사용 사례', () => {
    const unauthorizedCodes = Object.entries(ERROR_STATUS_MAP)
      .filter(([_, status]) => status === 401)
      .map(([code]) => code);

    expect(unauthorizedCodes).toContain(AUTH_ERROR_CODES.AUTH_FAILED);
  });

  it('404 상태 코드 사용 사례', () => {
    const notFoundCodes = Object.entries(ERROR_STATUS_MAP)
      .filter(([_, status]) => status === 404)
      .map(([code]) => code);

    expect(notFoundCodes).toContain(COURSE_ERROR_CODES.NOT_FOUND);
    expect(notFoundCodes).toContain(ADMIN_ERROR_CODES.NOT_FOUND);
  });

  it('500 상태 코드 사용 사례', () => {
    const serverErrorCodes = Object.entries(ERROR_STATUS_MAP)
      .filter(([_, status]) => status === 500)
      .map(([code]) => code);

    expect(serverErrorCodes.length).toBeGreaterThan(0);
  });
});
