# 🔐 AUTH.md — TeamMatch 인증 시스템

**참조:** PRD.md 섹션 3  
**버전:** v1.0  
**최종 업데이트:** 2025-01-06

---

## 1. Overview

### 1.1 인증 방식 요약

| Role | ID | Password | 세션 | 계정 생성 |
|------|-----|----------|------|----------|
| **Admin** | 환경변수 이메일 | 환경변수 비밀번호 | JWT (4시간) | 환경변수 |
| **Instructor** | 이메일 | 4자리 PIN | JWT (24시간) | Admin이 생성 |
| **Student** | 9자리 학번 | 4자리 PIN | JWT (24시간) | 최초 접속 시 자동 |

### 1.2 기술 스택

| 항목 | 기술 |
|------|------|
| Token | JWT (JSON Web Token) |
| JWT Library | jose |
| Password Hash | bcryptjs |
| Storage | HTTP-Only Cookie |

---

## 2. JWT Configuration

### 2.1 환경변수

```env
# JWT 설정
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_ISSUER=teammatch
JWT_AUDIENCE=teammatch-users

# Admin 계정
ADMIN_EMAIL=bklee@kdischool.ac.kr
ADMIN_PASSWORD=1217
```

### 2.2 JWT Payload 구조

```typescript
// Base JWT Payload
interface BaseJWT {
  iss: string;      // Issuer: "teammatch"
  aud: string;      // Audience: "teammatch-users"
  iat: number;      // Issued At
  exp: number;      // Expiration
}

// Admin JWT
interface AdminJWTPayload extends BaseJWT {
  role: 'admin';
  email: string;
}

// Instructor JWT
interface InstructorJWTPayload extends BaseJWT {
  role: 'instructor';
  instructorId: string;
  email: string;
}

// Student JWT
interface StudentJWTPayload extends BaseJWT {
  role: 'student';
  studentId: string;
  courseId: string;
  studentNumber: string;
}
```

### 2.3 토큰 만료 시간

| Role | Duration | Seconds |
|------|----------|---------|
| Admin | 4시간 | 14400 |
| Instructor | 24시간 | 86400 |
| Student | 24시간 | 86400 |

---

## 3. Implementation

### 3.1 JWT 유틸리티 (lib/auth/jwt.ts)

```typescript
import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const JWT_ISSUER = process.env.JWT_ISSUER || 'teammatch';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'teammatch-users';

// 토큰 만료 시간 (초)
const EXPIRATION = {
  admin: 14400,      // 4시간
  instructor: 86400, // 24시간
  student: 86400,    // 24시간
} as const;

type Role = keyof typeof EXPIRATION;

// JWT 생성
export async function signToken(
  payload: Record<string, unknown>,
  role: Role
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(`${EXPIRATION[role]}s`)
    .sign(JWT_SECRET);
}

// JWT 검증
export async function verifyToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload;
  } catch {
    return null;
  }
}

// 토큰에서 역할 추출
export function getRole(payload: JWTPayload): Role | null {
  const role = payload.role as string;
  if (role === 'admin' || role === 'instructor' || role === 'student') {
    return role;
  }
  return null;
}
```

### 3.2 비밀번호 해싱 (lib/auth/hash.ts)

```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

// PIN/비밀번호 해싱
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// PIN/비밀번호 검증
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### 3.3 Cookie 설정 (lib/auth/cookie.ts)

```typescript
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

const COOKIE_NAME = 'token';

// Cookie 옵션
const baseCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

// 토큰 설정용 Cookie 옵션
export function getSetCookieOptions(
  maxAgeSeconds: number
): ResponseCookie {
  return {
    ...baseCookieOptions,
    name: COOKIE_NAME,
    value: '', // 실제 값은 별도 설정
    maxAge: maxAgeSeconds,
  } as ResponseCookie;
}

// 토큰 삭제용 Cookie 옵션
export function getClearCookieOptions(): ResponseCookie {
  return {
    ...baseCookieOptions,
    name: COOKIE_NAME,
    value: '',
    maxAge: 0,
  } as ResponseCookie;
}

export { COOKIE_NAME };
```

### 3.4 인증 미들웨어 (lib/auth/middleware.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getRole } from './jwt';
import { COOKIE_NAME } from './cookie';

type Role = 'admin' | 'instructor' | 'student';

interface AuthResult {
  valid: boolean;
  payload?: any;
  error?: string;
}

// 토큰 검증
export async function authenticate(
  request: NextRequest
): Promise<AuthResult> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  
  if (!token) {
    return { valid: false, error: 'AUTH_003' };
  }
  
  const payload = await verifyToken(token);
  
  if (!payload) {
    return { valid: false, error: 'AUTH_003' };
  }
  
  return { valid: true, payload };
}

// 역할 검증
export async function authorize(
  request: NextRequest,
  allowedRoles: Role[]
): Promise<AuthResult> {
  const auth = await authenticate(request);
  
  if (!auth.valid) {
    return auth;
  }
  
  const role = getRole(auth.payload);
  
  if (!role || !allowedRoles.includes(role)) {
    return { valid: false, error: 'AUTH_003' };
  }
  
  return auth;
}

// API Route 래퍼
export function withAuth(
  handler: (req: NextRequest, auth: any) => Promise<Response>,
  allowedRoles: Role[]
) {
  return async (request: NextRequest) => {
    const auth = await authorize(request, allowedRoles);
    
    if (!auth.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: { code: auth.error, message: '인증이 필요합니다' } 
        },
        { status: 401 }
      );
    }
    
    return handler(request, auth.payload);
  };
}
```

