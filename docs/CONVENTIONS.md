# 📏 CONVENTIONS.md — TeamMatch 코딩 컨벤션

**버전:** v1.0  
**최종 업데이트:** 2025-01-06

---

## 1. General Principles

### 1.1 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **명확성** | 코드는 자기 문서화되어야 함 |
| **일관성** | 프로젝트 전체에서 동일한 스타일 유지 |
| **단순성** | 불필요한 복잡성 배제 |
| **타입 안전성** | TypeScript 활용 극대화 |

### 1.2 도구

```json
{
  "devDependencies": {
    "eslint": "^8.x",
    "prettier": "^3.x",
    "@typescript-eslint/parser": "^6.x",
    "@typescript-eslint/eslint-plugin": "^6.x"
  }
}
```

---

## 2. Naming Conventions

### 2.1 파일명

| 유형 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `ProfileForm.tsx` |
| 훅 | camelCase (use 접두사) | `useAuth.ts` |
| 유틸리티 | camelCase | `formatDate.ts` |
| 타입 | camelCase | `database.ts` |
| API Route | kebab-case (폴더) | `reset-pin/route.ts` |
| 상수 | camelCase | `weights.ts` |

### 2.2 변수/함수명

```typescript
// ✅ Good
const studentCount = 25;
const isProfileCompleted = true;
function calculateTeamScore() {}
async function fetchCourseData() {}

// ❌ Bad
const cnt = 25;
const completed = true;
function calc() {}
async function getData() {}
```

### 2.3 타입/인터페이스명

```typescript
// ✅ Good - Interface는 명사형
interface Student {
  id: string;
  name: string;
}

interface CourseSettings {
  teamSize: number;
  weightProfile: string;
}

// ✅ Good - Type은 용도에 따라
type Role = 'admin' | 'instructor' | 'student';
type ApiResponse<T> = { success: true; data: T } | { success: false; error: ApiError };

// ❌ Bad - I 접두사 사용 금지
interface IStudent {}
```

### 2.4 상수명

```typescript
// ✅ Good - UPPER_SNAKE_CASE
const MAX_TEAM_SIZE = 6;
const JWT_EXPIRATION = {
  admin: 14400,
  instructor: 86400,
  student: 86400,
} as const;

// 에러 코드
const ERROR_CODES = {
  AUTH_001: 'AUTH_001',
  AUTH_002: 'AUTH_002',
} as const;
```

### 2.5 Enum 값

```typescript
// DB enum (snake_case) - PostgreSQL 호환
type Major = 'data_analysis' | 'research' | 'writing';

// 상태 enum (UPPER_CASE)
type CourseStatus = 'OPEN' | 'LOCKED' | 'CONFIRMED';
```

---

## 3. TypeScript Conventions

### 3.1 타입 정의

```typescript
// ✅ Good - 명시적 타입
function calculateScore(members: TeamMember[]): number {
  return members.length * 10;
}

// ✅ Good - 제네릭 활용
async function fetchData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json();
}

// ❌ Bad - any 사용 금지
function process(data: any) {}
```

### 3.2 Null 처리

```typescript
// ✅ Good - Optional chaining + Nullish coalescing
const name = student?.profile?.name ?? 'Unknown';

// ✅ Good - Type guard
function isStudent(user: User): user is Student {
  return user.role === 'student';
}

// ❌ Bad
const name = student && student.profile && student.profile.name || 'Unknown';
```

### 3.3 Import 순서

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { NextRequest, NextResponse } from 'next/server';

// 2. 외부 라이브러리
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// 3. 내부 모듈 (절대 경로)
import { verifyToken } from '@/lib/auth/jwt';
import { Button } from '@/components/ui/button';

// 4. 타입
import type { Student, Course } from '@/types/database';

// 5. 상대 경로 (현재 디렉토리)
import { formatDate } from './utils';
```

---

## 4. React/Next.js Conventions

### 4.1 컴포넌트 구조

```typescript
// components/forms/ProfileForm.tsx

