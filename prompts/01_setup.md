# 🚀 01_setup.md — 프로젝트 초기 설정

**순서:** 1/8 (가장 먼저 실행)  
**의존성:** 없음  
**다음:** 02_database.md

---

## 🎯 Mission

TeamMatch MVP 프로젝트의 기본 구조를 설정합니다.
Next.js 14 프로젝트를 생성하고, 필요한 의존성과 폴더 구조를 구성합니다.

---

## 📋 Tasks

### Task 1: Next.js 프로젝트 생성

```bash
npx create-next-app@latest teammatch --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd teammatch
```

### Task 2: 추가 의존성 설치

```bash
# Core
npm install @supabase/supabase-js jose bcryptjs zod

# UI (shadcn/ui)
npx shadcn@latest init -d
npx shadcn@latest add button input select card label toast

# Types
npm install -D @types/bcryptjs
```

### Task 3: 폴더 구조 생성

```bash
mkdir -p app/\(auth\)/admin/dashboard
mkdir -p app/\(auth\)/instructor/dashboard
mkdir -p app/course/\[uuid\]/profile
mkdir -p app/course/\[uuid\]/team
mkdir -p app/api/admin/login
mkdir -p app/api/admin/instructors/\[id\]
mkdir -p app/api/admin/students/\[id\]/reset-pin
mkdir -p app/api/admin/courses/\[id\]
mkdir -p app/api/instructor/login
mkdir -p app/api/instructor/courses/\[id\]/students
mkdir -p app/api/instructor/courses/\[id\]/lock
mkdir -p app/api/instructor/courses/\[id\]/match
mkdir -p app/api/instructor/courses/\[id\]/confirm
mkdir -p app/api/instructor/courses/\[id\]/teams
mkdir -p app/api/student/auth
mkdir -p app/api/student/profile
mkdir -p app/api/student/team
mkdir -p app/api/course/\[uuid\]/status
mkdir -p components/ui
mkdir -p components/forms
mkdir -p components/layouts
mkdir -p components/shared
mkdir -p lib/supabase
mkdir -p lib/auth
mkdir -p lib/matching
mkdir -p lib/validators
mkdir -p lib/db
mkdir -p lib/constants
mkdir -p types
mkdir -p hooks
mkdir -p __tests__/unit
mkdir -p __tests__/integration
```

### Task 4: 환경변수 파일 생성

**파일:** `.env.local`
```env
# Admin
ADMIN_EMAIL=bklee@kdischool.ac.kr
ADMIN_PASSWORD=1217

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-here
JWT_ISSUER=teammatch
JWT_AUDIENCE=teammatch-users

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Task 5: TypeScript 타입 정의

**파일:** `types/database.ts`
```typescript
export type WeightProfile = 'balanced' | 'skill_heavy' | 'skill_role_focused' | 'diversity_heavy';
export type CourseStatus = 'OPEN' | 'LOCKED' | 'CONFIRMED';
export type Major = 'MPP' | 'MDP' | 'MPM' | 'MDS' | 'MIPD' | 'MPPM' | 'PhD';
export type Gender = 'male' | 'female' | 'other';
export type Continent = 'asia' | 'africa' | 'europe' | 'north_america' | 'south_america' | 'oceania';
export type Role = 'leader' | 'executor' | 'ideator' | 'coordinator';
export type Skill = 'data_analysis' | 'research' | 'writing' | 'visual' | 'presentation';
export type TimeSlot = 'weekday_daytime' | 'weekday_evening' | 'weekend';
export type Goal = 'a_plus' | 'balanced' | 'minimum';

export interface Instructor {
  instructor_id: string;
  email: string;
  pin_hash: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  course_id: string;
  instructor_id: string;
  course_name: string;
  course_code: string;
  team_size: number;
  weight_profile: WeightProfile;
  deadline: string;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
}