---

## 4. Authentication Flows

### 4.1 Admin Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Login Flow                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. POST /api/admin/login                                   │
│     Body: { email, password }                               │
│         │                                                    │
│         ▼                                                    │
│  2. 환경변수와 비교                                          │
│     - ADMIN_EMAIL === email?                                │
│     - ADMIN_PASSWORD === password?                          │
│         │                                                    │
│         ▼                                                    │
│  3. JWT 생성                                                 │
│     Payload: { role: 'admin', email }                       │
│     Expiration: 4시간                                        │
│         │                                                    │
│         ▼                                                    │
│  4. Cookie 설정                                              │
│     Set-Cookie: token=<JWT>; HttpOnly; Secure               │
│         │                                                    │
│         ▼                                                    │
│  5. 응답 반환                                                │
│     { success: true, data: { role, email } }                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**구현 코드:**

```typescript
// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  // 환경변수와 비교
  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json(
      { 
        success: false, 
        error: { code: 'AUTH_003', message: '인증 실패' } 
      },
      { status: 401 }
    );
  }
  
  // JWT 생성
  const token = await signToken(
    { role: 'admin', email },
    'admin'
  );
  
  // 응답 + Cookie
  const response = NextResponse.json({
    success: true,
    data: { role: 'admin', email }
  });
  
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 14400, // 4시간
    path: '/',
  });
  
  return response;
}
```

### 4.2 Instructor Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Instructor Login Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. POST /api/instructor/login                              │
│     Body: { email, pin }                                    │
│         │                                                    │
│         ▼                                                    │
│  2. PIN 형식 검증                                            │
│     - /^\d{4}$/.test(pin)                                   │
│         │                                                    │
│         ▼                                                    │
│  3. DB에서 교수자 조회                                       │
│     SELECT * FROM instructors WHERE email = ?               │
│         │                                                    │
│         ▼                                                    │
│  4. PIN 해시 비교                                            │
│     bcrypt.compare(pin, pin_hash)                           │
│         │                                                    │
│         ▼                                                    │
│  5. JWT 생성                                                 │
│     Payload: { role, instructorId, email }                  │
│     Expiration: 24시간                                       │
│         │                                                    │
│         ▼                                                    │
│  6. Cookie 설정 + 응답                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Student Auth Flow (신규 + 기존)

```
┌─────────────────────────────────────────────────────────────┐
│                    Student Auth Flow                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. POST /api/student/auth                                  │
│     Body: { courseId, studentNumber, pin, isNewUser }       │
│         │                                                    │
│         ▼                                                    │
│  2. 형식 검증                                                │
│     - studentNumber: /^\d{9}$/                              │
│     - pin: /^\d{4}$/                                        │
│         │                                                    │
│         ▼                                                    │
│  3. 코스 존재 확인                                           │
│     SELECT * FROM courses WHERE course_id = ?               │
│         │                                                    │
│         ├─── isNewUser: true ───┐                           │
│         │                        │                           │
│         │    4a. 기존 학생 확인  │  4b. 새 학생 생성         │
│         │    (중복 체크)         │  INSERT INTO students     │
│         │         │              │         │                 │
│         │         ▼              │         ▼                 │
│         │    5a. PIN 검증        │  5b. PIN 해시 저장        │
│         │    bcrypt.compare      │  bcrypt.hash             │
│         │         │              │         │                 │
│         └─────────┴──────────────┴─────────┘                │
│                   │                                          │
│                   ▼                                          │
│            6. JWT 생성                                       │
│            Payload: { role, studentId, courseId, number }   │
│                   │                                          │
│                   ▼                                          │
│            7. Cookie 설정 + 응답                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Next.js Middleware

### 5.1 경로별 접근 제어 (middleware.ts)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, getRole } from './lib/auth/jwt';

// 보호된 경로 정의
const PROTECTED_ROUTES = {
  admin: ['/admin/dashboard', '/api/admin'],
  instructor: ['/instructor/dashboard', '/api/instructor'],
  student: ['/course/*/profile', '/course/*/team', '/api/student'],
};

// 공개 경로
const PUBLIC_ROUTES = [
  '/admin',           // Admin 로그인 페이지
  '/instructor',      // Instructor 로그인 페이지
  '/course/*',        // 학생 인증 페이지 (첫 화면)
  '/api/admin/login',
  '/api/instructor/login',
  '/api/student/auth',
  '/api/course/*/status',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 공개 경로는 통과
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // 토큰 확인
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return redirectToLogin(request);
  }
  
  // 토큰 검증
  const payload = await verifyToken(token);
  
  if (!payload) {
    return redirectToLogin(request);
  }
  
  // 역할 확인
  const role = getRole(payload);
  
  if (!role) {
    return redirectToLogin(request);
  }
  
  // 경로 권한 확인
  if (!hasAccess(pathname, role)) {
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_003', message: '권한 없음' } },
      { status: 403 }
    );
  }
  
  return NextResponse.next();
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route.includes('*')) {
      const regex = new RegExp(route.replace('*', '[^/]+'));
      return regex.test(pathname);
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

function hasAccess(pathname: string, role: string): boolean {
  const allowedRoutes = PROTECTED_ROUTES[role as keyof typeof PROTECTED_ROUTES];
  if (!allowedRoutes) return false;
  
  return allowedRoutes.some(route => {
    if (route.includes('*')) {
      const regex = new RegExp(route.replace('*', '[^/]+'));
      return regex.test(pathname);
    }
    return pathname.startsWith(route);
  });
}

function redirectToLogin(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  if (pathname.startsWith('/instructor')) {
    return NextResponse.redirect(new URL('/instructor', request.url));
  }
  // Student는 courseId가 필요하므로 적절한 처리 필요
  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/instructor/:path*',
    '/course/:path*',
    '/api/:path*',
  ],
};
```

