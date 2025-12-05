# 🔐 03_auth_backend.md — 인증 백엔드 구현

**순서:** 3/8  
**의존성:** 01_setup.md, 02_database.md  
**다음:** 04_admin_feature.md

---

## 🎯 Mission

3가지 역할(Admin, Instructor, Student)의 인증 시스템을 구현합니다.
JWT 생성/검증, 비밀번호 해싱, 미들웨어를 구현합니다.

---

## 📋 Tasks

### Task 1: JWT 유틸리티

**파일:** `lib/auth/jwt.ts`
```typescript
import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const JWT_ISSUER = process.env.JWT_ISSUER || 'teammatch';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'teammatch-users';

const EXPIRATION = {
  admin: '4h',
  instructor: '24h',
  student: '24h',
} as const;

type Role = keyof typeof EXPIRATION;

export async function signToken(
  payload: Record<string, unknown>,
  role: Role
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(EXPIRATION[role])
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
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

export function getRole(payload: JWTPayload): Role | null {
  const role = payload.role as string;
  if (role === 'admin' || role === 'instructor' || role === 'student') {
    return role;
  }
  return null;
}
```

### Task 2: 비밀번호 해싱

**파일:** `lib/auth/hash.ts`
```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Task 3: 인증 미들웨어

**파일:** `lib/auth/middleware.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getRole } from './jwt';

type Role = 'admin' | 'instructor' | 'student';

interface AuthResult {
  valid: boolean;
  payload?: any;
  error?: string;
}

export async function authenticate(request: NextRequest): Promise<AuthResult> {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return { valid: false, error: 'AUTH_003' };
  }
  
  const payload = await verifyToken(token);
  
  if (!payload) {
    return { valid: false, error: 'AUTH_003' };
  }
  
  return { valid: true, payload };
}

export async function authorize(
  request: NextRequest,
  allowedRoles: Role[]
): Promise<AuthResult> {
  const auth = await authenticate(request);
  
  if (!auth.valid) return auth;
  
  const role = getRole(auth.payload);
  
  if (!role || !allowedRoles.includes(role)) {
    return { valid: false, error: 'AUTH_003' };
  }
  
  return auth;
}