'use client'; // 필요한 경우에만

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Student } from '@/types/database';

// Props 타입 정의
interface ProfileFormProps {
  student: Student;
  onSubmit: (data: ProfileData) => Promise<void>;
  disabled?: boolean;
}

// 컴포넌트 정의
export function ProfileForm({ 
  student, 
  onSubmit, 
  disabled = false 
}: ProfileFormProps) {
  // Hooks
  const [isLoading, setIsLoading] = useState(false);
  
  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

### 4.2 Server vs Client Components

```typescript
// ✅ Server Component (기본)
// app/course/[uuid]/page.tsx
export default async function CoursePage({ params }: Props) {
  const course = await fetchCourse(params.uuid);
  return <CourseView course={course} />;
}

// ✅ Client Component (필요시)
// components/forms/ProfileForm.tsx
'use client';

export function ProfileForm() {
  const [state, setState] = useState();
  // ...
}
```

### 4.3 API Route 구조

```typescript
// app/api/instructor/courses/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { courseSchema } from '@/lib/validators/course';
import { createCourse } from '@/lib/db/courses';

// GET 핸들러
export const GET = withAuth(
  async (request: NextRequest, auth) => {
    const courses = await getCourses(auth.instructorId);
    
    return NextResponse.json({
      success: true,
      data: courses,
    });
  },
  ['instructor']
);

// POST 핸들러
export const POST = withAuth(
  async (request: NextRequest, auth) => {
    // 1. 입력 검증
    const body = await request.json();
    const validated = courseSchema.parse(body);
    
    // 2. 비즈니스 로직
    const course = await createCourse({
      ...validated,
      instructorId: auth.instructorId,
    });
    
    // 3. 응답
    return NextResponse.json(
      { success: true, data: course },
      { status: 201 }
    );
  },
  ['instructor']
);
```

---

## 5. Error Handling

### 5.1 API 에러 응답

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 에러 핸들러
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { 
        success: false, 
        error: { code: error.code, message: error.message } 
      },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { 
        success: false, 
        error: { code: 'VALIDATION_ERROR', message: error.errors[0].message } 
      },
      { status: 400 }
    );
  }
  
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { 
      success: false, 
      error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } 
    },
    { status: 500 }
  );
}
```

### 5.2 클라이언트 에러 처리

```typescript
// hooks/useApi.ts
export function useApi() {
  const handleError = (error: ApiError) => {
    switch (error.code) {
      case 'AUTH_003':
        router.push('/login');
        break;
      case 'COURSE_002':
        toast.error('마감기한이 지났습니다');
        break;
      default:
        toast.error(error.message);
    }
  };
  
  return { handleError };
}
```

---

## 6. Validation

### 6.1 Zod 스키마

```typescript
// lib/validators/auth.ts
import { z } from 'zod';

export const studentNumberSchema = z
  .string()
  .regex(/^\d{9}$/, '학번은 9자리 숫자여야 합니다');

export const pinSchema = z
  .string()
  .regex(/^\d{4}$/, 'PIN은 4자리 숫자여야 합니다');

export const studentAuthSchema = z.object({
  courseId: z.string().uuid(),
  studentNumber: studentNumberSchema,
  pin: pinSchema,
  isNewUser: z.boolean(),
});

// lib/validators/profile.ts
export const profileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  major: z.enum(['MPP', 'MDP', 'MPM', 'MDS', 'MIPD', 'MPPM', 'PhD']),
  gender: z.enum(['male', 'female', 'other']),
  continent: z.enum(['asia', 'africa', 'europe', 'north_america', 'south_america', 'oceania']),
  role: z.enum(['leader', 'executor', 'ideator', 'coordinator']),
  skill: z.enum(['data_analysis', 'research', 'writing', 'visual', 'presentation']),
  times: z.array(z.enum(['weekday_daytime', 'weekday_evening', 'weekend'])).min(1),
  goal: z.enum(['a_plus', 'balanced', 'minimum']),
});
```

---

## 7. Database Queries

### 7.1 Supabase 쿼리 패턴

```typescript
// lib/db/courses.ts
import { supabase } from '@/lib/supabase/server';
import type { Course } from '@/types/database';