---

## 6. Validation Rules

### 6.1 학번 (Student Number)

```typescript
const STUDENT_NUMBER_REGEX = /^\d{9}$/;

export function validateStudentNumber(value: string): boolean {
  return STUDENT_NUMBER_REGEX.test(value);
}

// 에러: AUTH_001 - 학번은 9자리 숫자여야 합니다
```

### 6.2 PIN

```typescript
const PIN_REGEX = /^\d{4}$/;

export function validatePin(value: string): boolean {
  return PIN_REGEX.test(value);
}

// 에러: AUTH_002 - PIN은 4자리 숫자여야 합니다
```

### 6.3 이메일

```typescript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}
```

---

## 7. Security Considerations

### 7.1 보안 체크리스트

| 항목 | 구현 |
|------|------|
| 비밀번호 해싱 | bcrypt (salt rounds: 10) |
| JWT 서명 | HS256 알고리즘 |
| Cookie 보안 | HttpOnly, Secure, SameSite=Strict |
| 토큰 만료 | Admin: 4h, Others: 24h |
| CSRF 방지 | SameSite Cookie |
| Rate Limiting | 로그인 API 제한 |

### 7.2 Rate Limiting 구현

```typescript
// 간단한 메모리 기반 Rate Limiter
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, maxAttempts = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  
  if (!record || record.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
}
```

### 7.3 로그아웃 구현

```typescript
// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // 즉시 만료
    path: '/',
  });
  
  return response;
}
```

---

## 8. Error Handling

### 8.1 인증 에러 코드

| Code | HTTP | Message | Cause |
|------|------|---------|-------|
| AUTH_001 | 400 | 학번은 9자리 숫자여야 합니다 | 학번 형식 오류 |
| AUTH_002 | 400 | PIN은 4자리 숫자여야 합니다 | PIN 형식 오류 |
| AUTH_003 | 401 | 인증에 실패했습니다 | 자격 증명 불일치 |

### 8.2 에러 응답 형식

```typescript
interface AuthErrorResponse {
  success: false;
  error: {
    code: 'AUTH_001' | 'AUTH_002' | 'AUTH_003';
    message: string;
  };
}
```

---

## 9. Testing

### 9.1 테스트 케이스

```typescript
describe('Authentication', () => {
  describe('Admin Login', () => {
    it('should login with valid credentials', async () => {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'bklee@kdischool.ac.kr',
          password: '1217'
        })
      });
      expect(res.status).toBe(200);
      expect(res.headers.get('set-cookie')).toContain('token=');
    });
    
    it('should reject invalid credentials', async () => {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'wrong@email.com',
          password: 'wrong'
        })
      });
      expect(res.status).toBe(401);
    });
  });
  
  describe('Student Auth', () => {
    it('should validate student number format', async () => {
      const res = await fetch('/api/student/auth', {
        method: 'POST',
        body: JSON.stringify({
          courseId: 'valid-uuid',
          studentNumber: '12345', // 잘못된 형식
          pin: '1234',
          isNewUser: true
        })
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.code).toBe('AUTH_001');
    });
  });
});
```

---

**END OF DOCUMENT**

*이 문서는 PRD.md 섹션 3을 기반으로 한 인증 시스템 상세 설계입니다.*