export function withAuth(
  handler: (req: NextRequest, auth: any) => Promise<Response>,
  allowedRoles: Role[]
) {
  return async (request: NextRequest) => {
    const auth = await authorize(request, allowedRoles);
    
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, error: { code: auth.error, message: '인증이 필요합니다' } },
        { status: 401 }
      );
    }
    
    return handler(request, auth.payload);
  };
}
```

### Task 4: Admin 로그인 API

**파일:** `app/api/admin/login/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // 환경변수와 비교
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_003', message: '인증 실패' } },
        { status: 401 }
      );
    }
    
    // JWT 생성
    const token = await signToken({ role: 'admin', email }, 'admin');
    
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
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
```

### Task 5: Instructor 로그인 API

**파일:** `app/api/instructor/login/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth/jwt';
import { verifyPassword } from '@/lib/auth/hash';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, pin } = await request.json();
    
    // PIN 형식 검증
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_002', message: 'PIN은 4자리 숫자여야 합니다' } },
        { status: 400 }
      );
    }
    
    // DB 조회
    const { data: instructor, error } = await supabaseAdmin
      .from('instructors')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !instructor) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_003', message: '인증 실패' } },
        { status: 401 }
      );
    }
    
    // PIN 검증
    const isValid = await verifyPassword(pin, instructor.pin_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_003', message: '인증 실패' } },
        { status: 401 }
      );
    }
    
    // JWT 생성
    const token = await signToken(
      { role: 'instructor', instructorId: instructor.instructor_id, email },
      'instructor'
    );
    
    const response = NextResponse.json({
      success: true,
      data: {
        instructorId: instructor.instructor_id,
        email: instructor.email,
        name: instructor.name
      }
    });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24시간
      path: '/',
    });
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
```

### Task 6: Student 인증 API

**파일:** `app/api/student/auth/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth/jwt';
import { hashPassword, verifyPassword } from '@/lib/auth/hash';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { courseId, studentNumber, pin, isNewUser } = await request.json();
    
    // 형식 검증
    if (!/^\d{9}$/.test(studentNumber)) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_001', message: '학번은 9자리 숫자여야 합니다' } },
        { status: 400 }
      );
    }
    
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_002', message: 'PIN은 4자리 숫자여야 합니다' } },
        { status: 400 }
      );
    }
    
    // 코스 확인
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('course_id', courseId)
      .single();
    
    if (courseError || !course) {
      return NextResponse.json(
        { success: false, error: { code: 'COURSE_001', message: '코스를 찾을 수 없습니다' } },
        { status: 404 }
      );
    }
    
    if (isNewUser) {
      // 신규 등록
      const { data: existing } = await supabaseAdmin
        .from('students')
        .select('student_id')
        .eq('course_id', courseId)
        .eq('student_number', studentNumber)
        .single();
      
      if (existing) {
        return NextResponse.json(
          { success: false, error: { code: 'AUTH_003', message: '이미 등록된 학번입니다' } },
          { status: 400 }
        );
      }
      
      const pinHash = await hashPassword(pin);
      
      const { data: newStudent, error: insertError } = await supabaseAdmin
        .from('students')
        .insert({
          course_id: courseId,
          student_number: studentNumber,
          pin_hash: pinHash,
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      const token = await signToken(
        { role: 'student', studentId: newStudent.student_id, courseId, studentNumber },
        'student'
      );
      
      const response = NextResponse.json({
        success: true,
        data: {
          studentId: newStudent.student_id,
          studentNumber,
          profileCompleted: false,
          courseStatus: course.status
        }
      });
      
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400,
        path: '/',
      });
      
      return response;
    } else {
      // 기존 로그인
      const { data: student, error: studentError } = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_number', studentNumber)
        .single();
      
      if (studentError || !student) {
        return NextResponse.json(
          { success: false, error: { code: 'AUTH_003', message: '인증 실패' } },
          { status: 401 }
        );
      }
      
      const isValid = await verifyPassword(pin, student.pin_hash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: { code: 'AUTH_003', message: '인증 실패' } },
          { status: 401 }
        );
      }
      
      const token = await signToken(
        { role: 'student', studentId: student.student_id, courseId, studentNumber },
        'student'
      );
      
      const response = NextResponse.json({
        success: true,
        data: {
          studentId: student.student_id,
          studentNumber,
          profileCompleted: student.profile_completed,
          courseStatus: course.status
        }
      });
      
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400,
        path: '/',
      });
      
      return response;
    }
  } catch (error) {
    console.error('Student auth error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '서버 오류' } },
      { status: 500 }
    );
  }
}
```

### Task 7: 로그아웃 API

**파일:** `app/api/auth/logout/route.ts`
```typescript
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  
  return response;
}
```

### Task 8: Next.js Middleware

**파일:** `middleware.ts` (루트)
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

const PUBLIC_PATHS = [
  '/admin',
  '/instructor', 
  '/course',
  '/api/admin/login',
  '/api/instructor/login',
  '/api/student/auth',
  '/api/course',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 공개 경로는 통과
  const isPublic = PUBLIC_PATHS.some(path => 
    pathname === path || 
    pathname.startsWith(path + '/')
  );
  
  // API 상태 조회는 공개
  if (pathname.includes('/api/course/') && pathname.includes('/status')) {
    return NextResponse.next();
  }
  
  if (isPublic && !pathname.includes('/dashboard')) {
    return NextResponse.next();
  }
  
  // 토큰 확인
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_003', message: '인증 필요' } },
        { status: 401 }
      );
    }
    // 페이지 접근 시 로그인으로 리다이렉트
    const loginUrl = getLoginUrl(pathname, request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

function getLoginUrl(pathname: string, baseUrl: string): URL {
  if (pathname.startsWith('/admin')) {
    return new URL('/admin', baseUrl);
  }
  if (pathname.startsWith('/instructor')) {
    return new URL('/instructor', baseUrl);
  }
  return new URL('/', baseUrl);
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

## ✅ Checklist

- [ ] JWT 생성/검증 작동
- [ ] 비밀번호 해싱 작동
- [ ] Admin 로그인 API 작동
- [ ] Instructor 로그인 API 작동
- [ ] Student 인증 API 작동 (신규/기존)
- [ ] 로그아웃 API 작동
- [ ] Middleware 라우트 보호 작동

---

## 🧪 Test Cases

```bash
# Admin 로그인
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bklee@kdischool.ac.kr","password":"1217"}'

# Instructor 로그인 (먼저 Admin으로 교수자 생성 필요)
curl -X POST http://localhost:3000/api/instructor/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@kdi.ac.kr","pin":"1234"}'
```

---

## 🔗 Reference

- docs/AUTH.md
- docs/API_SPEC.md

---

## ➡️ Next Step

04_admin_feature.md로 진행하여 Admin 기능을 구현합니다.
