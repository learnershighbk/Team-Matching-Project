/**
 * Vitest 전역 설정
 *
 * 테스트 환경 초기화 및 환경변수 모킹
 */

import { beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { resetIdCounter } from './helpers/test-fixtures';

// 환경변수 모킹
process.env.JWT_SECRET = 'test-secret-key-min-32-characters!!';
process.env.JWT_ISSUER = 'teammatch';
process.env.JWT_AUDIENCE = 'teammatch-users';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.ADMIN_EMAIL = 'admin@test.com';
process.env.ADMIN_PASSWORD = 'testpassword123';
process.env.NODE_ENV = 'test';

// 전역 설정
beforeAll(() => {
  // 콘솔 에러 스파이 (필요시 사용)
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  // 각 테스트 전에 ID 카운터 리셋
  resetIdCounter();
  // 모든 mock 초기화
  vi.clearAllMocks();
});

// 글로벌 타입 확장 (필요시)
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
      JWT_ISSUER: string;
      JWT_AUDIENCE: string;
      SUPABASE_URL: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      ADMIN_EMAIL: string;
      ADMIN_PASSWORD: string;
      NODE_ENV: string;
    }
  }
}
