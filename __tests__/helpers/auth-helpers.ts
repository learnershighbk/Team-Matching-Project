/**
 * 인증 테스트 헬퍼
 *
 * JWT 토큰 생성 및 인증된 요청 생성 유틸리티
 */

import { SignJWT } from 'jose';
import type { AdminPayload, InstructorPayload, StudentPayload, TokenPayload } from '@/features/auth/backend/jwt';

// 테스트용 JWT 설정
const TEST_JWT_SECRET = new TextEncoder().encode('test-secret-key-min-32-characters!!');
const TEST_JWT_ISSUER = 'teammatch';
const TEST_JWT_AUDIENCE = 'teammatch-users';

/**
 * 테스트용 JWT 토큰 생성
 */
export async function generateTestToken(
  payload: TokenPayload,
  options: { expiresIn?: string; expired?: boolean } = {}
): Promise<string> {
  const { expiresIn = '24h', expired = false } = options;

  const jwt = new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(TEST_JWT_ISSUER)
    .setAudience(TEST_JWT_AUDIENCE);

  if (expired) {
    // 1초 전에 만료되도록 설정
    jwt.setExpirationTime(Math.floor(Date.now() / 1000) - 1);
  } else {
    jwt.setExpirationTime(expiresIn);
  }

  return jwt.sign(TEST_JWT_SECRET);
}

/**
 * Admin 토큰 생성
 */
export async function generateAdminToken(
  email: string = 'admin@test.com',
  options: { expired?: boolean } = {}
): Promise<string> {
  const payload: AdminPayload = {
    role: 'admin',
    email,
  };
  return generateTestToken(payload, { expiresIn: '4h', ...options });
}

/**
 * Instructor 토큰 생성
 */
export async function generateInstructorToken(
  instructorId: string = 'test-instructor-id',
  email: string = 'instructor@test.com',
  options: { expired?: boolean } = {}
): Promise<string> {
  const payload: InstructorPayload = {
    role: 'instructor',
    instructorId,
    email,
  };
  return generateTestToken(payload, { expiresIn: '24h', ...options });
}

/**
 * Student 토큰 생성
 */
export async function generateStudentToken(
  studentId: string = 'test-student-id',
  courseId: string = 'test-course-id',
  studentNumber: string = '202400001',
  options: { expired?: boolean } = {}
): Promise<string> {
  const payload: StudentPayload = {
    role: 'student',
    studentId,
    courseId,
    studentNumber,
  };
  return generateTestToken(payload, { expiresIn: '24h', ...options });
}

/**
 * 인증된 Request 생성
 */
export function createAuthenticatedRequest(
  token: string,
  method: string = 'GET',
  path: string = '/',
  options: {
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Request {
  const { body, headers = {} } = options;

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Cookie: `token=${token}`,
      ...headers,
    },
  };

  if (body && method !== 'GET' && method !== 'HEAD') {
    requestInit.body = JSON.stringify(body);
  }

  return new Request(`http://localhost${path}`, requestInit);
}

/**
 * 인증 헤더로 Request 생성 (Bearer 토큰)
 */
export function createBearerRequest(
  token: string,
  method: string = 'GET',
  path: string = '/',
  options: {
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Request {
  const { body, headers = {} } = options;

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...headers,
    },
  };

  if (body && method !== 'GET' && method !== 'HEAD') {
    requestInit.body = JSON.stringify(body);
  }

  return new Request(`http://localhost${path}`, requestInit);
}

/**
 * 인증 없는 Request 생성
 */
export function createUnauthenticatedRequest(
  method: string = 'GET',
  path: string = '/',
  options: {
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Request {
  const { body, headers = {} } = options;

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET' && method !== 'HEAD') {
    requestInit.body = JSON.stringify(body);
  }

  return new Request(`http://localhost${path}`, requestInit);
}

/**
 * 테스트용 페이로드 생성
 */
export const testPayloads = {
  admin: (): AdminPayload => ({
    role: 'admin',
    email: 'admin@test.com',
  }),

  instructor: (id?: string): InstructorPayload => ({
    role: 'instructor',
    instructorId: id || 'test-instructor-id',
    email: 'instructor@test.com',
  }),

  student: (id?: string, courseId?: string): StudentPayload => ({
    role: 'student',
    studentId: id || 'test-student-id',
    courseId: courseId || 'test-course-id',
    studentNumber: '202400001',
  }),
};

/**
 * 잘못된 토큰 생성 (테스트용)
 */
export function createInvalidToken(): string {
  return 'invalid.jwt.token';
}

/**
 * 잘못된 서명의 토큰 생성
 */
export async function createMalformedToken(): Promise<string> {
  const wrongSecret = new TextEncoder().encode('wrong-secret-key-32-characters!!');
  const payload: AdminPayload = {
    role: 'admin',
    email: 'admin@test.com',
  };

  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(TEST_JWT_ISSUER)
    .setAudience(TEST_JWT_AUDIENCE)
    .setExpirationTime('24h')
    .sign(wrongSecret);
}

export { TEST_JWT_SECRET, TEST_JWT_ISSUER, TEST_JWT_AUDIENCE };