export async function getCourseById(courseId: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('course_id', courseId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return data;
}

export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .insert(input)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

### 7.2 트랜잭션 패턴

```typescript
// 매칭 확정 시 트랜잭션
export async function confirmMatching(courseId: string, teams: Team[]) {
  // Supabase는 자동 트랜잭션을 지원하지 않으므로
  // RPC 함수 또는 순차 실행 + 롤백 로직 사용
  
  try {
    // 1. 팀 생성
    for (const team of teams) {
      await createTeam(courseId, team);
    }
    
    // 2. 학생 팀 배정
    for (const team of teams) {
      for (const member of team.members) {
        await assignStudentToTeam(member.studentId, team.teamId);
      }
    }
    
    // 3. 코스 상태 변경
    await updateCourseStatus(courseId, 'CONFIRMED');
    
  } catch (error) {
    // 롤백 로직
    await rollbackMatching(courseId);
    throw error;
  }
}
```

---

## 8. Testing Conventions

### 8.1 테스트 파일 구조

```
__tests__/
├── unit/
│   ├── lib/
│   │   ├── auth/
│   │   │   └── jwt.test.ts
│   │   └── matching/
│   │       └── scoring.test.ts
│   └── components/
│       └── ProfileForm.test.tsx
├── integration/
│   └── api/
│       ├── admin.test.ts
│       └── student.test.ts
└── e2e/
    └── student-flow.test.ts
```

### 8.2 테스트 명명

```typescript
describe('calculateTimeScore', () => {
  it('should return 10 when all members share a time slot', () => {
    // ...
  });
  
  it('should return 6 when majority (>50%) shares a time slot', () => {
    // ...
  });
  
  it('should return 2 when no common time slot exists', () => {
    // ...
  });
});
```

---

## 9. Git Conventions

### 9.1 Branch 명명

```
feature/   새 기능
fix/       버그 수정
refactor/  리팩토링
docs/      문서 수정
test/      테스트 추가

예시:
feature/student-profile
fix/matching-score-calculation
refactor/auth-middleware
```

### 9.2 Commit Message

```
<type>: <subject>

<body>

<footer>

타입:
- feat: 새 기능
- fix: 버그 수정
- refactor: 리팩토링
- docs: 문서
- test: 테스트
- chore: 기타

예시:
feat: Add student profile form validation

- Add Zod schema for profile validation
- Implement client-side validation
- Add error messages for each field

Closes #123
```

---

## 10. Project Structure

```
teammatch/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth 그룹
│   ├── api/               # API Routes
│   └── course/            # 학생 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # 기본 UI (shadcn)
│   ├── forms/            # 폼 컴포넌트
│   ├── layouts/          # 레이아웃
│   └── shared/           # 공통 컴포넌트
├── lib/                   # 유틸리티
│   ├── auth/             # 인증
│   ├── db/               # DB 쿼리
│   ├── matching/         # 매칭 알고리즘
│   ├── supabase/         # Supabase 클라이언트
│   └── validators/       # Zod 스키마
├── types/                 # TypeScript 타입
├── hooks/                 # Custom Hooks
├── __tests__/            # 테스트
└── docs/                  # 문서
```

---

## 11. ESLint & Prettier Config

### 11.1 .eslintrc.json

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error",
    "no-console": ["warn", { "allow": ["error"] }]
  }
}
```

### 11.2 .prettierrc

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

**END OF DOCUMENT**

*이 문서는 TeamMatch 프로젝트의 코딩 컨벤션 가이드입니다.*
