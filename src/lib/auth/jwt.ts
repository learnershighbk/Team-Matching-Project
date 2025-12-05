import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { getServerEnv } from '@/constants/env';

// JWT 설정
function getJWTConfig() {
  const serverEnv = getServerEnv();
  return {
    secret: new TextEncoder().encode(serverEnv.JWT_SECRET),
    issuer: serverEnv.JWT_ISSUER,
    audience: serverEnv.JWT_AUDIENCE,
  };
}

// 토큰 만료 시간 (초)
const EXPIRATION = {
  admin: 14400, // 4시간
  instructor: 86400, // 24시간
  student: 86400, // 24시간
} as const;

export type Role = keyof typeof EXPIRATION;

// JWT Payload 타입 정의
export interface AdminJWTPayload extends JWTPayload {
  role: 'admin';
  email: string;
}

export interface InstructorJWTPayload extends JWTPayload {
  role: 'instructor';
  instructorId: string;
  email: string;
}

export interface StudentJWTPayload extends JWTPayload {
  role: 'student';
  studentId: string;
  courseId: string;
  studentNumber: string;
}

export type AuthJWTPayload = AdminJWTPayload | InstructorJWTPayload | StudentJWTPayload;

/**
 * JWT 토큰 생성
 */
export async function signToken(
  payload: Omit<AuthJWTPayload, 'iss' | 'aud' | 'iat' | 'exp'>,
  role: Role
): Promise<string> {
  const config = getJWTConfig();

  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(config.issuer)
    .setAudience(config.audience)
    .setExpirationTime(`${EXPIRATION[role]}s`)
    .sign(config.secret);
}

/**
 * JWT 토큰 검증
 */
export async function verifyToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const config = getJWTConfig();
    const { payload } = await jwtVerify(token, config.secret, {
      issuer: config.issuer,
      audience: config.audience,
    });
    return payload;
  } catch (error) {
    // 토큰 만료, 서명 오류 등
    return null;
  }
}

/**
 * 토큰에서 역할 추출
 */
export function getRole(payload: JWTPayload): Role | null {
  const role = payload.role as string;
  if (role === 'admin' || role === 'instructor' || role === 'student') {
    return role;
  }
  return null;
}

/**
 * 타입 가드: Admin JWT 확인
 */
export function isAdminPayload(
  payload: JWTPayload
): payload is AdminJWTPayload {
  return payload.role === 'admin' && typeof payload.email === 'string';
}

/**
 * 타입 가드: Instructor JWT 확인
 */
export function isInstructorPayload(
  payload: JWTPayload
): payload is InstructorJWTPayload {
  return (
    payload.role === 'instructor' &&
    typeof payload.instructorId === 'string' &&
    typeof payload.email === 'string'
  );
}

/**
 * 타입 가드: Student JWT 확인
 */
export function isStudentPayload(
  payload: JWTPayload
): payload is StudentJWTPayload {
  return (
    payload.role === 'student' &&
    typeof payload.studentId === 'string' &&
    typeof payload.courseId === 'string' &&
    typeof payload.studentNumber === 'string'
  );
}