export interface Student {
  student_id: string;
  course_id: string;
  team_id: string | null;
  student_number: string;
  pin_hash: string;
  name: string | null;
  email: string | null;
  major: Major | null;
  gender: Gender | null;
  continent: Continent | null;
  role: Role | null;
  skill: Skill | null;
  times: TimeSlot[];
  goal: Goal | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Team {
  team_id: string;
  course_id: string;
  team_number: number;
  member_count: number;
  score_total: number;
  score_time: number;
  score_skill: number;
  score_role: number;
  score_major: number;
  score_goal: number;
  score_continent: number;
  score_gender: number;
  top_factors: string[];
  created_at: string;
}
```

**파일:** `types/api.ts`
```typescript
export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
```

**파일:** `types/auth.ts`
```typescript
export type UserRole = 'admin' | 'instructor' | 'student';

export interface AdminJWT {
  role: 'admin';
  email: string;
}

export interface InstructorJWT {
  role: 'instructor';
  instructorId: string;
  email: string;
}

export interface StudentJWT {
  role: 'student';
  studentId: string;
  courseId: string;
  studentNumber: string;
}

export type JWTPayload = AdminJWT | InstructorJWT | StudentJWT;
```

### Task 6: 상수 정의

**파일:** `lib/constants/weights.ts`
```typescript
export const WEIGHT_PROFILES = {
  balanced: {
    time: 4,
    skill: 3,
    role: 2,
    major: 2,
    goal: 1,
    continent: 2,
    gender: 1.5,
  },
  skill_heavy: {
    time: 3,
    skill: 5,
    role: 2,
    major: 1.5,
    goal: 1,
    continent: 1.5,
    gender: 1.5,
  },
  skill_role_focused: {
    time: 3,
    skill: 4,
    role: 3,
    major: 1.5,
    goal: 1,
    continent: 1.5,
    gender: 1.5,
  },
  diversity_heavy: {
    time: 3,
    skill: 2,
    role: 1.5,
    major: 3,
    goal: 1,
    continent: 3,
    gender: 3,
  },
} as const;

export type WeightProfileName = keyof typeof WEIGHT_PROFILES;
```

**파일:** `lib/constants/errors.ts`
```typescript
export const ERROR_CODES = {
  AUTH_001: { code: 'AUTH_001', message: '학번은 9자리 숫자여야 합니다' },
  AUTH_002: { code: 'AUTH_002', message: 'PIN은 4자리 숫자여야 합니다' },
  AUTH_003: { code: 'AUTH_003', message: '인증에 실패했습니다' },
  COURSE_001: { code: 'COURSE_001', message: '코스를 찾을 수 없습니다' },
  COURSE_002: { code: 'COURSE_002', message: '프로필 입력 마감기한이 지났습니다' },
  MATCH_001: { code: 'MATCH_001', message: '최소 2명의 학생이 필요합니다' },
  MATCH_002: { code: 'MATCH_002', message: '이미 매칭이 확정되었습니다' },
} as const;
```

### Task 7: 기본 레이아웃

**파일:** `app/layout.tsx`
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TeamMatch - KDI School',
  description: '팀 프로젝트 매칭 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

**파일:** `app/page.tsx`
```typescript
import { redirect } from 'next/navigation';

export default function Home() {
  // 랜딩 페이지 또는 리다이렉트
  redirect('/instructor');
}
```

---

## ✅ Checklist

- [ ] Next.js 프로젝트 생성됨
- [ ] 모든 의존성 설치됨
- [ ] 폴더 구조 생성됨
- [ ] 환경변수 파일 존재
- [ ] TypeScript 타입 정의됨
- [ ] 상수 파일 생성됨
- [ ] 기본 레이아웃 작동
- [ ] `npm run dev` 실행 가능

---

## 🔗 Reference

- docs/ARCHITECTURE.md
- docs/ENV_TEMPLATE.md
- docs/CONVENTIONS.md

---

## ➡️ Next Step

02_database.md로 진행하여 Supabase 스키마를 생성합니다.
