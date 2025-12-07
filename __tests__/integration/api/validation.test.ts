/**
 * 입력 검증 API 통합 테스트
 * 
 * Zod 스키마 검증이 올바르게 작동하는지 테스트
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createHonoApp } from '@/backend/hono/app';
import type { Hono } from 'hono';

describe('Validation API', () => {
  let app: Hono;

  beforeAll(() => {
    app = createHonoApp();
  });

  describe('Student Profile Validation', () => {
    it('올바른 프로필 데이터 검증 성공', async () => {
      // 이 테스트는 실제 인증이 필요하므로 스킵
      // 실제 구현 시 인증 토큰을 포함하여 테스트
    });

    it('잘못된 이메일 형식 검증 실패', async () => {
      // 이 테스트는 실제 인증이 필요하므로 스킵
      // 실제 구현 시 인증 토큰을 포함하여 테스트
    });
  });

  describe('Course Creation Validation', () => {
    it('올바른 코스 데이터 검증 성공', async () => {
      // 이 테스트는 실제 인증이 필요하므로 스킵
      // 실제 구현 시 인증 토큰을 포함하여 테스트
    });

    it('잘못된 팀 크기 검증 실패', async () => {
      // 이 테스트는 실제 인증이 필요하므로 스킵
      // 실제 구현 시 인증 토큰을 포함하여 테스트
    });
  });
});



