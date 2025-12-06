/**
 * 쿠키 유틸리티 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { COOKIE_NAME, getSetCookieOptions, getClearCookieOptions } from '@/lib/auth/cookie';

describe('쿠키 유틸리티', () => {
  describe('COOKIE_NAME', () => {
    it('COOKIE_NAME이 정의되어 있음', () => {
      expect(COOKIE_NAME).toBeDefined();
      expect(typeof COOKIE_NAME).toBe('string');
    });

    it('COOKIE_NAME이 token임', () => {
      expect(COOKIE_NAME).toBe('token');
    });
  });

  describe('getSetCookieOptions', () => {
    it('maxAge가 설정됨', () => {
      const maxAgeSeconds = 3600; // 1시간

      const options = getSetCookieOptions(maxAgeSeconds);

      expect(options.maxAge).toBe(maxAgeSeconds);
    });

    it('httpOnly가 true로 설정됨', () => {
      const options = getSetCookieOptions(3600);

      expect(options.httpOnly).toBe(true);
    });

    it('sameSite가 strict로 설정됨', () => {
      const options = getSetCookieOptions(3600);

      expect(options.sameSite).toBe('strict');
    });

    it('path가 /로 설정됨', () => {
      const options = getSetCookieOptions(3600);

      expect(options.path).toBe('/');
    });

    it('name이 COOKIE_NAME으로 설정됨', () => {
      const options = getSetCookieOptions(3600);

      expect(options.name).toBe(COOKIE_NAME);
    });

    it('다양한 maxAge 값 처리', () => {
      const testCases = [
        { input: 0, expected: 0 },
        { input: 1, expected: 1 },
        { input: 3600, expected: 3600 },
        { input: 86400, expected: 86400 }, // 24시간
        { input: 14400, expected: 14400 }, // 4시간
      ];

      for (const { input, expected } of testCases) {
        const options = getSetCookieOptions(input);
        expect(options.maxAge).toBe(expected);
      }
    });
  });

  describe('getClearCookieOptions', () => {
    it('maxAge가 0으로 설정됨 (쿠키 삭제)', () => {
      const options = getClearCookieOptions();

      expect(options.maxAge).toBe(0);
    });

    it('httpOnly가 true로 설정됨', () => {
      const options = getClearCookieOptions();

      expect(options.httpOnly).toBe(true);
    });

    it('sameSite가 strict로 설정됨', () => {
      const options = getClearCookieOptions();

      expect(options.sameSite).toBe('strict');
    });

    it('path가 /로 설정됨', () => {
      const options = getClearCookieOptions();

      expect(options.path).toBe('/');
    });

    it('name이 COOKIE_NAME으로 설정됨', () => {
      const options = getClearCookieOptions();

      expect(options.name).toBe(COOKIE_NAME);
    });

    it('value가 빈 문자열로 설정됨', () => {
      const options = getClearCookieOptions();

      expect(options.value).toBe('');
    });
  });

  describe('보안 설정', () => {
    it('모든 쿠키 옵션이 httpOnly를 포함', () => {
      const setOptions = getSetCookieOptions(3600);
      const clearOptions = getClearCookieOptions();

      expect(setOptions.httpOnly).toBe(true);
      expect(clearOptions.httpOnly).toBe(true);
    });

    it('모든 쿠키 옵션이 sameSite strict를 포함', () => {
      const setOptions = getSetCookieOptions(3600);
      const clearOptions = getClearCookieOptions();

      expect(setOptions.sameSite).toBe('strict');
      expect(clearOptions.sameSite).toBe('strict');
    });
  });
});

describe('토큰 만료 시간 시나리오', () => {
  it('Admin 토큰 - 4시간 (14400초)', () => {
    const adminMaxAge = 4 * 60 * 60; // 4시간
    const options = getSetCookieOptions(adminMaxAge);

    expect(options.maxAge).toBe(14400);
  });

  it('Instructor 토큰 - 24시간 (86400초)', () => {
    const instructorMaxAge = 24 * 60 * 60; // 24시간
    const options = getSetCookieOptions(instructorMaxAge);

    expect(options.maxAge).toBe(86400);
  });

  it('Student 토큰 - 24시간 (86400초)', () => {
    const studentMaxAge = 24 * 60 * 60; // 24시간
    const options = getSetCookieOptions(studentMaxAge);

    expect(options.maxAge).toBe(86400);
  });
});
